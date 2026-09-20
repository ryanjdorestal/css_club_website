"""Tests for the FastAPI app: KB matcher, Tier-1 fallbacks, submission guards.
Run: pytest scripts/test_api.py  (api/ stays at 2 files; tests live here)."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from fastapi.testclient import TestClient  # noqa: E402
from api.index import app, kb_answer, INBOX  # noqa: E402

client = TestClient(app)


def test_health_tier1():
    r = client.get("/api/health")
    assert r.status_code == 200
    body = r.json()
    assert body["ok"] is True
    assert body["db"] == "skipped"  # no Supabase env in tests


def test_chat_status_is_keyless():
    body = client.get("/api/chat").json()
    assert body == {"ok": True, "source": "static", "configured": False, "mascot": "bloodhound"}


def test_kb_matches_join():
    a = kb_answer("how do I join the club?", None)
    assert "join" in a["answer"].lower() or "Join" in str(a["citations"])
    assert a["emote"] == "happy"


def test_kb_matches_ctf_to_cyberhounds():
    a = kb_answer("do you do capture the flag?", None)
    assert "cyberhounds" in a["answer"].lower() or "ctf" in a["answer"].lower()


def test_kb_page_context_boost():
    a = kb_answer("what workshops have you run", "/events")
    assert a["emote"] == "happy"


def test_kb_fallback_is_confused():
    a = kb_answer("zzqqxx nonsense elephant", None)
    assert a["emote"] == "confused"
    assert a["suggestions"]  # always offers a way forward


def test_chat_post_validates():
    assert client.post("/api/chat", json={}).status_code == 400
    r = client.post("/api/chat", json={"message": "when is the next event?"})
    assert r.status_code == 200
    assert r.json()["source"] == "static"


def test_onboarding_local_inbox(tmp_path, monkeypatch):
    import api.index as ix
    monkeypatch.setattr(ix, "INBOX", tmp_path / "inbox")
    r = client.post(
        "/api/onboarding/submit",
        json={"name": "Test Student", "email": "t@jjay.cuny.edu", "major": "CS"},
    )
    assert r.json() == {"ok": True, "stored": "local"}
    lines = (tmp_path / "inbox" / "onboarding_requests.jsonl").read_text().strip().splitlines()
    assert len(lines) == 1
    assert "Test Student" in lines[0]


def test_onboarding_rejects_garbage():
    r = client.post("/api/onboarding/submit", json={"name": "", "email": "not-an-email"})
    assert r.status_code == 400


def test_apps_submit_local_inbox(tmp_path, monkeypatch):
    import api.index as ix
    monkeypatch.setattr(ix, "INBOX", tmp_path / "inbox")
    r = client.post(
        "/api/apps/submit",
        json={
            "title": "Room Finder",
            "author": "Jay",
            "email": "j@jjay.cuny.edu",
            "summary": "Finds rooms",
            "platform": ["ios"],
        },
    )
    assert r.json() == {"ok": True, "stored": "local"}
    assert (tmp_path / "inbox" / "app_submissions.jsonl").exists()


def test_reads_fall_back_to_committed_json():
    apps = client.get("/api/apps").json()
    assert apps["source"] == "static" and len(apps["apps"]) == 3
    events = client.get("/api/events").json()
    assert events["source"] == "static" and len(events["semesters"]) == 2
    board = client.get("/api/board").json()
    assert board["source"] == "static" and len(board["terms"]) == 5
