"""
John Jay CSS — the one FastAPI app. api/ holds <= 2 files (this + requirements.txt);
CI enforces the count so Vercel's function limit can never be hit.

Tier 1 rule: every read falls back to committed JSON in data/; every write, when
Supabase env vars are absent, appends to .cache/inbox/*.jsonl and returns
{ok: true, stored: "local"}. No LLM providers, no feature API keys.
"""
from __future__ import annotations

import json
import os
import time
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

app = FastAPI(title="jjcss-api")

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data"
INBOX = ROOT / ".cache" / "inbox"


def _read_json(name: str, fallback):
    """Tier-1 read: committed JSON, else the given fallback."""
    p = DATA / name
    try:
        return json.loads(p.read_text())
    except Exception:
        return fallback


@app.get("/api/health")
def health():
    sha = os.environ.get("VERCEL_GIT_COMMIT_SHA", "dev")
    db = "ok" if os.environ.get("SUPABASE_URL") else "skipped"
    return {"ok": True, "sha": sha, "db": db, "ts": int(time.time())}


# Full route surface lands in phase 5; health is the phase-0 contract.
