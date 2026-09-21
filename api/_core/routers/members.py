"""/api/os/members — the Discord & member tracker (people, not auth). CSV
import with a dry-run diff first (`display_name,discord_handle,email,status,
joined_term`); status changes go through crud's audited transition."""
from __future__ import annotations

import csv
import io
import uuid
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from .. import audit, lifecycle
from .. import collections as C
from ..auth import Actor, require_role
from ..crud import RouterSpec, make_router
from ..models import ImportIn, MemberIn

STATUSES = {"interested", "member", "active", "alumni", "left"}


def prepare(data: dict[str, Any], actor: Actor) -> dict[str, Any]:
    data.setdefault("status", "interested")
    data.setdefault("source", "manual")
    data.setdefault("tags", [])
    return data


r: APIRouter = make_router(RouterSpec("/os/members", C.members, MemberIn, filters=("status", "joined_term"), delete_role="officer",
                                      transitions="members", prepare=prepare))


def parse_csv(text: str) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    for raw in csv.DictReader(io.StringIO(text.strip())):
        row = {(k or "").strip().lower(): (v or "").strip() for k, v in raw.items()}
        name = row.get("display_name") or row.get("name") or row.get("username") or ""
        if not name:
            continue
        rows.append({
            "display_name": name[:120], "discord_handle": (row.get("discord_handle") or row.get("discord") or row.get("handle") or "")[:80],
            "school_email": (row.get("email") or row.get("school_email") or "")[:200],
            "status": row.get("status") if row.get("status") in STATUSES else "member", "joined_term": row.get("joined_term") or "",
        })
    return rows


def key_of(m: dict[str, Any]) -> str:
    return (m.get("discord_handle") or m.get("school_email") or m.get("display_name") or "").lower()


@r.post("/import")
def import_members(body: ImportIn, actor: Actor = Depends(require_role("officer"))) -> dict[str, Any]:
    incoming = parse_csv(body.csv)
    existing = {key_of(m): m for m in C.members.list()}
    added, changed, unchanged = [], [], []
    for m in incoming:
        cur = existing.get(key_of(m))
        if not cur:
            added.append(m)
        elif any(cur.get(k, "") != v for k, v in m.items() if v):
            changed.append({"id": cur["id"], "before": cur, "after": {**cur, **{k: v for k, v in m.items() if v}}})
        else:
            unchanged.append(m)
    result = {"ok": True, "dry_run": body.dry_run, "added": len(added), "changed": len(changed), "unchanged": len(unchanged),
              "preview": (added + [c["after"] for c in changed])[:20]}
    if body.dry_run:
        return result
    batch = str(uuid.uuid4())[:8]
    for m in added:
        C.members.create({**m, "source": "import", "tags": [], "notes": "", "import_batch": batch}, actor.email)
    for c in changed:
        C.members.patch(c["id"], {k: v for k, v in c["after"].items() if k not in ("id", "created_at")}, actor.email, action="import")
    audit.record(actor.email, "import", "members", batch, None, {"added": len(added), "changed": len(changed)}, note=f"batch {batch}")
    return {**result, "batch": batch}


@r.post("/import/undo")
def undo_import(actor: Actor = Depends(require_role("officer"))) -> dict[str, Any]:
    """Delete every row the LAST import added (changed rows keep their new values — the audit has the diff)."""
    rows = [m for m in C.members.list() if m.get("import_batch")]
    if not rows:
        raise HTTPException(404, "no import to undo")
    last = max(rows, key=lambda m: int(m.get("created_at") or 0)).get("import_batch")
    removed = 0
    for m in rows:
        if m.get("import_batch") == last:
            C.members.delete(m["id"], actor.email)
            removed += 1
    audit.record(actor.email, "undo:import", "members", str(last), None, {"removed": removed})
    return {"ok": True, "batch": last, "removed": removed}


class BulkTransition(BaseModel):
    ids: list[str]
    to: str


@r.post("/bulk-transition")
def bulk_transition(body: BulkTransition, actor: Actor = Depends(require_role("officer"))) -> dict[str, Any]:
    """Honours the allowed-transition map per row; the rest are refused with the reason."""
    done, refused = [], []
    for mid in body.ids:
        m = C.members.get(mid)
        if not m:
            refused.append({"id": mid, "reason": "not found"})
        elif not lifecycle.allowed("members", str(m.get("status")), body.to):
            refused.append({"id": mid, "reason": f"{m.get('status')} → {body.to} is not allowed (allowed: {', '.join(lifecycle.next_states('members', str(m.get('status')))) or 'none'})"})
        else:
            C.members.patch(mid, {"status": body.to}, actor.email, action=f"transition:{body.to}")
            done.append(mid)
    return {"ok": True, "done": len(done), "refused": refused}


class MergeIn(BaseModel):
    survivor: str
    duplicate: str


@r.post("/merge")
def merge(body: MergeIn, actor: Actor = Depends(require_role("officer"))) -> dict[str, Any]:
    """Fold `duplicate` into `survivor`: keeps both handles/emails (the extra one lands in notes + tags), audited."""
    a, b = C.members.get(body.survivor), C.members.get(body.duplicate)
    if not a or not b:
        raise HTTPException(404, "member not found")
    tags = sorted({*(a.get("tags") or []), *(b.get("tags") or []), "merged"})
    notes = "\n".join(x for x in [str(a.get("notes") or ""), f"merged {b.get('display_name')} ({b.get('discord_handle') or '—'} · {b.get('school_email') or '—'})", str(b.get("notes") or "")] if x)
    changes = {"tags": tags, "notes": notes[:4000], "discord_handle": a.get("discord_handle") or b.get("discord_handle"), "school_email": a.get("school_email") or b.get("school_email")}
    row = C.members.patch(body.survivor, changes, actor.email, action="merge")
    C.members.delete(body.duplicate, actor.email)
    return {"ok": True, "row": row}
