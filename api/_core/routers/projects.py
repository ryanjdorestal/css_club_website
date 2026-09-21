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
        raise HTTPException(422, {"message": "a note is required when requesting changes — the student sees it on resubmit", "field": "note"})
    to = DECISION_STATE[body.decision]
    if not lifecycle.allowed("projects", str(before.get("status")), to):
        raise HTTPException(422, {"message": f"illegal transition {before.get('status')} → {to}", "field": "status",
                                  "allowed": lifecycle.next_states("projects", str(before.get("status")))})
    history = list(before.get("history") or []) + [{"at": int(time.time()), "by": actor.email, "to": to, "note": body.note or ""}]
    row = C.projects.patch(row_id, {"status": to, "review_notes": body.note or "", "reviewed_by": actor.email, "reviewed_at": int(time.time()), "history": history},
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


MAX_FEATURED = 3


@r.post("/{row_id:path}/feature")
def feature(row_id: str, actor: Actor = Depends(require_role("officer"))) -> dict[str, Any]:
    """Feature = pinned to the top three on /projects. A 4th is refused, naming the three."""
    row = C.projects.get(row_id)
    if not row:
        raise HTTPException(404, "not found")
    if row.get("featured"):
        return {"ok": True, "row": row}
    featured = [p for p in C.projects.list() if p.get("featured") and str(p.get("id")) != str(row_id)]
    if len(featured) >= MAX_FEATURED:
        raise HTTPException(409, {"message": f"three projects are already featured — unfeature one first: {', '.join(str(p.get('title')) for p in featured)}",
                                  "featured": [{"id": p.get("id"), "title": p.get("title")} for p in featured]})
    return {"ok": True, "row": C.projects.patch(row_id, {"featured": True, "display_order": 0}, actor.email, action="feature")}


@r.post("/{row_id:path}/unfeature")
def unfeature(row_id: str, actor: Actor = Depends(require_role("officer"))) -> dict[str, Any]:
    if not C.projects.get(row_id):
        raise HTTPException(404, "not found")
    return {"ok": True, "row": C.projects.patch(row_id, {"featured": False}, actor.email, action="unfeature")}


@r.post("/{row_id:path}/unpublish")
def unpublish(row_id: str, actor: Actor = Depends(require_role("officer"))) -> dict[str, Any]:
    before = C.projects.get(row_id)
    if not before:
        raise HTTPException(404, "not found")
    if before.get("status") != "published":
        raise HTTPException(422, {"message": f"not published (status {before.get('status')})", "field": "status"})
    return {"ok": True, "row": C.projects.patch(row_id, {"status": "approved", "featured": False}, actor.email, action="unpublish")}


@r.post("/reorder")
def reorder(body: ReorderIn, actor: Actor = Depends(require_role("officer"))) -> dict[str, Any]:
    for i, pid in enumerate(body.ids):
        C.projects.patch(pid, {"display_order": i}, actor.email, action="reorder")
    return {"ok": True, "count": len(body.ids)}
