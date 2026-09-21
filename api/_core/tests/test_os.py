"""Tier-1 tests for every OS endpoint: happy path + one auth failure each.
Runs against the FastAPI app with a temp data/ + inbox (no Supabase, no keys).
`pytest api/_core/tests -q`."""
from __future__ import annotations

import json
import sys
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from _core import config

from .conftest import ADMIN, OFFICER, ROOT


# ------------------------------------------------------------ auth / whoami
def test_whoami_guest_by_default(client: TestClient) -> None:
    assert client.get("/api/whoami").json()["role"] == "guest"


def test_whoami_local_role(client: TestClient) -> None:
    assert client.get("/api/whoami", headers=ADMIN).json()["role"] == "admin"


def test_local_role_ignored_on_vercel(client: TestClient, monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(config, "IS_VERCEL", True)
    assert client.get("/api/whoami", headers=ADMIN).json()["role"] == "guest"


def test_jwt_roundtrip(monkeypatch: pytest.MonkeyPatch) -> None:
    import base64
    import hashlib
    import hmac
    import time

    from _core.auth import verify_jwt

    def b64(b: bytes) -> str:
        return base64.urlsafe_b64encode(b).rstrip(b"=").decode()

    h = b64(json.dumps({"alg": "HS256", "typ": "JWT"}).encode())
    p = b64(json.dumps({"email": "x@y.edu", "exp": time.time() + 60}).encode())
    sig = b64(hmac.new(b"s3cret", f"{h}.{p}".encode(), hashlib.sha256).digest())
    claims = verify_jwt(f"{h}.{p}.{sig}", "s3cret")
    assert claims is not None and claims["email"] == "x@y.edu"
    assert verify_jwt(f"{h}.{p}.{sig}", "wrong") is None


def test_os_requires_officer(client: TestClient) -> None:
    assert client.get("/api/os/projects").status_code == 401


# ---------------------------------------------------------------- public
def test_health_tier1(client: TestClient) -> None:
    j = client.get("/api/health").json()
    assert j["ok"] and j["db"] == "skipped" and j["tier"] == "local"


@pytest.mark.parametrize("path,key", [("/api/projects", "projects"), ("/api/events", "semesters"), ("/api/board", "terms"),
                                      ("/api/resources", "groups"), ("/api/posts", "posts"), ("/api/site-settings", "settings"), ("/api/links", "links")])
def test_public_reads_fall_back(client: TestClient, path: str, key: str) -> None:
    j = client.get(path).json()
    assert j["ok"] and key in j and j["source"] in ("static", "local")


def test_chat_is_keyless(client: TestClient) -> None:
    assert client.get("/api/chat").json()["configured"] is False
    assert client.post("/api/chat", json={"message": "how do I join"}).json()["ok"]


def test_apps_submit_redirects(client: TestClient) -> None:
    r = client.post("/api/apps/submit", json={}, follow_redirects=False)
    assert r.status_code == 308


# -------------------------------------------------------------- projects
def submit(client: TestClient) -> str:
    r = client.post("/api/projects/submit", json={"title": "T", "author": "A", "email": "a@b.edu", "summary": "s", "platform": "web"})
    assert r.status_code == 200 and r.json()["stored"] == "local"
    return str(r.json()["id"])


def test_project_flow(client: TestClient) -> None:
    pid = submit(client)
    assert any(p["id"] == pid for p in client.get("/api/os/projects?status=submitted", headers=OFFICER).json()["rows"])
    assert client.post(f"/api/os/projects/{pid}/decide", json={"decision": "request_changes"}, headers=OFFICER).status_code == 422  # note required
    assert client.post(f"/api/os/projects/{pid}/decide", json={"decision": "in_review"}, headers=OFFICER).json()["row"]["status"] == "in_review"
    assert client.post(f"/api/os/projects/{pid}/publish", headers=OFFICER).status_code == 422  # not approved yet
    assert client.post(f"/api/os/projects/{pid}/decide", json={"decision": "approve"}, headers=OFFICER).json()["row"]["status"] == "approved"
    assert client.post(f"/api/os/projects/{pid}/publish", headers=OFFICER).json()["row"]["status"] == "published"
    assert any(p["id"] == pid for p in client.get("/api/projects").json()["projects"])


def test_project_submit_validates(client: TestClient) -> None:
    assert client.post("/api/projects/submit", json={"title": "", "author": "A", "email": "nope", "summary": "s"}).status_code == 422


def test_project_reorder(client: TestClient) -> None:
    ids = [p["id"] for p in client.get("/api/os/projects", headers=OFFICER).json()["rows"]][:2][::-1]
    assert client.post("/api/os/projects/reorder", json={"ids": ids}, headers=OFFICER).json()["count"] == 2


def test_project_write_needs_officer(client: TestClient) -> None:
    assert client.post("/api/os/projects", json={"title": "x"}).status_code == 401


# ------------------------------------------------------------------ posts
def test_post_flow(client: TestClient) -> None:
    r = client.post("/api/os/posts", json={"title": "Fall Kickoff!", "body_md": "## Hi\n\nhello"}, headers=OFFICER).json()
    assert r["row"]["slug"] == "fall-kickoff" and r["row"]["status"] == "draft"
    assert not any(p["slug"] == "fall-kickoff" for p in client.get("/api/posts").json()["posts"])
    assert client.post("/api/os/posts/fall-kickoff/publish", headers=OFFICER).json()["row"]["status"] == "published"
    assert client.get("/api/posts/fall-kickoff").json()["post"]["body_md"].startswith("## Hi")


def test_post_illegal_transition(client: TestClient) -> None:
    client.post("/api/os/posts", json={"title": "Draft", "body_md": ""}, headers=OFFICER)
    assert client.post("/api/os/posts/draft/transition", json={"to": "acknowledged"}, headers=OFFICER).status_code == 422


def test_posts_need_auth(client: TestClient) -> None:
    assert client.get("/api/os/posts").status_code == 401


# ----------------------------------------------------------------- events
def test_event_flow(client: TestClient) -> None:
    r = client.post("/api/os/events", json={"title": "Kickoff", "semester": "Fall 2026", "date_label": "Sep 24"}, headers=OFFICER).json()
    assert r["row"]["status"] == "draft"
    assert "Fall 2026" not in [s["semester"] for s in client.get("/api/events").json()["semesters"]]
    client.post(f"/api/os/events/{r['row']['id']}/publish", headers=OFFICER)
    assert "Fall 2026" in [s["semester"] for s in client.get("/api/events").json()["semesters"]]


def test_events_need_auth(client: TestClient) -> None:
    assert client.post("/api/os/events", json={"title": "x"}).status_code == 401


# -------------------------------------------------------------- resources
def test_resource_crud(client: TestClient) -> None:
    r = client.post("/api/os/resources", json={"group": "General Knowledge", "title": "New", "url": "https://example.org"}, headers=OFFICER).json()
    rid = r["row"]["id"]
    assert client.patch(f"/api/os/resources/{rid}", json={"group": "General Knowledge", "title": "Renamed", "url": "https://example.org"}, headers=OFFICER).json()["row"]["title"] == "Renamed"
    assert any(ln["title"] == "Renamed" for g in client.get("/api/resources").json()["groups"] for ln in g["links"])
    assert client.delete(f"/api/os/resources/{rid}", headers=OFFICER).json()["ok"]


def test_link_edit_reaches_public(client: TestClient) -> None:
    assert client.patch("/api/os/links/discord", json={"url": "https://discord.gg/new"}, headers=OFFICER).status_code == 200
    assert client.get("/api/links").json()["links"]["discord"] == "https://discord.gg/new"


def test_links_need_auth(client: TestClient) -> None:
    assert client.patch("/api/os/links/discord", json={"url": "x"}).status_code == 401


# ------------------------------------------------------------------ board
def test_board_write_needs_admin(client: TestClient) -> None:
    assert client.post("/api/os/board", json={"name": "New Officer"}, headers=OFFICER).status_code == 403


def test_rollover(client: TestClient) -> None:
    cur = client.get("/api/os/terms", headers=OFFICER).json()["current"]["id"]
    r = client.post("/api/os/terms/rollover", json={"next_id": "S27", "next_label": "Spring 2027", "continuing_ids": []}, headers=ADMIN).json()
    assert r["closed"] == cur and r["opened"]["id"] == "S27"
    assert "S27" in client.get("/api/os/inheritance", headers=OFFICER).json()["terms"]  # rollover wrote S27/roster.md into the spine
    assert client.get("/api/os/terms", headers=OFFICER).json()["current"]["id"] == "S27"
    assert client.post("/api/os/terms/rollover", json={"next_id": "S27", "next_label": "Spring 2027"}, headers=ADMIN).status_code == 409


def test_public_board_shape(client: TestClient) -> None:
    j = client.get("/api/board").json()
    # the current term (F26, no seats yet) lists first — even empty — then the most recent board on record
    assert j["terms"][0]["is_current"] and j["terms"][0]["members"] == []
    assert j["terms"][1]["members"][0]["name"]


# ---------------------------------------------------------------- members
CSV = "display_name,discord_handle,email,status,joined_term\nJay,jay#1,jay@x.edu,member,F26\nSam,sam#2,,interested,F26\n"


def test_member_import_dry_then_commit(client: TestClient) -> None:
    dry = client.post("/api/os/members/import", json={"csv": CSV, "dry_run": True}, headers=OFFICER).json()
    assert dry["added"] == 2 and client.get("/api/os/members", headers=OFFICER).json()["count"] == 0
    client.post("/api/os/members/import", json={"csv": CSV, "dry_run": False}, headers=OFFICER)
    assert client.get("/api/os/members", headers=OFFICER).json()["count"] == 2
    again = client.post("/api/os/members/import", json={"csv": CSV, "dry_run": True}, headers=OFFICER).json()
    assert again["added"] == 0 and again["unchanged"] == 2


def test_member_transition_audited(client: TestClient) -> None:
    m = client.post("/api/os/members", json={"display_name": "Jay"}, headers=OFFICER).json()["row"]
    assert client.post(f"/api/os/members/{m['id']}/transition", json={"to": "alumni"}, headers=OFFICER).status_code == 422
    assert client.post(f"/api/os/members/{m['id']}/transition", json={"to": "member"}, headers=OFFICER).json()["row"]["status"] == "member"
    recs = client.get("/api/os/records?table=members", headers=OFFICER).json()["rows"]
    assert any(r["action"] == "transition:member" for r in recs)


def test_join_form_creates_member(client: TestClient) -> None:
    client.post("/api/onboarding/submit", json={"name": "New Kid", "email": "kid@jjay.cuny.edu", "discord_handle": "kid"})
    assert any(m["display_name"] == "New Kid" for m in client.get("/api/os/members", headers=OFFICER).json()["rows"])


def test_members_need_auth(client: TestClient) -> None:
    assert client.get("/api/os/members").status_code == 401


# --------------------------------------------------------------- settings
def test_settings_admin_only(client: TestClient) -> None:
    assert client.patch("/api/os/site-settings/taglines", json={"value": {"primary": "x"}}, headers=OFFICER).status_code == 403
    assert client.patch("/api/os/site-settings/taglines", json={"value": {"primary": "Ship it."}}, headers=ADMIN).status_code == 200
    assert client.get("/api/site-settings").json()["settings"]["taglines"]["primary"] == "Ship it."


# ------------------------------------------------------------ inheritance
def test_status_is_honest(client: TestClient) -> None:
    checks = client.get("/api/os/status", headers=OFFICER).json()["checks"]
    assert {c["label"] for c in checks} >= {"SUPABASE", "KEEPALIVE", "DEPLOY", "SNAPSHOT", "LINK_CHECK", "INBOX"}
    assert next(c for c in checks if c["label"] == "SUPABASE")["state"] == "offline"


def test_attention_keys(client: TestClient) -> None:
    items = client.get("/api/os/attention", headers=OFFICER).json()["items"]
    assert {i["key"] for i in items} >= {"submissions", "dead_links", "handoffs", "inbox"}


# ------------------------------------------------------------------ spine
def test_spine_index_and_templates(client: TestClient) -> None:
    j = client.get("/api/os/inheritance", headers=OFFICER).json()
    assert j["ok"] and "F26" in j["terms"] and j["stats"]["records"] >= 1
    t = client.get("/api/os/inheritance/templates", headers=OFFICER).json()
    assert set(t["templates"]) == {"roster", "handoff", "decision", "project", "event", "contact", "lesson", "minutes"} and "## The five steps" in t["howto"]


def test_spine_create_writes_a_file(client: TestClient, tmp_path: Path) -> None:
    d = tmp_path / "inheritance"
    body = {"meta": {"type": "decision", "title": "Meet on Thursdays", "term": "F26", "date": "2026-10-01", "status": "final", "owners": ["the board"], "visibility": "board",
                     "links": [{"label": "Notes", "url": "https://drive.google.com/x"}]}, "body_md": "## Decision\n\nThursdays 1:40."}
    r = client.post("/api/os/inheritance", json=body, headers=OFFICER)
    assert r.status_code == 200, r.text
    assert (d / "F26/decisions/2026-10-01-meet-on-thursdays.md").exists()
    assert client.post("/api/os/inheritance", json=body, headers=OFFICER).status_code == 409
    got = client.get("/api/os/inheritance/F26/decisions/2026-10-01-meet-on-thursdays", headers=OFFICER).json()["row"]
    assert got["links"][0]["label"] == "Notes" and got["body_md"].startswith("## Decision")


def test_spine_refuses_secrets_and_pii(client: TestClient) -> None:
    base = {"type": "lesson", "title": "x", "term": "F26", "date": "2026-10-02", "status": "draft", "owners": ["the board"], "visibility": "board"}
    r = client.post("/api/os/inheritance", json={"meta": base, "body_md": "token: ghp_abcdefghijklmnopqrstuvwxyz0123456789"}, headers=OFFICER)
    assert r.status_code == 422 and "secret-shaped" in r.text
    r = client.post("/api/os/inheritance", json={"meta": {**base, "visibility": "public"}, "body_md": "call me at 212-555-0100"}, headers=OFFICER)
    assert r.status_code == 422 and "phone" in r.text
    r = client.post("/api/os/inheritance", json={"meta": {**base, "status": "published"}, "body_md": "ok"}, headers=OFFICER)
    assert r.status_code == 422 and "status must be" in r.text


def test_spine_export_zip(client: TestClient) -> None:
    r = client.get("/api/os/inheritance/export.zip", headers=OFFICER)
    assert r.status_code == 200 and r.headers["content-type"] == "application/zip" and len(r.content) > 500


def test_spine_needs_auth(client: TestClient) -> None:
    assert client.get("/api/os/inheritance").status_code == 401


def test_status_needs_auth(client: TestClient) -> None:
    assert client.get("/api/os/status").status_code == 401


# ------------------------------------------------------------------ audit
def test_records_and_inbox(client: TestClient) -> None:
    submit(client)
    assert client.get("/api/os/records", headers=OFFICER).json()["count"] >= 1
    inbox = client.get("/api/os/inbox", headers=OFFICER).json()
    assert inbox["count"] >= 1 and inbox["db"] is False
    assert client.post("/api/os/inbox/replay", json={}, headers=ADMIN).json()["ok"] is False  # no DB → honest


def test_replay_needs_admin(client: TestClient) -> None:
    assert client.post("/api/os/inbox/replay", json={}, headers=OFFICER).status_code == 403


# ---------------------------------------------------------------- uploads
def test_upload_rejects_non_image(client: TestClient) -> None:
    r = client.post("/api/os/uploads", files={"file": ("x.txt", b"hi", "text/plain")}, headers=OFFICER)
    assert r.status_code == 415


def test_upload_png_local(client: TestClient) -> None:
    import io

    from PIL import Image

    buf = io.BytesIO()
    Image.new("RGB", (2400, 1200), (179, 32, 42)).save(buf, format="PNG")
    png = buf.getvalue()
    r = client.post("/api/os/uploads", files={"file": ("dot.png", png, "image/png")}, headers=OFFICER).json()
    assert r["ok"] and r["stored"] == "local" and r["path"].startswith("/api/os/uploads/")
    assert r["bytes"] < len(png)  # resized to ≤ 1600 px
    assert client.get(r["path"]).status_code == 200


def test_upload_needs_auth(client: TestClient) -> None:
    assert client.post("/api/os/uploads", files={"file": ("x.png", b"", "image/png")}).status_code == 401


# --------------------------------------------------------------- api count
def test_one_function_guard() -> None:
    import subprocess

    assert subprocess.run([sys.executable, str(ROOT / "scripts/check_api_count.py")], capture_output=True).returncode == 0
