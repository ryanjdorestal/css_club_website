"""The inheritance spine — board knowledge as markdown files with YAML
frontmatter under content/inheritance/<term>/… (the Tier-1 truth), mirrored
to `inheritance_records` when Supabase is configured. One validator for the
API, the CLI (scripts/validate_inheritance.py) and CI. No secrets, no
uploads (links only), no personal data beyond name / role / public email."""
from __future__ import annotations

import io
import json
import re
import time
import zipfile
from pathlib import Path
from typing import Any

from . import audit, config, db

DIR = config.CONTENT / "inheritance"
TABLE = "inheritance_records"
TYPES: dict[str, str] = {
    "roster": "roster.md",
    "handoff": "handoffs/{slug}.md",
    "decision": "decisions/{date}-{slug}.md",
    "project": "projects/{slug}.md",
    "event": "events/{slug}.md",
    "contact": "contacts/{slug}.md",
    "lesson": "lessons/{slug}.md",
    "minutes": "meetings/{date}.md",
}
STATUSES = ("draft", "final", "superseded")
VISIBILITY = ("board", "public")
REQUIRED = ("type", "title", "term", "date", "status", "owners", "visibility")
OPTIONAL = ("tags", "summary", "links", "supersedes", "succeeded_by", "related", "slug", "role")
TERM_RE = re.compile(r"^[FSW]\d{2}(-[FSW]\d{2})?$")
DATE_RE = re.compile(r"^\d{4}-\d{2}-\d{2}$")
EMAIL_RE = re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}")
PHONE_RE = re.compile(r"(?<!\d)(?:\+?1[ .-]?)?\(?\d{3}\)?[ .-]?\d{3}[ .-]?\d{4}(?!\d)")
# secret-shaped strings (gitleaks-style; the allowlist is "none")
SECRET_RES = [re.compile(p) for p in (
    r"AKIA[0-9A-Z]{16}", r"gh[pousr]_[A-Za-z0-9]{30,}", r"github_pat_[A-Za-z0-9_]{40,}", r"xox[baprs]-[A-Za-z0-9-]{10,}",
    r"AIza[0-9A-Za-z\-_]{35}", r"sk-[A-Za-z0-9]{32,}", r"eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{10,}",
    r"-----BEGIN (RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----", r"discord(?:app)?\.com/api/webhooks/\d+/[A-Za-z0-9_-]{30,}",
    r"secret_[A-Za-z0-9]{40,}", r"ntn_[A-Za-z0-9]{40,}", r"sb[ps]_[A-Za-z0-9]{30,}",
    r"(?i)(password|passwd|secret|token|api[_-]?key)\s*[:=]\s*['\"]?[A-Za-z0-9/+_\-]{16,}",
)]


# ------------------------------------------------------------ frontmatter
def parse(text: str) -> tuple[dict[str, Any], str]:
    """Minimal YAML subset: `k: v`, `k: [a, b]`, block lists (`- x`), and block
    lists of `- label: x` / `  url: y` maps. Enough for the spine; no PyYAML."""
    m = re.match(r"^---\n(.*?)\n---\n?", text, re.S)
    if not m:
        return {}, text
    meta: dict[str, Any] = {}
    lines = m.group(1).split("\n")
    i = 0
    while i < len(lines):
        km = re.match(r"^([A-Za-z_][\w-]*):\s*(.*)$", lines[i])
        if not km:
            i += 1
            continue
        key, val = km.group(1), km.group(2).strip()
        if val == "":
            meta[key], i = parse_block_list(lines, i + 1)
        else:
            meta[key] = parse_scalar(val)
            i += 1
    return meta, text[m.end() :]


def parse_scalar(val: str) -> Any:
    if val.startswith("[") and val.endswith("]"):
        return [x.strip().strip("\"'") for x in val[1:-1].split(",") if x.strip()]
    if val.lower() in ("true", "false"):
        return val.lower() == "true"
    return val.strip("\"'")


def parse_block_list(lines: list[str], i: int) -> tuple[list[Any], int]:
    """`- x` items, or `- label: x` maps continued by indented `key: value` lines; returns (items, next line)."""
    items: list[Any] = []
    while i < len(lines) and (lines[i].startswith("  ") or lines[i].startswith("- ")):
        s = lines[i].strip()
        if not s.startswith("- "):
            i += 1
            continue
        body = s[2:].strip()
        if ":" in body and not body.startswith(("http", '"', "'")):
            obj, i = parse_block_map(lines, i, body)
            items.append(obj)
        else:
            items.append(body.strip("\"'"))
            i += 1
    return items, i


def parse_block_map(lines: list[str], i: int, first: str) -> tuple[dict[str, str], int]:
    k, v = first.split(":", 1)
    obj = {k.strip(): v.strip().strip("\"'")}
    i += 1
    while i < len(lines) and lines[i].startswith("    ") and not lines[i].strip().startswith("- "):
        k, v = lines[i].strip().split(":", 1)
        obj[k.strip()] = v.strip().strip("\"'")
        i += 1
    return obj, i


def dump(meta: dict[str, Any], body: str) -> str:
    out = ["---"]
    for k in [*REQUIRED, *OPTIONAL]:
        if k not in meta or meta[k] in (None, "", []):
            continue
        v = meta[k]
        if isinstance(v, list) and v and isinstance(v[0], dict):
            out.append(f"{k}:")
            for item in v:
                first = True
                for k2, v2 in item.items():
                    out.append(f"{'  - ' if first else '    '}{k2}: {v2}")
                    first = False
        elif isinstance(v, list):
            out.append(f"{k}: [{', '.join(str(x) for x in v)}]")
        else:
            out.append(f"{k}: {v}")
    out.append("---")
    return "\n".join(out) + "\n\n" + body.strip() + "\n"


# ---------------------------------------------------------------- paths
def slugify(s: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", str(s).lower()).strip("-")[:80]


def rel_path(meta: dict[str, Any]) -> str:
    """'F26/decisions/2026-09-21-platform-adoption.md' — the record id is this without .md."""
    t = str(meta.get("type", ""))
    pattern = TYPES.get(t, "notes/{slug}.md")
    slug = str(meta.get("slug") or slugify(meta.get("role") or meta.get("title", "untitled")))
    return f"{meta.get('term', '')}/" + pattern.format(slug=slug, date=meta.get("date", ""))


def record_id(meta: dict[str, Any]) -> str:
    return rel_path(meta)[:-3]


# ----------------------------------------------------------------- reads
def _row(path: Path, text: str) -> dict[str, Any]:
    meta, body = parse(text)
    rid = str(path.relative_to(DIR))[:-3]
    return {**meta, "id": rid, "path": f"content/inheritance/{rid}.md", "body_md": body.strip(),
            "excerpt": re.sub(r"\s+", " ", body.strip())[:180], "updated_at": int(path.stat().st_mtime)}


def list_records(term: str | None = None, with_body: bool = False) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    if not DIR.exists():
        return rows
    for p in sorted(DIR.rglob("*.md")):
        if "_template" in p.parts or p.name.upper().startswith("HOW-TO") or p.name == "README.md":
            continue
        row = _row(p, p.read_text())
        if term and row.get("term") != term:
            continue
        if not with_body:
            row.pop("body_md", None)
        rows.append(row)
    rows.sort(key=lambda r: (str(r.get("term", "")), str(r.get("date", ""))), reverse=True)
    return rows


def get_record(rid: str) -> dict[str, Any] | None:
    p = DIR / f"{rid}.md"
    if not p.exists() or ".." in rid:
        return None
    return _row(p, p.read_text())


def terms() -> list[str]:
    if not DIR.exists():
        return []
    return sorted((d.name for d in DIR.iterdir() if d.is_dir() and not d.name.startswith("_")), reverse=True)


def templates() -> dict[str, str]:
    d = DIR / "_template"
    return {p.stem: p.read_text() for p in sorted(d.glob("*.md"))} if d.exists() else {}


def howto() -> str:
    p = DIR / "HOW-TO.md"
    return p.read_text() if p.exists() else ""


# ------------------------------------------------------------- validate
KNOWN_FIELDS = set(REQUIRED) | set(OPTIONAL) | {"id", "path", "body_md", "excerpt", "updated_at"}
ENUMS: tuple[tuple[str, tuple[str, ...], str], ...] = (
    ("type", tuple(TYPES), f"type must be one of {', '.join(TYPES)}"),
    ("status", STATUSES, f"status must be one of {', '.join(STATUSES)}"),
    ("visibility", VISIBILITY, "visibility must be board or public"),
)
SHAPES: tuple[tuple[str, re.Pattern[str], str], ...] = (
    ("term", TERM_RE, "term must look like F26 or F24-S25"),
    ("date", DATE_RE, "date must be YYYY-MM-DD"),
)


def validate(meta: dict[str, Any], body: str, roster_names: list[str] | None = None, others: list[dict[str, Any]] | None = None) -> list[str]:
    """Every rule the spine enforces, one check per concern. Returns [] when the record is acceptable."""
    errs = check_header(meta)
    errs += check_owners(meta, roster_names)
    if others is not None:
        errs += check_references(meta, others)
    errs += check_privacy(meta, body)
    return errs


def check_header(meta: dict[str, Any]) -> list[str]:
    """Required fields present, enums and shapes right, no unknown keys, links well-formed."""
    errs = [f"missing required field: {k}" for k in REQUIRED if k not in meta or meta[k] in ("", None, [])]
    errs += [msg for key, allowed, msg in ENUMS if meta.get(key) and meta[key] not in allowed]
    errs += [msg for key, rx, msg in SHAPES if meta.get(key) and not rx.match(str(meta[key]))]
    errs += [f"unknown field: {k}" for k in meta if k not in KNOWN_FIELDS]
    for ln in meta.get("links") or []:
        if not isinstance(ln, dict) or not ln.get("label") or not str(ln.get("url", "")).startswith("http"):
            errs.append("each link needs a label and an http(s) url")
    return errs


def check_owners(meta: dict[str, Any], roster_names: list[str] | None) -> list[str]:
    """Owners are a non-empty list; when the term has a roster, every owner is on it (or a role)."""
    owners = meta.get("owners") or []
    if not isinstance(owners, list) or not owners:
        return ["owners must be a non-empty list of names or roles"]
    if not roster_names:
        return []
    known = {n.lower() for n in roster_names} | {"the board", "board"}
    return [f"owner not on the {meta.get('term')} roster: {o}" for o in owners if str(o).lower() not in known]


def check_references(meta: dict[str, Any], others: list[dict[str, Any]]) -> list[str]:
    """supersedes / succeeded_by / related resolve to real records, and the supersedes chain has no cycle."""
    ids = {r["id"] for r in others}
    errs = [f"{k} does not resolve: {meta[k]}" for k in ("supersedes", "succeeded_by") if meta.get(k) and meta[k] not in ids]
    errs += [f"related does not resolve: {rel}" for rel in meta.get("related") or [] if rel not in ids]
    by_id = {r["id"]: r for r in others}
    chain, cur = set(), meta.get("supersedes")
    while cur:
        if cur in chain or cur == record_id(meta):
            errs.append("supersedes chain forms a cycle")
            break
        chain.add(cur)
        cur = by_id.get(cur, {}).get("supersedes")
    return errs


def check_privacy(meta: dict[str, Any], body: str) -> list[str]:
    """No secret-shaped string anywhere; no email or phone number in a public record."""
    errs: list[str] = []
    text = json.dumps(meta) + "\n" + body
    for rx in SECRET_RES:
        if rx.search(text):
            errs.append(f"secret-shaped string found ({rx.pattern[:24]}…) — pointer records only, never credentials")
            break
    if meta.get("visibility") == "public" and (EMAIL_RE.search(body) or PHONE_RE.search(body)):
        errs.append("public records may not contain email addresses or phone numbers")
    return errs


# ------------------------------------------------------------------ write
def save_record(meta: dict[str, Any], body: str, actor: str, roster_names: list[str] | None = None) -> tuple[dict[str, Any] | None, list[str]]:
    others = list_records()
    rid = record_id(meta)
    errs = validate(meta, body, roster_names, [r for r in others if r["id"] != rid])
    if errs:
        return None, errs
    p = DIR / f"{rid}.md"
    before = get_record(rid)
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(dump(meta, body))
    row = _row(p, p.read_text())
    db.upsert(TABLE, {"id": rid, "path": row["path"], "type": row.get("type"), "term": row.get("term"), "title": row.get("title"),
                      "frontmatter": {k: v for k, v in meta.items()}, "body_md": body, "updated_at": int(time.time())})
    audit.record(actor, "update" if before else "create", TABLE, rid, before, {k: v for k, v in row.items() if k != "body_md"})
    return row, []


def export_zip() -> bytes:
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as z:
        for p in sorted(DIR.rglob("*.md")):
            z.write(p, f"inheritance/{p.relative_to(DIR)}")
    return buf.getvalue()


def stats(term: str | None, officers: int) -> dict[str, Any]:
    rows = list_records(term)
    filed = len([r for r in rows if r.get("type") == "handoff" and r.get("status") == "final"])
    return {"records": len(rows), "handoffs_filed": filed, "officers": officers, "last_date": max((str(r.get("date", "")) for r in rows), default=""),
            "by_type": {t: len([r for r in rows if r.get("type") == t]) for t in TYPES}}
