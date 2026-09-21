#!/usr/bin/env python3
"""api/ must hold exactly ONE top-level .py file (index.py) — one Vercel
function, always — plus requirements.txt and the `_core/` helper package
(underscore-prefixed folders are not functions on Vercel). This is the guard
that stops the silent-stale-deploy failure mode. Usage: python scripts/check_api_count.py"""
import sys
from pathlib import Path

api = Path(__file__).resolve().parent.parent / "api"
top_py = sorted(p.name for p in api.glob("*.py"))
top_other = sorted(p.name for p in api.iterdir() if p.is_file() and p.suffix != ".py")
print(f"api/ top-level .py: {top_py}  other: {top_other}  _core: {(api / '_core').is_dir()}")
ok = top_py == ["index.py"] and set(top_other) <= {"requirements.txt", "README.md"} and (api / "_core").is_dir()
stray = [p for p in api.iterdir() if p.is_dir() and not p.name.startswith("_") and p.name != "__pycache__"]
if stray:
    print(f"FAIL: non-underscore folders in api/ would become functions: {[p.name for p in stray]}")
    ok = False
if not ok:
    print("FAIL: api/ must be exactly index.py + requirements.txt + _core/.")
    sys.exit(1)
print("OK — one function")
