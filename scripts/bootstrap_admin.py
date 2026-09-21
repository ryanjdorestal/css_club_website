#!/usr/bin/env python3
"""bootstrap_admin.py — add the first admin to the roster so someone can log in.

Login is roster-gated: an email can sign in only if board_profiles has a row
for the CURRENT term with active=true. On a fresh project nobody has one, so
this script creates it (Supabase when SUPABASE_URL + SUPABASE_SERVICE_KEY are
set, otherwise the local Tier-1 table data/board_profiles.local.json).

Usage:
  .venv/bin/python scripts/bootstrap_admin.py --email webmaster@jjay.cuny.edu --name "Jay Bloodhound" [--role "Webmaster"] [--term F26]
"""
from __future__ import annotations

import argparse
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "api"))
from _core import collections as C  # noqa: E402
from _core.auth import current_term  # noqa: E402
from _core.seeds import slug  # noqa: E402

if __name__ == "__main__":
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--email", required=True)
    ap.add_argument("--name", required=True)
    ap.add_argument("--role", default="Webmaster", help="role title shown on About")
    ap.add_argument("--term", default=None, help="term id (default: the current term)")
    a = ap.parse_args()
    term = a.term or (current_term() or {}).get("id")
    if not term:
        sys.exit("no current term — add one to data/terms.json first")
    existing = [r for r in C.board.list(term=term) if str(r.get("email", "")).lower() == a.email.lower()]
    if existing:
        row = C.board.patch(str(existing[0]["id"]), {"active": True, "os_role": "admin"}, actor=f"bootstrap:{a.email}")
        print(f"updated {row['id']}: active admin on {term}")
    else:
        row = C.board.create({"id": f"{term}/{slug(a.name)}", "term": term, "name": a.name, "role_title": a.role, "group_label": "Executive Board Members",
                              "email": a.email, "active": True, "os_role": "admin", "sort": 0, "visibility": "public", "bio": "", "photo_path": ""}, actor=f"bootstrap:{a.email}")
        print(f"created {row['id']}: active admin on {term} ({C.board.source()})")
    print("next: sign in on /os/login with that email (Supabase sends a code), or pick 'admin' in LOCAL_DEV.")
