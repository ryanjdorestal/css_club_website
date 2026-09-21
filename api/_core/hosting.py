"""Hosting budget (run 11): the free-tier limits the club runs under, how much of them is used, and the
keepalive readout. Used by routers/public.py (health), routers/inheritance.py (/os/hosting, /os/status)
and scripts/db_budget.py. The numbers in LIMITS are copied from docs/HOSTING_LIMITS.md — keep both."""
from __future__ import annotations

import time
from typing import Any

from . import config, db, tier1

DB_LIMIT_BYTES = 500 * 1024 * 1024
STORAGE_LIMIT_BYTES = 1024 * 1024 * 1024
WARN_AT = 0.70

# Static, per docs/HOSTING_LIMITS.md (verified 2026-09-21). `exceed` is what actually happens past the line.
LIMITS: list[dict[str, str]] = [
    {"host": "vercel", "what": "Deployments per day", "limit": "100", "ours": "~5", "exceed": "new builds refused until the day rolls over; the last deploy keeps serving"},
    {"host": "vercel", "what": "Function invocations / month", "limit": "1,000,000", "ours": "< 20,000", "exceed": "the API pauses for the month — the site keeps its bundled JSON, the OS stops"},
    {"host": "vercel", "what": "Fast data transfer / month", "limit": "100 GB", "ours": "< 5 GB", "exceed": "the site is paused for the month"},
    {"host": "vercel", "what": "Image transformations", "limit": "5,000", "ours": "0 (never used)", "exceed": "n/a — every image is a pre-sized WebP under /img"},
    {"host": "supabase", "what": "Database size", "limit": "500 MB", "ours": "see below", "exceed": "the project is set read-only until it is under the line"},
    {"host": "supabase", "what": "File storage", "limit": "1 GB", "ours": "see below", "exceed": "uploads refused"},
    {"host": "supabase", "what": "Egress / month", "limit": "5 GB", "ours": "< 1 GB", "exceed": "the project is paused until the next month"},
    {"host": "supabase", "what": "Inactivity", "limit": "7 days", "ours": "keepalive every 3", "exceed": "the project pauses; Restore it in the dashboard (docs/RUNBOOK.md)"},
]


def keepalive_last_run() -> str | None:
    """When the keepalive last wrote — from the database row when Supabase is on, else the legacy file."""
    if config.supabase_configured():
        rows = db.select("site_settings", {"key": "eq.keepalive", "select": "value"})
        if rows:
            value = rows[0].get("value") or {}
            return str(value.get("last_run")) if isinstance(value, dict) and value.get("last_run") else None
    legacy = tier1.read_json("../qa/keepalive.json", {})
    return str(legacy["last_run"]) if legacy.get("last_run") else None


def usage() -> dict[str, Any] | None:
    """The service-role `hosting_usage()` function (migration 0005); None when not configured or not answering."""
    result = db.rpc("hosting_usage")
    return result if isinstance(result, dict) else None


def budget(raw: dict[str, Any]) -> dict[str, Any]:
    db_bytes = int(raw.get("db_bytes") or 0)
    storage_bytes = int(raw.get("storage_bytes") or 0)
    db_pct = round(100 * db_bytes / DB_LIMIT_BYTES, 1)
    storage_pct = round(100 * storage_bytes / STORAGE_LIMIT_BYTES, 1)
    return {
        "db_bytes": db_bytes, "db_pct": db_pct, "storage_bytes": storage_bytes, "storage_pct": storage_pct,
        "rows": raw.get("rows") or {}, "measured_at": raw.get("measured_at"),
        "over_warning": db_pct >= WARN_AT * 100 or storage_pct >= WARN_AT * 100,
    }


def budget_lines(report: dict[str, Any]) -> list[str]:
    lines = [
        f"database: {report['db_bytes'] / 1048576:.1f} MB of 500 MB ({report['db_pct']} %)",
        f"storage:  {report['storage_bytes'] / 1048576:.1f} MB of 1024 MB ({report['storage_pct']} %)",
        "rows: " + ", ".join(f"{k}={v}" for k, v in sorted(report["rows"].items())),
    ]
    if report["over_warning"]:
        lines.append(f"OVER {int(WARN_AT * 100)} % — prune audit records (/os/audit → prune) or move files out of Storage")
    return lines


def local_usage() -> dict[str, Any]:
    """Tier 1: the local tables' size on disk, so the panel shows a real number instead of a dash."""
    total = sum(p.stat().st_size for p in config.DATA.glob("*.local.json")) if config.DATA.exists() else 0
    return {"db_bytes": total, "storage_bytes": sum(p.stat().st_size for p in config.UPLOADS.glob("*")) if config.UPLOADS.exists() else 0, "rows": {}, "measured_at": int(time.time())}
