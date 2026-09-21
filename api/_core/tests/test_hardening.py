"""Run 10 §10 — every router: happy path, validation failure, 401, 403, 404, 409 conflict, idempotent
replay; plus the entity actions the board simulation leans on (feature max 3, resubmit history, import
undo, category cascade, term guards, upload sniffing, the error envelope, rate limits).
Uses the `client` fixture from test_os.py (a fresh Tier-1 data/ per test)."""
from __future__ import annotations

import io
from typing import Any

import pytest
from fastapi.testclient import TestClient

from .conftest import ADMIN, OFFICER

ENTITIES = [
    # (prefix, create body, role headers for writes, a required field to blank)
    ("/api/os/posts", {"title": "Welcome back", "body_md": "hi"}, OFFICER, "title"),
    ("/api/os/projects", {"title": "Smoke app", "kind": "app", "summary": "x"}, OFFICER, "title"),
    ("/api/os/events", {"title": "First general meeting", "semester": "Fall 2026"}, OFFICER, "title"),
    ("/api/os/workshops", {"title": "Intro to Git — session 1", "series": "Intro to Git", "session_no": 1, "date": "2026-10-01"}, OFFICER, "title"),
    ("/api/os/resources", {"group": "General", "title": "Docs", "url": "https://example.org"}, OFFICER, "url"),
    ("/api/os/members", {"display_name": "Jay Bloodhound", "discord_handle": "jay#1"}, OFFICER, "display_name"),
    ("/api/os/board", {"name": "Officer One", "term": "F26", "role_title": "President", "email": "one@jjay.cuny.edu", "active": True}, ADMIN, "name"),
]


def envelope(res: Any) -> dict[str, Any]:
    body = res.json()
    assert body.get("ok") is False and "error" in body and "code" in body["error"] and "message" in body["error"], body
    return dict(body["error"])


@pytest.mark.parametrize("prefix,body,role,_", ENTITIES)
def test_create_get_patch_roundtrip(client: TestClient, prefix: str, body: dict[str, Any], role: dict[str, str], _: str) -> None:
    r = client.post(prefix, json=body, headers=role)
    assert r.status_code == 200, r.text
    row = r.json()["row"]
    assert client.get(f"{prefix}/{row['id']}", headers=role).json()["row"]["id"] == row["id"]
    key = "title" if "title" in body else "name" if "name" in body else "display_name"
    p = client.patch(f"{prefix}/{row['id']}", json={**body, key: body[key] + " 2", "expected_updated_at": row["updated_at"]}, headers=role)
    assert p.status_code == 200 and p.json()["row"][key].endswith(" 2")


@pytest.mark.parametrize("prefix,body,role,blank", ENTITIES)
def test_validation_failure_names_the_field(client: TestClient, prefix: str, body: dict[str, Any], role: dict[str, str], blank: str) -> None:
    r = client.post(prefix, json={**body, blank: ""}, headers=role)
    assert r.status_code == 422
    err = envelope(r)
    assert err["code"] == "invalid" and err.get("field") == blank


@pytest.mark.parametrize("prefix,body,role,_", ENTITIES)
def test_anonymous_is_401(client: TestClient, prefix: str, body: dict[str, Any], role: dict[str, str], _: str) -> None:
    r = client.post(prefix, json=body)
    assert r.status_code == 401 and envelope(r)["code"] == "unauthorized"


@pytest.mark.parametrize("prefix,body,role,_", ENTITIES)
def test_missing_row_is_404(client: TestClient, prefix: str, body: dict[str, Any], role: dict[str, str], _: str) -> None:
    r = client.get(f"{prefix}/nope-nope", headers=role)
    assert r.status_code == 404 and envelope(r)["code"] == "not_found"


@pytest.mark.parametrize("prefix,body,role,_", ENTITIES)
def test_stale_write_is_409_never_a_clobber(client: TestClient, prefix: str, body: dict[str, Any], role: dict[str, str], _: str) -> None:
    row = client.post(prefix, json=body, headers=role).json()["row"]
    key = "title" if "title" in body else "name" if "name" in body else "display_name"
    first = client.patch(f"{prefix}/{row['id']}", json={**body, key: "tab one", "expected_updated_at": row["updated_at"]}, headers=role)
    assert first.status_code == 200
    second = client.patch(f"{prefix}/{row['id']}", json={**body, key: "tab two", "expected_updated_at": row["updated_at"]}, headers=role)
    assert second.status_code == 409
    err = envelope(second)
    assert err["code"] == "conflict" and err["current"][key] == "tab one" and err["attempted"][key] == "tab two"
    assert client.get(f"{prefix}/{row['id']}", headers=role).json()["row"][key] == "tab one"


@pytest.mark.parametrize("prefix,body,role,_", ENTITIES)
def test_client_id_makes_exactly_one_row(client: TestClient, prefix: str, body: dict[str, Any], role: dict[str, str], _: str) -> None:
    before = client.get(prefix, headers=role).json()["count"]
    a = client.post(prefix, json={**body, "client_id": "dbl-click-1"}, headers=role).json()["row"]
    b = client.post(prefix, json={**body, "client_id": "dbl-click-1"}, headers=role).json()["row"]
    assert a["id"] == b["id"]
    assert client.get(prefix, headers=role).json()["count"] == before + 1


@pytest.mark.parametrize("prefix,body,role,_", ENTITIES)
def test_archive_unarchive_duplicate(client: TestClient, prefix: str, body: dict[str, Any], role: dict[str, str], _: str) -> None:
    row = client.post(prefix, json=body, headers=role).json()["row"]
    a = client.post(f"{prefix}/{row['id']}/archive", headers=role).json()["row"]
    assert a.get("status") == "archived" or a.get("archived") is True
    u = client.post(f"{prefix}/{row['id']}/unarchive", headers=role).json()["row"]
    assert u.get("status") != "archived" and not u.get("archived")
    d = client.post(f"{prefix}/{row['id']}/duplicate", headers=role).json()["row"]
    assert d["id"] != row["id"]


# ------------------------------------------------------------------ 403s: officer vs admin
@pytest.mark.parametrize("method,path,body", [
    ("post", "/api/os/board", {"name": "X", "term": "F26"}),
    ("post", "/api/os/terms", {"id": "S27", "label": "Spring 2027"}),
    ("post", "/api/os/terms/rollover", {"next_id": "S27", "next_label": "Spring 2027"}),
    ("patch", "/api/os/site-settings/taglines", {"value": {"primary": "x"}}),
    ("post", "/api/os/inbox/replay", {"client_ids": []}),
    ("delete", "/api/os/posts/anything", None),
    ("delete", "/api/os/events/anything", None),
])
def test_officer_gets_403_on_admin_writes(client: TestClient, method: str, path: str, body: dict[str, Any] | None) -> None:
    r = getattr(client, method)(path, headers=OFFICER, **({"json": body} if body is not None else {}))
    assert r.status_code == 403, r.text
    assert envelope(r)["code"] == "forbidden"


# ------------------------------------------------------------------ workshops
def test_workshops_public_grouped_by_series(client: TestClient) -> None:
    for n in (1, 2, 3):
        client.post("/api/os/workshops", json={"title": f"Intro to Git — {n}", "series": "Intro to Git", "session_no": n, "date": f"2026-10-0{n}", "status": "published"}, headers=OFFICER)
    pub = client.get("/api/workshops").json()
    git = next(s for s in pub["series"] if s["series"] == "Intro to Git")
    assert [w["session_no"] for w in git["sessions"]] == [1, 2, 3]


def test_workshop_publish_needs_a_date(client: TestClient) -> None:
    row = client.post("/api/os/workshops", json={"title": "No date yet"}, headers=OFFICER).json()["row"]
    r = client.post(f"/api/os/workshops/{row['id']}/publish", headers=OFFICER)
    assert r.status_code == 422 and envelope(r)["field"] == "date"


# ------------------------------------------------------------------ projects
def _published_project(client: TestClient, title: str) -> str:
    row = client.post("/api/os/projects", json={"title": title, "kind": "app", "summary": "x", "status": "approved"}, headers=OFFICER).json()["row"]
    client.post(f"/api/os/projects/{row['id']}/publish", headers=OFFICER)
    return str(row["id"])


def test_feature_refuses_a_fourth_naming_the_three(client: TestClient) -> None:
    for p in client.get("/api/os/projects", headers=OFFICER).json()["rows"]:  # the seed ships one featured example
        client.post(f"/api/os/projects/{p['id']}/unfeature", headers=OFFICER)
    ids = [_published_project(client, f"P{i}") for i in range(4)]
    for pid in ids[:3]:
        assert client.post(f"/api/os/projects/{pid}/feature", headers=OFFICER).status_code == 200
    r = client.post(f"/api/os/projects/{ids[3]}/feature", headers=OFFICER)
    assert r.status_code == 409
    err = envelope(r)
    assert len(err["featured"]) == 3 and "P0" in err["message"]
    client.post(f"/api/os/projects/{ids[0]}/unfeature", headers=OFFICER)
    assert client.post(f"/api/os/projects/{ids[3]}/feature", headers=OFFICER).status_code == 200


def test_unpublish_removes_from_public(client: TestClient) -> None:
    pid = _published_project(client, "Gone soon")
    assert any(p["id"] == pid for p in client.get("/api/projects").json()["projects"])
    assert client.post(f"/api/os/projects/{pid}/unpublish", headers=OFFICER).json()["row"]["status"] == "approved"
    assert not any(p["id"] == pid for p in client.get("/api/projects").json()["projects"])


def test_resubmit_keeps_history_and_returns_the_note(client: TestClient) -> None:
    sub = {"title": "Study Buddy", "kind": "app", "summary": "pairs students", "author": "Jay", "email": "jay@jjay.cuny.edu", "link": "https://github.com/x"}
    first = client.post("/api/projects/submit", json=sub).json()
    pid = first["id"]
    assert client.post(f"/api/os/projects/{pid}/decide", json={"decision": "in_review"}, headers=OFFICER).status_code == 200
    r = client.post(f"/api/os/projects/{pid}/decide", json={"decision": "request_changes", "note": ""}, headers=OFFICER)
    assert r.status_code == 422 and envelope(r)["field"] == "note"
    client.post(f"/api/os/projects/{pid}/decide", json={"decision": "request_changes", "note": "add screenshots"}, headers=OFFICER)
    assert client.get(f"/api/projects/submission/{pid}").json()["reviewer_note"] == "add screenshots"
    again = client.post("/api/projects/submit", json={**sub, "summary": "pairs students, now with screenshots"}).json()
    assert again["resubmitted"] is True and again["id"] == pid and again["reviewer_note"] == "add screenshots"
    row = client.get(f"/api/os/projects/{pid}", headers=OFFICER).json()["row"]
    assert row["status"] == "submitted" and [h["to"] for h in row["history"]][-2:] == ["changes_requested", "submitted"]


# ------------------------------------------------------------------ members
CSV = "display_name,discord_handle,email,status,joined_term\n" + "\n".join(f"Member {i},m{i}#0001,m{i}@jjay.cuny.edu,interested,F26" for i in range(40))


def test_import_dry_run_commit_undo_reimport(client: TestClient) -> None:
    dry = client.post("/api/os/members/import", json={"csv": CSV, "dry_run": True}, headers=OFFICER).json()
    assert dry["added"] == 40 and client.get("/api/os/members", headers=OFFICER).json()["count"] == 0
    done = client.post("/api/os/members/import", json={"csv": CSV, "dry_run": False}, headers=OFFICER).json()
    assert done["added"] == 40 and client.get("/api/os/members", headers=OFFICER).json()["count"] == 40
    undo = client.post("/api/os/members/import/undo", headers=OFFICER).json()
    assert undo["removed"] == 40 and client.get("/api/os/members", headers=OFFICER).json()["count"] == 0
    client.post("/api/os/members/import", json={"csv": CSV, "dry_run": False}, headers=OFFICER)
    assert client.get("/api/os/members", headers=OFFICER).json()["count"] == 40


def test_bulk_transition_honours_the_map(client: TestClient) -> None:
    client.post("/api/os/members/import", json={"csv": CSV, "dry_run": False}, headers=OFFICER)
    ids = [m["id"] for m in client.get("/api/os/members", headers=OFFICER).json()["rows"][:6]]
    ok = client.post("/api/os/members/bulk-transition", json={"ids": ids, "to": "member"}, headers=OFFICER).json()
    assert ok["done"] == 6 and ok["refused"] == []
    bad = client.post("/api/os/members/bulk-transition", json={"ids": ids[:2], "to": "interested"}, headers=OFFICER).json()
    assert bad["done"] == 0 and len(bad["refused"]) == 2 and "not allowed" in bad["refused"][0]["reason"]


def test_merge_keeps_both_handles(client: TestClient) -> None:
    a = client.post("/api/os/members", json={"display_name": "Sam", "discord_handle": "sam#1"}, headers=OFFICER).json()["row"]
    b = client.post("/api/os/members", json={"display_name": "Sam R.", "school_email": "sam@jjay.cuny.edu"}, headers=OFFICER).json()["row"]
    row = client.post("/api/os/members/merge", json={"survivor": a["id"], "duplicate": b["id"]}, headers=OFFICER).json()["row"]
    assert row["discord_handle"] == "sam#1" and row["school_email"] == "sam@jjay.cuny.edu" and "merged" in row["tags"]
    assert client.get(f"/api/os/members/{b['id']}", headers=OFFICER).status_code == 404


# ------------------------------------------------------------------ resources
def test_category_rename_delete_cascade_bulk(client: TestClient) -> None:
    client.post("/api/os/resources", json={"group": "Temp", "title": "A", "url": "https://a.example"}, headers=OFFICER)
    client.post("/api/os/resources", json={"group": "Temp", "title": "B", "url": "https://b.example"}, headers=OFFICER)
    assert client.post("/api/os/resources/category/rename", json={"group": "Temp", "to": "Temporary"}, headers=OFFICER).json()["moved"] == 2
    refused = client.post("/api/os/resources/category/delete", json={"group": "Temporary"}, headers=OFFICER)
    assert refused.status_code == 409 and envelope(refused)["links"] == ["A", "B"]
    assert client.post("/api/os/resources/category/delete", json={"group": "Temporary", "cascade": True}, headers=OFFICER).json()["deleted"] == 2
    dry = client.post("/api/os/resources/bulk", json={"group": "Pasted", "text": "https://one.example\nTwo | https://two.example\nnot a url"}, headers=OFFICER).json()
    assert [r["ok"] for r in dry["rows"]] == [True, True, False] and dry["rows"][1]["title"] == "Two"
    done = client.post("/api/os/resources/bulk", json={"group": "Pasted", "text": "https://one.example\nTwo | https://two.example\nnot a url", "dry_run": False}, headers=OFFICER).json()
    assert done["created"] == 2 and done["skipped"] == 1


def test_check_one_link_without_network(client: TestClient) -> None:
    row = client.post("/api/os/resources", json={"group": "X", "title": "local", "url": "notaurl.local"}, headers=OFFICER).json()["row"]
    r = client.post(f"/api/os/resources/{row['id']}/check", headers=OFFICER).json()
    assert r["ok"] is True and r["row"]["last_checked"]


# ------------------------------------------------------------------ terms + officers
def test_term_edit_set_current_and_delete_guards(client: TestClient) -> None:
    client.post("/api/os/terms", json={"id": "S27", "label": "Spring 2027", "starts_on": "2027-01-25"}, headers=ADMIN)
    cur = client.get("/api/os/terms", headers=OFFICER).json()["current"]["id"]
    refused = client.delete(f"/api/os/terms/{cur}", headers=ADMIN)
    assert refused.status_code == 409 and "current" in envelope(refused)["message"]
    assert client.patch("/api/os/terms/S27", json={"ends_on": "2027-05-20", "is_current": True}, headers=ADMIN).json()["row"]["is_current"] is True
    terms = client.get("/api/os/terms", headers=OFFICER).json()["rows"]
    assert sum(1 for t in terms if t.get("is_current")) == 1
    assert client.patch("/api/os/terms/S27", json={"is_current": False}, headers=OFFICER).status_code == 403
    client.post("/api/os/board", json={"name": "Held", "term": "S27", "role_title": "Secretary", "active": True}, headers=ADMIN)
    client.patch(f"/api/os/terms/{cur}", json={"is_current": True}, headers=ADMIN)
    r = client.delete("/api/os/terms/S27", headers=ADMIN)
    assert r.status_code == 409 and envelope(r)["officers"] == 1


def test_officer_with_a_handoff_is_archived_not_deleted(client: TestClient) -> None:
    cur = client.get("/api/os/terms", headers=OFFICER).json()["current"]["id"]
    o = client.post("/api/os/board", json={"name": "Filer", "term": cur, "role_title": "Treasurer", "active": True}, headers=ADMIN).json()["row"]
    saved = client.post("/api/os/inheritance", json={"meta": {"type": "handoff", "title": "Handoff — Treasurer", "term": cur, "date": "2026-12-01", "status": "final",
                                                              "owners": ["Treasurer"], "visibility": "board", "role": "Treasurer"}, "body_md": "## What I ran\n\nmoney"}, headers=OFFICER)
    assert saved.status_code == 200, saved.text
    r = client.delete(f"/api/os/board/{o['id']}", headers=ADMIN)
    assert r.status_code == 409 and envelope(r)["archived"] is True
    assert client.get(f"/api/os/board/{o['id']}", headers=ADMIN).json()["row"]["archived"] is True


# ------------------------------------------------------------------ uploads
def _png(w: int = 64, h: int = 64) -> bytes:
    from PIL import Image

    out = io.BytesIO()
    Image.new("RGB", (w, h), (30, 70, 100)).save(out, format="PNG")
    return out.getvalue()


@pytest.mark.parametrize("name,data,status", [
    ("evil.png", b"MZ\x90\x00" + b"\x00" * 200, 415),
    ("huge.png", b"\x89PNG\r\n\x1a\n" + b"\x00" * (2 * 1024 * 1024 + 1), 413),
    ("dot.png", None, 422),
    ("cut.png", b"\x89PNG\r\n\x1a\n" + b"\x00" * 40, 415),
])
def test_upload_refusals_name_the_reason(client: TestClient, name: str, data: bytes | None, status: int) -> None:
    payload = data if data is not None else _png(1, 1)
    r = client.post("/api/os/uploads", files={"file": (name, payload, "image/png")}, headers=OFFICER)
    assert r.status_code == status, r.text
    assert envelope(r)["field"] == "file"


def test_upload_ok_is_resized_and_served(client: TestClient) -> None:
    r = client.post("/api/os/uploads", files={"file": ("cover.png", _png(2400, 1200), "image/png")}, headers=OFFICER)
    assert r.status_code == 200
    path = r.json()["path"]
    got = client.get(path)
    assert got.status_code == 200 and got.content[:8] == b"\x89PNG\r\n\x1a\n"
    from PIL import Image

    assert max(Image.open(io.BytesIO(got.content)).size) <= 1600


# ------------------------------------------------------------------ envelope, health, rate limit
def test_health_reports_counts_and_last_write(client: TestClient) -> None:
    client.post("/api/os/posts", json={"title": "x"}, headers=OFFICER)
    h = client.get("/api/health").json()
    assert h["counts"]["posts"] >= 1 and h["last_write"] and h["tier"] == "local" and h["sha"]


def test_public_submit_rate_limited_with_a_message(client: TestClient) -> None:
    from _core.routers import public as pub

    pub._hits.clear()  # the limiter is per-process; other tests share the test client's IP
    sub = {"title": "Spam", "kind": "app", "summary": "x", "author": "A", "email": "a@jjay.cuny.edu", "link": "https://x.example"}
    codes = [client.post("/api/projects/submit", json={**sub, "title": f"Spam {i}"}).status_code for i in range(6)]
    assert codes[:5] == [200] * 5 and codes[5] == 429


def test_invalid_json_is_an_envelope_not_html(client: TestClient) -> None:
    r = client.post("/api/os/posts", content=b"{not json", headers={**OFFICER, "Content-Type": "application/json"})
    assert r.status_code == 422 and r.headers["content-type"].startswith("application/json") and envelope(r)["code"] == "invalid"
