"""/api/os/inheritance — the spine as an API: list/get/create/patch records
(markdown files under content/inheritance/), templates + HOW-TO, stats, and
a zip export. Every save runs spine.validate; a failing record is refused
with the rule names (422). Officers write; everyone on the board reads."""
from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import Response
from pydantic import BaseModel, Field

from .. import collections as C
from .. import spine
from ..auth import Actor, current_term, require_role

r = APIRouter(prefix="/os/inheritance")


class RecordIn(BaseModel):
    meta: dict[str, Any] = Field(default_factory=dict)
    body_md: str = Field(default="", max_length=120000)


def roster_names(term: str | None) -> list[str]:
    rows = C.board.list(term=term) if term else []
    names: list[str] = []
    for row in rows:
        names += [str(row.get("name", "")), str(row.get("role_title", ""))]
    return [n for n in names if n]


@r.get("")
def index(request: Request, actor: Actor = Depends(require_role("officer"))) -> dict[str, Any]:
    term = request.query_params.get("term") or None
    cur = (current_term() or {}).get("id")
    rows = spine.list_records(term)
    return {"ok": True, "rows": rows, "terms": spine.terms(), "current": cur, "types": list(spine.TYPES),
            "stats": spine.stats(term or cur, len(C.board.list(term=cur))), "source": "files"}


@r.get("/templates")
def templates(actor: Actor = Depends(require_role("officer"))) -> dict[str, Any]:
    return {"ok": True, "templates": spine.templates(), "howto": spine.howto()}


@r.get("/export.zip")
def export(actor: Actor = Depends(require_role("officer"))) -> Response:
    return Response(spine.export_zip(), media_type="application/zip", headers={"Content-Disposition": 'attachment; filename="inheritance.zip"'})


@r.get("/{rid:path}")
def get_one(rid: str, actor: Actor = Depends(require_role("officer"))) -> dict[str, Any]:
    row = spine.get_record(rid)
    if not row:
        raise HTTPException(404, "no such record")
    return {"ok": True, "row": row}


def _save(body: RecordIn, actor: Actor, rid: str | None = None) -> dict[str, Any]:
    meta = {k: v for k, v in body.meta.items() if v not in (None, "")}
    if rid:
        existing = spine.get_record(rid)
        if not existing:
            raise HTTPException(404, "no such record")
        for k in ("type", "term", "date"):
            meta.setdefault(k, existing.get(k))
        if spine.record_id(meta) != rid:
            raise HTTPException(422, {"errors": ["type, term, date and slug fix the file path — they cannot change on an existing record"]})
    meta.setdefault("term", (current_term() or {}).get("id"))
    row, errs = spine.save_record(meta, body.body_md, actor.email, roster_names(str(meta.get("term") or "")) or None)
    if errs:
        raise HTTPException(422, {"errors": errs})
    return {"ok": True, "row": row}


@r.post("")
def create(body: RecordIn, actor: Actor = Depends(require_role("officer"))) -> dict[str, Any]:
    if spine.get_record(spine.record_id({**body.meta, "term": body.meta.get("term") or (current_term() or {}).get("id")})):
        raise HTTPException(409, "a record already exists at that path — open it instead")
    return _save(body, actor)


@r.patch("/{rid:path}")
def patch(rid: str, body: RecordIn, actor: Actor = Depends(require_role("officer"))) -> dict[str, Any]:
    return _save(body, actor, rid)
