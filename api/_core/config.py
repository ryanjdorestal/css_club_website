"""Paths + environment for the API. Read once; nothing here touches the network.
Used by every module in api/_core. Secrets come only from the host's env."""
from __future__ import annotations

import os
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DATA = ROOT / "data"
CONTENT = ROOT / "content"
CACHE = ROOT / ".cache"
INBOX = CACHE / "inbox"
UPLOADS = CACHE / "uploads"

SUPABASE_URL = os.environ.get("SUPABASE_URL", "").rstrip("/")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_KEY") or os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
SUPABASE_JWT_SECRET = os.environ.get("SUPABASE_JWT_SECRET", "")
IS_VERCEL = bool(os.environ.get("VERCEL"))
GIT_SHA = os.environ.get("VERCEL_GIT_COMMIT_SHA", "dev")


def supabase_configured() -> bool:
    return bool(SUPABASE_URL and SUPABASE_KEY)


def local_dev_allowed() -> bool:
    """The X-Local-Role header is honoured only off Vercel (never in production)."""
    return not IS_VERCEL
