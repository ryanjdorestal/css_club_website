"""/api/os/events — the board's event list; /events and Home read published
rows through /api/events (public.py) in the nested semester shape."""
from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Depends, HTTPException

from .. import collections as C
from .. import lifecycle
from ..auth import Actor, require_role
from ..crud import make_router
from ..models import EventIn


def prepare(data: dict[str, Any], actor: Actor) -> dict[str, Any]:
    data.setdefault("when", "upcoming")
    data.setdefault("semester", "Fall 2026")
    data.setdefault("sort", 0)
    return data


r: APIRouter = make_router("/os/events", C.events, EventIn, filters=("status", "semester"), transitions="events", prepare=prepare)


@r.post("/{row_id:path}/publish")
def publish(row_id: str, actor: Actor = Depends(require_role("officer"))) -> dict[str, Any]:
    before = C.events.get(row_id)
    if not before:
        raise HTTPException(404, "not found")
    if not lifecycle.allowed("events", str(before.get("status")), "published"):
        raise HTTPException(422, f"cannot publish from {before.get('status')}")
    return {"ok": True, "row": C.events.patch(row_id, {"status": "published"}, actor.email, action="publish")}
