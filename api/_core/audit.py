"""Audit records — every OS write leaves one: who, action, table, row, before,
after, when. Stored in `records` (Supabase) or data/records.local.json (Tier 1).
Used by store.py (automatically) and by routers for non-row actions."""
from __future__ import annotations

import time
import uuid
from typing import Any

from . import db, tier1

TABLE = "records"


def record(
    actor_email: str,
    action: str,
    table: str,
    row_id: str | None,
    before: dict[str, Any] | None = None,
    after: dict[str, Any] | None = None,
    note: str = "",
) -> dict[str, Any]:
    row = {
        "id": str(uuid.uuid4()),
        "actor": actor_email,
        "action": action,
        "table_name": table,
        "row_id": row_id,
        "before": before,
        "after": after,
        "note": note,
        "created_at": int(time.time()),
    }
    if db.insert(TABLE, row) is None:
        rows = tier1.local_read(TABLE) or []
        rows.append(row)
        tier1.local_write(TABLE, rows[-2000:])  # keep the local log bounded
    return row


def list_records(limit: int = 200, table: str | None = None, actor: str | None = None) -> list[dict[str, Any]]:
    params = {"order": "created_at.desc", "limit": str(limit)}
    if table:
        params["table_name"] = f"eq.{table}"
    if actor:
        params["actor"] = f"eq.{actor}"
    rows = db.select(TABLE, params)
    if rows is None:
        rows = tier1.local_read(TABLE) or []
        if table:
            rows = [r for r in rows if r.get("table_name") == table]
        if actor:
            rows = [r for r in rows if r.get("actor") == actor]
        rows = sorted(rows, key=lambda r: r.get("created_at", 0), reverse=True)[:limit]
    return rows
