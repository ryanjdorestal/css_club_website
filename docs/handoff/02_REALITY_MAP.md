# 02 — Reality map: what is live, what is Tier-1 only, what is not built

Every "works" below names the gate that proves it. Legend: **LIVE** = works in Tier 1 today and, once Supabase
is configured, against the database through the same code path; **T1** = built and tested in Tier 1, not yet
exercised against a real Supabase project (nobody has created the club's project yet — `08_ROADMAP.md` (a));
**NOT BUILT** = does not exist, with the reason. Derived from `docs/archive/context/42_OS_MATRIX.md` (19 entities
× 11 actions, ✅118 ⚠️5 ❌0) and `qa/REPORT_RUN10.md`. Gates: `check` = `make check`, `smoke` = `make smoke`
(OS gate 12 + functional 9), `sim` = `make sim` (25 steps), `break` = `make break` (16 cases), `a11y` = `make a11y`.

## Public site

| Capability                                                                                                     | Status    | Proved by                                                                            |
| -------------------------------------------------------------------------------------------------------------- | --------- | ------------------------------------------------------------------------------------ |
| Every route renders from committed JSON/markdown with no API                                                   | LIVE      | CI `playwright smoke` (every route, API off) · `check`                               |
| API-first reads with bundled fallback (`useApi`)                                                               | LIVE      | `check` (route/image/token audits) · `smoke` 2–5                                     |
| Posts, events (+ workshops by series), projects (featured ≤ 3), resources, board/About, join links from the OS | LIVE      | `smoke` 2–6 · `sim` 5–11                                                             |
| Public project submission → review → resubmit → publish                                                        | LIVE      | `sim` 14–17                                                                          |
| Maintenance banner + feature flags honoured on the public site                                                 | LIVE      | `break` 13                                                                           |
| Keyword chatbot (static KB, no LLM)                                                                            | LIVE      | `check` (kb.json schema) — no network                                                |
| 3D cube + Cyberhound (R3F)                                                                                     | LIVE      | `check` build · `a11y`                                                               |
| Accessibility 0 findings (pa11y + axe, every route)                                                            | LIVE      | `a11y`                                                                               |
| Type v5 self-hosted fonts, no CDN, no Google Fonts                                                             | LIVE      | grep gates in `qa/REPORT_RUN10.md` · `check` tokens                                  |
| Mobile Lighthouse ≥ 85                                                                                         | NOT BUILT | desktop 97, mobile 60 (CSR SPA pays its JS up front) — `08_ROADMAP.md` (b) prerender |

## CSS OS — cross-cutting

| Capability                                                                  | Status | Proved by                                            |
| --------------------------------------------------------------------------- | ------ | ---------------------------------------------------- |
| Roster-gated roles: guest / officer / admin, enforced in the UI and the API | LIVE   | `sim` 4 · `break` 11 (48 writes) · pytest 403 matrix |
| Login by email code (Supabase OTP); LOCAL_DEV role picker off Vercel only   | T1     | pytest `whoami`; the OTP path needs the club project |
| Every write audited with before/after; diff view                            | LIVE   | `sim` 21 · pytest                                    |
| Idempotent creates (`client_id`), 409 on stale saves with a diff, UNDO 8 s  | LIVE   | `break` 06, 09 · pytest                              |
| Validation server-first with the field named; client mirror + rule lines    | LIVE   | `break` 01–03 · pytest 422                           |
| Drafts survive refresh and session loss; unsaved-changes guard              | LIVE   | `break` 08, 10                                       |
| API down → browser outbox → replays itself                                  | LIVE   | `break` 07                                           |
| Tier-1 inbox → "Replay to DB" (upsert by id, idempotent)                    | T1     | pytest; the DB side needs the club project           |
| Uploads: magic bytes, ≤ 2 MB, resized 1600, EXIF stripped, replace/remove   | LIVE   | `break` 05 · pytest                                  |
| Rate limit 5/min on public writes                                           | LIVE   | pytest                                               |
| Search / sort / count / CSV on every list; keyboard tables; ⌘K launcher     | LIVE   | OS gate · `break` 16 (keyboard-only)                 |
| 390 px layout                                                               | LIVE   | `break` 15                                           |

## CSS OS — per module

| Module        | What works                                                                                                   | Status | Gate                  |
| ------------- | ------------------------------------------------------------------------------------------------------------ | ------ | --------------------- |
| Posts         | draft → review → publish/unpublish/archive, duplicate, delete drafts, cover upload, slug uniqueness, preview | LIVE   | `sim` 5 · `break` 02  |
| Projects      | review loop with notes and history, feature (max 3), unpublish, reorder, edit every field                    | LIVE   | `sim` 14–17           |
| Events        | date + time ET, flyer, publish/unpublish/archive, duplicate for next term                                    | LIVE   | `sim` 6 · `break` 04  |
| Workshops     | series + numbered sessions, materials, recording, publish needs a date                                       | LIVE   | `sim` 7 · pytest      |
| Resources     | links + categories (rename/reorder/delete-with-cascade), bulk paste, check all / one, dead filter            | LIVE   | `sim` 8–11            |
| Members       | add/edit, CSV import (dry run → commit → undo), bulk transition, merge, export                               | LIVE   | `sim` 12–13           |
| Board / terms | officers (photo, reorder, archive-not-delete after a handoff), terms, set current, rollover wizard           | LIVE   | `sim` 2–4, 24         |
| Inheritance   | 8 record types, templates, validator, filter/search, zip export, rollover stubs                              | LIVE   | `sim` 21–24           |
| Site          | taglines, blurbs, maintenance banner, feature flags, ticker (JSON control)                                   | LIVE   | `break` 13            |
| Audit         | log + diff, inbox replay, prune > 12 months                                                                  | LIVE   | pytest `test_hosting` |
| System        | live checks, ownership sheet, docs, runbook, HOSTING budget panel                                            | LIVE   | pytest · OS gate      |
| Today         | needs-attention counts, handoff nag in the last 4 weeks                                                      | LIVE   | `sim` 22              |

## The five honest ⚠️ (built as a line of text, not a control)

| Gap                                      | Where it says so                       | Roadmap                |
| ---------------------------------------- | -------------------------------------- | ---------------------- |
| Delete an inheritance record from the UI | `/os/inheritance` "what is not here"   | (b)                    |
| Reorder ticker items with ▲▼             | `/os/site` — edit the JSON list order  | (b) — good first issue |
| Audit filter by actor / date range       | `/os/audit` — table + search only      | (b) — good first issue |
| Per-item inbox replay                    | `/os/audit` — replay-all is idempotent | (b)                    |
| Supersedes picker for records            | text field, validated server-side      | (b)                    |

## Infrastructure

| Piece                                                                                        | Status        | Proved by                                                       |
| -------------------------------------------------------------------------------------------- | ------------- | --------------------------------------------------------------- |
| GitHub repo `ryanjdorestal/css_club_website`, branch `main`, ruleset (PR + `check` + linear) | LIVE          | `gh api rulesets` — `docs/REPO_SETTINGS.md`                     |
| CI on every push/PR: `make check` + build + render smoke + functional (smoke, sim, break)    | LIVE          | the Actions tab                                                 |
| Vercel project connected to the repo                                                         | NOT BUILT     | Ryan creates it under the club Gmail — `05_VERCEL_SETUP.md`     |
| Supabase project with migrations 0001–0005 applied                                           | NOT BUILT     | same — `04_SUPABASE_SETUP.md`                                   |
| Ignored build step, cache headers, one function                                              | LIVE (config) | `scripts/tests/test_vercel_should_build.py` · `check_api_count` |
| Nightly snapshot as an auto-merged PR; keepalive write + read-back; db budget at 70 %        | T1            | workflow files; needs the two secrets                           |
| Hosting limits documented with our usage                                                     | LIVE          | `docs/HOSTING_LIMITS.md` · `/os/system` HOSTING                 |
