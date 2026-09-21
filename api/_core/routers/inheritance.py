"""/api/os/status + /api/os/handoffs + /api/os/attention — the inheritance
spine. status = honest live checks (no fake green); handoffs = one per officer
per term; attention = the counts Today shows. Mounted by api/index.py."""
from __future__ import annotations

import subprocess
import time
from typing import Any

from fastapi import APIRouter, Depends, HTTPException

from .. import collections as C
from .. import config, db, lifecycle, tier1
from ..auth import Actor, current_term, require_role
from ..crud import make_router
from ..models import HandoffIn


def prepare(data: dict[str, Any], actor: Actor) -> dict[str, Any]:
    data.setdefault("term", (current_term() or {}).get("id"))
    data.setdefault("profile_id", actor.profile_id or actor.email)
    data.setdefault("officer_name", actor.name or actor.email)
    data.setdefault("status", "draft")
    return data


r: APIRouter = make_router("/os/handoffs", C.handoffs, HandoffIn, filters=("term", "status"), delete_role="admin",
                           transitions="handoffs", prepare=prepare)
status_r = APIRouter(prefix="/os")


@r.post("/{row_id:path}/file")
def file_handoff(row_id: str, actor: Actor = Depends(require_role("officer"))) -> dict[str, Any]:
    before = C.handoffs.get(row_id)
    if not before:
        raise HTTPException(404, "not found")
    if not lifecycle.allowed("handoffs", str(before.get("status")), "filed"):
        raise HTTPException(422, f"cannot file from {before.get('status')}")
    return {"ok": True, "row": C.handoffs.patch(row_id, {"status": "filed", "filed_at": int(time.time())}, actor.email, action="file")}


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
    ka = tier1.read_json("../qa/keepalive.json", {})
    checks.append(chip("live" if ka.get("last_run") else "idle", "KEEPALIVE", f"last run {ka.get('last_run') or 'never (workflow writes qa/keepalive.json)'}", "RUNBOOK · Keepalive"))
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
    filed = {h.get("profile_id") for h in C.handoffs.list(term=term.get("id")) if h.get("status") in ("filed", "acknowledged")}
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
