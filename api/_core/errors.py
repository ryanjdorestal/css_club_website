"""One error envelope for every endpoint (run 10 §10): {"ok": false, "error": {"code", "message",
"field"?}}. HTTPException details (strings or dicts), pydantic validation errors and unexpected
exceptions all land here — never a bare string, never an HTML page, never a stack trace.
`detail` keeps the legacy string for older clients. Installed by api/index.py."""
from __future__ import annotations

import logging
from typing import Any

from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

log = logging.getLogger("jjcss")

CODE = {400: "bad_request", 401: "unauthorized", 403: "forbidden", 404: "not_found", 409: "conflict", 413: "too_large",
        415: "unsupported", 422: "invalid", 429: "rate_limited", 500: "server_error"}


def envelope(status: int, message: str, field: str | None = None, **extra: Any) -> JSONResponse:
    err: dict[str, Any] = {"code": CODE.get(status, "error"), "message": message}
    if field:
        err["field"] = field
    err.update(extra)
    return JSONResponse({"ok": False, "error": err, "detail": message}, status_code=status)


def install(app: FastAPI) -> None:
    @app.exception_handler(HTTPException)
    async def _http(request: Request, exc: HTTPException) -> JSONResponse:
        d = exc.detail
        if isinstance(d, dict):
            msg = str(d.get("message") or d.get("error") or d.get("detail") or "request failed")
            return envelope(exc.status_code, msg, d.get("field"), **{k: v for k, v in d.items() if k not in ("message", "error", "detail", "field")})
        return envelope(exc.status_code, str(d))

    @app.exception_handler(RequestValidationError)
    async def _validation(request: Request, exc: RequestValidationError) -> JSONResponse:
        errs = exc.errors()
        first = errs[0] if errs else {}
        loc = [str(p) for p in first.get("loc", []) if p not in ("body", "query", "path")]
        field = loc[-1] if loc else None
        msg = first.get("msg", "invalid input")
        if field:
            msg = f"{field}: {msg}"
        return envelope(422, msg, field, fields=[{"field": ".".join(str(p) for p in e.get("loc", []) if p != "body"), "message": e.get("msg", "")} for e in errs[:12]])

    @app.exception_handler(Exception)
    async def _any(request: Request, exc: Exception) -> JSONResponse:
        log.exception("unhandled %s %s", request.method, request.url.path)
        return envelope(500, "something broke on the server — the error is logged; try again or tell the webmaster")
