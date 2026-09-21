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
    xerrs = cross_checks()
    for e in xerrs:
        print(f"CROSS {e}")
    print(f"\n{len(schemas) - failures}/{len(schemas)} schemas pass · {len(xerrs)} cross-check error(s)")
    return 1 if failures or xerrs else 0


def cross_checks() -> list[str]:
    """content-indexer, adapted: references between data/, content/ and public/ resolve."""
    import json as _json

    public = ROOT / "apps/web/public"
    errs: list[str] = []
    events = _json.loads((DATA / "events.json").read_text())
    for sem in events["semesters"]:
        for ev in sem["events"]:
            fl = ev.get("flyer")
            if fl and not (public / fl).exists():
                errs.append(f"events.json: flyer missing in public/: {fl}")
    board = _json.loads((DATA / "board.json").read_text())
    for t in board["terms"]:
        for m in t["members"]:
            ph = m.get("photo")
            if ph and not (public / ph).exists():
                errs.append(f"board.json: photo missing in public/: {ph}")
    posts = _json.loads((DATA / "posts.json").read_text())["posts"]
    for p in posts:
        if not (ROOT / "content/news" / f"{p['slug']}.md").exists():
            errs.append(f"posts.json: content/news/{p['slug']}.md missing (run scripts/snapshot.py)")
    projects = _json.loads((DATA / "projects.json").read_text())["projects"]
    for pr in projects:
        for sc in pr.get("screenshots", []):
            if sc.startswith("/") and not (public / sc.lstrip("/")).exists():
                errs.append(f"projects.json: screenshot missing: {sc}")
    return errs


if __name__ == "__main__":
    sys.exit(main())
