#!/usr/bin/env python3
"""Validate data/*.json against data/*.schema.json (minimal JSON-Schema subset:
type, required, properties, items, enum). Exit 1 on any failure."""
from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data"

TYPES = {"object": dict, "array": list, "string": str, "number": (int, float),
         "integer": int, "boolean": bool, "null": type(None)}


def check(value, schema, path="$") -> list[str]:
    errs = []
    t = schema.get("type")
    if t:
        allowed = t if isinstance(t, list) else [t]
        if not any(isinstance(value, TYPES[a]) for a in allowed):
            return [f"{path}: expected {t}, got {type(value).__name__}"]
    if "enum" in schema and value not in schema["enum"]:
        errs.append(f"{path}: {value!r} not in {schema['enum']}")
    if isinstance(value, dict):
        for req in schema.get("required", []):
            if req not in value:
                errs.append(f"{path}: missing required key '{req}'")
        for key, sub in schema.get("properties", {}).items():
            if key in value:
                errs.extend(check(value[key], sub, f"{path}.{key}"))
    if isinstance(value, list) and "items" in schema:
        for i, item in enumerate(value):
            errs.extend(check(item, schema["items"], f"{path}[{i}]"))
    return errs


def main() -> int:
    failures = 0
    schemas = sorted(DATA.glob("*.schema.json"))
    if not schemas:
        print("no schemas found")
        return 1
    for sp in schemas:
        target = DATA / sp.name.replace(".schema", "")
        if not target.exists():
            print(f"SKIP {target.name} (missing)")
            continue
        schema = json.loads(sp.read_text())
        try:
            doc = json.loads(target.read_text())
        except json.JSONDecodeError as e:
            print(f"FAIL {target.name}: invalid JSON ({e})")
            failures += 1
            continue
        errs = check(doc, schema)
        if errs:
            failures += 1
            print(f"FAIL {target.name}:")
            for e in errs[:10]:
                print(f"  {e}")
        else:
            print(f"OK   {target.name}")
    print(f"\n{len(schemas) - failures}/{len(schemas)} schemas pass")
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
