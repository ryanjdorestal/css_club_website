# 32 — RUN 7: CSS OS (the board's internal platform) · PROJECTS & APPS merge · CODE AUDIT for handoff

Paste everything below the line into Claude Code (Fable, xhigh) opened in `~/Desktop/jjay_css`. Read anything
on this Mac; write only inside this folder; never push; never touch rhecwb or its Supabase.

---

## 0. What Ryan said, and what it means

"Really all that's left is their own internal platform. Like RHEC with the login, but they have their own
process, so it's a **board** platform: a tracker for Discord people, them writing blogs/news, editing
things on the site — projects/apps (make Projects/Apps one section, and add a project display section even
though there are none yet), an OS-inheritance/infrastructure section like RHEC OS's end-game institutional
mode, a section to update resources, links, etc., and anything else a board would need — engineered at the
**survivor level**. Then, after everything is functional and polished, **audit the code** and put it in a
form that's acceptable and simple enough that someone who wants to develop this further manually doesn't
leave in 10 minutes because it's large or looks like slop."

So run 7 has three parts, in order:

- **A. CSS OS** — the board's internal platform at `/os`, modeled on RHEC OS's *structure* (read-only
  reference at `~/Desktop/LAGCC/rhec_web/rhecwb/os/` and `netlify/functions/`), built for John Jay's
  simpler process: a board of ~6 officers, a Discord server, a site to keep current, a term rollover every
  semester. No member-facing OS, no alumni network, no study vault, no intelligence dashboard — those are
  RHEC's; if a module isn't in §3 it doesn't exist here.
- **B. Projects & Apps** — one public section, one data model, one review queue.
- **C. The audit** — make the repo something a sophomore can clone, run, understand and extend in an
  evening. This is a real deliverable with its own gate (§9), not a cleanup afterthought.

Hard rules carry over: Python API in `api/index.py` (one Vercel function — see §4 for how the code grows
without adding functions), no API keys for features, no LLMs, Tier 1 always works (`npm run dev` +
`uvicorn`, zero accounts), no secrets committed, John Jay palette/type v3, commit per phase, never push.

**Budget: 210 minutes.** Phase A ≤ 120, Phase B ≤ 30, Phase C ≤ 60. Checkpoints every 30 min in
`context/33_RUN7_LOG.md`. No questions; ambiguity → the simpler option that keeps Tier 1 working; log it.

## 1. Read first (≤ 15 min)

- `CLAUDE.md`, `context/08_SITE_STRUCTURE.md` §OS, `context/03_PRIOR_ART_RHECWB_LAGCC.md`,
  `context/15_EXECUTION_PLAN.md` phase 6, `context/18_BUILD_LOG.md`, `SETUP.md`, `api/index.py`
  (279 lines, 9 endpoints), `supabase/migrations/0001_init.sql` (8 tables: members, onboarding_requests,
  apps, app_submissions, events, board_profiles, site_settings, records), `apps/web/src/os/*` (Today,
  Queue, Login with local dev roles, `inbox.ts`).
- RHEC OS, for **shape only**: `rhecwb/os/apps/{board-os,inheritance,site-content,onboarding-queue,
  projects,event-ops,settings,board-profiles}.html`, `rhecwb/os/js/{os-auth,os-session,os-ui}.js`,
  `rhecwb/netlify/functions/{whoami,onboarding-queue,onboarding-decide,projects,events,blog,
  site-settings,handoffs,lifecycle-transition,records-db}.js`, `rhecwb/project-rules/*.md`,
  `rhecwb/docs/contributor-handoff/{00_START_HERE,02_PLATFORM_REALITY_MAP,11_DATABASE_SCHEMA_MAP,
  12_API_MAP,15_PRODUCTION_HANDOFF,16_DEFINITION_OF_DONE,19_KNOWN_RISKS_AND_TRAPS}.md`. Take: the
  role model (`whoami` never elevates an email without a roster row), the audit-record pattern, the
  "one handoff per person per term" idea, the "Is the platform working?" panel, the "what is not here
  and why" section on every OS page, the docs structure. Re-implement; copy nothing verbatim.
- Write `context/34_OS_PLAN.md` before coding: the §3 module table with the routes, tables, endpoints and
  Tier-1 fallback for each, in one screen. That file is the contract for the run.

## 2. Principles for CSS OS

1. **Board-only.** Two roles: `officer` (any current board member) and `admin` (president + webmaster —
   can change roles, run term rollover, edit settings). Everyone else is `guest` and sees only the login.
2. **Auth = Supabase Auth email OTP / magic link**, no passwords to manage, no OAuth apps to register.
   A login succeeds only if the email is on `board_profiles` for the **current term** with `active=true`
   (the RHEC `whoami` rule: no roster row → `guest`, whatever the email). The API validates the Supabase JWT
   on every write. Tier 1 (no Supabase): the existing local dev login with `?role=officer|admin` and a
   visible `LOCAL_DEV` chip — never available in production builds (`import.meta.env.PROD` guard).
3. **Every write is an audit record** (`records` table: who, what, before/after JSON, when) and every write
   has a Tier-1 fallback (the local inbox), so nothing the board does is lost when Supabase is paused.
4. **The public site never depends on the OS being up.** Public pages read the API with the committed JSON
   as fallback (as now). New: a **snapshot** step (§5.4) writes the DB back into `data/*.json` and
   `content/news/*.md` so the committed fallback stays current.
5. **Survivor-level engineering.** Tables, forms, lists. No realtime, no websockets, no drag-and-drop, no
   rich text editor (markdown textarea with preview), no image cropper (upload + constraints), no charts
   beyond a `Meter`. If a feature needs a third-party account or key, it goes in `docs/LATER.md`, not in
   the build.
6. **Same design system as the public site**, denser: `SpecSheet`, `IndexList`, `Readout`, `StatusChip`,
   `Meter`, `Tag`, Bracket/Block buttons, label grammar, status bar. OS layout = left rail (mono nav with
   `/01`…) + content column; no cube canvas in the OS (perf); reveals only on page load. Forms use shadcn
   primitives restyled to the tokens (zero radius, hairlines, mono labels). Every OS page ends with a
   "What is not here, and why" block (RHEC pattern) so the next board doesn't go looking.

## 3. Modules (routes under `/os`; each with purpose · data · endpoints · Tier-1 · UI · done-when)

### 3.1 `/os` — Today
- Purpose: the board's landing page. Platform status + what needs attention + quick links.
- Data: `/api/health` (extend: supabase reachable?, last keepalive, deploy SHA vs repo SHA, last snapshot
  time), counts of pending items from every queue below.
- UI: `Readout` row (STATUS · DB · DEPLOY · SNAPSHOT), "Needs attention" `IndexList` (pending project
  submissions, unreviewed suggestions, dead links, events without flyers, posts in draft > 14 days, handoff
  not filed this term), "This term" `SpecSheet` (term name, officers, next event, last post).
- Done when: with Supabase down, the page still renders with `○ OFFLINE` and the inbox counts.

### 3.2 `/os/members` — Discord & member tracker
- Purpose: track the people (Ryan: "a tracker for Discord peeps"). Not an auth roster.
- Data: table `members` (extend 0001): `id, display_name, discord_handle, school_email?, status
  (interested|member|active|alumni|left), joined_term, last_seen_term, tags[], notes, source
  (form|import|manual), created_by, updated_at`. **No Discord API** (needs a bot token = key). Inputs:
  the Join form (already posts `onboarding/submit`), a CSV import (`display_name,discord_handle,email,
  status,joined_term` — from Discord's member export or a Google Form export), and manual add.
- Endpoints: `GET /api/os/members?status=&term=&q=`, `POST /api/os/members` (create), `PATCH
  /api/os/members/{id}`, `POST /api/os/members/import` (CSV, dry-run flag returns the diff first),
  `POST /api/os/members/{id}/transition` (status change with audit; allowed transitions in a small
  table like RHEC's `member_lifecycle_transitions`, but as a Python dict — not a DB table).
- Tier-1: reads from `data/members.local.json` (gitignored) + inbox; import dry-run works offline.
- UI: `IndexList` table with filters (status chips, term select, search), row → side panel `SpecSheet`
  editor, bulk status transition, import page with dry-run diff (added / changed / unchanged counts +
  first 20 rows), export CSV button (client-side). Counts by status as `Meter`s at the top.
- Done when: import → dry-run → commit works end to end offline; transition logs an audit record.

### 3.3 `/os/posts` — News & blog
- Purpose: officers write posts; the public `/news` renders them.
- Data: table `posts`: `id, slug, title, dek, body_md, cover_path?, author_profile_id, status
  (draft|review|published|archived), published_at, updated_at, tags[]`. Migrate the existing
  `content/news/*.md` (the grad-events article + blog posts) into seed rows with `source: 'legacy'`.
- Endpoints: `GET /api/posts` (public, published only, with `data/posts.json` fallback), `GET
  /api/posts/{slug}`, `GET /api/os/posts` (all, officer), `POST/PATCH /api/os/posts`, `POST
  /api/os/posts/{id}/publish` (sets status + published_at + audit), `POST /api/os/uploads` (cover
  image → Supabase Storage bucket `public-media`, constraints: ≤ 2 MB, jpg/png/webp, resized to 1600 px
  server-side with Pillow; Tier-1: saved under `.inbox/uploads/`).
- UI: list (status chips, author, date) → editor: title, slug (auto from title, editable), dek, tags,
  cover upload, **markdown textarea with a live preview pane** rendered by the same `md.ts` the public
  site uses, save draft / send to review / publish; "Published to /news/{slug}" link. Preview uses the
  public article layout at reduced width so what they see is what ships.
- Public: `/news` and `/news/:slug` read the API first, JSON fallback second, same components as now.
- Done when: a post written in the OS appears on `/news` (Tier 2) and, after a snapshot (§5.4), in the
  committed fallback (Tier 1).

### 3.4 `/os/projects` — Projects & Apps (merged; see Phase B for the public side)
- Purpose: review submissions, curate the public Projects section.
- Data: rename `apps` → `projects` and `app_submissions` → `project_submissions` (migration `0002`):
  add `kind (app|project|research|tool)`, `status (submitted|in_review|changes_requested|approved|
  published|archived)`, `featured bool`, `display_order int`, `screenshots[]`, `links {repo,live,demo}`,
  `benefits_jj text`, `authors[] {name, handle, term}`, `reviewed_by, review_notes`.
- Endpoints: `GET /api/projects` (public, published), `POST /api/projects/submit` (public form;
  replaces `apps/submit`, keep the old path as a 308), `GET /api/os/projects?status=`, `PATCH
  /api/os/projects/{id}`, `POST /api/os/projects/{id}/decide` (`approve|request_changes|archive` +
  note + audit), `POST /api/os/projects/{id}/publish`, `POST /api/os/projects/reorder`.
- UI: queue (submitted / in review) with a review panel: the submission as a `SpecSheet`, screenshots,
  decision buttons with a required note on request-changes; published list with `featured` toggle and
  up/down reorder; an "add a project on behalf of a student" form (same fields).
- Done when: a submission from the public form reaches the queue offline (inbox) and online (DB), and a
  published project shows on `/projects`.

### 3.5 `/os/events` — Events
- Data: `events` (exists): add `status (draft|published|archived)`, `flyer_path`, `location`,
  `rsvp_url?`, `recap_post_id?`. Endpoints: `GET /api/events` (public, published, fallback), `GET/POST/
  PATCH /api/os/events`, flyer upload via `/api/os/uploads`.
- UI: list by term → editor (title, date/time, location, description md, flyer, link a recap post),
  publish/archive. "Upcoming" on the public site is now driven by this (fallback JSON still works).
- Done when: an event created here shows on `/events` and Home §4 without code changes.

### 3.6 `/os/resources` — Resources & links
- Data: `resources` (categories + links from `data/resources.json`) and `links` (site links: Discord
  invite, Form, Linktree, MSRC, PRISM…) become tables with `last_checked, last_status, dead bool`.
- Endpoints: `GET /api/resources` (public, fallback), `GET/POST/PATCH/DELETE /api/os/resources`,
  `GET/PATCH /api/os/links`, `POST /api/os/links/check` (server-side HEAD/GET with a 6 s timeout,
  writes `last_status`; Tier-1: runs locally the same way).
- UI: categories as `IndexList` groups with inline edit, add link, reorder within category; a "Check all
  links" button with a `Meter` and a dead-link list; the site links (`_discord_invite`, `_join_form` …)
  as a `SpecSheet` with edit-in-place — this is how the board updates the Discord invite without a deploy.
- Done when: changing the Discord invite here changes it on the public site (Tier 2) and in the next
  snapshot (Tier 1).

### 3.7 `/os/board` — Board, roles, terms
- Data: `board_profiles` (exists): `profile_id, term, name, role_title, email, photo_path, bio, active,
  os_role (officer|admin)`; `terms` table: `id (F26, S27…), label, starts_on, ends_on, is_current`.
- Endpoints: `GET /api/board` (public, current + history, fallback), `GET/POST/PATCH /api/os/board`,
  `POST /api/os/terms/rollover` (admin: closes current term, clones officers into the next term as
  `active=false` for the admin to confirm, files a handoff stub per officer — §3.8).
- UI: current board grid (photo, name, role, email, OS role chip), edit panel, "Add officer", term
  history accordion (reuses public About §5 data), **Term rollover** wizard (3 steps: confirm dates →
  who continues → done) admin-only.
- Done when: rollover produces the next term with the right officers and the public About page shows it.

### 3.8 `/os/inheritance` — Inheritance & infrastructure (RHEC's "institutional mode", sized for JJ)
- Purpose: the platform survives graduation. This page answers three questions a new board asks:
  *Is it working? Who owns what? What do I do at term end?*
- Panels:
  1. **Is the platform working?** — live checks: Supabase reachable (and days since last write —
     warn at 5, the free tier pauses at 7 idle), keepalive workflow last run (from a committed
     `qa/keepalive.json` the workflow updates), deployed SHA vs `main` SHA, last snapshot, link-check
     age, uploads bucket size. Each a `StatusChip` + one-line "what to do if red" (from `docs/RUNBOOK.md`).
  2. **Ownership checklist** — a `SpecSheet` of accounts (`Vercel project`, `Supabase project`, `GitHub
     repo`, `Domain/DNS`, `Google Form`, `Discord server`, `Linktree`, `YouTube`, `club Gmail`) with
     `owner_email`, `second_owner_email`, `last_verified` — **never** credentials or values. Stored in
     `site_settings.ownership` JSON; editable by admin. Red if any owner is not a current officer.
  3. **Handoffs** — one per officer per term (RHEC pattern): a markdown form (what I ran, where things
     are, what's unfinished, advice) saved to `handoffs` table (`profile_id, term, body_md, filed_at`),
     listed by term, exportable as one markdown file per term into `content/handoffs/` by the snapshot.
     Today shows "handoff not filed" for the current term's officers in the last 4 weeks of the term.
  4. **Docs index** — links to `docs/` (§9) rendered from a committed `docs/INDEX.json`.
  5. **Runbook** — `docs/RUNBOOK.md` rendered inline: "Supabase paused", "Deploy stale", "Someone
     graduated with a login", "Rotate the Vercel/Supabase keys", "Restore from snapshot".
- Done when: every check has a real data source (no fake green), the ownership sheet saves, a handoff
  files and shows in Today.

### 3.9 `/os/site` — Site content & settings
- Data: `site_settings` (exists) as key→JSON: `taglines`, `hero_copy`, `about_blurbs`, `collaborate`
  (openings/committees/ideas — from `data/collaborate.json`), `maintenance_banner {on, text}`,
  `feature_flags {projects_public, chat_enabled, ticker_items[]}`, `ownership` (§3.8).
- Endpoints: `GET /api/site-settings` (exists; public, fallback), `PATCH /api/os/site-settings/{key}`
  (admin; audit).
- UI: one `SpecSheet` per key with inline edit (strings, string lists, small JSON forms), the
  maintenance banner toggle, feature flags, ticker items editor. Public site reads these (with fallback).
- Done when: editing a tagline here changes the hero (Tier 2) with no deploy.

### 3.10 `/os/audit` — Audit log
- `records` (exists): list with filters (who, table, date), diff view (before/after JSON side by side).
  Read-only. Also the inbox viewer (Tier-1 writes that haven't been synced) with a "Replay to DB"
  button that posts each inbox item to its endpoint when Supabase is back (idempotent by `client_id`).

### 3.11 `/os/login`, `/os/logout`, `/os/whoami`
- Magic-link/OTP flow with the `board_profiles` allowlist; session = Supabase session in memory +
  refresh; `GET /api/whoami` returns `{role, profile, term}`; the OS rail shows name · role · term.
  Local dev mode as now, PROD-guarded.

## 4. API growth without new Vercel functions

- `api/index.py` stays the **only** function. Move logic into a package **`api/_core/`** — Vercel treats
  files and folders that start with `_` inside `api/` as non-functions (helpers), so this adds zero
  functions. Layout: `api/_core/{auth.py, db.py (supabase REST client via httpx + service key from env,
  never exposed), tier1.py (JSON fallbacks + inbox), audit.py, uploads.py, routers/{public.py, members.py,
  posts.py, projects.py, events.py, resources.py, board.py, inheritance.py, settings.py}}`, each router a
  FastAPI `APIRouter` included in `index.py`. Update `scripts/check_api_count.py` to count **top-level**
  `api/*.py` only (must be 1) and to assert `api/_core` exists; add `vercel build` dry-run to CI asserting
  exactly one function in the output manifest. If the `_`-folder rule turns out not to hold for the
  Python runtime on `vercel build`, fall back to `vercel.json` `functions.api/index.py.includeFiles:
  "api/_core/**"` — verify one or the other and log which.
- Auth dependency: `require_role("officer"|"admin")` verifies the Supabase JWT (`SUPABASE_JWT_SECRET`
  env) and looks up the roster; in Tier 1 with `LOCAL_DEV=1` it trusts the `X-Local-Role` header only
  when `os.environ.get("VERCEL")` is unset.
- Every write endpoint: validate (pydantic) → authorize → write (DB or inbox) → audit → return the row.
- Tests: `api/_core/tests/` with pytest hitting the FastAPI app in Tier-1 mode for every endpoint (happy
  path + one auth failure each). ≥ 40 tests, all green, in CI.

## 5. Data & schema

1. `supabase/migrations/0002_os.sql`: `posts`, `terms`, `handoffs`, `resources`, `links`, `members`
   extensions, `apps→projects` rename (+ view `apps` for one release), `events` extensions, `records`
   indexes, **RLS**: public `select` on published rows only; all writes via the service role from the API
   (the browser never holds the service key); `board_profiles` readable by authenticated officers.
   Storage bucket `public-media` (public read, API-only write).
2. `supabase/seed.sql` from the committed JSON (so a fresh project matches Tier 1 on day one).
3. Keep `data/*.json` + schemas as the **fallback contract**: add `posts.json`, `members.local.json`
   (gitignored), `projects.json` (renamed from apps), `terms.json`, `links.json` extended.
4. **Snapshot**: `scripts/snapshot.py` — pulls published rows from Supabase and rewrites `data/*.json`
   + `content/news/*.md` + `content/handoffs/*.md`, validates against the schemas, prints a diff.
   `.github/workflows/snapshot.yml` runs it nightly and on `workflow_dispatch`, commits with
   `chore(snapshot): …` if changed (needs `SUPABASE_URL` + service key as repo secrets — documented in
   `SETUP.md`; without them the workflow no-ops with a clear log line). This is what keeps Tier 1 current
   and is the restore path if Supabase is ever lost.
5. `SETUP.md` gains the OS steps: enable Email OTP in Supabase Auth, set `SUPABASE_JWT_SECRET`, create the
   bucket, run `0002`, seed, add the first admin row (`scripts/bootstrap_admin.py --email …`).

## 6. Phase B — Projects & Apps on the public site (≤ 30 min)

- One section: **Projects** at `/projects` (`/apps` → 308 redirect; nav label `PROJECTS`; cube face
  mapping green S → Projects). Hero: `PROJECTS` / `BUILT HERE.`; dek says apps, tools, research, class
  projects.
- Subsections in this order: **Featured** (`SpecSheet`, first `featured`), **Apps** (`kind=app`
  `TicketCard` grid), **Projects** (`kind=project|research|tool` — the new display section; with zero
  rows it renders three `SlotCard`s: `SLOT_01 · YOUR CAPSTONE`, `SLOT_02 · A CLASS PROJECT`, `SLOT_03 ·
  RESEARCH` each linking to the submit form — the empty state is the pitch), **Submit** (one form, `kind`
  select), **How review works** (`[1] SUBMIT [2] BOARD REVIEW [3] PUBLISHED`, `Meter`).
- Home §5 becomes "PROJECTS · BUILT AT JOHN JAY"; brand config, sitemap, parity table, README updated.
  Old-site "Collaborate → project ideas" links point here.

## 7. Phase A loop protocol

Modules in this order (each is a loop: plan line in `34_OS_PLAN.md` → migration/API/tests → UI → shoot
1440 + 390 → score → fix → commit `feat(os): <module>`): 3.11 auth → 3.4 projects (unblocks Phase B) →
3.3 posts → 3.5 events → 3.6 resources → 3.7 board → 3.2 members → 3.9 site → 3.8 inheritance → 3.10
audit → 3.1 today (last, because it aggregates). Minimum if time runs short: auth, projects, posts,
resources, board, inheritance, today — log the cut.

OS rubric per module (1–5, gate ≥ 4): works offline (Tier 1) · works online (mocked DB in tests) ·
audit record on every write · same design language as the public site · "what is not here" block ·
mobile 390 usable · no keys · tests green.

## 8. Phase C — the audit ("doesn't leave in 10 minutes") (≤ 60 min)

The test is literal: **a CS sophomore with Node + Python installed clones the repo, and within 10 minutes
has the site and the OS running locally and knows where to change something.** Engineer toward that test.

### 8.1 Repo shape (target)
```
README.md            ← 1 screen: what this is, the 10-minute start, the map below, where to ask
ARCHITECTURE.md      ← 1 diagram (Mermaid, public site ↔ api ↔ supabase ↔ tier-1 JSON/inbox), 1 page
CONTRIBUTING.md      ← how to add a page / a data field / an API endpoint / an OS module, with one worked example each
SETUP.md             ← accounts + env (existing, updated)
docs/                ← RUNBOOK.md, DECISIONS.md (the why, condensed from context/12), LATER.md, HANDOFF.md, INDEX.json
apps/web/            ← src/{pages,os,components,cube,mascot,sigils,textures,motion,lib,styles}; README per folder (5 lines)
api/                 ← index.py + _core/ (+ tests); README
data/ content/       ← the Tier-1 fallback; README explaining the snapshot loop
supabase/            ← migrations, seed; README
scripts/             ← each script has a docstring and `--help`; README table
brand/  assets/      ← brand config; brand files (cube, hound, logos, refs); README
context/             ← MOVE to docs/archive/context/ — planning history, not a working doc; link from README
qa/                  ← keep REPORT_*.md and the latest shots only; move loop dirs to qa/archive/ (gitignored) or delete
```
### 8.2 Size and clarity budget
- `apps/web/src` ≤ ~9,000 lines TS/TSX after the OS (it is 5,889 now); no file > 400 lines; no component
  > 200 lines; page files are composition only (sections as components). Delete dead code: every export
  is imported somewhere (`npx ts-prune` = 0), every CSS class is used, every dependency in `package.json`
  is imported (`npx depcheck`), every image in `public/` is referenced.
- One way to do each thing: one `Button`, one `Card` family, one data-fetch hook (`useApi(path,
  fallback)`), one form helper, one markdown renderer, one date formatter. Merge duplicates found in
  runs 2–6 (there are at least: two hound rasters, two decode implementations, `Ticker` vs `Marquee`
  remnants, `Section` vs `Band`).
- Naming: files named for what they render/do, folders by role not by run (`components/cards/`, not
  `components/v2/`); no run numbers, no `_new`, `_old`, `Fixed`, `Final` anywhere; the `context/`
  history is the only place run numbers survive.
- Comments: a 1–3 line header on every file saying what it is and where it's used; no commented-out
  code; no TODOs without an issue-style line in `docs/LATER.md`.
- Types: `strict` TS, no `any` (≤ 5 justified with a comment), API responses typed once in
  `apps/web/src/lib/api.types.ts` generated from the pydantic models (`scripts/gen_types.py`).
- Python: `ruff` + `mypy --strict` clean on `api/`; functions ≤ 60 lines; routers ≤ 250 lines.
- Tests: `npm test` (vitest: md renderer, api hook fallback, label grammar helper, cube keyframe
  interpolation, 20+ tests) and `pytest` (§4) in CI; Playwright smoke: every route 200 in Tier 1.
- Tooling: `make dev` (or `npm run dev:all` with concurrently) starts web + api; `make check` runs
  lint + types + tests + api-count + link validity; `make snapshot`; pre-commit hook runs `make check`
  fast subset. Node and Python versions pinned (`.nvmrc`, `.python-version`).

### 8.3 The 10-minute newcomer test (run it, don't assume it)
Write `scripts/newcomer_test.sh`: from a **fresh clone into /tmp** on this Mac, with a stopwatch: `make
dev` → both servers up → `/` and `/os` (local dev role) load → change one tagline in `data/…` and see it →
add one resource via the OS in Tier 1 and see it in the inbox → `make check` green. Record the wall time
in `qa/REPORT_RUN7.md`. Gate: ≤ 10 min including install, and the README alone was enough (the script
follows only README steps).

### 8.4 Docs (short — RHEC's 21-file handoff was written for a bigger platform; JJ gets 6)
- `README.md` (10-minute start + map), `ARCHITECTURE.md`, `CONTRIBUTING.md` (with the four worked
  examples), `docs/RUNBOOK.md` (the red-state playbooks from §3.8), `docs/HANDOFF.md` (board-side: what
  to do each term, account ownership, how to add/remove an officer, how to transfer the repo to `jjcss`
  and point the domain), `docs/DECISIONS.md` (30 lines: the decisions a newcomer will question — Python
  API, one function, Tier 1, no keys, why Unbounded, why procedural 3D, why snapshot). Each ≤ 2 screens.

## 9. Final gate (all must be true before the report)

1. All §3 modules (or the logged minimum) work in Tier 1 and pass their tests.
2. `make check` green; `ts-prune`, `depcheck`, `ruff`, `mypy`, vitest, pytest, api-count, Playwright smoke
   all green in CI (`.github/workflows/ci.yml` updated).
3. Newcomer test ≤ 10 min from a fresh clone, README-only.
4. No file > 400 lines; no run numbers or `_v2` names outside `docs/archive`.
5. Public site visually unchanged except Phase B (re-run `scripts/shoot.mjs` on Home/Projects/News/About
   and diff against `qa/loops/*` — differences only where Phase B says).
6. Parity table still 28/28 (+ the projects row); Lighthouse desktop ≥ 85 on Home.
7. `SETUP.md` + `docs/HANDOFF.md` are enough for the board to go live without Ryan (list the exact
   accounts, secrets by *name*, and the 8 steps).

## 10. Don'ts

No Discord bot/token, no LLM, no OAuth apps, no realtime, no rich-text editor, no new fonts, no cube in
the OS, no member-facing OS, no alumni/study-vault/intelligence modules, no second Vercel function, no
service key in the browser, no push, no writes to rhecwb, no deleting `context/` (move it), no
questions.

## 11. End of run

Commit per phase (`feat(os): …`, `feat(projects): merge`, `chore(audit): …`); write `qa/REPORT_RUN7.md`
(module table with scores, test counts, newcomer time, size before/after, what was cut → `docs/LATER.md`),
`context/33_RUN7_LOG.md` (→ moved with `context/` in Phase C; update links). Print: the module status
table, the newcomer time, the line counts before/after, the exact `SETUP.md` steps still needing Ryan or
the board, and `make dev`.
