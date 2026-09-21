"""/api/os/board + /api/os/terms — the roster (who can log in) and the terms.
Rollover (admin): closes the current term, opens the next one, clones the
officers into it as active=false for the admin to confirm, and files a
handoff stub per officer (RHEC's one-handoff-per-person-per-term)."""
from __future__ import annotations

import time
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from .. import audit, spine
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


class TermPatch(BaseModel):
    label: str | None = Field(default=None, min_length=2, max_length=60)
    starts_on: str | None = None
    ends_on: str | None = None
    is_current: bool | None = None


@terms_r.patch("/{term_id}")
def patch_term(term_id: str, body: TermPatch, actor: Actor = Depends(require_role("admin"))) -> dict[str, Any]:
    """Edit dates / label; `is_current: true` moves the current flag here (exactly one current term)."""
    if not C.terms.get(term_id):
        raise HTTPException(404, "no such term")
    changes = clean(body)
    if changes.get("is_current"):
        for t in C.terms.list():
            if t.get("is_current") and t["id"] != term_id:
                C.terms.patch(t["id"], {"is_current": False}, actor.email, action="term:unset-current")
    row = C.terms.patch(term_id, changes, actor.email, action="term:edit")
    return {"ok": True, "row": row}


@terms_r.delete("/{term_id}")
def delete_term(term_id: str, actor: Actor = Depends(require_role("admin"))) -> dict[str, Any]:
    """Refused for the current term and for any term that still has officers or spine records."""
    t = C.terms.get(term_id)
    if not t:
        raise HTTPException(404, "no such term")
    if t.get("is_current"):
        raise HTTPException(409, {"message": "the current term cannot be deleted — set another term current first", "field": "is_current"})
    officers = C.board.list(term=term_id)
    records = spine.list_records(term_id)
    if officers or records:
        raise HTTPException(409, {"message": f"{term_id} still has {len(officers)} officer(s) and {len(records)} record(s) — remove or move them first",
                                  "officers": len(officers), "records": len(records)})
    C.terms.delete(term_id, actor.email)
    return {"ok": True}


# the generic delete from make_router is replaced by the guarded one below (FastAPI matches in order)
r.routes[:] = [rt for rt in r.routes if not (getattr(rt, "path", "") == "/os/board/{row_id:path}" and "DELETE" in getattr(rt, "methods", set()))]


@r.delete("/{row_id:path}")
def delete_officer(row_id: str, actor: Actor = Depends(require_role("admin"))) -> dict[str, Any]:
    """An officer who filed a handoff is archived (kept for the term history), never deleted."""
    o = C.board.get(row_id)
    if not o:
        raise HTTPException(404, "not found")
    role = str(o.get("role_title") or "").lower()
    filed = any(h.get("type") == "handoff" and str(h.get("role") or "").lower() == role for h in spine.list_records(str(o.get("term") or "")))
    if filed:
        C.board.patch(row_id, {"active": False, "archived": True}, actor.email, action="archive")
        raise HTTPException(409, {"message": f"{o.get('name')} filed a handoff for {o.get('term')} — the seat was archived instead of deleted (history kept)",
                                  "archived": True})
    C.board.delete(row_id, actor.email)
    return {"ok": True}


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
    # 3. the spine: <next>/roster.md from the confirmed officers + a draft handoff stub per outgoing officer
    stubs = 0
    today = time.strftime("%Y-%m-%d")
    table = "\n".join(f"| {o.get('role_title', '')} | {o.get('name', '')} | {body.next_id} |" for o in cloned) or "| | | |"
    spine.save_record({"type": "roster", "title": f"Board roster — {body.next_label}", "term": body.next_id, "date": today, "status": "draft",
                       "owners": ["the board"], "visibility": "board"},
                      f"## Officers\n\n| Role | Name | Since |\n|---|---|---|\n{table}\n\n## Who holds what\n\nSee CSS OS → System → Ownership.\n", actor.email)
    for o in officers:
        role = str(o.get("role_title") or o.get("name") or "officer")
        meta = {"type": "handoff", "title": f"Handoff — {role}", "term": current["id"], "date": today, "status": "draft", "owners": [role], "visibility": "board", "role": role}
        if not spine.get_record(spine.record_id(meta)):
            spine.save_record(meta, "## What I ran\n\n## Where things are\n\n## What's unfinished\n\n## Who to call\n\n## Advice for whoever is next\n", actor.email)
            stubs += 1
    audit.record(actor.email, "rollover", "terms", body.next_id, current, nxt, note=f"{len(cloned)} continuing, {stubs} handoff stubs")
    return {"ok": True, "closed": current["id"], "opened": nxt, "cloned": cloned, "handoff_stubs": stubs, "ts": int(time.time())}
