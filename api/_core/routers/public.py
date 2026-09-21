"""Public endpoints — what the site reads and the two forms post to. Every
read returns the same JSON shape as its committed data/*.json fallback, so the
pages can swap between the API and the bundled file without code changes.
Mounted at /api by api/index.py."""
from __future__ import annotations

import json
import re
import time
from collections import defaultdict, deque
from typing import Any

from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse, RedirectResponse

from .. import collections as C
from .. import config, db, tier1
from ..auth import whoami
from ..models import ChatIn, OnboardingSubmit, ProjectSubmit

r = APIRouter()

# ---------------------------------------------------------- rate limit
_hits: dict[str, deque[float]] = defaultdict(deque)


def rate_limited(request: Request, limit: int = 20, window: int = 60) -> bool:
    ip = (request.headers.get("x-forwarded-for") or (request.client.host if request.client else "?")).split(",")[0].strip()
    now = time.time()
    q = _hits[ip]
    while q and q[0] < now - window:
        q.popleft()
    if len(q) >= limit:
        return True
    q.append(now)
    return False


# ---------------------------------------------------------------- health
@r.get("/health")
def health() -> dict[str, Any]:
    dbstate = "skipped"
    if config.supabase_configured():
        dbstate = "ok" if db.reachable() else "error"
    keepalive = tier1.read_json("../qa/keepalive.json", {})
    snapshot = tier1.read_json("snapshot.json", {})
    return {
        "ok": True, "sha": config.GIT_SHA, "db": dbstate, "ts": int(time.time()),
        "db_last_ok": db.last_ok, "keepalive": keepalive.get("last_run"), "snapshot": snapshot.get("generated_at"),
        "inbox": tier1.inbox_count(), "tier": "db" if dbstate == "ok" else "local",
    }


@r.get("/whoami")
def whoami_route(request: Request) -> dict[str, Any]:
    actor = whoami(request)
    return {"ok": True, **actor.dict(), "local_dev": config.local_dev_allowed(), "auth_configured": bool(config.SUPABASE_JWT_SECRET)}


# ------------------------------------------------------------- the Hound
STOP = {"the", "a", "an", "is", "are", "do", "i", "how", "what", "when", "where", "who",
        "to", "of", "in", "on", "for", "and", "or", "it", "you", "we", "can"}


def _stem(w: str) -> str:
    return re.sub(r"(ing|ers|er|ies|s)$", "", w)


def _tokens(text: str) -> set[str]:
    return {_stem(w) for w in re.split(r"[^a-z0-9]+", text.lower()) if len(w) > 1 and w not in STOP}


def kb_answer(message: str, page: str | None) -> dict[str, Any]:
    kb = tier1.read_json("kb.json", {"entries": [], "fallback": {
        "answer": "The knowledge base is missing — try the Events or Join pages.", "suggestions": [], "emote": "confused"}})
    msg_tokens, msg_lower = _tokens(message), message.lower()
    best, best_score = None, 0
    for entry in kb["entries"]:
        score = 0
        for kw in entry["keywords"]:
            if " " in kw:
                score += 3 if kw in msg_lower else 0
            elif _stem(kw.lower()) in msg_tokens:
                score += 2
        if page and any(page.startswith(p) for p in entry.get("pages", [])):
            score += 1
        if score > best_score:
            best, best_score = entry, score
    if not best or best_score < 2:
        fb = kb["fallback"]
        return {"answer": fb["answer"], "suggestions": fb.get("suggestions", []), "citations": [], "emote": fb.get("emote", "confused")}
    return {"answer": best["answer"], "suggestions": best.get("suggestions", []), "citations": best.get("citations", []), "emote": best.get("emote", "happy")}


@r.get("/chat")
def chat_status() -> dict[str, Any]:
    return {"ok": True, "source": "static", "configured": False, "mascot": "bloodhound"}


@r.post("/chat")
def chat(body: ChatIn, request: Request) -> Any:
    if rate_limited(request, limit=30):
        return JSONResponse({"ok": False, "error": "rate-limited"}, status_code=429)
    return {"ok": True, "source": "static", **kb_answer(body.message, body.page)}


# ------------------------------------------------------------ the forms
@r.post("/onboarding/submit")
def onboarding_submit(body: OnboardingSubmit, request: Request) -> Any:
    if rate_limited(request, limit=5, window=300):
        return JSONResponse({"ok": False, "error": "rate-limited"}, status_code=429)
    row = {"full_name": body.name, "email": body.email, "major": body.major or "", "class_year": body.class_year or "",
           "interests": body.interests or "", "discord_handle": body.discord_handle or "", "status": "new", "source": "site-join-form"}
    saved = C.onboarding.create(row, actor="public")
    member = {"display_name": body.name, "discord_handle": body.discord_handle or "", "school_email": body.email,
              "status": "interested", "joined_term": (C.terms.list(is_current=True) or [{}])[0].get("id"), "tags": [], "notes": "", "source": "form"}
    C.members.create(member, actor="public")
    return {"ok": True, "stored": "db" if C.onboarding.source() == "db" else "local", "id": saved.get("id")}


@r.post("/projects/submit")
def projects_submit(body: ProjectSubmit, request: Request) -> Any:
    if rate_limited(request, limit=5, window=300):
        return JSONResponse({"ok": False, "error": "rate-limited"}, status_code=429)
    platform = body.platform if isinstance(body.platform, list) else [p.strip() for p in str(body.platform or "").split(",") if p.strip()]
    row = {"title": body.title, "kind": body.kind, "summary": body.summary, "platform": platform[:5], "stack": [],
           "links": {"repo": body.link or ""}, "authors": [{"name": body.author, "handle": "", "term": ""}], "author_email": body.email,
           "status": "submitted", "featured": False, "display_order": 999, "source": "site-projects-form"}
    saved = C.projects.create(row, actor="public")
    return {"ok": True, "stored": "db" if C.projects.source() == "db" else "local", "id": saved.get("id")}


@r.post("/apps/submit")
def apps_submit_redirect() -> RedirectResponse:
    return RedirectResponse("/api/projects/submit", status_code=308)


# ------------------------------------------------------------ the reads
def _source(col: Any) -> str:
    return "db" if col.source() == "db" else ("local" if tier1.local_exists(col.table) else "static")


@r.get("/projects")
def projects() -> dict[str, Any]:
    rows = [p for p in C.projects.list(status="published") if p.get("visibility", "public") == "public"]
    rows.sort(key=lambda p: (not p.get("featured"), p.get("display_order", 0)))
    return {"ok": True, "source": _source(C.projects), "projects": rows}


@r.get("/apps")
def apps_alias() -> dict[str, Any]:
    data = projects()
    return {**data, "apps": [p for p in data["projects"] if p.get("kind") == "app"]}


@r.get("/posts")
def posts() -> dict[str, Any]:
    rows = sorted(C.posts.list(status="published"), key=lambda p: str(p.get("published_at", "")), reverse=True)
    return {"ok": True, "source": _source(C.posts), "posts": [{k: v for k, v in p.items() if k != "body_md"} for p in rows]}


@r.get("/posts/{slug}")
def post(slug: str) -> Any:
    rows = [p for p in C.posts.list(status="published") if p.get("slug") == slug]
    if not rows:
        return JSONResponse({"ok": False, "error": "not found"}, status_code=404)
    return {"ok": True, "source": _source(C.posts), "post": rows[0]}


@r.get("/events")
def events() -> dict[str, Any]:
    rows = [e for e in C.events.list(status="published")]
    by_sem: dict[str, list[dict[str, Any]]] = {}
    for e in sorted(rows, key=lambda e: (e.get("semester", ""), e.get("sort", 0))):
        by_sem.setdefault(e.get("semester", ""), []).append({
            "title": e.get("title"), "semester": e.get("semester"), "summary": e.get("summary", ""), "date": e.get("date_label", ""),
            "time": e.get("time_label", ""), "room": e.get("location", ""), "status": e.get("when", "past"),
            "flyer": e.get("flyer_path", ""), "rsvp_url": e.get("rsvp_url", ""), "id": e.get("id"),
        })
    semesters = [{"semester": s, "events": evs} for s, evs in by_sem.items()]
    semesters.sort(key=lambda s: s["semester"], reverse=True)
    return {"ok": True, "source": _source(C.events), "semesters": semesters}


@r.get("/board")
def board() -> dict[str, Any]:
    terms = sorted(C.terms.list(), key=lambda t: t.get("id", ""), reverse=True)
    profiles = C.board.list()
    out = []
    for t in terms:
        members = [p for p in profiles if p.get("term") == t["id"] and p.get("visibility", "public") == "public"]
        if not members:
            continue
        members.sort(key=lambda p: p.get("sort", 0))
        out.append({"term": t.get("label", t["id"]), "id": t["id"], "is_current": t.get("is_current", False), "members": [
            {"name": p.get("name"), "role": p.get("role_title", ""), "group": p.get("group_label", ""), "bio": p.get("bio", ""),
             "photo": p.get("photo_path", ""), "socials": p.get("socials", {})} for p in members]})
    cur = next((t for t in out if t["is_current"]), out[0] if out else None)
    return {"ok": True, "source": _source(C.board), "current_term": cur["term"] if cur else "", "terms": out}


@r.get("/resources")
def resources() -> dict[str, Any]:
    rows = C.resources.list()
    groups: dict[str, list[dict[str, Any]]] = {}
    for row in sorted(rows, key=lambda x: (x.get("group", ""), x.get("sort", 0))):
        groups.setdefault(row["group"], []).append({"title": row["title"], "url": row["url"], "description": row.get("description", ""),
                                                    "dead": row.get("dead", False), "id": row.get("id")})
    order = [g["group"] for g in tier1.read_json("resources.json", {"groups": []})["groups"]]
    names = sorted(groups, key=lambda g: order.index(g) if g in order else 99)
    return {"ok": True, "source": _source(C.resources), "count": len(rows), "groups": [{"group": g, "links": groups[g]} for g in names]}


@r.get("/links")
def links() -> dict[str, Any]:
    return {"ok": True, "source": _source(C.links), "links": {row["key"]: row["url"] for row in C.links.list()}}


@r.get("/site-settings")
def site_settings() -> dict[str, Any]:
    rows = C.settings.list()
    return {"ok": True, "source": _source(C.settings), "settings": {row["key"]: row.get("value") for row in rows}}


def dumps(obj: Any) -> str:
    return json.dumps(obj, ensure_ascii=False)
