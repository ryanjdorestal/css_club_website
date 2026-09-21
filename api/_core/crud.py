"""Generic OS router: list / get / create / patch / delete / transition / archive / unarchive /
duplicate for one Collection (run 10 §6: every entity inherits them). Module routers build on it
and add their specific actions (publish, decide, import…). Every write: validate → authorize →
write (DB or local+inbox) → audit → return the row. Creates carry a client-generated `client_id`
(idempotent: a double-click makes one row); patches may carry `expected_updated_at` and get a 409
when the row changed elsewhere. Used by every routers/*.py — CONTRIBUTING.md "adding an entity"."""

from collections.abc import Callable
from dataclasses import dataclass
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
    return HTTPException(409, {"message": "CHANGED_ELSEWHERE — this row was saved by someone else since you opened it", "code": "conflict", "current": exc.current, "attempted": exc.attempted})


@dataclass(frozen=True)
class RouterSpec:
    """What one entity's generic router needs: the collection, its input model, who may read / write /
    delete, the list filters, the lifecycle name (None = no status machine), the sort key, and an
    optional `prepare(data, actor)` hook run before every create."""

    prefix: str
    col: Collection
    model_in: type[BaseModel]
    read_role: str = "officer"
    write_role: str = "officer"
    delete_role: str = "admin"
    filters: tuple[str, ...] = ("status",)
    transitions: str | None = None
    order_by: str = "updated_at"
    prepare: Callable[[dict[str, Any], Actor], dict[str, Any]] | None = None


class TransitionBody(BaseModel):
    to: str
    note: str | None = None


def found(row: dict[str, Any] | None) -> dict[str, Any]:
    if not row:
        raise HTTPException(404, "not found")
    return row


def illegal_transition(spec: RouterSpec, before: dict[str, Any], to: str) -> HTTPException:
    return HTTPException(422, {"message": f"illegal transition {before.get('status')} → {to}", "field": "status", "allowed": lifecycle.next_states(str(spec.transitions), str(before.get("status")))})


def make_router(spec: RouterSpec) -> APIRouter:
    r = APIRouter(prefix=spec.prefix)
    add_reads(r, spec)
    add_writes(r, spec)
    add_lifecycle(r, spec)
    return r


def add_reads(r: APIRouter, spec: RouterSpec) -> None:
    col = spec.col

    @r.get("")
    def list_rows(request: Request, actor: Actor = Depends(require_role(spec.read_role))) -> dict[str, Any]:
        active = {k: request.query_params.get(k) for k in spec.filters if request.query_params.get(k)}
        rows = col.list(**active)
        q = (request.query_params.get("q") or "").lower()
        if q:
            rows = [row for row in rows if q in " ".join(str(v) for v in row.values()).lower()]
        rows = sorted(rows, key=lambda row: str(row.get(spec.order_by, "")), reverse=True)
        return {"ok": True, "source": col.source(), "rows": rows, "count": len(rows), "actor": actor.dict()}

    @r.get("/{row_id:path}/next")
    def next_states(row_id: str, actor: Actor = Depends(require_role(spec.read_role))) -> dict[str, Any]:
        row = found(col.get(row_id))
        return {"ok": True, "next": lifecycle.next_states(spec.transitions or col.table, str(row.get("status", "")))}

    @r.get("/{row_id:path}")
    def get_row(row_id: str, actor: Actor = Depends(require_role(spec.read_role))) -> dict[str, Any]:
        return {"ok": True, "row": found(col.get(row_id))}


def add_writes(r: APIRouter, spec: RouterSpec) -> None:
    col, model_in = spec.col, spec.model_in

    @r.post("")
    def create_row(body: model_in, actor: Actor = Depends(require_role(spec.write_role))) -> dict[str, Any]:  # type: ignore[valid-type]
        data = clean(body)
        cid, _ = meta(body)
        if spec.prepare:
            data = spec.prepare(data, actor)
        if spec.transitions:
            data.setdefault("status", lifecycle.initial_state(spec.transitions))
        data.setdefault("created_by", actor.email)
        row = col.create(data, actor.email, client_id=cid)
        return {"ok": True, "row": row, "source": col.source()}

    @r.patch("/{row_id:path}")
    def patch_row(row_id: str, body: model_in, actor: Actor = Depends(require_role(spec.write_role))) -> dict[str, Any]:  # type: ignore[valid-type]
        changes = clean(body)
        _, expected = meta(body)
        if spec.transitions and "status" in changes:
            before = col.get(row_id) or {}
            if changes["status"] != before.get("status") and not lifecycle.allowed(spec.transitions, str(before.get("status")), changes["status"]):
                raise HTTPException(422, {"message": f"illegal transition {before.get('status')} → {changes['status']}", "field": "status"})
        try:
            row = col.patch(row_id, changes, actor.email, expected_updated_at=expected)
        except Conflict as exc:
            raise conflict(exc) from None
        return {"ok": True, "row": found(row), "source": col.source()}

    @r.delete("/{row_id:path}")
    def delete_row(row_id: str, actor: Actor = Depends(require_role(spec.delete_role))) -> dict[str, Any]:
        if not col.delete(row_id, actor.email):
            raise HTTPException(404, "not found")
        return {"ok": True}


def add_lifecycle(r: APIRouter, spec: RouterSpec) -> None:
    col = spec.col

    @r.post("/{row_id:path}/archive")
    def archive_row(row_id: str, actor: Actor = Depends(require_role(spec.write_role))) -> dict[str, Any]:
        return {"ok": True, "row": found(col.archive(row_id, actor.email))}

    @r.post("/{row_id:path}/unarchive")
    def unarchive_row(row_id: str, actor: Actor = Depends(require_role(spec.write_role))) -> dict[str, Any]:
        return {"ok": True, "row": found(col.archive(row_id, actor.email, undo=True))}

    @r.post("/{row_id:path}/duplicate")
    def duplicate_row(row_id: str, actor: Actor = Depends(require_role(spec.write_role))) -> dict[str, Any]:
        initial = lifecycle.initial_state(spec.transitions) if spec.transitions else None
        return {"ok": True, "row": found(col.duplicate(row_id, actor.email, initial))}

    if not spec.transitions:
        return

    @r.post("/{row_id:path}/transition")
    def transition(row_id: str, body: TransitionBody, actor: Actor = Depends(require_role(spec.write_role))) -> dict[str, Any]:
        before = found(col.get(row_id))
        if not lifecycle.allowed(str(spec.transitions), str(before.get("status")), body.to):
            raise illegal_transition(spec, before, body.to)
        row = col.patch(row_id, {"status": body.to, "status_note": body.note or ""}, actor.email, action=f"transition:{body.to}")
        return {"ok": True, "row": row}
