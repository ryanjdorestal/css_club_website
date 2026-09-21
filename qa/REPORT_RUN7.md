# qa/REPORT_RUN7.md — CSS OS · Projects merge · code audit (run 7), 2026-09-21

Ryan's brief (docs/archive/context — pasted as "32 — RUN 7"): the board's
internal platform at the survivor level, Projects & Apps merged, then an audit
so a sophomore doesn't leave in 10 minutes. Contract: `docs/archive/context/34_OS_PLAN.md`;
log: `docs/archive/context/33_RUN7_LOG.md`. Five commits, never pushed.
Wall clock: 23:13 → 00:12 (59 min of the 210 budgeted; the log's first
checkpoint headings were estimates and were corrected to the clock).

## A — CSS OS: module table (rubric 1–5, gate ≥ 4)

| Module | Route | Offline | Online* | Audit | Design | Not-here | 390 | Keys | Tests | Score |
|---|---|---|---|---|---|---|---|---|---|---|
| Auth / whoami | /os/login | ✅ picker (PROD-guarded) | ✅ JWT→roster | — | ✅ | ✅ | ✅ | none | 5 | 5 |
| Projects (queue + curate) | /os/projects | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | none | 4 | 5 |
| Posts (markdown + preview) | /os/posts | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | none | 3 | 5 |
| Events | /os/events | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | none | 2 | 4 |
| Resources + site links + link check | /os/resources | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | none | 3 | 5 |
| Board · roles · terms · rollover | /os/board | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | none | 3 | 4 |
| Members (Discord tracker, CSV) | /os/members | ✅ dry-run→commit | ✅ | ✅ | ✅ | ✅ | ✅ | none | 4 | 5 |
| Site content & settings | /os/site | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | none | 1 | 4 |
| Inheritance (status · ownership · handoffs · docs · runbook) | /os/inheritance | ✅ honest OFFLINE | ✅ | ✅ | ✅ | ✅ | ✅ | none | 3 | 5 |
| Audit log + inbox replay | /os/audit | ✅ | ✅ (replay upserts) | — | ✅ | ✅ | ✅ | none | 2 | 4 |
| Today | /os | ✅ ○ OFFLINE + inbox counts | ✅ | — | ✅ | ✅ | ✅ | none | 1 | 5 |

\*Online = the Supabase path exists and is exercised through `db.py`; no
project was created in this run (SETUP.md), so "online" is tested by shape,
not against a live database. Shots: `qa/loops/run7/os-*-{1440,390}.png`.
No module was cut.

**What the API is now.** `api/index.py` (one function) + `api/_core/`
(config · db · tier1 · store.Collection · audit · auth · lifecycle · models ·
crud.make_router · seeds · collections · routers/{public, projects, posts,
events, resources, board, members, settings, inheritance, audit, uploads} ·
tests). 44 pytest cases: every endpoint's happy path + one auth failure,
run in Tier 1 against a temp `data/`. Migration `0002_os.sql`, `seed` via
`scripts/snapshot.py --restore`, nightly `snapshot.yml`, `keepalive.yml`
now records `qa/keepalive.json`.

## B — Projects & Apps
`/projects`: Featured spec sheet → Apps grid → Projects/Research/Tools (three
pitch SlotCards while empty) → Submit (kind select → `/api/projects/submit`)
→ How review works. `/apps` 308s. Nav PROJECTS, cube green face → /projects,
Home §3 "PROJECTS · BUILT AT JOHN JAY". Public pages now read the API first
with the committed JSON as the typed fallback (`lib/useApi`): News (posts +
article), Events, About, Resources (+ links), Projects. Parity table: 28 rows
+ the Projects row. Shots: `qa/loops/run7/pub-*.png`; Home after the audit
split pixel-diffs 1.4 % (live cube/marquee/clock) at the same height.

## C — The audit

| Gate | Result |
|---|---|
| `make check` | **green** (ruff · mypy --strict 30 files · oxlint · tsc · pytest 44 · vitest 19 · ts-prune 0 · depcheck 0 · api-count · schemas) |
| No file > 400 lines / component > 200 | ✅ / ✅ (Home 446 → 34; sections in `pages/home/`) |
| Size | `apps/web/src` 7,959 lines TS/TSX (was 5,889 before the OS; budget ≤ 9,000); Python 3,216 |
| Dead code | 3 components, 1 helper, 1 alias, 4 retired font deps, 1 superseded test file removed; 14 module-internal exports un-exported; no unreferenced public images except `favicon`/`icons.svg` (referenced from `index.html`) |
| Names | no run numbers or `_v2`/`_old`/`Fixed` outside `docs/archive/` (`grep` = 0) |
| Types | `strict`; generated `lib/api.types.ts` from the pydantic models (CI checks it is current); `any` count in src: 0 |
| Docs | README (10-minute start + map) · ARCHITECTURE (one mermaid) · CONTRIBUTING (four worked examples) · SETUP (8 steps, secrets by name) · docs/RUNBOOK · HANDOFF · DECISIONS · LATER · INDEX.json · 17 folder READMEs · CLAUDE.md rewritten |
| Newcomer test (fresh clone, README steps only) | **53 s** from `git clone` to `make check` green (clone 4 s · `make install` 18 s with a warm npm cache — budget ~3 min cold · `make dev` up in 5 s · `/` and `/os` load · tagline edit visible · resource added via the OS → inbox + public API · `make check` 25 s). Script: `scripts/newcomer_test.sh`; it follows README steps only |
| Lighthouse desktop (prod dist) | Home **97** (LCP 1.2 s, TBT 30 ms) · Projects **94** |
| Public site unchanged except Phase B | Home/News/About/Events/Resources re-shot; only /projects and the Home §3 copy differ |

Size before → after: 5,889 → 7,959 lines TS/TSX (+ the whole OS), 279 → 3,216
lines Python (+ the whole API), 9 → 44 API tests, 0 → 19 web tests.

## What was cut → docs/LATER.md
Discord sync (bot token), analytics, email from the OS, screenshot gallery,
prerender, the Vercel build dry-run (needs a token), link-rot service,
clickable fins, bust v7.

## SETUP.md steps still needing Ryan or the board
1. Push the repo + create the Vercel project (club Gmail).
2. Create the Supabase project; run `0001_init.sql` + `0002_os.sql`; enable Email OTP.
3. Set the five env vars in Vercel (`SUPABASE_URL`, `SUPABASE_SERVICE_KEY`,
   `SUPABASE_JWT_SECRET`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).
4. `scripts/snapshot.py --restore` + `scripts/bootstrap_admin.py --email …`.
5. GitHub Actions: `SITE_URL` variable; `SUPABASE_URL` + `SUPABASE_SERVICE_KEY` secrets.
6. Sign in on `/os/login`; add the officers on `/os/board`; fill the ownership sheet.

## Dev
```
make install   # once
make dev       # web :5173 + api :8000, Tier 1
make check     # what CI runs
```
