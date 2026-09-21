"""Collection — one read/write abstraction for every OS table.
Supabase when configured and reachable; otherwise data/<table>.local.json
(seeded from the committed JSON the first time) plus an inbox line that can be
replayed. Every write is audited. Routers never talk to db/tier1 directly."""
from __future__ import annotations

import time
import uuid
from typing import Any, Callable

from . import audit, db, tier1

Rows = list[dict[str, Any]]
Seed = Callable[[], Rows]


def now() -> int:
    return int(time.time())


class Collection:
    def __init__(self, table: str, seed: Seed | None = None, id_field: str = "id") -> None:
        self.table = table
        self.seed = seed or (lambda: [])
        self.id_field = id_field

    # ------------------------------------------------------------ reads
    def _local(self) -> Rows:
        rows = tier1.local_read(self.table)
        if rows is None:
            rows = self.seed()
            tier1.local_write(self.table, rows)
        return rows

    def list(self, **filters: Any) -> Rows:
        """Rows matching every equality filter (None values are ignored)."""
        active = {k: v for k, v in filters.items() if v is not None and v != ""}
        rows = db.select(self.table, {k: f"eq.{v}" for k, v in active.items()}) if db.config.supabase_configured() else None
        if rows is None:
            rows = [r for r in self._local() if all(r.get(k) == v for k, v in active.items())]
        return rows

    def get(self, row_id: str) -> dict[str, Any] | None:
        rows = db.select(self.table, {self.id_field: f"eq.{row_id}"}) if db.config.supabase_configured() else None
        if rows is None:
            rows = [r for r in self._local() if str(r.get(self.id_field)) == str(row_id)]
        return rows[0] if rows else None

    def source(self) -> str:
        return "db" if db.config.supabase_configured() and db.reachable() else "local"

    # ----------------------------------------------------------- writes
    def create(self, row: dict[str, Any], actor: str, client_id: str | None = None) -> dict[str, Any]:
        row = {**row}
        row.setdefault(self.id_field, str(uuid.uuid4()))
        row.setdefault("created_at", now())
        row["updated_at"] = now()
        saved = db.insert(self.table, row)
        if saved is None:
            rows = self._local()
            rows.append(row)
            tier1.local_write(self.table, rows)
            tier1.inbox_append(self.table, "create", row, client_id)
            saved = row
        audit.record(actor, "create", self.table, str(saved.get(self.id_field)), None, saved)
        return saved

    def patch(self, row_id: str, changes: dict[str, Any], actor: str, action: str = "update") -> dict[str, Any] | None:
        before = self.get(row_id)
        if before is None:
            return None
        changes = {k: v for k, v in changes.items() if k != self.id_field}
        changes["updated_at"] = now()
        saved = db.update(self.table, row_id, changes, self.id_field)
        if saved is None:
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
        return saved

    def delete(self, row_id: str, actor: str) -> bool:
        before = self.get(row_id)
        if before is None:
            return False
        if not db.delete(self.table, row_id, self.id_field):
            rows = [r for r in self._local() if str(r.get(self.id_field)) != str(row_id)]
            tier1.local_write(self.table, rows)
            tier1.inbox_append(self.table, "delete", {self.id_field: row_id})
        audit.record(actor, "delete", self.table, str(row_id), before, None)
        return True

    def replace_all_local(self, rows: Rows) -> None:
        """Tier-1 only: overwrite the local table (imports, reorders)."""
        tier1.local_write(self.table, rows)
