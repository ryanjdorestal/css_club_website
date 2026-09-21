"""Seed rows for every collection from the committed Tier-1 JSON (data/) and
markdown (content/). Each function returns flat rows in the table's shape; the
public read endpoints reverse these shapes (see routers/public.py) so the
public site's JSON contract never changes. Used by store.Collection."""
from __future__ import annotations

import re
from typing import Any

from . import config, tier1

Rows = list[dict[str, Any]]


def slug(s: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")


def term_id(label: str) -> str:
    """'Fall 2024 - Spring 2025' → 'F24-S25'; 'Fall 2026' → 'F26'."""
    parts = re.findall(r"(Fall|Spring|Summer)\s+(\d{4})", label)
    return "-".join(f"{p[0][0]}{p[1][2:]}" for p in parts) or slug(label).upper()


# ----------------------------------------------------------------- terms
def terms() -> Rows:
    rows: Rows = tier1.read_json("terms.json", {"terms": []}).get("terms", [])
    if rows:
        return rows
    board = tier1.read_json("board.json", {"terms": []})
    return [{"id": term_id(t["term"]), "label": t["term"], "is_current": i == 0} for i, t in enumerate(board["terms"])]


# ------------------------------------------------------- board profiles
def board_profiles() -> Rows:
    board = tier1.read_json("board.json", {"terms": []})
    rows: Rows = []
    for t in board["terms"]:
        tid = term_id(t["term"])
        for i, m in enumerate(t["members"]):
            rows.append({
                "id": f"{tid}/{slug(m['name'])}", "term": tid, "name": m["name"], "role_title": m.get("role", ""),
                "group_label": m.get("group", "Executive Board Members"), "email": m.get("email", ""),
                "photo_path": m.get("photo", ""), "bio": m.get("bio", ""), "socials": m.get("socials", {}),
                "sort": i, "active": False, "os_role": "officer",
            })
    return rows


# -------------------------------------------------------------- projects
def projects() -> Rows:
    rows: Rows = tier1.read_json("projects.json", {"projects": []}).get("projects", [])
    return rows


def project_submissions() -> Rows:
    return []


# ----------------------------------------------------------------- posts
def posts() -> Rows:
    rows: Rows = tier1.read_json("posts.json", {"posts": []}).get("posts", [])
    return rows


# ---------------------------------------------------------------- events
def events() -> Rows:
    data = tier1.read_json("events.json", {"semesters": []})
    rows: Rows = []
    for sem in data["semesters"]:
        for i, ev in enumerate(sem["events"]):
            rows.append({
                "id": f"{term_id(sem['semester'])}/{slug(ev['title'])}", "title": ev["title"], "semester": sem["semester"],
                "summary": ev.get("summary", ""), "date_label": ev.get("date", ""), "time_label": ev.get("time", ""),
                "location": ev.get("room", ""), "flyer_path": ev.get("flyer", ""), "rsvp_url": ev.get("rsvp_url", ""),
                "status": "published", "when": ev.get("status", "past"), "sort": i, "recap_post_id": None,
            })
    return rows


# ------------------------------------------------------------- resources
def resources() -> Rows:
    data = tier1.read_json("resources.json", {"groups": []})
    rows: Rows = []
    for g in data["groups"]:
        for i, ln in enumerate(g["links"]):
            rows.append({
                "id": f"{slug(g['group'])}/{slug(ln['title'])}", "group": g["group"], "title": ln["title"],
                "url": ln["url"], "description": ln.get("description", ""), "sort": i,
                "last_checked": None, "last_status": None, "dead": False,
            })
    return rows


LINK_LABELS = {
    "website": "Website", "email": "Club email", "discord": "Discord invite", "discord_alt": "Discord invite (alt)",
    "github": "GitHub org", "youtube": "YouTube", "instagram": "Instagram", "linkedin": "LinkedIn", "facebook": "Facebook",
    "linktree": "Linktree", "join_form": "Join form", "email_updates_form": "Email updates form", "address": "Campus address",
}


def links() -> Rows:
    data = tier1.read_json("links.json", {})
    return [
        {"key": k, "url": str(v), "label": LINK_LABELS.get(k, k), "last_checked": None, "last_status": None, "dead": False}
        for k, v in data.items()
        if isinstance(v, str) and k not in ("source", "verify_note")
    ]


# --------------------------------------------------------- site settings
def site_settings() -> Rows:
    data = tier1.read_json("site_settings.json", {})
    return [{"key": k, "value": v} for k, v in data.items()]


# --------------------------------------------------------- members etc.
def members() -> Rows:
    return []


def content_news_files() -> list[str]:
    d = config.CONTENT / "news"
    return sorted(p.name for p in d.glob("*.md")) if d.exists() else []


# ------------------------------------------------------------ workshops
def workshops() -> Rows:
    """data/workshops.json (the old-site list: name · repo · topic) → first-class rows (run 10 §7).
    Each old entry is one session-1 record in the series named by its topic."""
    data = tier1.read_json("workshops.json", {"workshops": []})
    rows: Rows = []
    for i, w in enumerate(data.get("workshops", [])):
        rows.append({
            "id": f"legacy/{slug(w['name'])}", "title": w["name"], "series": w.get("topic", "General"), "session_no": 1,
            "date": None, "time": None, "location": None, "level": "intro", "description_md": "",
            "materials": [{"label": "Repo", "url": w["repo"]}] if w.get("repo") else [], "recording_url": None,
            "status": "published", "sort": i,
        })
    return rows
