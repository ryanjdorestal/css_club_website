"""The one place every table is named. Routers import these instances so the
public reads and the OS writes share the same Collection (and the same Tier-1
local file). Table names match supabase/migrations/0002_os.sql."""
from __future__ import annotations

from . import seeds
from .store import Collection

projects = Collection("projects", seeds.projects)
submissions = Collection("project_submissions", seeds.project_submissions)
posts = Collection("posts", seeds.posts)
events = Collection("events", seeds.events)
resources = Collection("resources", seeds.resources)
links = Collection("links", seeds.links, id_field="key")
board = Collection("board_profiles", seeds.board_profiles)
terms = Collection("terms", seeds.terms)
members = Collection("members", seeds.members)
settings = Collection("site_settings", seeds.site_settings, id_field="key")
handoffs = Collection("handoffs", seeds.handoffs)
onboarding = Collection("onboarding_requests")

ALL = {c.table: c for c in (projects, submissions, posts, events, resources, links, board, terms, members, settings, handoffs, onboarding)}
