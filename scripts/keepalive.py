#!/usr/bin/env python3
"""keepalive.py — the write that stops the free Supabase project from pausing (docs/HOSTING_LIMITS.md §3.3).

Every three days the keepalive workflow runs this: it upserts site_settings.keepalive with the current
time, reads the row back, and exits non-zero if the value it reads is not the value it wrote — so a
silent break (paused project, rotated key, dropped table) shows up red in the Actions tab instead of
being discovered when the login page dies. Without SUPABASE_URL + SUPABASE_SERVICE_KEY it prints one
line and exits 0 (Tier 1 has nothing to keep alive).

Usage: SUPABASE_URL=… SUPABASE_SERVICE_KEY=… .venv/bin/python scripts/keepalive.py
"""

from __future__ import annotations

import datetime as dt
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "api"))
from _core import config, db  # noqa: E402


def main() -> int:
    if not config.supabase_configured():
        print("keepalive: SUPABASE_URL / SUPABASE_SERVICE_KEY not set — nothing to keep alive (Tier 1)")
        return 0
    stamp = dt.datetime.now(dt.UTC).replace(microsecond=0).isoformat().replace("+00:00", "Z")
    written = db.upsert("site_settings", {"key": "keepalive", "value": {"last_run": stamp, "source": "workflow"}}, on_conflict="key")
    if written is None:
        print("keepalive: FAILED — the upsert did not succeed (paused project? rotated key?)")
        return 1
    rows = db.select("site_settings", {"key": "eq.keepalive", "select": "value"})
    read_back = (rows or [{}])[0].get("value", {}).get("last_run") if rows else None
    if read_back != stamp:
        print(f"keepalive: FAILED — wrote {stamp} but read back {read_back!r}")
        return 1
    print(f"keepalive: wrote and read back {stamp}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
