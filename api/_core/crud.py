"""Generic OS router: list / get / create / patch / delete / transition / archive / unarchive /
duplicate for one Collection (run 10 §6: every entity inherits them). Module routers build on it
and add their specific actions (publish, decide, import…). Every write: validate → authorize →
write (DB or local+inbox) → audit → return the row. Creates carry a client-generated `client_id`
(idempotent: a double-click makes one row); patches may carry `expected_updated_at` and get a 409
when the row changed elsewhere. Used by every routers/*.py — CONTRIBUTING.md "adding an entity"."""

from collections.abc import Callable
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel

from . import lifecycle
from .auth import Actor, require_role
from .store import Collection, Conflict

META = ("client_id", "expected_updated_at")


def clean(model: BaseModel) -> dict[str, Any]:
    """Model → dict without the Nones (so PATCH bodies stay partial) and without the write meta."""
    return {k: v for k, v in model.model_dump().items() if v is not None and k not in META}


def meta(model: BaseModel) -> tuple[str | None, int | None]:
    d = model.model_dump()
    cid = d.get("client_id")
    exp = d.get("expected_updated_at")
    return (str(cid) if cid else None, int(exp) if exp is not None else None)


def conflict(exc: Conflict) -> HTTPException:
    return HTTPException(409, {"message": "CHANGED_ELSEWHERE — this row was saved by someone else since you opened it", "code": "conflict",
                              "current": exc.current, "attempted": exc.attempted})


def make_router(
    prefix: str,
    col: Collection,
    model_in: type[BaseModel],
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
        cid, _ = meta(body)
        if prepare:
            data = prepare(data, actor)
        if transitions:
            data.setdefault("status", lifecycle.initial_state(transitions))
        data.setdefault("created_by", actor.email)
        row = col.create(data, actor.email, client_id=cid)
        return {"ok": True, "row": row, "source": col.source()}

    @r.patch("/{row_id:path}")
    def patch_row(row_id: str, body: model_in, actor: Actor = Depends(require_role(write_role))) -> dict[str, Any]:  # type: ignore[valid-type]
        changes = clean(body)
        _, expected = meta(body)
        if transitions and "status" in changes:
            before = col.get(row_id) or {}
            if changes["status"] != before.get("status") and not lifecycle.allowed(transitions, str(before.get("status")), changes["status"]):
                raise HTTPException(422, {"message": f"illegal transition {before.get('status')} → {changes['status']}", "field": "status"})
        try:
            row = col.patch(row_id, changes, actor.email, expected_updated_at=expected)
        except Conflict as exc:
            raise conflict(exc) from None
        if not row:
            raise HTTPException(404, "not found")
        return {"ok": True, "row": row, "source": col.source()}

    @r.delete("/{row_id:path}")
    def delete_row(row_id: str, actor: Actor = Depends(require_role(delete_role))) -> dict[str, Any]:
        if not col.delete(row_id, actor.email):
            raise HTTPException(404, "not found")
        return {"ok": True}

    @r.post("/{row_id:path}/archive")
    def archive_row(row_id: str, actor: Actor = Depends(require_role(write_role))) -> dict[str, Any]:
        row = col.archive(row_id, actor.email)
        if not row:
            raise HTTPException(404, "not found")
        return {"ok": True, "row": row}

    @r.post("/{row_id:path}/unarchive")
    def unarchive_row(row_id: str, actor: Actor = Depends(require_role(write_role))) -> dict[str, Any]:
        row = col.archive(row_id, actor.email, undo=True)
        if not row:
            raise HTTPException(404, "not found")
        return {"ok": True, "row": row}

    @r.post("/{row_id:path}/duplicate")
    def duplicate_row(row_id: str, actor: Actor = Depends(require_role(write_role))) -> dict[str, Any]:
        row = col.duplicate(row_id, actor.email, lifecycle.initial_state(transitions) if transitions else None)
        if not row:
            raise HTTPException(404, "not found")
        return {"ok": True, "row": row}

    if transitions:

        @r.post("/{row_id:path}/transition")
        def transition(row_id: str, body: TransitionBody, actor: Actor = Depends(require_role(write_role))) -> dict[str, Any]:
            before = col.get(row_id)
            if not before:
                raise HTTPException(404, "not found")
            if not lifecycle.allowed(transitions, str(before.get("status")), body.to):
                raise HTTPException(422, {"message": f"illegal transition {before.get('status')} → {body.to}", "field": "status",
                                          "allowed": lifecycle.next_states(transitions, str(before.get("status")))})
            row = col.patch(row_id, {"status": body.to, "status_note": body.note or ""}, actor.email, action=f"transition:{body.to}")
            return {"ok": True, "row": row}

    return r


class TransitionBody(BaseModel):
    to: str
    note: str | None = None
