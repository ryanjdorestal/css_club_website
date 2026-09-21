"""
John Jay CSS — the one FastAPI app (= the one Vercel function).

All logic lives in api/_core/ (a `_`-prefixed helper package: zero extra
functions). This file only assembles the routers. CI enforces that api/ holds
exactly one top-level .py file, so Vercel's function limit can never be hit
and a push can never silently serve a stale deploy.

Tier-1 guarantees (no accounts, no keys):
  * every public read answers from committed data/*.json when Supabase is absent
  * every write lands in data/<table>.local.json + .cache/inbox/ when Supabase
    is absent — replayable later, never dropped
  * the chatbot is a static keyword KB — no LLM provider, ever
"""
from __future__ import annotations

import sys
from pathlib import Path

from fastapi import FastAPI

sys.path.insert(0, str(Path(__file__).resolve().parent))  # api/ → `_core` importable in both uvicorn and Vercel
from _core.routers import audit, board, events, inheritance, members, posts, projects, public, resources, settings, spine, uploads

app = FastAPI(title="jjcss-api", docs_url=None, redoc_url=None)


@app.on_event("startup")
def _env_check() -> None:
    """One line at boot: which tier the env vars describe (names only, never values)."""
    import importlib.util

    spec = importlib.util.spec_from_file_location("env_validate", Path(__file__).resolve().parents[1] / "scripts" / "env_validate.py")
    if spec and spec.loader:
        mod = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(mod)
        print(mod.check()[1])

for router in (
    public.r,
    projects.r,
    posts.r,
    events.r,
    resources.r,
    resources.links_r,
    board.r,
    board.terms_r,
    members.r,
    settings.r,
    spine.r,
    inheritance.status_r,
    audit.r,
    uploads.r,
):
    app.include_router(router, prefix="/api")
