"""Generic OS router: list / get / create / patch / delete / transition for one
Collection. Module routers build on it and add their specific actions
(publish, decide, import…). Every write: validate → authorize → write (DB or
local+inbox) → audit → return the row. Used by every routers/*.py."""

from typing import Any, Callable, Type

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel

from . import lifecycle
from .auth import Actor, require_role
from .store import Collection


def clean(model: BaseModel) -> dict[str, Any]:
    """Model → dict without the Nones (so PATCH bodies stay partial)."""
    return {k: v for k, v in model.model_dump().items() if v is not None}


def make_router(
    prefix: str,
    col: Collection,
    model_in: Type[BaseModel],
    *,
    read_role: str = "officer",
    write_role: str = "officer",
    delete_role: str = "admin",
    filters: tuple[str, ...] = ("status",),
    transitions: str | None = None,
    order_by: str = "updated_at",
    prepare: Callable[[dict[str, Any], Actor], dict[str, Any]] | None = None,
) -> APIRouter:
    r = APIRouter(prefix=prefix)

    @r.get("")
    def list_rows(request: Request, actor: Actor = Depends(require_role(read_role))) -> dict[str, Any]:
        active = {k: request.query_params.get(k) for k in filters if request.query_params.get(k)}
        rows = col.list(**active)
        q = (request.query_params.get("q") or "").lower()
        if q:
            rows = [row for row in rows if q in " ".join(str(v) for v in row.values()).lower()]
        rows = sorted(rows, key=lambda row: str(row.get(order_by, "")), reverse=True)
        return {"ok": True, "source": col.source(), "rows": rows, "count": len(rows), "actor": actor.dict()}

    @r.get("/{row_id:path}/next")
    def next_states(row_id: str, actor: Actor = Depends(require_role(read_role))) -> dict[str, Any]:
        row = col.get(row_id)
        if not row:
            raise HTTPException(404, "not found")
        return {"ok": True, "next": lifecycle.next_states(transitions or col.table, str(row.get("status", "")))}

    @r.get("/{row_id:path}")
    def get_row(row_id: str, actor: Actor = Depends(require_role(read_role))) -> dict[str, Any]:
        row = col.get(row_id)
        if not row:
            raise HTTPException(404, "not found")
        return {"ok": True, "row": row}

    @r.post("")
    def create_row(body: model_in, actor: Actor = Depends(require_role(write_role))) -> dict[str, Any]:  # type: ignore[valid-type]
        data = clean(body)
        if prepare:
            data = prepare(data, actor)
        if transitions:
            data.setdefault("status", lifecycle.initial_state(transitions))
        data.setdefault("created_by", actor.email)
        row = col.create(data, actor.email)
        return {"ok": True, "row": row, "source": col.source()}

    @r.patch("/{row_id:path}")
    def patch_row(row_id: str, body: model_in, actor: Actor = Depends(require_role(write_role))) -> dict[str, Any]:  # type: ignore[valid-type]
        changes = clean(body)
        if transitions and "status" in changes:
            before = col.get(row_id) or {}
            if changes["status"] != before.get("status") and not lifecycle.allowed(transitions, str(before.get("status")), changes["status"]):
                raise HTTPException(422, f"illegal transition {before.get('status')} → {changes['status']}")
        row = col.patch(row_id, changes, actor.email)
        if not row:
            raise HTTPException(404, "not found")
        return {"ok": True, "row": row, "source": col.source()}

    @r.delete("/{row_id:path}")
    def delete_row(row_id: str, actor: Actor = Depends(require_role(delete_role))) -> dict[str, Any]:
        if not col.delete(row_id, actor.email):
            raise HTTPException(404, "not found")
        return {"ok": True}

    if transitions:

        @r.post("/{row_id:path}/transition")
        def transition(row_id: str, body: TransitionBody, actor: Actor = Depends(require_role(write_role))) -> dict[str, Any]:
            before = col.get(row_id)
            if not before:
                raise HTTPException(404, "not found")
            if not lifecycle.allowed(transitions, str(before.get("status")), body.to):
                raise HTTPException(422, {"error": "illegal transition", "allowed": lifecycle.next_states(transitions, str(before.get("status")))})
            row = col.patch(row_id, {"status": body.to, "status_note": body.note or ""}, actor.email, action=f"transition:{body.to}")
            return {"ok": True, "row": row}

    return r


class TransitionBody(BaseModel):
    to: str
    note: str | None = None
