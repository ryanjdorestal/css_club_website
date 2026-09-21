"""/api/os/site-settings — key → JSON settings the public site reads
(taglines, hero copy, collaborate lists, maintenance banner, feature flags,
ownership sheet). Admin-only writes, every one audited."""
from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Depends

from .. import collections as C
from ..auth import Actor, require_role
from ..models import SettingIn

r = APIRouter(prefix="/os/site-settings")

KEYS = ("taglines", "hero_copy", "collaborate", "maintenance_banner", "feature_flags", "ownership")


@r.get("")
def list_settings(actor: Actor = Depends(require_role("officer"))) -> dict[str, Any]:
    return {"ok": True, "source": C.settings.source(), "rows": C.settings.list(), "keys": list(KEYS)}


@r.patch("/{key}")
def patch_setting(key: str, body: SettingIn, actor: Actor = Depends(require_role("admin"))) -> dict[str, Any]:
    row = C.settings.patch(key, {"value": body.value, "updated_by": actor.email}, actor.email)
    if row is None:
        row = C.settings.create({"key": key, "value": body.value, "updated_by": actor.email}, actor.email)
    return {"ok": True, "row": row}
