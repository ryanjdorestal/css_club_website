#!/usr/bin/env python3
"""env_validate.py — names of the env vars each tier needs; never values.

Tier 1 (local, no accounts) needs nothing. Tier 2 (Supabase on) needs SUPABASE_URL,
SUPABASE_SERVICE_KEY and SUPABASE_JWT_SECRET on the server, plus VITE_SUPABASE_URL and
VITE_SUPABASE_ANON_KEY at build time for the browser. The API calls check() at startup
and logs one clear line; `vercel build` / CI run this file (exit 1 only when a tier is
half-configured, which is the failure mode that produces confusing 500s).

    .venv/bin/python scripts/env_validate.py
"""
from __future__ import annotations

import os
import sys

SERVER = ("SUPABASE_URL", "SUPABASE_SERVICE_KEY", "SUPABASE_JWT_SECRET")
BROWSER = ("VITE_SUPABASE_URL", "VITE_SUPABASE_ANON_KEY")
OPTIONAL = ("SITE_URL",)


def check(env: dict[str, str] | None = None) -> tuple[bool, str]:
    e = env if env is not None else dict(os.environ)
    have_server = [k for k in SERVER if e.get(k)]
    have_browser = [k for k in BROWSER if e.get(k)]
    if not have_server and not have_browser:
        return True, "env: Tier 1 — no Supabase variables set; local JSON + inbox (fine for dev)"
    missing = [k for k in SERVER if not e.get(k)] + [k for k in BROWSER if not e.get(k)]
    if missing:
        return False, f"env: Tier 2 is half-configured — missing {', '.join(missing)} (set them all, or none)"
    return True, "env: Tier 2 — Supabase server + browser variables present"


if __name__ == "__main__":
    ok, msg = check()
    print(msg)
    sys.exit(0 if ok else 1)
