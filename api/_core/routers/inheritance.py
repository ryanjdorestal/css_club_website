"""/api/os/status + /api/os/attention — platform health (the /os/system page)
and the counts Today shows. status = honest live checks, no fake green.
Handoffs live in the spine (routers/spine.py). Mounted by api/index.py."""
from __future__ import annotations

import subprocess
import time
from typing import Any

from fastapi import APIRouter, Depends

from .. import collections as C
from .. import config, db, hosting, spine, tier1
from ..auth import Actor, current_term, require_role

status_r = APIRouter(prefix="/os")


def repo_sha() -> str:
    try:
        return subprocess.run(["git", "rev-parse", "--short", "HEAD"], capture_output=True, text=True, cwd=config.ROOT, timeout=3).stdout.strip() or "?"
    except Exception:
        return "?"


def chip(state: str, label: str, detail: str, fix: str = "") -> dict[str, str]:
    return {"state": state, "label": label, "detail": detail, "fix": fix}


@status_r.get("/status")
def platform_status(actor: Actor = Depends(require_role("officer"))) -> dict[str, Any]:
    """Is the platform working? Every check names its real data source."""
    checks: list[dict[str, str]] = []
    if config.supabase_configured():
        ok = db.reachable()
        days = (time.time() - db.last_ok) / 86400 if db.last_ok else None
        checks.append(chip("live" if ok else "offline", "SUPABASE", "reachable" if ok else "unreachable — paused or wrong keys", "RUNBOOK · Supabase paused"))
        if days is not None:
            checks.append(chip("live" if days < 5 else "idle", "DAYS_SINCE_LAST_WRITE", f"{days:.1f} d (free tier pauses at 7 idle)", "RUNBOOK · Supabase paused"))
    else:
        checks.append(chip("offline", "SUPABASE", "not configured — Tier 1 (local JSON + inbox)", "SETUP.md §2"))
    keepalive = hosting.keepalive_last_run()
    checks.append(chip("live" if keepalive else "idle", "KEEPALIVE", f"last run {keepalive or 'never (the keepalive workflow writes site_settings.keepalive)'}", "RUNBOOK · Supabase paused"))
    deployed, repo = config.GIT_SHA, repo_sha()
    stale = deployed != "dev" and not deployed.startswith(repo) and not repo.startswith(deployed[:7])
    checks.append(chip("idle" if stale else "live", "DEPLOY", f"deployed {deployed[:7]} · repo {repo}", "RUNBOOK · Deploy stale"))
    snap = tier1.read_json("snapshot.json", {})
    checks.append(chip("live" if snap.get("generated_at") else "idle", "SNAPSHOT", f"last {snap.get('generated_at') or 'never — run scripts/snapshot.py'}", "RUNBOOK · Restore from snapshot"))
    checked = [float(x["last_checked"]) for x in C.links.list() + C.resources.list() if x.get("last_checked")]
    age = (time.time() - max(checked)) / 86400 if checked else None
    checks.append(chip("live" if age is not None and age < 90 else "idle", "LINK_CHECK", f"{age:.0f} d ago" if age is not None else "never", "/os/resources → Check all links"))
    n_up = sum(1 for _ in config.UPLOADS.glob("*")) if config.UPLOADS.exists() else 0
    checks.append(chip("live", "UPLOADS", f"{n_up} local files" if not config.supabase_configured() else "bucket public-media", ""))
    inbox = tier1.inbox_count()
    checks.append(chip("live" if inbox == 0 else "idle", "INBOX", f"{inbox} unsynced write(s)", "/os/audit → Replay to DB"))
    return {"ok": True, "checks": checks, "ts": int(time.time())}


@status_r.get("/attention")
def attention(actor: Actor = Depends(require_role("officer"))) -> dict[str, Any]:
    """What needs a human — the counts behind Today's 'Needs attention' list."""
    term = current_term() or {}
    now = time.time()
    posts = C.posts.list()
    stale_drafts = [p for p in posts if p.get("status") == "draft" and now - float(p.get("updated_at") or 0) > 14 * 86400]
    events = C.events.list()
    officers = C.board.list(term=term.get("id"))
    filed_roles = {str(h.get("role") or "").lower() for h in spine.list_records(str(term.get("id") or "")) if h.get("type") == "handoff" and h.get("status") == "final"}
    filed = {o["id"] for o in officers if str(o.get("role_title", "")).lower() in filed_roles}
    ends = term.get("ends_on")
    last_weeks = False
    if ends:
        try:
            last_weeks = (time.mktime(time.strptime(ends, "%Y-%m-%d")) - now) < 28 * 86400
        except Exception:
            last_weeks = False
    items = [
        {"key": "submissions", "label": "Project submissions to review", "count": len([p for p in C.projects.list() if p.get("status") in ("submitted", "in_review")]), "href": "/os/projects"},
        {"key": "onboarding", "label": "New join requests", "count": len([m for m in C.members.list() if m.get("status") == "interested"]), "href": "/os/members"},
        {"key": "dead_links", "label": "Dead links", "count": len([x for x in C.links.list() + C.resources.list() if x.get("dead")]), "href": "/os/resources"},
        {"key": "no_flyer", "label": "Published events without a flyer", "count": len([e for e in events if e.get("status") == "published" and not e.get("flyer_path")]), "href": "/os/events"},
        {"key": "stale_drafts", "label": "Drafts older than 14 days", "count": len(stale_drafts), "href": "/os/posts"},
        {"key": "handoffs", "label": "Handoffs not filed this term", "count": len([o for o in officers if o["id"] not in filed]) if last_weeks else 0, "href": "/os/inheritance"},
        {"key": "inbox", "label": "Unsynced writes in the inbox", "count": tier1.inbox_count(), "href": "/os/audit"},
    ]
    return {"ok": True, "term": term, "items": items, "officers": len(officers),
            "last_post": max((p.get("published_at") or "" for p in posts if p.get("status") == "published"), default=""),
            "next_event": next((e for e in sorted(events, key=lambda e: str(e.get("starts_at") or "")) if e.get("when") == "upcoming" and e.get("status") == "published"), None)}


@status_r.get("/hosting")
def hosting_panel(actor: Actor = Depends(require_role("officer"))) -> dict[str, Any]:
    """The HOSTING panel on /os/system: free-tier limits, measured usage, and the ages a board member acts on.
    Deployments today come from the GitHub API in the browser (no token); everything here is server-side."""
    configured = config.supabase_configured()
    raw = hosting.usage() if configured else hosting.local_usage()
    report = hosting.budget(raw) if raw else None
    last_write = 0
    for col in C.ALL.values():
        try:
            last_write = max([last_write, *(int(r.get("updated_at") or 0) for r in col.list())])
        except Exception:
            continue
    snap = tier1.read_json("snapshot.json", {})
    return {
        "ok": True, "tier": "db" if configured else "local", "limits": hosting.LIMITS, "usage": report,
        "usage_reason": None if report else ("hosting_usage() did not answer — run supabase/migrations/0005_hosting.sql" if configured else "Tier 1: local tables"),
        "keepalive": hosting.keepalive_last_run(), "snapshot": snap.get("generated_at"),
        "days_since_last_write": round((time.time() - last_write) / 86400, 1) if last_write else None,
        "warn_at_pct": int(hosting.WARN_AT * 100),
    }
