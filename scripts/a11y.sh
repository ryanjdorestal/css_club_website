#!/usr/bin/env bash
# The a11y gate. Two tools, two servers, and the split matters:
#
#   axe (Playwright) covers the public routes AND every OS route signed in as admin. The LOCAL_DEV
#   role picker it relies on exists only in a dev build (src/os/session.tsx), so axe must run
#   against `vite dev` or it would silently grade the login page eleven times.
#
#   pa11y-ci covers the public routes of the SHIPPED bundle (`vite preview`) with reduced motion
#   forced on, so the 3D never mounts. Two headless tabs compositing WebGL in software on a two-core
#   runner crash the tab or blow the navigation timeout — that is what killed nine of ten routes in
#   run 11. .pa11yci.js has the detail. Between the two tools, both motion paths get graded.
#
# Servers already listening on either port are reused, so this is safe to run beside `make dev`.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WEB="$ROOT/apps/web"
cd "$ROOT" # uvicorn resolves api.index from here
DEV_PORT="${A11Y_DEV_PORT:-5173}"
PREVIEW_PORT="${A11Y_PREVIEW_PORT:-4173}"
started=()

cleanup() {
  for pid in "${started[@]:-}"; do
    pkill -P "$pid" 2>/dev/null || true
    kill "$pid" 2>/dev/null || true
  done
}
trap cleanup EXIT

wait_for() {
  local url="$1" seconds="$2"
  for _ in $(seq 1 "$seconds"); do
    curl -fsS "$url" >/dev/null 2>&1 && return 0
    sleep 1
  done
  echo "a11y: $url never came up — see /tmp/a11y-*.log" >&2
  return 1
}

# The OS pages ask the API who is signed in; without it every one of them bounces to the login
# screen and axe would grade that instead (it now refuses to, but a refusal is not a pass).
if curl -fsS "http://localhost:8000/api/health" >/dev/null 2>&1; then
  echo "a11y: reusing the api on 8000"
elif [ -x .venv/bin/uvicorn ]; then
  (exec .venv/bin/uvicorn api.index:app --port 8000) >/tmp/a11y-api.log 2>&1 &
  started+=($!)
  wait_for "http://localhost:8000/api/health" 60
else
  echo "a11y: no .venv — run 'make install' first, the OS routes need the API" >&2
  exit 1
fi

if curl -fsS "http://localhost:$DEV_PORT/" >/dev/null 2>&1; then
  echo "a11y: reusing the dev server on $DEV_PORT"
else
  (cd "$WEB" && exec npm run dev -- --port "$DEV_PORT" --strictPort) >/tmp/a11y-dev.log 2>&1 &
  started+=($!)
  wait_for "http://localhost:$DEV_PORT/" 90
fi

if [ ! -f "$WEB/dist/index.html" ]; then
  echo "a11y: no build to test — building"
  (cd "$WEB" && npm run build)
fi

if curl -fsS "http://localhost:$PREVIEW_PORT/" >/dev/null 2>&1; then
  echo "a11y: reusing the preview server on $PREVIEW_PORT"
else
  (cd "$WEB" && exec npx vite preview --port "$PREVIEW_PORT" --strictPort) >/tmp/a11y-preview.log 2>&1 &
  started+=($!)
  wait_for "http://localhost:$PREVIEW_PORT/" 60
fi

BASE_URL="http://localhost:$DEV_PORT" npm run a11y:axe --prefix "$WEB"
A11Y_BASE_URL="http://localhost:$PREVIEW_PORT" npm run a11y:pa11y --prefix "$WEB"
