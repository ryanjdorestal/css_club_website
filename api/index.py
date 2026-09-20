"""
John Jay CSS — the one FastAPI app. api/ holds <= 2 files (this + requirements.txt);
CI enforces the count, so Vercel's function limit can never be hit and a push can
never silently serve a stale deploy.

Contracts re-implemented from rhecwb's Netlify functions (chat-assistant,
onboarding-submit) — in Python, keyless, for the new John Jay project.

Tier-1 guarantees:
  * every read answers from committed JSON in data/ when Supabase is absent/down
  * every write appends to .cache/inbox/*.jsonl when Supabase is absent/down
    and returns {ok: true, stored: "local"} — no silent drops, no dead forms
  * the chatbot is a static keyword KB — no LLM provider, no API keys, ever
"""
from __future__ import annotations

import json
import os
import re
import time
from collections import defaultdict, deque
from pathlib import Path
from typing import Any

import httpx
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

app = FastAPI(title="jjcss-api")

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data"
INBOX = ROOT / ".cache" / "inbox"

SUPABASE_URL = os.environ.get("SUPABASE_URL", "").rstrip("/")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_KEY") or os.environ.get(
    "SUPABASE_SERVICE_ROLE_KEY", ""
)


def supabase_configured() -> bool:
    return bool(SUPABASE_URL and SUPABASE_KEY)


# ------------------------------------------------------------- shared helpers
def read_json(name: str, fallback: Any):
    try:
        return json.loads((DATA / name).read_text())
    except Exception:
        return fallback


def store_write(table: str, payload: dict) -> str:
    """Persist a submission: Supabase when configured, local inbox otherwise.
    Returns "db" | "local". Never raises for the caller."""
    if supabase_configured():
        try:
            r = httpx.post(
                f"{SUPABASE_URL}/rest/v1/{table}",
                json=payload,
                headers={
                    "apikey": SUPABASE_KEY,
                    "Authorization": f"Bearer {SUPABASE_KEY}",
                    "Prefer": "return=minimal",
                },
                timeout=6.0,
            )
            if r.status_code < 300:
                return "db"
        except Exception:
            pass  # fall through to the local inbox — never drop a submission
    INBOX.mkdir(parents=True, exist_ok=True)
    line = json.dumps({"ts": int(time.time()), "table": table, "payload": payload})
    with (INBOX / f"{table}.jsonl").open("a") as f:
        f.write(line + "\n")
    return "local"


def db_read(table: str, select: str = "*") -> list | None:
    if not supabase_configured():
        return None
    try:
        r = httpx.get(
            f"{SUPABASE_URL}/rest/v1/{table}",
            params={"select": select},
            headers={"apikey": SUPABASE_KEY, "Authorization": f"Bearer {SUPABASE_KEY}"},
            timeout=6.0,
        )
        if r.status_code == 200:
            return r.json()
    except Exception:
        pass
    return None


# ------------------------------------------------------- in-memory rate limit
_hits: dict[str, deque] = defaultdict(deque)


def rate_limited(request: Request, limit: int = 20, window: int = 60) -> bool:
    ip = (request.headers.get("x-forwarded-for") or request.client.host or "?").split(",")[0].strip()
    now = time.time()
    q = _hits[ip]
    while q and q[0] < now - window:
        q.popleft()
    if len(q) >= limit:
        return True
    q.append(now)
    return False


def clip(v: Any, n: int) -> str:
    return str(v)[:n].strip()


# ------------------------------------------------------------------ endpoints
@app.get("/api/health")
def health():
    sha = os.environ.get("VERCEL_GIT_COMMIT_SHA", "dev")
    db = "skipped"
    if supabase_configured():
        db = "ok" if db_read("site_settings", "key") is not None else "error"
    return {"ok": True, "sha": sha, "db": db, "ts": int(time.time())}


# ------------------------------------------------------------------- the Hound
STOP = {"the","a","an","is","are","do","i","how","what","when","where","who",
        "to","of","in","on","for","and","or","it","you","we","can"}


def _stem(w: str) -> str:
    return re.sub(r"(ing|ers|er|ies|s)$", "", w)


def _tokens(text: str) -> set[str]:
    return {
        _stem(w)
        for w in re.split(r"[^a-z0-9]+", text.lower())
        if len(w) > 1 and w not in STOP
    }


def kb_answer(message: str, page: str | None) -> dict:
    kb = read_json("kb.json", {"entries": [], "fallback": {
        "answer": "The knowledge base is missing — try the Events or Join pages.",
        "suggestions": [], "emote": "confused"}})
    msg_tokens = _tokens(message)
    msg_lower = message.lower()
    best, best_score = None, 0
    for entry in kb["entries"]:
        score = 0
        for kw in entry["keywords"]:
            if " " in kw:
                if kw in msg_lower:
                    score += 3
            elif _stem(kw.lower()) in msg_tokens:
                score += 2
        if page and any(page.startswith(p) for p in entry.get("pages", [])):
            score += 1
        if score > best_score:  # ties broken by KB order
            best, best_score = entry, score
    if not best or best_score < 2:
        fb = kb["fallback"]
        return {"answer": fb["answer"], "suggestions": fb.get("suggestions", []),
                "citations": [], "emote": fb.get("emote", "confused")}
    return {"answer": best["answer"], "suggestions": best.get("suggestions", []),
            "citations": best.get("citations", []), "emote": best.get("emote", "happy")}


@app.get("/api/chat")
def chat_status():
    return {"ok": True, "source": "static", "configured": False, "mascot": "bloodhound"}


@app.post("/api/chat")
async def chat(request: Request):
    if rate_limited(request, limit=30):
        return JSONResponse({"ok": False, "error": "rate-limited"}, status_code=429)
    try:
        body = await request.json()
    except Exception:
        return JSONResponse({"ok": False, "error": "invalid json"}, status_code=400)
    message = clip(body.get("message", ""), 500)
    if not message:
        return JSONResponse({"ok": False, "error": "message required"}, status_code=400)
    result = kb_answer(message, body.get("page"))
    return {"ok": True, "source": "static", **result}


# ---------------------------------------------------------------- submissions
@app.post("/api/onboarding/submit")
async def onboarding_submit(request: Request):
    if rate_limited(request, limit=5, window=300):
        return JSONResponse({"ok": False, "error": "rate-limited"}, status_code=429)
    try:
        body = await request.json()
    except Exception:
        return JSONResponse({"ok": False, "error": "invalid json"}, status_code=400)
    name = clip(body.get("name", ""), 120)
    email = clip(body.get("email", ""), 200)
    if not name or "@" not in email:
        return JSONResponse({"ok": False, "error": "name and email required"}, status_code=400)
    record = {
        "full_name": name,
        "email": email,
        "major": clip(body.get("major", ""), 120),
        "class_year": clip(body.get("class_year", ""), 12),
        "interests": clip(body.get("interests", ""), 1000),
        "status": "new",
        "source": "site-join-form",
    }
    stored = store_write("onboarding_requests", record)
    return {"ok": True, "stored": stored}


@app.post("/api/apps/submit")
async def apps_submit(request: Request):
    if rate_limited(request, limit=5, window=300):
        return JSONResponse({"ok": False, "error": "rate-limited"}, status_code=429)
    try:
        body = await request.json()
    except Exception:
        return JSONResponse({"ok": False, "error": "invalid json"}, status_code=400)
    title = clip(body.get("title", ""), 120)
    author = clip(body.get("author", ""), 120)
    email = clip(body.get("email", ""), 200)
    summary = clip(body.get("summary", ""), 2000)
    if not title or not author or "@" not in email or not summary:
        return JSONResponse(
            {"ok": False, "error": "title, author, email, summary required"}, status_code=400
        )
    platform = body.get("platform", [])
    if not isinstance(platform, list):
        platform = [clip(platform, 20)]
    record = {
        "title": title,
        "author_name": author,
        "author_email": email,
        "summary": summary,
        "platform": [clip(p, 20) for p in platform][:5],
        "link": clip(body.get("link", ""), 400),
        "status": "submitted",
        "source": "site-apps-form",
    }
    stored = store_write("app_submissions", record)
    return {"ok": True, "stored": stored}


# ---------------------------------------------------------------------- reads
@app.get("/api/apps")
def apps():
    rows = db_read("apps")
    if rows:
        return {"ok": True, "source": "db", "apps": rows}
    return {**read_json("apps.json", {"apps": []}), "ok": True, "source": "static"}


@app.get("/api/events")
def events():
    rows = db_read("events")
    if rows:
        return {"ok": True, "source": "db", "events": rows}
    return {**read_json("events.json", {"semesters": []}), "ok": True, "source": "static"}


@app.get("/api/board")
def board():
    rows = db_read("board_profiles")
    if rows:
        return {"ok": True, "source": "db", "board": rows}
    return {**read_json("board.json", {"terms": []}), "ok": True, "source": "static"}


@app.get("/api/site-settings")
def site_settings():
    rows = db_read("site_settings")
    if rows:
        return {"ok": True, "source": "db", "settings": rows}
    return {"ok": True, "source": "static", "settings": read_json("links.json", {})}
