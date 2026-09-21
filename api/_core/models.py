"""Pydantic models = the validation layer AND the source of the TypeScript
types (scripts/gen_types.py reads these). One `*In` model per writable table;
public form payloads at the bottom. Optional fields default to None so PATCH
bodies can be partial (crud.py drops the Nones)."""
from __future__ import annotations

from typing import Any, Literal

from pydantic import BaseModel, Field, field_validator

class MemberIn(BaseModel):
    display_name: str = Field(min_length=1, max_length=120)
    discord_handle: str | None = Field(default=None, max_length=80)
    school_email: str | None = Field(default=None, max_length=200)
    status: Literal["interested", "member", "active", "alumni", "left"] | None = None
    joined_term: str | None = None
    last_seen_term: str | None = None
    tags: list[str] | None = None
    notes: str | None = Field(default=None, max_length=4000)
    source: Literal["form", "import", "manual"] | None = None


class PostIn(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    slug: str | None = Field(default=None, max_length=120)
    dek: str | None = Field(default=None, max_length=400)
    body_md: str | None = Field(default=None, max_length=60000)
    cover_path: str | None = None
    tags: list[str] | None = None
    status: Literal["draft", "review", "published", "archived"] | None = None


class ProjectAuthor(BaseModel):
    name: str = Field(max_length=120)
    handle: str | None = Field(default=None, max_length=80)
    term: str | None = None


class ProjectIn(BaseModel):
    title: str = Field(min_length=1, max_length=120)
    kind: Literal["app", "project", "research", "tool"] | None = None
    summary: str | None = Field(default=None, max_length=2000)
    platform: list[str] | None = None
    stack: list[str] | None = None
    links: dict[str, str] | None = None
    screenshots: list[str] | None = None
    benefits_jj: str | None = Field(default=None, max_length=1000)
    authors: list[ProjectAuthor] | None = None
    featured: bool | None = None
    display_order: int | None = None
    term: str | None = None
    status: Literal["submitted", "in_review", "changes_requested", "approved", "published", "archived"] | None = None
    review_notes: str | None = Field(default=None, max_length=4000)


class EventIn(BaseModel):
    title: str = Field(min_length=1, max_length=160)
    semester: str | None = None
    summary: str | None = Field(default=None, max_length=2000)
    date_label: str | None = None
    time_label: str | None = None
    starts_at: str | None = None
    location: str | None = None
    flyer_path: str | None = None
    rsvp_url: str | None = None
    recap_post_id: str | None = None
    status: Literal["draft", "published", "archived"] | None = None
    when: Literal["upcoming", "past", "cancelled"] | None = None
    sort: int | None = None


class ResourceIn(BaseModel):
    group: str = Field(min_length=1, max_length=80)
    title: str = Field(min_length=1, max_length=160)
    url: str = Field(min_length=4, max_length=600)
    description: str | None = Field(default=None, max_length=2000)
    sort: int | None = None


class LinkIn(BaseModel):
    url: str = Field(min_length=1, max_length=600)
    label: str | None = Field(default=None, max_length=80)


class BoardProfileIn(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    term: str | None = None
    role_title: str | None = Field(default=None, max_length=80)
    group_label: str | None = None
    email: str | None = Field(default=None, max_length=200)
    photo_path: str | None = None
    bio: str | None = Field(default=None, max_length=2000)
    socials: dict[str, str] | None = None
    sort: int | None = None
    active: bool | None = None
    os_role: Literal["officer", "admin"] | None = None


class TermIn(BaseModel):
    id: str = Field(min_length=2, max_length=12)
    label: str = Field(min_length=2, max_length=60)
    starts_on: str | None = None
    ends_on: str | None = None
    is_current: bool | None = None


class HandoffIn(BaseModel):
    term: str | None = None
    body_md: str | None = Field(default=None, max_length=30000)
    status: Literal["draft", "filed", "acknowledged"] | None = None


class SettingIn(BaseModel):
    value: Any


class DecideIn(BaseModel):
    decision: Literal["approve", "request_changes", "archive", "in_review"]
    note: str | None = Field(default=None, max_length=2000)


class TransitionIn(BaseModel):
    to: str
    note: str | None = Field(default=None, max_length=1000)


class ReorderIn(BaseModel):
    ids: list[str]


class ImportIn(BaseModel):
    csv: str = Field(max_length=400000)
    dry_run: bool = True


class ReplayIn(BaseModel):
    client_ids: list[str] | None = None


# ---------------------------------------------------------- public forms
def _email_ok(v: str) -> str:
    if "@" not in v or "." not in v.split("@")[-1]:
        raise ValueError("email required")
    return v.strip()


class OnboardingSubmit(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    email: str = Field(max_length=200)
    _v = field_validator("email")(_email_ok)
    major: str | None = Field(default=None, max_length=120)
    class_year: str | None = Field(default=None, max_length=12)
    interests: str | None = Field(default=None, max_length=1000)
    discord_handle: str | None = Field(default=None, max_length=80)


class ProjectSubmit(BaseModel):
    title: str = Field(min_length=1, max_length=120)
    author: str = Field(min_length=1, max_length=120)
    email: str = Field(max_length=200)
    _v = field_validator("email")(_email_ok)
    summary: str = Field(min_length=1, max_length=2000)
    kind: Literal["app", "project", "research", "tool"] = "app"
    platform: list[str] | str | None = None
    link: str | None = Field(default=None, max_length=400)


class ChatIn(BaseModel):
    message: str = Field(min_length=1, max_length=500)
    page: str | None = None
