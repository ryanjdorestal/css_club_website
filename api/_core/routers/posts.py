"""The Posts API (`/api/os/posts`) — the server side of the OS Posts module.

Read this file as three parts:
  1. `prepare()` runs before every create: it turns the title into a URL slug (`welcome-back`),
     makes it unique (`welcome-back-2`), and stamps the author from the signed-in officer.
  2. `make_router(RouterSpec(...))` gives the module its standard routes for free — list, get,
     create, patch, delete, transition, archive, unarchive, duplicate — with validation (PostIn),
     roles (officer), audit records and the Tier-1 fallback all handled in crud.py / store.py.
  3. The routes below add what only posts need: `publish` (sets the date and the status).
Every route answers `{"ok": true, "row": ...}` or an error envelope `{"error": {"code", "message"}}`.
"""
from __future__ import annotations

import re
import time
from typing import Any

from fastapi import APIRouter, Depends, HTTPException

from .. import collections as C
from .. import lifecycle
from ..auth import Actor, require_role
from ..crud import RouterSpec, make_router
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


r: APIRouter = make_router(RouterSpec("/os/posts", C.posts, PostIn, transitions="posts", prepare=prepare))


@r.post("/{row_id:path}/publish")
def publish(row_id: str, actor: Actor = Depends(require_role("officer"))) -> dict[str, Any]:
    """Put a draft (or a post in review) on /news: status → published, the date set once and kept on re-publish."""
    post = C.posts.get(row_id)
    if not post:
        raise HTTPException(404, "not found")
    if not lifecycle.allowed("posts", str(post.get("status")), "published"):
        raise HTTPException(422, f"cannot publish from {post.get('status')}")
    changes = {"status": "published", "published_at": post.get("published_at") or time.strftime("%Y-%m-%d")}
    return {"ok": True, "row": C.posts.patch(row_id, changes, actor.email, action="publish")}
