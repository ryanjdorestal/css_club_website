"""Collection — one read/write abstraction for every OS table.
Supabase when configured and reachable; otherwise data/<table>.local.json
(seeded from the committed JSON the first time) plus an inbox line that can be
replayed. Every write is audited. Routers never talk to db/tier1 directly."""
from __future__ import annotations

import logging
import time
import uuid
from collections.abc import Callable
from typing import Any

from . import audit, config, db, tier1

Rows = list[dict[str, Any]]
Seed = Callable[[], Rows]


def now() -> int:
    return int(time.time())


class Conflict(Exception):
    """A stale write: the row changed since the client read it (run 10 §6.10)."""

    def __init__(self, current: dict[str, Any], attempted: dict[str, Any]) -> None:
        super().__init__("changed elsewhere")
        self.current = current
        self.attempted = attempted


log = logging.getLogger("jjcss")


class Collection:
    def __init__(self, table: str, seed: Seed | None = None, id_field: str = "id") -> None:
        self.table = table
        self.seed = seed or (lambda: [])
        self.id_field = id_field

    # ------------------------------------------------------------ reads
    def _local(self) -> Rows:
        with tier1.LOCK:
            rows = tier1.local_read(self.table)
            if rows is None:
                rows = self.seed()
                tier1.local_write(self.table, rows)
        return rows

    def list(self, **filters: Any) -> Rows:
        """Rows matching every equality filter (None values are ignored)."""
        active = {k: v for k, v in filters.items() if v is not None and v != ""}
        rows = db.select(self.table, {k: f"eq.{v}" for k, v in active.items()}) if config.supabase_configured() else None
        if rows is None:
            rows = [r for r in self._local() if all(r.get(k) == v for k, v in active.items())]
        return rows

    def get(self, row_id: str) -> dict[str, Any] | None:
        rows = db.select(self.table, {self.id_field: f"eq.{row_id}"}) if config.supabase_configured() else None
        if rows is None:
            rows = [r for r in self._local() if str(r.get(self.id_field)) == str(row_id)]
        return rows[0] if rows else None

    def source(self) -> str:
        return "db" if config.supabase_configured() and db.reachable() else "local"

    # ----------------------------------------------------------- writes
    def by_client_id(self, client_id: str) -> dict[str, Any] | None:
        """The row a previous create with this client_id produced (idempotent replays)."""
        return next((r for r in self.list() if r.get("client_id") == client_id), None)

    def create(self, row: dict[str, Any], actor: str, client_id: str | None = None) -> dict[str, Any]:
        t0 = time.time()
        if client_id:
            existing = self.by_client_id(client_id)
            if existing:
                return existing  # a double-click or a replay: exactly one row
        row = {**row}
        if client_id:
            row["client_id"] = client_id
        row.setdefault(self.id_field, str(uuid.uuid4()))
        row.setdefault("created_at", now())
        row["updated_at"] = now()
        saved = db.insert(self.table, row)
        if saved is None:
            with tier1.LOCK:
                rows = self._local()
                rows.append(row)
                tier1.local_write(self.table, rows)
            tier1.inbox_append(self.table, "create", row, client_id)
            saved = row
        audit.record(actor, "create", self.table, str(saved.get(self.id_field)), None, saved)
        log.info("write actor=%s entity=%s action=create ms=%d tier=%s", actor, self.table, (time.time() - t0) * 1000, self.source())
        return saved

    def patch(self, row_id: str, changes: dict[str, Any], actor: str, action: str = "update", expected_updated_at: int | None = None) -> dict[str, Any] | None:
        t0 = time.time()
        before = self.get(row_id)
        if before is None:
            return None
        if expected_updated_at is not None and int(before.get("updated_at") or 0) != int(expected_updated_at):
            raise Conflict(before, changes)
        changes = {k: v for k, v in changes.items() if k not in (self.id_field, "expected_updated_at", "client_id")}
        changes["updated_at"] = max(now(), int(before.get("updated_at") or 0) + 1)
        saved = db.update(self.table, row_id, changes, self.id_field)
        if saved is None:
            with tier1.LOCK:
                rows = self._local()
                saved = None
                for i, r in enumerate(rows):
                    if str(r.get(self.id_field)) == str(row_id):
                        rows[i] = {**r, **changes}
                        saved = rows[i]
                if saved is None:
                    return None
                tier1.local_write(self.table, rows)
            tier1.inbox_append(self.table, "patch", {self.id_field: row_id, **changes})
        audit.record(actor, action, self.table, str(row_id), before, saved)
        log.info("write actor=%s entity=%s action=%s ms=%d tier=%s", actor, self.table, action, (time.time() - t0) * 1000, self.source())
        return saved

    def patch_many(self, updates: dict[str, dict[str, Any]], actor: str, action: str) -> int:
        """One write for many rows (reorders, renames): DB → per-row updates; Tier 1 → a single file write,
        one inbox line per row, one audit record naming the count."""
        if config.supabase_configured() and db.reachable():
            n = 0
            for rid, ch in updates.items():
                if db.update(self.table, rid, {**ch, "updated_at": now()}, self.id_field):
                    n += 1
            audit.record(actor, action, self.table, None, None, {"rows": n})
            return n
        with tier1.LOCK:
            rows = self._local()
            n = 0
            for i, r in enumerate(rows):
                upd = updates.get(str(r.get(self.id_field)))
                if upd:
                    rows[i] = {**r, **upd, "updated_at": now()}
                    n += 1
            tier1.local_write(self.table, rows)
        for rid, ch in updates.items():
            tier1.inbox_append(self.table, "patch", {self.id_field: rid, **ch})
        audit.record(actor, action, self.table, None, None, {"rows": n})
        return n

    def archive(self, row_id: str, actor: str, undo: bool = False) -> dict[str, Any] | None:
        """Archive = status 'archived' (remembering where it came from) or an `archived` flag on
        tables without a lifecycle; undo restores the previous status / clears the flag."""
        before = self.get(row_id)
        if before is None:
            return None
        changes: dict[str, Any]
        if "status" in before:
            changes = {"status": str(before.get("archived_from") or "draft"), "archived_from": None} if undo else {"status": "archived", "archived_from": before.get("status")}
        else:
            changes = {"archived": not undo}
        return self.patch(row_id, changes, actor, action="unarchive" if undo else "archive")

    def duplicate(self, row_id: str, actor: str, initial_status: str | None = None) -> dict[str, Any] | None:
        before = self.get(row_id)
        if before is None:
            return None
        copy = {k: v for k, v in before.items() if k not in (self.id_field, "created_at", "updated_at", "client_id", "published_at", "slug", "archived_from")}
        if "title" in copy:
            copy["title"] = f"{copy['title']} (copy)"
        if initial_status:
            copy["status"] = initial_status
        copy["featured"] = False if "featured" in copy else copy.get("featured")
        return self.create({k: v for k, v in copy.items() if v is not None or k != "featured"}, actor)

    def delete(self, row_id: str, actor: str) -> bool:
        before = self.get(row_id)
        if before is None:
            return False
        if not db.delete(self.table, row_id, self.id_field):
            with tier1.LOCK:
                rows = [r for r in self._local() if str(r.get(self.id_field)) != str(row_id)]
                tier1.local_write(self.table, rows)
            tier1.inbox_append(self.table, "delete", {self.id_field: row_id})
        audit.record(actor, "delete", self.table, str(row_id), before, None)
        return True

    def replace_all_local(self, rows: Rows) -> None:
        """Tier-1 only: overwrite the local table (imports, reorders)."""
        tier1.local_write(self.table, rows)
