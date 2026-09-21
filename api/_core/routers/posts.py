"""/api/os/posts — officers write News posts; /news renders published ones.
CRUD from crud.make_router; publish sets status + published_at with an audit
record. Slugs are derived from the title when not supplied."""
from __future__ import annotations

import re
import time
from typing import Any

from fastapi import APIRouter, Depends, HTTPException

from .. import collections as C
from .. import lifecycle
from ..auth import Actor, require_role
from ..crud import make_router
from ..models import PostIn


def slugify(s: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")[:80]


def prepare(data: dict[str, Any], actor: Actor) -> dict[str, Any]:
    base = slugify(data.get("slug") or data["title"])
    taken = {str(p.get("slug")) for p in C.posts.list()}
    data["slug"] = base
    n = 2
    while data["slug"] in taken:  # welcome-back, welcome-back-2, welcome-back-3 …
        data["slug"] = f"{base}-{n}"
        n += 1
    data["id"] = data["slug"]
    data["author_name"] = actor.name or actor.email
    data["author_profile_id"] = actor.profile_id
    data.setdefault("tags", [])
    return data


r: APIRouter = make_router("/os/posts", C.posts, PostIn, transitions="posts", prepare=prepare)


@r.post("/{row_id:path}/publish")
def publish(row_id: str, actor: Actor = Depends(require_role("officer"))) -> dict[str, Any]:
    before = C.posts.get(row_id)
    if not before:
        raise HTTPException(404, "not found")
    if not lifecycle.allowed("posts", str(before.get("status")), "published"):
        raise HTTPException(422, f"cannot publish from {before.get('status')}")
    changes = {"status": "published", "published_at": before.get("published_at") or time.strftime("%Y-%m-%d")}
    return {"ok": True, "row": C.posts.patch(row_id, changes, actor.email, action="publish")}
