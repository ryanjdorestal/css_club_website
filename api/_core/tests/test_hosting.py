"""Run 11: the hosting budget endpoint, the audit prune, and the keepalive readout (Tier 1, no Supabase)."""

from __future__ import annotations

import time

from fastapi.testclient import TestClient

from _core import audit, hosting, tier1

from .conftest import ADMIN, OFFICER


def test_hosting_panel_reports_tier_1_with_the_limits_table(client: TestClient) -> None:
    r = client.get("/api/os/hosting", headers=OFFICER)
    assert r.status_code == 200
    body = r.json()
    assert body["tier"] == "local"
    assert body["usage"]["db_pct"] == 0 and body["usage_reason"] is None
    assert {row["host"] for row in body["limits"]} == {"vercel", "supabase"}
    assert body["warn_at_pct"] == 70


def test_hosting_panel_needs_an_officer(client: TestClient) -> None:
    assert client.get("/api/os/hosting").status_code == 401


def test_health_reports_no_keepalive_in_tier_1(client: TestClient) -> None:
    assert client.get("/api/health").json()["keepalive"] is None


def test_budget_flags_seventy_percent() -> None:
    fine = hosting.budget({"db_bytes": 100 * 1024 * 1024, "storage_bytes": 0, "rows": {}})
    over = hosting.budget({"db_bytes": 400 * 1024 * 1024, "storage_bytes": 0, "rows": {"records": 5}})
    assert fine["over_warning"] is False and fine["db_pct"] == 20.0
    assert over["over_warning"] is True
    assert any(line.startswith("OVER 70 %") for line in hosting.budget_lines(over))


def test_prune_removes_only_records_older_than_the_window(client: TestClient) -> None:
    old = audit.record("a@jjay.cuny.edu", "create", "posts", "p1")
    rows = tier1.local_read("records") or []
    for row in rows:
        if row["id"] == old["id"]:
            row["created_at"] = int(time.time()) - 400 * 86400
    tier1.local_write("records", rows)
    audit.record("a@jjay.cuny.edu", "create", "posts", "p2")
    r = client.post("/api/os/records/prune", json={"months": 12}, headers=ADMIN)
    assert r.status_code == 200 and r.json()["removed"] == 1
    ids = {row["id"] for row in tier1.local_read("records") or []}
    assert old["id"] not in ids
    assert any(row["action"] == "prune" for row in tier1.local_read("records") or [])


def test_prune_is_admin_only_and_refuses_short_windows(client: TestClient) -> None:
    assert client.post("/api/os/records/prune", json={"months": 12}, headers=OFFICER).status_code == 403
    r = client.post("/api/os/records/prune", json={"months": 1}, headers=ADMIN)
    assert r.status_code == 422 and r.json()["error"]["field"] == "months"
