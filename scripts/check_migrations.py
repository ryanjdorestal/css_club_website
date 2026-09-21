#!/usr/bin/env python3
"""check_migrations.py — the schema changes only through supabase/migrations/, in order, and never destructively
by accident (docs/HOSTING_LIMITS.md §3.3). Runs in `make check`.

Rules: filenames are `NNNN_<name>.sql` numbered 0001, 0002, … with no gap or duplicate; every file parses into
at least one SQL statement (sqlparse) and every statement is a known kind — a file of comments or a stray
character would ship a no-op migration; `drop table` / `drop column` / `truncate` need a `-- guard:` comment on
the line above saying why, so a destructive step is a decision, not a slip.

    .venv/bin/python scripts/check_migrations.py
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

import sqlparse

ROOT = Path(__file__).resolve().parent.parent
MIGRATIONS = ROOT / "supabase" / "migrations"
NAME = re.compile(r"^(\d{4})_[a-z0-9_]+\.sql$")
DESTRUCTIVE = re.compile(r"^\s*(drop\s+table|alter\s+table\s+\S+\s+drop\s+column|truncate)\b", re.I)


def check_names(files: list[Path]) -> list[str]:
    errors: list[str] = []
    numbers: list[int] = []
    for f in files:
        m = NAME.match(f.name)
        if not m:
            errors.append(f"{f.name}: name must be NNNN_snake_case.sql")
            continue
        numbers.append(int(m.group(1)))
    expected = list(range(1, len(numbers) + 1))
    if sorted(numbers) != expected:
        errors.append(f"numbers must be 0001…{len(numbers):04d} with no gap or duplicate; found {sorted(numbers)}")
    return errors


KNOWN_UNTYPED = {"GRANT", "REVOKE", "COMMENT", "DO", "BEGIN", "COMMIT", "SET", "NOTIFY"}


def first_keyword(statement: sqlparse.sql.Statement) -> str:
    for token in statement.flatten():
        if token.ttype not in sqlparse.tokens.Comment and not token.is_whitespace:
            return token.normalized.upper()
    return ""


def check_sql(f: Path) -> list[str]:
    errors: list[str] = []
    text = f.read_text()
    real = [s for s in sqlparse.parse(text) if first_keyword(s)]
    if not real:
        errors.append(f"{f.name}: no SQL statement found")
    for s in real:
        if s.get_type() == "UNKNOWN" and first_keyword(s) not in KNOWN_UNTYPED:
            errors.append(f"{f.name}: statement of unknown kind — {str(s).strip().splitlines()[0][:70]}")
    lines = text.splitlines()
    for i, line in enumerate(lines):
        if DESTRUCTIVE.match(line) and not (i > 0 and lines[i - 1].strip().lower().startswith("-- guard:")):
            errors.append(f"{f.name}:{i + 1}: destructive statement without a `-- guard:` comment on the line above")
    return errors


def main() -> int:
    files = sorted(MIGRATIONS.glob("*.sql"))
    errors = check_names(files)
    for f in files:
        errors.extend(check_sql(f))
    for e in errors:
        print("FAIL", e)
    print(f"{len(files)} migration(s), {len(errors)} error(s)")
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
