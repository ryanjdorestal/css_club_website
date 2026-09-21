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
    """One JSON value against one schema node: type, enum, then the object / array children."""
    t = schema.get("type")
    if t:
        allowed = t if isinstance(t, list) else [t]
        if not any(isinstance(value, TYPES[a]) for a in allowed):
            return [f"{path}: expected {t}, got {type(value).__name__}"]
    errs = [f"{path}: {value!r} not in {schema['enum']}"] if "enum" in schema and value not in schema["enum"] else []
    if isinstance(value, dict):
        errs += check_object(value, schema, path)
    if isinstance(value, list) and "items" in schema:
        for i, item in enumerate(value):
            errs.extend(check(item, schema["items"], f"{path}[{i}]"))
    return errs


def check_object(value: dict, schema: dict, path: str) -> list[str]:
    errs = [f"{path}: missing required key '{req}'" for req in schema.get("required", []) if req not in value]
    for key, sub in schema.get("properties", {}).items():
        if key in value:
            errs.extend(check(value[key], sub, f"{path}.{key}"))
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
    xerrs = cross_checks()
    for e in xerrs:
        print(f"CROSS {e}")
    print(f"\n{len(schemas) - failures}/{len(schemas)} schemas pass · {len(xerrs)} cross-check error(s)")
    return 1 if failures or xerrs else 0


def load(name: str) -> dict:
    import json as _json

    return _json.loads((DATA / name).read_text())


def missing_files(rows: list[dict], key: str, label: str) -> list[str]:
    """Every `row[key]` that names a file must exist under apps/web/public/."""
    public = ROOT / "apps/web/public"
    return [f"{label}: {key} missing in public/: {r[key]}" for r in rows if r.get(key) and not (public / str(r[key]).lstrip("/")).exists()]


def cross_checks() -> list[str]:
    """content-indexer, adapted: references between data/, content/ and public/ resolve."""
    events = [ev for sem in load("events.json")["semesters"] for ev in sem["events"]]
    officers = [m for t in load("board.json")["terms"] for m in t["members"]]
    posts = load("posts.json")["posts"]
    shots = [{"screenshot": sc} for pr in load("projects.json")["projects"] for sc in pr.get("screenshots", []) if sc.startswith("/")]
    errs = missing_files(events, "flyer", "events.json") + missing_files(officers, "photo", "board.json") + missing_files(shots, "screenshot", "projects.json")
    errs += [f"posts.json: content/news/{p['slug']}.md missing (run scripts/snapshot.py)" for p in posts if not (ROOT / "content/news" / f"{p['slug']}.md").exists()]
    return errs


if __name__ == "__main__":
    sys.exit(main())
