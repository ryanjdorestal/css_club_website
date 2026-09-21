"""/api/os/uploads — cover images and flyers. Constraints: ≤ 2 MB, jpg/png/webp,
resized to ≤ 1600 px with Pillow. Supabase Storage bucket `public-media` when
configured; Tier 1 saves under .cache/uploads/ and serves it from
/api/os/uploads/{name}. No cropper, no CDN, no keys in the browser."""
from __future__ import annotations

import io
import re
import time
from typing import Any

import httpx
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from fastapi.responses import FileResponse

from .. import audit, config
from ..auth import Actor, require_role

r = APIRouter(prefix="/os/uploads")
MAX_BYTES = 2 * 1024 * 1024
TYPES = {"image/jpeg": "jpg", "image/png": "png", "image/webp": "webp"}


def resize(data: bytes, ext: str) -> bytes:
    try:
        from PIL import Image  # optional at runtime; the file is stored as-is without it
    except Exception:
        return data
    try:
        im = Image.open(io.BytesIO(data))
        im.load()
    except Exception:
        raise HTTPException(415, "not a valid image") from None
    im.thumbnail((1600, 1600))
    out = io.BytesIO()
    im.save(out, format={"jpg": "JPEG", "png": "PNG", "webp": "WEBP"}[ext], quality=86)
    return out.getvalue()


@r.post("")
async def upload(file: UploadFile = File(...), actor: Actor = Depends(require_role("officer"))) -> dict[str, Any]:
    ext = TYPES.get(file.content_type or "")
    if not ext:
        raise HTTPException(415, "jpg, png or webp only")
    data = await file.read()
    if len(data) > MAX_BYTES:
        raise HTTPException(413, "2 MB max")
    data = resize(data, ext)
    stem = re.sub(r"[^a-z0-9]+", "-", (file.filename or "upload").rsplit(".", 1)[0].lower()).strip("-")[:60] or "upload"
    name = f"{int(time.time())}-{stem}.{ext}"
    path = f"/api/os/uploads/{name}"
    if config.supabase_configured():
        try:
            resp = httpx.post(f"{config.SUPABASE_URL}/storage/v1/object/public-media/{name}", content=data,
                              headers={"apikey": config.SUPABASE_KEY, "Authorization": f"Bearer {config.SUPABASE_KEY}", "Content-Type": file.content_type or ""}, timeout=15.0)
            if resp.status_code < 300:
                path = f"{config.SUPABASE_URL}/storage/v1/object/public/public-media/{name}"
        except Exception:
            pass
    if path.startswith("/api/"):
        config.UPLOADS.mkdir(parents=True, exist_ok=True)
        (config.UPLOADS / name).write_bytes(data)
    audit.record(actor.email, "upload", "uploads", name, None, {"path": path, "bytes": len(data)})
    return {"ok": True, "path": path, "bytes": len(data), "stored": "bucket" if not path.startswith("/api/") else "local"}


@r.get("/{name}")
def serve(name: str) -> FileResponse:
    p = config.UPLOADS / re.sub(r"[^a-z0-9.\-]", "", name)
    if not p.exists():
        raise HTTPException(404, "no such upload")
    return FileResponse(p)
