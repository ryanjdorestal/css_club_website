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
MIN_SIDE = 16  # a 1×1 tracking pixel is not a cover


def sniff(data: bytes) -> str | None:
    """The real type from the magic bytes (run 10 §6.11) — an .exe renamed .png is refused here."""
    if data[:8] == b"\x89PNG\r\n\x1a\n":
        return "png"
    if data[:3] == b"\xff\xd8\xff":
        return "jpg"
    if data[:4] == b"RIFF" and data[8:12] == b"WEBP":
        return "webp"
    return None


def resize(data: bytes, ext: str) -> bytes:
    """Longest edge → 1600 px, EXIF stripped (a fresh image carries no metadata), re-encoded."""
    try:
        from PIL import Image  # optional at runtime; the file is stored as-is without it
    except Exception:
        return data
    try:
        im = Image.open(io.BytesIO(data))
        im.load()
    except Exception:
        raise HTTPException(415, {"message": "not a valid image (the file is truncated or not really a jpg/png/webp)", "field": "file"}) from None
    if im.width < MIN_SIDE or im.height < MIN_SIDE:
        raise HTTPException(422, {"message": f"image too small ({im.width}×{im.height}) — at least {MIN_SIDE} px on each side", "field": "file"})
    im.thumbnail((1600, 1600))
    clean = Image.new(im.mode if im.mode in ("RGB", "RGBA") else "RGB", im.size)
    clean.paste(im.convert(clean.mode))
    out = io.BytesIO()
    clean.save(out, format={"jpg": "JPEG", "png": "PNG", "webp": "WEBP"}[ext], quality=86)
    return out.getvalue()


@r.post("")
async def upload(file: UploadFile = File(...), actor: Actor = Depends(require_role("officer"))) -> dict[str, Any]:
    data = await file.read()
    if len(data) > MAX_BYTES:
        raise HTTPException(413, {"message": f"{len(data) / 1024 / 1024:.1f} MB — the limit is 2 MB; export a smaller jpg/webp", "field": "file"})
    ext = sniff(data)
    if not ext:
        raise HTTPException(415, {"message": "jpg, png or webp only — the file's bytes are not one of those (the extension does not count)", "field": "file"})
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
