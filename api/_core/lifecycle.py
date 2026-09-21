"""Allowed status transitions per table (RHEC's member_lifecycle_transitions,
as a dict — small enough not to need a table). Enforced by crud.transition and
the decide/publish actions; the UI asks `next_states` so it never shows a
raw enum it cannot reach."""
from __future__ import annotations

TRANSITIONS: dict[str, dict[str, set[str]]] = {
    "members": {
        "interested": {"member", "left"},
        "member": {"active", "alumni", "left"},
        "active": {"member", "alumni", "left"},
        "alumni": {"active"},
        "left": {"interested", "member"},
    },
    "projects": {
        "submitted": {"in_review", "archived"},
        "in_review": {"changes_requested", "approved", "archived"},
        "changes_requested": {"in_review", "archived"},
        "approved": {"published", "archived"},
        "published": {"archived", "approved"},
        "archived": {"approved", "submitted"},
    },
    "workshops": {
        "draft": {"published", "archived"},
        "published": {"archived", "draft"},
        "archived": {"draft"},
    },
    "posts": {
        "draft": {"review", "published", "archived"},
        "review": {"draft", "published", "archived"},
        "published": {"archived", "draft"},
        "archived": {"draft"},
    },
    "events": {
        "draft": {"published", "archived"},
        "published": {"archived", "draft"},
        "archived": {"draft"},
    },
    "handoffs": {
        "draft": {"filed"},
        "filed": {"acknowledged", "draft"},
        "acknowledged": set(),
    },
}


def allowed(table: str, from_state: str, to_state: str) -> bool:
    return to_state in TRANSITIONS.get(table, {}).get(from_state, set())


def next_states(table: str, from_state: str) -> list[str]:
    return sorted(TRANSITIONS.get(table, {}).get(from_state, set()))


def initial_state(table: str) -> str:
    first = {"members": "interested", "projects": "submitted", "posts": "draft", "events": "draft", "workshops": "draft", "handoffs": "draft"}
    return first.get(table, "draft")
