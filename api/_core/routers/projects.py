"""/api/os/projects — the review queue + the curated public Projects list.
CRUD from crud.make_router; decide / publish / reorder are the module's own
actions. Mounted by api/index.py."""
from __future__ import annotations

import time
from typing import Any

from fastapi import APIRouter, Depends, HTTPException

from .. import collections as C
from .. import lifecycle
from ..auth import Actor, require_role
from ..crud import make_router
from ..models import DecideIn, ProjectIn, ReorderIn

r: APIRouter = make_router("/os/projects", C.projects, ProjectIn, filters=("status", "kind"), transitions="projects")

DECISION_STATE = {"approve": "approved", "request_changes": "changes_requested", "archive": "archived", "in_review": "in_review"}


@r.post("/{row_id:path}/decide")
def decide(row_id: str, body: DecideIn, actor: Actor = Depends(require_role("officer"))) -> dict[str, Any]:
    before = C.projects.get(row_id)
    if not before:
        raise HTTPException(404, "not found")
    if body.decision == "request_changes" and not (body.note or "").strip():
        raise HTTPException(422, "a note is required when requesting changes")
    to = DECISION_STATE[body.decision]
    if not lifecycle.allowed("projects", str(before.get("status")), to):
        raise HTTPException(422, {"error": "illegal transition", "allowed": lifecycle.next_states("projects", str(before.get("status")))})
    row = C.projects.patch(row_id, {"status": to, "review_notes": body.note or "", "reviewed_by": actor.email, "reviewed_at": int(time.time())},
                           actor.email, action=f"decide:{body.decision}")
    return {"ok": True, "row": row}


@r.post("/{row_id:path}/publish")
def publish(row_id: str, actor: Actor = Depends(require_role("officer"))) -> dict[str, Any]:
    before = C.projects.get(row_id)
    if not before:
        raise HTTPException(404, "not found")
    if not lifecycle.allowed("projects", str(before.get("status")), "published"):
        raise HTTPException(422, f"cannot publish from {before.get('status')}")
    row = C.projects.patch(row_id, {"status": "published", "published_at": int(time.time()), "visibility": "public"}, actor.email, action="publish")
    return {"ok": True, "row": row}


@r.post("/{row_id:path}/feature")
def feature(row_id: str, actor: Actor = Depends(require_role("officer"))) -> dict[str, Any]:
    """Make this the featured project (the public page shows one); clears the others."""
    if not C.projects.get(row_id):
        raise HTTPException(404, "not found")
    for other in C.projects.list():
        if other.get("featured") and str(other.get("id")) != str(row_id):
            C.projects.patch(str(other["id"]), {"featured": False}, actor.email, action="unfeature")
    return {"ok": True, "row": C.projects.patch(row_id, {"featured": True, "display_order": 0}, actor.email, action="feature")}


@r.post("/reorder")
def reorder(body: ReorderIn, actor: Actor = Depends(require_role("officer"))) -> dict[str, Any]:
    for i, pid in enumerate(body.ids):
        C.projects.patch(pid, {"display_order": i}, actor.email, action="reorder")
    return {"ok": True, "count": len(body.ids)}
