#!/usr/bin/env python3
"""snapshot.py — keep the committed Tier-1 fallback current.

Pulls the published rows from Supabase (or, with no env vars, from the local
Tier-1 tables in data/*.local.json) and rewrites:
  data/projects.json · data/posts.json · data/events.json · data/board.json
  data/terms.json · data/resources.json · data/links.json · data/site_settings.json
  content/news/<slug>.md (one per published post)
  content/inheritance/<id>.md (the spine, mirrored back from the DB when configured)
  data/snapshot.json (generated_at + counts — /os/inheritance reads it)
then validates data/*.json against the schemas and prints a diff summary.
This is what keeps Tier 1 current, and the restore path if Supabase is lost.

Usage:
  .venv/bin/python scripts/snapshot.py            # write the snapshot
  .venv/bin/python scripts/snapshot.py --check    # dry run: report, write nothing
  .venv/bin/python scripts/snapshot.py --restore  # push the committed JSON back INTO Supabase (new project)
Env (optional): SUPABASE_URL, SUPABASE_SERVICE_KEY. Without them the local tables are the source.
"""
from __future__ import annotations

import argparse
import json
import subprocess
import sys
import time
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "api"))
from _core import collections as C  # noqa: E402
from _core import config, db, spine  # noqa: E402
from _core.routers import public  # noqa: E402

DATA, CONTENT = ROOT / "data", ROOT / "content"


def write_json(name: str, obj: Any, dry: bool) -> bool:
    p = DATA / name
    new = json.dumps(obj, indent=2, ensure_ascii=False) + "\n"
    old = p.read_text() if p.exists() else ""
    if new != old and not dry:
        p.write_text(new)
    return new != old


def write_md(path: Path, text: str, dry: bool) -> bool:
    old = path.read_text() if path.exists() else ""
    if text != old and not dry:
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(text)
    return text != old


def snapshot(dry: bool) -> int:
    src = "supabase" if config.supabase_configured() and db.reachable() else "local tables"
    print(f"source: {src}")
    changed: list[str] = []

    def note(name: str, did: bool) -> None:
        if did:
            changed.append(name)

    # public shapes come straight from the same functions the API serves
    note("projects.json", write_json("projects.json", {"note": "Snapshot of published projects (scripts/snapshot.py).", "projects": public.projects()["projects"]}, dry))
    posts_full = sorted(C.posts.list(status="published"), key=lambda p: str(p.get("published_at", "")))
    note("posts.json", write_json("posts.json", {"note": "Published posts (the Tier-1 fallback for /news).", "posts": posts_full}, dry))
    ev = public.events()
    note("events.json", write_json("events.json", {"source": "OS snapshot", "semesters": ev["semesters"]}, dry))
    bd = public.board()
    note("board.json", write_json("board.json", {"source": "OS snapshot", "current_term": bd["current_term"], "terms": bd["terms"]}, dry))
    note("terms.json", write_json("terms.json", {"note": "Terms for the OS roster + rollover.", "terms": sorted(C.terms.list(), key=lambda t: t["id"], reverse=True)}, dry))
    rs = public.resources()
    note("resources.json", write_json("resources.json", {"source": "OS snapshot", "count": rs["count"], "groups": rs["groups"]}, dry))
    old_links = json.loads((DATA / "links.json").read_text())
    links = {**old_links, **public.links()["links"]}
    note("links.json", write_json("links.json", links, dry))
    note("site_settings.json", write_json("site_settings.json", public.site_settings()["settings"], dry))

    for p in posts_full:
        fm = f"---\ntitle: {p['title']}\ndate: {p.get('published_at', '')}\nkind: {(p.get('tags') or ['article'])[0]}\nauthor: {p.get('author_name', 'The Board')}\nslug: {p['slug']}\n---\n\n"
        note(f"content/news/{p['slug']}.md", write_md(CONTENT / "news" / f"{p['slug']}.md", fm + (p.get("body_md") or "").strip() + "\n", dry))
    # the inheritance spine: DB rows (Tier 2) → content/inheritance files; the files are the truth in Tier 1
    mirrored = db.select(spine.TABLE) or []
    for rec in mirrored:
        meta = dict(rec.get("frontmatter") or {})
        note(f"content/inheritance/{rec['id']}.md", write_md(spine.DIR / f"{rec['id']}.md", spine.dump(meta, str(rec.get("body_md") or "")), dry))
    by_term = {t: 1 for t in spine.terms()}

    meta = {"generated_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()), "source": src,
            "counts": {"projects": len(public.projects()["projects"]), "posts": len(posts_full), "events": sum(len(s["events"]) for s in ev["semesters"]),
                       "resources": rs["count"], "spine_terms": len(by_term), "spine_records": len(spine.list_records())}}
    if not dry:
        write_json("snapshot.json", meta, dry)
    print(f"changed: {changed or 'nothing'}")
    r = subprocess.run([sys.executable, str(ROOT / "scripts/validate_data.py")], capture_output=True, text=True)
    print(r.stdout.strip().splitlines()[-1] if r.stdout else r.stderr)
    return 0 if r.returncode == 0 else 1


def restore() -> int:
    if not config.supabase_configured():
        print("SUPABASE_URL + SUPABASE_SERVICE_KEY required to restore")
        return 1
    n = 0
    for col in (C.terms, C.board, C.projects, C.posts, C.events, C.resources, C.links, C.settings):
        for row in col.seed():
            if db.upsert(col.table, row, on_conflict=col.id_field):
                n += 1
    print(f"restored {n} rows from the committed JSON")
    return 0


if __name__ == "__main__":
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--check", action="store_true", help="dry run")
    ap.add_argument("--restore", action="store_true", help="push committed JSON into Supabase")
    a = ap.parse_args()
    sys.exit(restore() if a.restore else snapshot(a.check))
