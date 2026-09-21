"""/api/os/members — the Discord & member tracker (people, not auth). CSV
import with a dry-run diff first (`display_name,discord_handle,email,status,
joined_term`); status changes go through crud's audited transition."""
from __future__ import annotations

import csv
import io
from typing import Any

from fastapi import APIRouter, Depends

from .. import collections as C
from ..auth import Actor, require_role
from ..crud import make_router
from ..models import ImportIn, MemberIn

STATUSES = {"interested", "member", "active", "alumni", "left"}


def prepare(data: dict[str, Any], actor: Actor) -> dict[str, Any]:
    data.setdefault("status", "interested")
    data.setdefault("source", "manual")
    data.setdefault("tags", [])
    return data


r: APIRouter = make_router("/os/members", C.members, MemberIn, filters=("status", "joined_term"), delete_role="officer",
                           transitions="members", prepare=prepare)


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
    for m in added:
        C.members.create({**m, "source": "import", "tags": [], "notes": ""}, actor.email)
    for c in changed:
        C.members.patch(c["id"], {k: v for k, v in c["after"].items() if k not in ("id", "created_at")}, actor.email, action="import")
    return result
