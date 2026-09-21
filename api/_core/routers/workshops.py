"""/api/os/workshops — workshops as a first-class entity (run 10 §7): CRUD from
crud.make_router (list / get / create / patch / delete / transition / archive / unarchive /
duplicate) + publish. Public: /api/workshops (published, grouped by series) in public.py.
Tier 1: data/workshops.local.json seeded from data/workshops.json; DB: 0004_workshops.sql."""
from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Depends, HTTPException

from .. import collections as C
from ..auth import Actor, require_role
from ..crud import RouterSpec, make_router
from ..models import WorkshopIn

r: APIRouter = make_router(RouterSpec("/os/workshops", C.workshops, WorkshopIn, filters=("status", "series", "level"), transitions="workshops", order_by="date"))


@r.post("/{row_id:path}/publish")
def publish(row_id: str, actor: Actor = Depends(require_role("officer"))) -> dict[str, Any]:
    before = C.workshops.get(row_id)
    if not before:
        raise HTTPException(404, "not found")
    if not before.get("date"):
        raise HTTPException(422, {"message": "a workshop needs a date before it is published", "field": "date"})
    row = C.workshops.patch(row_id, {"status": "published"}, actor.email, action="publish")
    return {"ok": True, "row": row, "public": "/events#workshops"}


def public_rows() -> list[dict[str, Any]]:
    rows = [w for w in C.workshops.list(status="published")]
    rows.sort(key=lambda w: (str(w.get("series") or ""), int(w.get("session_no") or 0), str(w.get("date") or "")))
    return rows
