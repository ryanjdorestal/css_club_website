#!/usr/bin/env python3
"""Extract the old John Jay CSS site (jjcss/CSS_Website@a8fca55) into data/ + content/.

Content is never pasted into components — the React site renders from these files.
Review fixes from context/07 applied mechanically: ZIP -> 10019, stale "Executive
Openings" dropped, Blog marked empty (folds into News).
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / ".cache" / "CSS_Website" / "files"
DATA = ROOT / "data"
CONTENT = ROOT / "content"

if not SRC.exists():
    sys.exit("clone github.com/jjcss/CSS_Website into .cache/CSS_Website first")

DATA.mkdir(exist_ok=True)
CONTENT.mkdir(exist_ok=True)
(CONTENT / "news").mkdir(exist_ok=True)


def soup(name: str) -> BeautifulSoup:
    return BeautifulSoup((SRC / name).read_text(errors="replace"), "html.parser")


def clean(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()


def kebab(name: str) -> str:
    stem = re.sub(r"[^a-zA-Z0-9]+", "-", Path(name).stem).strip("-").lower()
    return stem


def write_json(name: str, payload) -> None:
    (DATA / name).write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n")
    print(f"data/{name}")


# ---------------------------------------------------------------- board.json
def extract_board():
    doc = soup("about.html")
    terms: dict[str, dict] = {}
    for section in doc.select("section.team-container"):
        sub = section.select_one("h3.team-sub-heading")
        if not sub:
            continue
        label = clean(sub.get_text(" "))
        m = re.search(r"\(([^)]+)\)", label)
        term = clean(m.group(1)) if m else "Unknown term"
        group = clean(label.split("(")[0])
        bucket = terms.setdefault(term, {"term": term, "members": []})
        for card in section.select("article.team-board-column"):
            img = card.select_one("img.team-member-image")
            role_el = card.select_one("h2.team-member-name")
            name_el = card.select_one("h3.team-member-name")
            bio_el = card.select_one("p.team-member-description")
            socials = {}
            for a in card.select(".team-member-social a[href]"):
                href = a["href"]
                if "linkedin" in href:
                    socials["linkedin"] = href
                elif "github" in href:
                    socials["github"] = href
            if not (name_el and role_el):
                continue
            photo = img["src"] if img and img.has_attr("src") else None
            bucket["members"].append(
                {
                    "name": clean(name_el.get_text(" ")),
                    "role": clean(role_el.get_text(" ")),
                    "group": group,
                    "bio": clean(bio_el.get_text(" ")) if bio_el else "",
                    "photo": f"img/board/{kebab(photo)}.webp" if photo else None,
                    "photo_src": photo,
                    "socials": socials or None,
                }
            )
    ordered = sorted(
        terms.values(),
        key=lambda t: (
            int(re.search(r"(20\d\d)", t["term"]).group(1)) if re.search(r"20\d\d", t["term"]) else 0
        ),
        reverse=True,
    )
    write_json(
        "board.json",
        {
            "source": "jjcss/CSS_Website@a8fca55 about.html",
            "current_term": ordered[0]["term"] if ordered else None,
            "terms": ordered,
        },
    )
    return ordered


# ---------------------------------------------------------------- events.json
def parse_events(name: str, semester: str):
    doc = soup(name)
    flyers = [
        img["src"]
        for img in doc.select("#carousel .item img[src]")
    ]
    if not flyers:
        # Fall 2024's carousel is commented out in the source; the flyers are
        # still the events' real flyers, so read them out of the comment.
        raw = (SRC / name).read_text(errors="replace")
        flyers = re.findall(r'<img src="(images/[^"]+)" alt="Flyer', raw)
    events = []
    for card in doc.select("div.event-container"):
        title_el = card.select_one(".event-title h2")
        if not title_el:
            continue
        title = clean(title_el.get_text(" "))
        desc_el = card.select_one(".event-description p")
        desc_html = str(desc_el) if desc_el else ""
        # pull labeled fields the old site kept inline: <b>Date</b>: ...
        fields = dict(
            (clean(k).lower(), clean(v))
            for k, v in re.findall(r"<b>\s*([^<]+?)\s*</b>\s*:\s*([^<]+)", desc_html)
        )
        summary = clean(re.split(r"<br\s*/?>", desc_html)[0].replace(str(title_el), ""))
        summary = clean(BeautifulSoup(re.split(r"<b>", desc_html)[0], "html.parser").get_text(" "))
        date_el = card.select_one(".event-footer .event-date p")
        ended = card.select_one(".past-events") is not None
        events.append(
            {
                "title": title,
                "semester": semester,
                "summary": summary,
                "date": clean(date_el.get_text(" ")) if date_el else fields.get("date"),
                "time": fields.get("time"),
                "room": fields.get("room number") or fields.get("room"),
                "status": "past" if ended else "unknown",
                "flyer": None,
                "flyer_src": None,
            }
        )
    # fuzzy-match flyers to events by shared tokens; leftovers stay unattached
    def tokens(s: str) -> set[str]:
        return {w for w in re.split(r"[^a-z0-9]+", s.lower()) if len(w) > 2}

    unmatched = []
    for flyer in flyers:
        ft = tokens(Path(flyer).stem)
        best, score = None, 0
        for ev in events:
            if ev["flyer"]:
                continue
            s = len(ft & tokens(ev["title"]))
            if s > score:
                best, score = ev, s
        if best is not None and score >= 1:
            best["flyer"] = f"img/events/{kebab(flyer)}.webp"
            best["flyer_src"] = flyer
        else:
            unmatched.append(flyer)
    return events, unmatched


def extract_events():
    spring, un1 = parse_events("events.html", "Spring 2025")
    fall, un2 = parse_events("previous_events.html", "Fall 2024")
    # Source-repo bug: First_General_Meeting.png actually contains the Sep-25
    # Intro-to-AI flyer and AI_Part_1.png the Sep-18 First General Meeting flyer.
    # Verified by eye against the artwork's own printed dates; swap them back.
    by_title = {e["title"]: e for e in fall}
    fgm = by_title.get("First General Meeting")
    ai1 = next((e for e in fall if "Part 1" in e["title"] and "Intelligence" in e["title"]), None)
    if fgm and ai1 and fgm.get("flyer_src") and ai1.get("flyer_src"):
        fgm["flyer"], ai1["flyer"] = ai1["flyer"], fgm["flyer"]
        fgm["flyer_src"], ai1["flyer_src"] = ai1["flyer_src"], fgm["flyer_src"]
    write_json(
        "events.json",
        {
            "source": "jjcss/CSS_Website@a8fca55 events.html + previous_events.html",
            "note": "No future events at migration time; the OS/board adds the current semester.",
            "semesters": [
                {"semester": "Spring 2025", "events": spring},
                {"semester": "Fall 2024", "events": fall},
            ],
            "unmatched_flyers": un1 + un2,
        },
    )
    return spring + fall


# ------------------------------------------------------------- resources.json
def extract_resources():
    doc = soup("resources.html")
    groups = []
    for main in doc.select("#table main"):
        title_el = main.select_one("section.resource-title")
        if not title_el:
            continue
        title = clean(title_el.get_text(" "))
        # the collapsible body is the next <p class="resourcesN">
        body = main.find_next_sibling("p")
        while body is not None and not any(
            c.startswith("resources") for c in (body.get("class") or [])
        ):
            body = body.find_next_sibling("p")
        links = []
        if body:
            for b in body.select("b"):
                a = b.select_one("a[href]")
                if not a:
                    continue
                # description = text between this <b> and the next <b>
                desc_parts = []
                for sib in b.next_siblings:
                    if getattr(sib, "name", None) == "b":
                        break
                    if getattr(sib, "name", None) == "br":
                        continue
                    text = sib.get_text(" ") if hasattr(sib, "get_text") else str(sib)
                    desc_parts.append(text)
                links.append(
                    {
                        "title": clean(a.get_text(" ")),
                        "url": a["href"].strip(),
                        "description": clean(" ".join(desc_parts)),
                    }
                )
        if links:
            groups.append({"group": title, "links": links})
    total = sum(len(g["links"]) for g in groups)
    write_json(
        "resources.json",
        {
            "source": "jjcss/CSS_Website@a8fca55 resources.html",
            "note": "Links carried as-published; click-test before promoting (context/07 checklist).",
            "count": total,
            "groups": groups,
        },
    )
    return total


# ----------------------------------------------------------------- links.json
def extract_links():
    # Verified inventory from context/02 (site footer + Discord pin). The board
    # click-tests these; `verified` stays false until they do.
    links = {
        "source": "jjcss/CSS_Website@a8fca55 footers + Discord pin 2021 (context/02)",
        "website": "https://jjaycss.tech/",
        "email": "computersocjjay@gmail.com",
        "discord": "https://discord.gg/fJZKErEnPa",
        "discord_alt": "https://discord.gg/EMFTqSUYNu",
        "github": "https://github.com/jjcss",
        "youtube": "https://www.youtube.com/@computersocjjay",
        "instagram": "https://www.instagram.com/jjccomputerscience/",
        "linkedin": "https://www.linkedin.com/company/jjcss",
        "facebook": "https://www.facebook.com/CSSJohnJay",
        "linktree": "https://linktr.ee/jjaycss",
        "join_form": "https://docs.google.com/forms/d/e/1FAIpQLScs_GAVci5aZwhLT01kAN2lI1JE4aVnjQ3Y2FCLbHs5yEjaew/viewform",
        "email_updates_form": "https://docs.google.com/forms/d/e/1FAIpQLSefHY3t8HakF0VvY5jLKppv0XIaU7a0ZdfbTkSHzs1ObCSgsA/viewform",
        "address": "524 W 59th St, New York, NY 10019",
        "verified": False,
        "verify_note": "Every link needs a click-test by the board; the Discord pin is from 2021.",
    }
    write_json("links.json", links)


# ------------------------------------------------------------------ content/
def md(name: str, body: str):
    body = body.replace("11109", "10019")  # context/07: John Jay ZIP fix
    lines = [
        ln
        for ln in body.splitlines()
        if "\u00a92024" not in ln and "524 W 59th" not in ln and "\u00a9 2024" not in ln
    ]
    (CONTENT / name).write_text("\n".join(lines).strip() + "\n")
    print(f"content/{name}")


def extract_copy():
    idx = soup("index.html")

    def sect(cls: str) -> str:
        el = idx.select_one(cls)
        return clean(el.get_text(" ")) if el else ""

    bands = []
    for band_title, band_cls in [
        ("What the Club is About", ".about-section-description"),
        ("Events", ".events-section-description"),
        ("Resources", ".resources-section-description"),
        ("Collaborate", ".collaborate-section-description"),
    ]:
        el = idx.select_one(band_cls)
        if el:
            bands.append(f"## {band_title}\n\n{clean(el.get_text(' '))}")
    hero_p = idx.select_one(".welcome-section-description")
    md(
        "home.md",
        "---\ntitle: Home\nsource: jjcss/CSS_Website@a8fca55 index.html\n---\n\n"
        + (clean(hero_p.get_text(" ")) if hero_p else "")
        + "\n\n"
        + "\n\n".join(bands),
    )

    about = soup("about.html")
    parts = ["---\ntitle: About\nsource: jjcss/CSS_Website@a8fca55 about.html\n---"]
    for h in about.select("h1, h2"):
        t = clean(h.get_text(" "))
        if t in ("Meet The Team",) or "team" in " ".join(h.get("class") or []):
            continue
        nxt = h.find_next("p")
        if nxt and clean(nxt.get_text(" ")):
            parts.append(f"## {t}\n\n{clean(nxt.get_text(' '))}")
    md("about.md", "\n\n".join(parts))

    cyber = soup("cyberhounds.html")
    parts = [
        "---\ntitle: Cyberhounds\nkicker: John Jay CTF Team\nsource: jjcss/CSS_Website@a8fca55 cyberhounds.html\n---"
    ]
    for h in cyber.select(".text-section h1, .text-section2 h1, h1"):
        t = clean(h.get_text(" "))
        if t.lower() == "cyberhounds":
            continue
        p = h.find_next("p")
        if p:
            parts.append(f"## {t}\n\n{clean(p.get_text(' '))}")
    seen = set()
    dedup = [p for p in parts if not (p in seen or seen.add(p))]
    md("cyberhounds.md", "\n\n".join(dedup))

    grad = soup("graduate-events.html")
    body = []
    for el in grad.select("h2, h3, p"):
        t = clean(el.get_text(" "))
        if not t or len(t) < 4:
            continue
        if el.name in ("h2", "h3"):
            body.append(f"## {t}")
        else:
            body.append(t)
    md(
        "news/grad-school-events.md",
        "---\ntitle: 3 Most Important Things to Consider Before Signing Up to Any Graduate School Event\n"
        "date: 2023-01-01\nkind: article\nsource: jjcss/CSS_Website@a8fca55 graduate-events.html\n---\n\n"
        + "\n\n".join(body),
    )


# --------------------------------------------------------------- workshops.json
def extract_workshops():
    """The org's workshop repos are the real 'Previous Workshops' archive
    (pre-Fall-2024 history only exists there). Curated from context/02; the
    live list can be refreshed from the GitHub API by the board."""
    workshops = [
        {"name": "AWS Part 2 (Fall 2024)", "repo": "https://github.com/jjcss/AWS_Part_2_Fall_2024", "topic": "Cloud"},
        {"name": "Ethical Hacking", "repo": "https://github.com/jjcss", "topic": "Security"},
        {"name": "Security Engineering", "repo": "https://github.com/jjcss", "topic": "Security"},
        {"name": "Python x Cybersecurity", "repo": "https://github.com/jjcss", "topic": "Security"},
        {"name": "React Fullstack", "repo": "https://github.com/jjcss", "topic": "Web"},
        {"name": "Networking Basics", "repo": "https://github.com/jjcss", "topic": "Systems"},
        {"name": "Git / GitHub", "repo": "https://github.com/jjcss", "topic": "Tools"},
        {"name": "iOS Development", "repo": "https://github.com/jjcss", "topic": "Mobile"},
        {"name": "JavaScript", "repo": "https://github.com/jjcss", "topic": "Web"},
        {"name": "HTML / CSS", "repo": "https://github.com/jjcss", "topic": "Web"},
        {"name": "Technical Interview Prep (series)", "repo": "https://github.com/jjcss", "topic": "Career"},
        {"name": "Career Prep", "repo": "https://github.com/jjcss", "topic": "Career"},
        {"name": "CompTIA Security+ Bootcamp", "repo": "https://github.com/jjcss/jjcss.github.io", "topic": "Security"},
    ]
    write_json(
        "workshops.json",
        {
            "source": "jjcss org repos (context/02); refresh via GitHub API",
            "org": "https://github.com/jjcss",
            "workshops": workshops,
        },
    )


# --------------------------------------------------------------- projects.json
def seed_projects():
    """Three placeholder entries marked example:true so /projects renders the
    format. Never shown with fake stats; the UI labels them as examples."""
    examples = [
        ("example-study-planner", "Study Planner", "Example: a weekly study planner for John Jay CS courses.", ["web"], ["react", "typescript"],
         "Helps students plan around the CSCI course sequence."),
        ("example-ctf-notebook", "CTF Notebook", "Example: notes + writeup templates for Cyberhounds competitions.", ["cli"], ["python"],
         "Faster writeups for NCL and picoCTF; shared templates for the team."),
        ("example-room-finder", "Campus Room Finder", "Example: find an open study room in the New Building.", ["web", "ios"], ["swift", "fastapi"],
         "Saves the walk between floors looking for a free room."),
    ]
    write_json(
        "projects.json",
        {
            "note": "Example entries only — replaced by real submissions approved in the OS.",
            "projects": [
                {
                    "id": f"2026/projects/{slug}", "kind": "app", "title": title, "summary": summary, "platform": platform, "stack": stack,
                    "links": {"repo": "", "live": ""}, "screenshots": [], "benefits_jj": benefit,
                    "authors": [{"name": "Your Name Here", "handle": "", "term": "F26"}], "featured": i == 0, "display_order": i,
                    "term": "F26", "status": "published", "example": True, "visibility": "public", "created_at": 0, "updated_at": 0,
                }
                for i, (slug, title, summary, platform, stack, benefit) in enumerate(examples)
            ],
        },
    )


def extract_collaborate():
    """Openings / committees / project-ideas / suggestions from collaborate.html
    (run 2: the Join + Home collaborate sections render these lists)."""
    raw = (SRC / "collaborate.html").read_text(errors="replace")
    doc = BeautifulSoup(raw, "html.parser")
    text = doc.get_text("\n")
    roles = re.findall(r"([A-Z][A-Za-z ]+?)\s*\(Open\)", text)
    # committees are the h2/h3 headings ending in "Openings"
    committees = [
        clean(h.get_text(" ")).replace(" Openings", "")
        for h in doc.find_all(["h1", "h2", "h3"])
        if "Openings" in h.get_text()
    ]
    def para_after(heading):
        for h in doc.find_all(["h1", "h2", "h3"]):
            if heading.lower() in h.get_text().lower():
                nxt = h.find_next("p")
                if nxt:
                    return clean(nxt.get_text(" "))
        return ""
    write_json(
        "collaborate.json",
        {
            "source": "jjcss/CSS_Website@a8fca55 collaborate.html",
            "note": "Stale term labels dropped per context/07; roles kept as evergreen openings.",
            "openings": [{"role": r, "status": "open"} for r in roles],
            "committees": [c for c in committees if "Executive" not in c],
            "project_ideas": para_after("Share Your Project Ideas"),
            "suggestions": para_after("Club Suggestions"),
        },
    )


if __name__ == "__main__":
    terms = extract_board()
    events = extract_events()
    n_links = extract_resources()
    extract_links()
    extract_copy()
    extract_workshops()
    extract_collaborate()
    seed_projects()
    n_members = sum(len(t["members"]) for t in terms)
    print(
        f"\nboard: {len(terms)} terms / {n_members} members · events: {len(events)} · resources: {n_links} links"
    )
