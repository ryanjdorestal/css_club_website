#!/usr/bin/env python3
"""Fail if api/ holds more than 2 files — the guard that stops Vercel's
silent-stale-deploy failure mode (one FastAPI app = one function, always)."""
import sys
from pathlib import Path

api = Path(__file__).resolve().parent.parent / "api"
files = [p for p in api.rglob("*") if p.is_file() and "__pycache__" not in p.parts]
names = sorted(str(p.relative_to(api)) for p in files)
print(f"api/ file count: {len(names)} -> {names}")
if len(names) > 2:
    print("FAIL: api/ must hold <= 2 files (index.py + requirements.txt).")
    sys.exit(1)
print("OK")
