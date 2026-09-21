#!/usr/bin/env python3
"""db_budget.py — how much of the Supabase free tier the club uses, and a loud failure at 70 %.

Calls the service-role-only `hosting_usage()` function (supabase/migrations/0005_hosting.sql) and prints
database bytes, storage bytes and row counts against the free-tier limits in docs/HOSTING_LIMITS.md.
Exit 1 when the database passes 70 % of 500 MB or storage passes 70 % of 1 GB — the keepalive workflow
runs this every three days, so the Actions tab turns red months before the project is throttled.
Without SUPABASE_URL + SUPABASE_SERVICE_KEY it prints one line and exits 0.

Usage: SUPABASE_URL=… SUPABASE_SERVICE_KEY=… .venv/bin/python scripts/db_budget.py [--json]
"""

from __future__ import annotations

import json
import sys
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "api"))
from _core import config, hosting  # noqa: E402


def main() -> int:
    if not config.supabase_configured():
        print("db_budget: SUPABASE_URL / SUPABASE_SERVICE_KEY not set — Tier 1 has no database budget")
        return 0
    usage: dict[str, Any] | None = hosting.usage()
    if usage is None:
        print("db_budget: FAILED — hosting_usage() did not answer (run migration 0005, check the key)")
        return 1
    report = hosting.budget(usage)
    if "--json" in sys.argv:
        print(json.dumps(report, indent=2))
    else:
        for line in hosting.budget_lines(report):
            print(line)
    return 1 if report["over_warning"] else 0


if __name__ == "__main__":
    sys.exit(main())
