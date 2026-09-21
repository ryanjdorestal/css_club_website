#!/usr/bin/env bash
# newcomer_test.sh — the literal 10-minute test, README steps only, from a FRESH clone.
#   bash scripts/newcomer_test.sh            (prints wall time per step; exit 1 if anything fails)
# It clones this repo into a temp dir, runs `make install` + `make dev`, checks / and /os,
# changes a tagline in data/ and sees it on the site, adds a resource through the OS in
# Tier 1 and sees it in the inbox, then runs `make check`.
set -euo pipefail
SRC="$(cd "$(dirname "$0")/.." && pwd)"
TMP="$(mktemp -d /tmp/jjcss-newcomer.XXXX)"
T0=$(date +%s); step() { echo "[$(( $(date +%s) - T0 ))s] $*"; }

step "clone → $TMP"
git clone -q "$SRC" "$TMP/jjay_css"; cd "$TMP/jjay_css"

step "make install"
make install > "$TMP/install.log" 2>&1

step "make dev (background)"
PORT_WEB=5173; PORT_API=8000
# free ports if a dev pair is already running on this machine
lsof -tiTCP:$PORT_WEB -sTCP:LISTEN | xargs -r kill 2>/dev/null || true
lsof -tiTCP:$PORT_API -sTCP:LISTEN | xargs -r kill 2>/dev/null || true
( make dev > "$TMP/dev.log" 2>&1 & )
for i in $(seq 1 60); do curl -fsS "http://localhost:$PORT_API/api/health" >/dev/null 2>&1 && curl -fsS "http://localhost:$PORT_WEB/" >/dev/null 2>&1 && break; sleep 1; done
curl -fsS "http://localhost:$PORT_API/api/health" | grep -q '"ok":true' && step "api up" || { echo "API did not start"; cat "$TMP/dev.log" | tail -20; exit 1; }
curl -fsS "http://localhost:$PORT_WEB/" | grep -qi '<div id="root"' && step "web up (/)"
curl -fsS "http://localhost:$PORT_WEB/os" | grep -qi '<div id="root"' && step "web up (/os)"

step "change a tagline in data/site_settings.json → visible via the API"
python3 - <<'PY'
import json; p="data/site_settings.json"; d=json.load(open(p)); d["taglines"]["primary"]="Newcomer test tagline"; json.dump(d, open(p,"w"), indent=2)
PY
curl -fsS "http://localhost:$PORT_API/api/site-settings" | grep -q "Newcomer test tagline" && step "tagline visible on /api/site-settings"

step "add a resource through the OS (Tier 1, local admin) → inbox"
curl -fsS -X POST -H 'Content-Type: application/json' -H 'X-Local-Role: admin' \
  -d '{"group":"General Knowledge","title":"Newcomer link","url":"https://example.org"}' \
  "http://localhost:$PORT_API/api/os/resources" | grep -q '"ok":true'
curl -fsS -H 'X-Local-Role: admin' "http://localhost:$PORT_API/api/os/inbox" | grep -q "Newcomer link" && step "resource in the inbox"
curl -fsS "http://localhost:$PORT_API/api/resources" | grep -q "Newcomer link" && step "…and on the public /api/resources"

step "make check"
pkill -f "uvicorn api.index:app --port $PORT_API" 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true
make check > "$TMP/check.log" 2>&1 && step "make check green" || { echo "make check FAILED"; tail -30 "$TMP/check.log"; exit 1; }

TOTAL=$(( $(date +%s) - T0 ))
echo "NEWCOMER TEST: $TOTAL s total ($(( TOTAL / 60 )) min $(( TOTAL % 60 )) s) — gate ≤ 600 s"
[ "$TOTAL" -le 600 ]
