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
from pydantic import BaseModel, Field

from .. import collections as C
from ..auth import Actor, require_role
from ..crud import clean, make_router
from ..models import LinkIn, ReorderIn, ResourceIn

r: APIRouter = make_router("/os/resources", C.resources, ResourceIn, filters=("group",), delete_role="officer", order_by="sort")
links_r = APIRouter(prefix="/os/links")


class CategoryIn(BaseModel):
    group: str = Field(min_length=1, max_length=80)
    to: str | None = Field(default=None, min_length=1, max_length=80)
    cascade: bool = False


@r.post("/category/rename")
def rename_category(body: CategoryIn, actor: Actor = Depends(require_role("officer"))) -> dict[str, Any]:
    if not body.to:
        raise HTTPException(422, {"message": "new name required", "field": "to"})
    rows = C.resources.list(group=body.group)
    if not rows:
        raise HTTPException(404, "no such category")
    for row in rows:
        C.resources.patch(row["id"], {"group": body.to}, actor.email, action="category:rename")
    return {"ok": True, "moved": len(rows)}


@r.post("/category/delete")
def delete_category(body: CategoryIn, actor: Actor = Depends(require_role("officer"))) -> dict[str, Any]:
    """Refused while links exist unless `cascade` — then every link goes, named in the audit note."""
    rows = C.resources.list(group=body.group)
    if rows and not body.cascade:
        raise HTTPException(409, {"message": f"'{body.group}' still holds {len(rows)} link(s) — move them or confirm the cascade (every link in it is deleted)",
                                  "links": [row["title"] for row in rows]})
    for row in rows:
        C.resources.delete(row["id"], actor.email)
    return {"ok": True, "deleted": len(rows)}


class CategoryOrder(BaseModel):
    groups: list[str]


@r.post("/category/reorder")
def reorder_categories(body: CategoryOrder, actor: Actor = Depends(require_role("officer"))) -> dict[str, Any]:
    """Category order = a `group_sort` on every link of the group (the public page sorts by it)."""
    n = 0
    for i, g in enumerate(body.groups):
        for row in C.resources.list(group=g):
            C.resources.patch(row["id"], {"group_sort": i}, actor.email, action="category:reorder")
            n += 1
    return {"ok": True, "count": n}


class BulkIn(BaseModel):
    group: str = Field(min_length=1, max_length=80)
    text: str = Field(min_length=1, max_length=20000)
    dry_run: bool = True


@r.post("/bulk")
def bulk_paste(body: BulkIn, actor: Actor = Depends(require_role("officer"))) -> dict[str, Any]:
    """One URL per line (optionally `Title | URL`) → parsed preview rows → confirm with dry_run=false."""
    rows: list[dict[str, Any]] = []
    known = {r["url"] for r in C.resources.list()}
    for line in body.text.splitlines():
        line = line.strip()
        if not line:
            continue
        title, url = (line.split("|", 1) + [""])[:2] if "|" in line else ("", line)
        url = url.strip() or title.strip()
        title = title.strip() or url.replace("https://", "").replace("http://", "").split("/")[0]
        ok = url.startswith("http://") or url.startswith("https://")
        rows.append({"title": title[:160], "url": url[:600], "group": body.group, "ok": ok, "duplicate": url in known})
    if body.dry_run:
        return {"ok": True, "dry_run": True, "rows": rows}
    created = [C.resources.create({"group": body.group, "title": r["title"], "url": r["url"], "description": "", "sort": 999}, actor.email)
               for r in rows if r["ok"] and not r["duplicate"]]
    return {"ok": True, "dry_run": False, "created": len(created), "skipped": len(rows) - len(created)}


@r.post("/{row_id:path}/check")
def check_one(row_id: str, actor: Actor = Depends(require_role("officer"))) -> dict[str, Any]:
    row = C.resources.get(row_id)
    if not row:
        raise HTTPException(404, "not found")
    status, is_dead = probe(str(row["url"]))
    saved = C.resources.patch(row_id, {"last_checked": int(time.time()), "last_status": status, "dead": is_dead}, actor.email, action="linkcheck")
    return {"ok": True, "row": saved, "dead": is_dead, "status": status}


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
