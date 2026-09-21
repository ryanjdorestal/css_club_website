"""/api/os/resources + /api/os/links — the curated resource groups and the
site's own links (Discord invite, forms…). `links/check` does a server-side
HEAD/GET with a 6 s timeout and records last_status / dead per row; it runs
the same way in Tier 1. Editing the Discord invite here changes the public
site (Tier 2 live, Tier 1 after a snapshot)."""
from __future__ import annotations

import time
from typing import Any

import httpx
from fastapi import APIRouter, Depends, HTTPException

from .. import collections as C
from ..auth import Actor, require_role
from ..crud import clean, make_router
from ..models import LinkIn, ReorderIn, ResourceIn

r: APIRouter = make_router("/os/resources", C.resources, ResourceIn, filters=("group",), delete_role="officer", order_by="sort")
links_r = APIRouter(prefix="/os/links")


@r.post("/reorder")
def reorder(body: ReorderIn, actor: Actor = Depends(require_role("officer"))) -> dict[str, Any]:
    for i, rid in enumerate(body.ids):
        C.resources.patch(rid, {"sort": i}, actor.email, action="reorder")
    return {"ok": True, "count": len(body.ids)}


@links_r.get("")
def list_links(actor: Actor = Depends(require_role("officer"))) -> dict[str, Any]:
    return {"ok": True, "source": C.links.source(), "rows": C.links.list()}


@links_r.patch("/{key}")
def patch_link(key: str, body: LinkIn, actor: Actor = Depends(require_role("officer"))) -> dict[str, Any]:
    row = C.links.patch(key, clean(body), actor.email)
    if not row:
        raise HTTPException(404, "no such link key")
    return {"ok": True, "row": row}


def probe(url: str) -> tuple[int | None, bool]:
    """(status, dead). HEAD first, GET if the host dislikes HEAD; 6 s budget."""
    if not url.startswith("http"):
        return None, False
    try:
        with httpx.Client(timeout=6.0, follow_redirects=True, headers={"User-Agent": "jjcss-linkcheck/1.0"}) as c:
            resp = c.head(url)
            if resp.status_code >= 400:
                resp = c.get(url)
            return resp.status_code, resp.status_code >= 400
    except Exception:
        return None, True


@links_r.post("/check")
def check_links(actor: Actor = Depends(require_role("officer"))) -> dict[str, Any]:
    """Check every site link AND every resource link. Returns the dead list."""
    dead: list[dict[str, Any]] = []
    checked = 0
    for row in C.links.list():
        status, is_dead = probe(row["url"])
        C.links.patch(row["key"], {"last_checked": int(time.time()), "last_status": status, "dead": is_dead}, actor.email, action="linkcheck")
        checked += 1
        if is_dead:
            dead.append({"kind": "link", "id": row["key"], "url": row["url"], "status": status})
    for row in C.resources.list():
        status, is_dead = probe(row["url"])
        C.resources.patch(row["id"], {"last_checked": int(time.time()), "last_status": status, "dead": is_dead}, actor.email, action="linkcheck")
        checked += 1
        if is_dead:
            dead.append({"kind": "resource", "id": row["id"], "url": row["url"], "status": status})
    return {"ok": True, "checked": checked, "dead": dead, "checked_at": int(time.time())}
