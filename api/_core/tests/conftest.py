"""Shared pytest fixture: the FastAPI app against a fresh Tier-1 data/ + inbox per test (no Supabase,
no keys). Both test modules use `client`, `OFFICER` and `ADMIN` from here."""
from __future__ import annotations

import shutil
import sys
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

API = Path(__file__).resolve().parents[2]
ROOT = API.parent
sys.path.insert(0, str(API))

from _core import config  # noqa: E402

OFFICER = {"X-Local-Role": "officer"}
ADMIN = {"X-Local-Role": "admin"}


@pytest.fixture()
def client(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> TestClient:
    """A fresh data/ copy (committed JSON only, no .local tables) per test."""
    data = tmp_path / "data"
    shutil.copytree(ROOT / "data", data, ignore=shutil.ignore_patterns("*.local.json"))
    monkeypatch.setattr(config, "DATA", data)
    monkeypatch.setattr(config, "INBOX", tmp_path / "inbox")
    monkeypatch.setattr(config, "UPLOADS", tmp_path / "uploads")
    monkeypatch.setattr(config, "SUPABASE_URL", "")
    monkeypatch.setattr(config, "SUPABASE_KEY", "")
    monkeypatch.setattr(config, "IS_VERCEL", False)
    from _core import spine as sp

    shutil.copytree(ROOT / "content/inheritance", tmp_path / "inheritance")
    monkeypatch.setattr(sp, "DIR", tmp_path / "inheritance")  # rollover + spine writes stay out of the repo
    from _core.routers import public as pub
    from index import app  # noqa: WPS433

    pub._hits.clear()  # the public rate limiter is per-process; every test starts with a clean budget
    return TestClient(app)


