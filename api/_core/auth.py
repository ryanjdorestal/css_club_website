"""Who is calling, and may they? Supabase Auth JWT (HS256) → email → the
board_profiles roster for the current term → role. No roster row → guest,
whatever the email (the RHEC whoami rule). Off Vercel, the local dev picker's
X-Local-Role header is honoured so the OS works with zero accounts.
Used by every /api/os/* router via require_role()."""
from __future__ import annotations

import base64
import hashlib
import hmac
import json
import time
from collections.abc import Callable
from dataclasses import asdict, dataclass
from typing import Any

from fastapi import HTTPException, Request

from . import config, seeds
from .store import Collection

ROLE_RANK = {"guest": 0, "officer": 1, "admin": 2}


@dataclass
class Actor:
    email: str
    role: str  # guest | officer | admin
    name: str = ""
    profile_id: str | None = None
    term: str | None = None
    source: str = "none"  # local | supabase | none

    def dict(self) -> dict[str, Any]:
        return asdict(self)


GUEST = Actor(email="", role="guest")


# ------------------------------------------------------------ JWT (HS256)
def _b64url_decode(s: str) -> bytes:
    return base64.urlsafe_b64decode(s + "=" * (-len(s) % 4))


def verify_jwt(token: str, secret: str) -> dict[str, Any] | None:
    """Minimal HS256 verification — enough for Supabase access tokens.
    Returns the claims or None. No third-party dependency."""
    try:
        h, p, s = token.split(".")
        header = json.loads(_b64url_decode(h))
        if header.get("alg") != "HS256":
            return None
        expected = hmac.new(secret.encode(), f"{h}.{p}".encode(), hashlib.sha256).digest()
        if not hmac.compare_digest(expected, _b64url_decode(s)):
            return None
        claims = json.loads(_b64url_decode(p))
        if claims.get("exp", 0) < time.time():
            return None
        return dict(claims)
    except Exception:
        return None


# ------------------------------------------------------------ the roster
def current_term() -> dict[str, Any] | None:
    terms = Collection("terms", seeds.terms).list()
    cur = [t for t in terms if t.get("is_current")]
    return cur[0] if cur else (terms[-1] if terms else None)


def roster_lookup(email: str) -> Actor:
    term = current_term()
    if not term:
        return GUEST
    rows = Collection("board_profiles", seeds.board_profiles).list(term=term["id"])
    for r in rows:
        if str(r.get("email", "")).lower() == email.lower() and r.get("active", True):
            role = "admin" if r.get("os_role") == "admin" else "officer"
            return Actor(email=email, role=role, name=r.get("name", ""), profile_id=str(r.get("id")), term=term["id"], source="supabase")
    return Actor(email=email, role="guest", source="supabase")


# ------------------------------------------------------------ resolution
def whoami(request: Request) -> Actor:
    auth = request.headers.get("authorization", "")
    if auth.lower().startswith("bearer ") and config.SUPABASE_JWT_SECRET:
        claims = verify_jwt(auth[7:].strip(), config.SUPABASE_JWT_SECRET)
        email = (claims or {}).get("email")
        if email:
            return roster_lookup(str(email))
        return GUEST
    local = request.headers.get("x-local-role")
    if local and config.local_dev_allowed():
        role = local if local in ROLE_RANK else "guest"
        return Actor(email=f"{role}@local.dev", role=role, name=f"Local {role}", term=(current_term() or {}).get("id"), source="local")
    return GUEST


def require_role(min_role: str) -> Callable[[Request], Actor]:
    def dep(request: Request) -> Actor:
        actor = whoami(request)
        if ROLE_RANK.get(actor.role, 0) < ROLE_RANK[min_role]:
            raise HTTPException(status_code=401 if actor.role == "guest" else 403, detail=f"{min_role} required")
        return actor

    return dep
