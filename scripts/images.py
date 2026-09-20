#!/usr/bin/env python3
"""Image pipeline: copy only images data/ references, kebab-case, WebP.
Flyers <= 1600px, headshots <= 800px, photos <= 1600px. Logs orphans skipped."""
from __future__ import annotations

import json
import re
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / ".cache" / "CSS_Website" / "files" / "images"
PUB = ROOT / "apps" / "web" / "public" / "img"


def kebab(name: str) -> str:
    return re.sub(r"[^a-zA-Z0-9]+", "-", Path(name).stem).strip("-").lower()


def convert(src: Path, dest: Path, max_px: int) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    im = Image.open(src)
    im = im.convert("RGBA") if im.mode in ("P", "LA") else im
    if max(im.size) > max_px:
        im.thumbnail((max_px, max_px), Image.LANCZOS)
    im.save(dest, "WEBP", quality=82, method=6)


def main() -> None:
    used: set[str] = set()

    board = json.loads((ROOT / "data" / "board.json").read_text())
    for term in board["terms"]:
        for m in term["members"]:
            if m.get("photo_src"):
                name = Path(m["photo_src"]).name
                used.add(name)
                src = SRC / name
                if src.exists():
                    convert(src, PUB / "board" / f"{kebab(name)}.webp", 800)

    events = json.loads((ROOT / "data" / "events.json").read_text())
    for sem in events["semesters"]:
        for ev in sem["events"]:
            if ev.get("flyer_src"):
                name = Path(ev["flyer_src"]).name
                used.add(name)
                src = SRC / name
                if src.exists():
                    convert(src, PUB / "events" / f"{kebab(name)}.webp", 1600)

    # club photos referenced by the old index/about copy — keep the good ones
    for name in ["club2.jpg", "clubPhoto.png", "clubPhoto2.png", "cyberhounds-header.png"]:
        src = SRC / name
        if src.exists():
            used.add(name)
            convert(src, PUB / "photos" / f"{kebab(name)}.webp", 1600)

    all_files = {p.name for p in SRC.iterdir() if p.is_file()}
    orphans = sorted(all_files - used)
    total_out = sum(f.stat().st_size for f in PUB.rglob("*.webp"))
    print(f"converted {len(used)} referenced images -> {total_out/1e6:.1f} MB webp")
    print(f"skipped {len(orphans)} unreferenced/brand files:")
    for o in orphans:
        print(f"  - {o}")


if __name__ == "__main__":
    main()
