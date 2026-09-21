# 34 — CSS OS plan (run 7 contract)

One screen. Every module: route · tables · endpoints · Tier-1 fallback · done-when.
Roles: `guest` (login only) · `officer` (any active board row, current term) · `admin` (president + webmaster: roles, rollover, settings).

## Cross-cutting
- **API**: `api/index.py` = the one function; logic in `api/_core/` (`_`-prefixed = helper folder, zero functions; `vercel.json` also pins `includeFiles`). Routers per module; `crud.py` builds list/get/create/patch/delete/transition for any `Collection`.
- **Store** (`_core/store.py`): `Collection(table, seed)` → Supabase REST when configured, else `data/<table>.local.json` (gitignored, seeded from the committed JSON on first use) **+** `.cache/inbox/<table>.jsonl` line with a `client_id` (replayable). Every write → `records` (audit: who · action · table · row · before/after · when).
- **Auth** (`_core/auth.py`): Supabase JWT (HS256, `SUPABASE_JWT_SECRET`) → email → `board_profiles` row for the current term with `active=true` → role; no row → `guest`. Tier 1 (no `VERCEL` env): `X-Local-Role` header from the local dev picker, PROD-guarded in the SPA.
- **Public reads** keep their JSON shapes; pages use `useApi(path, fallback)` — API first, committed JSON second. `scripts/snapshot.py` writes DB → `data/*.json` + `content/news/*.md` + `content/handoffs/*.md`.

| # | Route | Tables (0002) | Endpoints | Tier-1 | Done when |
|---|---|---|---|---|---|
| 3.11 | `/os/login` `/os/logout` | `board_profiles.os_role,email,active`, `terms` | `GET /api/whoami` | local picker (`?role=`), `LOCAL_DEV` chip; PROD → "not configured" | guest sees only login; officer email not on roster → guest |
| 3.4 | `/os/projects` | `projects` (← apps, +kind/status/featured/display_order/links/authors/review), `project_submissions` | `GET /api/projects` · `POST /api/projects/submit` (`/api/apps/submit` 308) · `GET/PATCH /api/os/projects` · `decide` · `publish` · `reorder` | `data/projects.json` seed → `projects.local.json`; submissions → inbox | public submit → queue (offline + online); published → `/projects` |
| 3.3 | `/os/posts` | `posts` | `GET /api/posts[/{slug}]` · `GET/POST/PATCH /api/os/posts` · `publish` · `POST /api/os/uploads` | `data/posts.json` (seeded from `content/news`), uploads → `.cache/uploads/` | OS post → `/news`; snapshot → committed md |
| 3.5 | `/os/events` | `events` (+status/flyer_path/location/rsvp_url/recap_post_id) | `GET /api/events` (nested shape kept) · `GET/POST/PATCH /api/os/events` · `publish` | `events.local.json` seeded by flattening `events.json` | event created here shows on `/events` + Home |
| 3.6 | `/os/resources` | `resources` (flat rows + group), `links` (key/url/label + last_checked/last_status/dead) | `GET /api/resources` · CRUD `/api/os/resources` · `GET/PATCH /api/os/links` · `POST /api/os/links/check` | seeded from `resources.json` / `links.json`; check runs locally | Discord invite edit → public site |
| 3.7 | `/os/board` | `board_profiles` (+email/active/os_role/photo_path), `terms` | `GET /api/board` · CRUD `/api/os/board` · `GET /api/os/terms` · `POST /api/os/terms/rollover` (admin) | seeded from `board.json` / `terms.json` | rollover → next term, About shows it |
| 3.2 | `/os/members` | `members` (display_name, discord_handle, status, joined_term, last_seen_term, tags, notes, source) | CRUD `/api/os/members` · `import` (dry-run) · `transition` | `members.local.json` (empty seed) | import dry-run → commit offline; transition audited |
| 3.9 | `/os/site` | `site_settings` key→JSON | `GET /api/site-settings` · `PATCH /api/os/site-settings/{key}` (admin) | `data/site_settings.json` seed | tagline edit → hero, no deploy |
| 3.8 | `/os/inheritance` | `handoffs`, `site_settings.ownership`, `records` | `GET /api/os/status` · CRUD `/api/os/handoffs` · ownership via settings | `handoffs.local.json`; status probes honest (`OFFLINE`) | every check has a real source; handoff files → Today |
| 3.10 | `/os/audit` | `records` | `GET /api/os/records` · `GET /api/os/inbox` · `POST /api/os/inbox/replay` | `records.local.json`; inbox = `.cache/inbox` | diff view; replay idempotent by `client_id` |
| 3.1 | `/os` | — | `GET /api/health` (+db, keepalive, sha, snapshot) · `GET /api/os/attention` | all counts from local stores | renders `○ OFFLINE` with inbox counts when DB is down |

## Order
auth → projects → posts → events → resources → board → members → site → inheritance → audit → today. Minimum if short: auth, projects, posts, resources, board, inheritance, today.

## Not here (by design)
No Discord API/bot · no LLM · no OAuth apps · no realtime · no rich text (markdown + preview) · no image cropper (upload + resize) · no member-facing OS · no alumni network / study vault / intelligence dashboard (RHEC's) · no second function · no service key in the browser.
