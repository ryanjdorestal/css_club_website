"""Supabase REST (PostgREST) client — the only place the service key is used.
Every call returns data or None; it never raises, so callers can fall back to
Tier 1. Used by store.py, auth.py and the health endpoint."""
from __future__ import annotations

import time
from typing import Any

import httpx

from . import config

TIMEOUT = 6.0
last_ok: float | None = None  # epoch of the last successful round-trip (health)


def _headers(prefer: str | None = None) -> dict[str, str]:
    h = {"apikey": config.SUPABASE_KEY, "Authorization": f"Bearer {config.SUPABASE_KEY}"}
    if prefer:
        h["Prefer"] = prefer
    return h


def _url(table: str) -> str:
    return f"{config.SUPABASE_URL}/rest/v1/{table}"


def _ok(r: httpx.Response) -> bool:
    global last_ok
    if r.status_code < 300:
        last_ok = time.time()
        return True
    return False


def select(table: str, params: dict[str, str] | None = None) -> list[dict[str, Any]] | None:
    if not config.supabase_configured():
        return None
    try:
        r = httpx.get(_url(table), params={"select": "*", **(params or {})}, headers=_headers(), timeout=TIMEOUT)
        return r.json() if _ok(r) else None
    except Exception:
        return None


def insert(table: str, row: dict[str, Any]) -> dict[str, Any] | None:
    if not config.supabase_configured():
        return None
    try:
        r = httpx.post(_url(table), json=row, headers=_headers("return=representation"), timeout=TIMEOUT)
        if _ok(r):
            body = r.json()
            return body[0] if isinstance(body, list) and body else row
    except Exception:
        pass
    return None


def upsert(table: str, row: dict[str, Any], on_conflict: str = "id") -> dict[str, Any] | None:
    if not config.supabase_configured():
        return None
    try:
        r = httpx.post(
            _url(table), json=row, params={"on_conflict": on_conflict},
            headers=_headers("return=representation,resolution=merge-duplicates"), timeout=TIMEOUT,
        )
        if _ok(r):
            body = r.json()
            return body[0] if isinstance(body, list) and body else row
    except Exception:
        pass
    return None


def update(table: str, row_id: str, changes: dict[str, Any], id_col: str = "id") -> dict[str, Any] | None:
    if not config.supabase_configured():
        return None
    try:
        r = httpx.patch(
            _url(table), json=changes, params={id_col: f"eq.{row_id}"},
            headers=_headers("return=representation"), timeout=TIMEOUT,
        )
        if _ok(r):
            body = r.json()
            return body[0] if isinstance(body, list) and body else None
    except Exception:
        pass
    return None


def delete(table: str, row_id: str, id_col: str = "id") -> bool:
    if not config.supabase_configured():
        return False
    try:
        r = httpx.delete(_url(table), params={id_col: f"eq.{row_id}"}, headers=_headers(), timeout=TIMEOUT)
        return _ok(r)
    except Exception:
        return False


def delete_where(table: str, params: dict[str, str]) -> int | None:
    """Bulk delete by a PostgREST filter (e.g. {"created_at": "lt.123"}); returns the number of rows removed."""
    if not config.supabase_configured():
        return None
    try:
        r = httpx.delete(_url(table), params=params, headers=_headers("return=representation"), timeout=TIMEOUT * 5)
        if _ok(r):
            body = r.json()
            return len(body) if isinstance(body, list) else 0
    except Exception:
        pass
    return None


def rpc(name: str, args: dict[str, Any] | None = None) -> Any | None:
    """Call a Postgres function exposed by PostgREST (service role only — hosting_usage())."""
    if not config.supabase_configured():
        return None
    try:
        r = httpx.post(f"{config.SUPABASE_URL}/rest/v1/rpc/{name}", json=args or {}, headers=_headers(), timeout=TIMEOUT)
        if _ok(r):
            return r.json()
    except Exception:
        pass
    return None


def reachable() -> bool:
    """One cheap round-trip for /api/health and the inheritance panel."""
    return select("site_settings", {"select": "key", "limit": "1"}) is not None
