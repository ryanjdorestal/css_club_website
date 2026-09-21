"""/api/os/board + /api/os/terms — the roster (who can log in) and the terms.
Rollover (admin): closes the current term, opens the next one, clones the
officers into it as active=false for the admin to confirm, and files a
handoff stub per officer (RHEC's one-handoff-per-person-per-term)."""
from __future__ import annotations

import time
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from .. import audit
from .. import collections as C
from ..auth import Actor, require_role
from ..crud import clean, make_router
from ..models import BoardProfileIn, TermIn

r: APIRouter = make_router("/os/board", C.board, BoardProfileIn, filters=("term", "active"), write_role="admin", order_by="sort")
terms_r = APIRouter(prefix="/os/terms")


@terms_r.get("")
def list_terms(actor: Actor = Depends(require_role("officer"))) -> dict[str, Any]:
    rows = sorted(C.terms.list(), key=lambda t: t.get("id", ""), reverse=True)
    return {"ok": True, "source": C.terms.source(), "rows": rows, "current": next((t for t in rows if t.get("is_current")), None)}


@terms_r.post("")
def create_term(body: TermIn, actor: Actor = Depends(require_role("admin"))) -> dict[str, Any]:
    if C.terms.get(body.id):
        raise HTTPException(409, "term exists")
    return {"ok": True, "row": C.terms.create(clean(body), actor.email)}


class RolloverIn(BaseModel):
    next_id: str = Field(min_length=2, max_length=12)
    next_label: str = Field(min_length=2, max_length=60)
    starts_on: str | None = None
    ends_on: str | None = None
    continuing_ids: list[str] = []   # board_profile ids that continue into the next term


@terms_r.post("/rollover")
def rollover(body: RolloverIn, actor: Actor = Depends(require_role("admin"))) -> dict[str, Any]:
    current = next((t for t in C.terms.list() if t.get("is_current")), None)
    if not current:
        raise HTTPException(409, "no current term")
    if C.terms.get(body.next_id):
        raise HTTPException(409, "next term already exists")
    officers = C.board.list(term=current["id"])
    # 1. close the current term, open the next
    C.terms.patch(current["id"], {"is_current": False}, actor.email, action="rollover:close")
    nxt = C.terms.create({"id": body.next_id, "label": body.next_label, "starts_on": body.starts_on, "ends_on": body.ends_on, "is_current": True}, actor.email)
    # 2. clone the continuing officers as active=false (admin confirms each)
    cloned = []
    for o in officers:
        if o["id"] in body.continuing_ids:
            cloned.append(C.board.create({**{k: v for k, v in o.items() if k not in ("id", "created_at", "updated_at")},
                                          "id": f"{body.next_id}/{o['id'].split('/')[-1]}", "term": body.next_id, "active": False}, actor.email))
    # 3. a handoff stub per outgoing officer for the closing term
    stubs = 0
    for o in officers:
        if not any(h.get("profile_id") == o["id"] and h.get("term") == current["id"] for h in C.handoffs.list()):
            C.handoffs.create({"profile_id": o["id"], "officer_name": o.get("name", ""), "role_title": o.get("role_title", ""),
                               "term": current["id"], "body_md": "", "status": "draft"}, actor.email)
            stubs += 1
    audit.record(actor.email, "rollover", "terms", body.next_id, current, nxt, note=f"{len(cloned)} continuing, {stubs} handoff stubs")
    return {"ok": True, "closed": current["id"], "opened": nxt, "cloned": cloned, "handoff_stubs": stubs, "ts": int(time.time())}
