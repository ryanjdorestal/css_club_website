#!/usr/bin/env python3
"""validate_inheritance.py — the spine gate (make check + CI + the API use the same rules).

Walks content/inheritance/, parses every record's frontmatter and body, and applies
api/_core/spine.validate: required fields + enums, links have label + http(s) url,
owners on that term's roster (when the roster has rows), supersedes/succeeded_by/related
resolve with no cycles, public records carry no email/phone, and no record anywhere
contains a secret-shaped string. Exit 1 on any error.

    .venv/bin/python scripts/validate_inheritance.py [--quiet]
"""
from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "api"))
from _core import collections as C  # noqa: E402
from _core import spine  # noqa: E402


def main() -> int:
    quiet = "--quiet" in sys.argv
    rows = spine.list_records(with_body=True)
    errors = 0
    for row in rows:
        term = str(row.get("term", ""))
        roster = [str(b.get(k, "")) for b in C.board.list(term=term) for k in ("name", "role_title")]
        errs = spine.validate({k: v for k, v in row.items() if k not in ("id", "path", "body_md", "excerpt", "updated_at")}, row["body_md"],
                              [n for n in roster if n] or None, [x for x in rows if x["id"] != row["id"]])
        for e in errs:
            errors += 1
            print(f"✗ {row['path']}: {e}")
        if not errs and not quiet:
            print(f"✓ {row['path']}")
    tpl = spine.templates()
    missing = [t for t in spine.TYPES if t not in tpl]
    if missing:
        errors += 1
        print(f"✗ content/inheritance/_template: missing templates for {missing}")
    print(f"{len(rows)} record(s), {len(tpl)} template(s), {errors} error(s)")
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
