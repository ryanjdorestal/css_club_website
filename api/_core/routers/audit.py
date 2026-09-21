"""/api/os/records (read-only audit log) + /api/os/inbox (Tier-1 writes not
yet in Supabase, with an idempotent replay by client_id)."""
from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Depends, Request

from .. import audit, config, db, tier1
from .. import collections as C
from ..auth import Actor, require_role
from ..models import ReplayIn

r = APIRouter(prefix="/os")


@r.get("/records")
def records(request: Request, actor: Actor = Depends(require_role("officer"))) -> dict[str, Any]:
    q = request.query_params
    rows = audit.list_records(limit=int(q.get("limit", "200")), table=q.get("table") or None, actor=q.get("actor") or None)
    return {"ok": True, "rows": rows, "count": len(rows)}


@r.get("/inbox")
def inbox(actor: Actor = Depends(require_role("officer"))) -> dict[str, Any]:
    items = tier1.inbox_items()
    return {"ok": True, "rows": items, "count": len(items), "db": config.supabase_configured() and db.reachable()}


@r.post("/inbox/replay")
def replay(body: ReplayIn, actor: Actor = Depends(require_role("admin"))) -> dict[str, Any]:
    """Post each inbox line to Supabase (upsert by id → idempotent). Lines that
    land are removed from the inbox; the rest stay for next time."""
    if not (config.supabase_configured() and db.reachable()):
        return {"ok": False, "error": "supabase not reachable", "replayed": 0}
    wanted = set(body.client_ids or [])
    replayed, failed = 0, []
    for item in tier1.inbox_items():
        if wanted and item["client_id"] not in wanted:
            continue
        col = C.ALL.get(item["table"])
        if not col:
            failed.append(item["client_id"])
            continue
        payload = item["payload"]
        ok: Any
        if item["action"] == "delete":
            ok = db.delete(col.table, str(payload.get(col.id_field)), col.id_field)
        else:
            ok = db.upsert(col.table, payload, on_conflict=col.id_field)
        if ok:
            tier1.inbox_remove(item["client_id"])
            replayed += 1
        else:
            failed.append(item["client_id"])
    audit.record(actor.email, "inbox-replay", "inbox", None, None, {"replayed": replayed, "failed": failed})
    return {"ok": True, "replayed": replayed, "failed": failed}
