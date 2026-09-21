# REPORT_RUN10 — type v5 (the real game face, everywhere) · the OS actually works

2026-09-21, 13:45 → 17:25 (220 of 220 min + report). Brief: `docs/archive/context/40_RUN10_PROMPT.md`.
Log with every decision: `docs/archive/context/41_RUN10_LOG.md`. Matrix: `42_OS_MATRIX.md`.
Shots: `qa/loops/run10/` (local, untracked) — `type_target.png`, `os_face.png`, `sim/NN-*.png`, `break/NN-*.png`.

## A — TYPE v5: the target vs the result

`~/Desktop/jjay_css_refs/run10/mock_turret.png` (Ryan's approved target) beside the rebuilt Home hero:
`qa/loops/run10/type_target.png`. Same face (Turret Road 800), same weight relationships (solid DEBUG /
COMMIT TO, hollow YOUR MIND, split GRO|WTH in teal), same dek register (Martian Mono caps, three lines —
the first two sentences of the old-site paragraph), the fin line in Michroma.

| Role         | Face                                                                       | Where                                                                       |
| ------------ | -------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| display      | **Turret Road** 200–800 (800 for headlines)                                | every headline ≥ 28 px, poster words, KPI numerals, buttons                 |
| display-wide | **Michroma** 400                                                           | fin lines, the nav logotype, single-word rails                              |
| mono-display | **Martian Mono** 500 (400–700 ship)                                        | deks, protocol lines, ticker, readouts, every label ≥ 11 px, OS tile labels |
| mono         | JetBrains Mono                                                             | micro labels (9 px), code, tables, forms                                    |
| body         | Space Grotesk                                                              | paragraphs over 3 lines                                                     |
| OS display   | **Silkscreen** 700 (`os_face.png`: chunkier + cleaner than VT323 at 72 px) | OS titles, the T03 login headline, tile F/I words                           |
| legacy       | VT323                                                                      | binary rings, ticker digits                                                 |
| reserve      | Orbitron 700–900                                                           | shipped, unused (no band read light)                                        |

Gates: `grep -riE "unbounded|S01Word|type/glyphs|familjen|chakra|space mono|fontsource|fonts\.googleapis"
apps/web/src apps/web/index.html` → **0**; `npm run build && grep -r googleapis dist` → **0** (22 woff2 in
`dist/assets`, the two above-the-fold faces preloaded); `font_audit.mjs` green on **13 routes** (public +
OS realms); no horizontal scroll at 390 / 768 / 1024 / 1440 / 1920; outline 3 px / 3.5 px; stencil bars
4.5 % at 38 / 64 %; the drawn alphabet folder and the geometric display package deleted. The TYPE v5
specimen is the first band of `/styleguide` (every role at its size, the six treatments, the label
grammar, the four evidence images named).

## B — THE OS ACTUALLY WORKS

### Matrix (docs/archive/context/42_OS_MATRIX.md)

|                | ✅ works | ⚠️ partial | ❌ absent | n/a |
| -------------- | -------- | ---------- | --------- | --- |
| before (13:45) | 47       | 29         | 60        | 55  |
| after (17:05)  | **118**  | **5**      | **0**     | 86  |

The five ⚠️ left, each one line in its page's "what is not here": inheritance / handoff delete from the
UI (a repo file — `superseded` is the human path), ticker item reorder (edit the JSON order), audit filters
by actor / date range (table + search only), per-item inbox replay (replay-all is idempotent by client_id).

### `scripts/board_sim.mjs` — the semester, 25/25 (`make sim`, in CI)

| #   | step                                                                                                     | result                           |
| --- | -------------------------------------------------------------------------------------------------------- | -------------------------------- |
| 01  | sign in (LOCAL_DEV admin) → /os renders; ticker shows TERM                                               | ✅ `sim/01-signin.png`           |
| 02  | edit term F26 (dates, set current) → /about shows F26                                                    | ✅ `02-term.png`, `02-about.png` |
| 03  | add 6 officers (2 with photos, 1 admin, 1 typo'd then corrected inline) → /about lists them              | ✅ `03-officers.png`             |
| 04  | fill the 9-row ownership sheet → no owner is red                                                         | ✅ `04-ownership.png`            |
| 05  | sign in as OFFICER → admin controls absent AND API 403 on six writes                                     | ✅ `05-officer.png`              |
| 06  | publish WELCOME BACK → /news lists it; /news/welcome-back renders                                        | ✅ `06-news.png`                 |
| 07  | event + flyer → /events upcoming + Home band                                                             | ✅ `07-events.png`               |
| 08  | workshop series INTRO TO GIT, 3 sessions → /events groups them                                           | ✅ `08-workshops.png`            |
| 09  | change the Discord invite → footer AND /join carry the new URL                                           | ✅ `09-discord.png`              |
| 10  | 2 links + rename + reorder a category → /resources reflects all three                                    | ✅ `10-resources.png`            |
| 11  | import 40 (dry-run 0 → commit 40) → undo → 0 → re-import → 40                                            | ✅ `11-import.png`               |
| 12  | 6 members interested → member; meters update; 6 audit rows                                               | ✅ `12-members.png`              |
| 13  | public form submit → /os/projects submitted                                                              | ✅ `13-queue.png`                |
| 14  | request changes with a note → changes_requested; the student can read the note                           | ✅ `14-changes.png`              |
| 15  | resubmit, same slug → submitted; history preserved; no duplicate                                         | ✅                               |
| 16  | approve → publish → feature → /projects Featured; a 4th feature refused naming the three                 | ✅ `16-featured.png`             |
| 17  | dead URL → dead chip (no response); fix; re-check clears (200)                                           | ✅ `17-deadlink.png`             |
| 18  | edit a published post → unpublish → re-publish → /news removes then restores it with the edit            | ✅                               |
| 19  | archive an event → unarchive → /events hides then restores it                                            | ✅                               |
| 20  | two tabs edit the same post; the second saves → 409 CHANGED_ELSEWHERE; no clobber                        | ✅ `20-conflict.png`             |
| 21  | decision record + minutes → listed; files exist; validate_inheritance passes                             | ✅ `21-records.png`              |
| 22  | all 6 officers file a handoff → Today shows handoffs 6/6                                                 | ✅ `22-today.png`                |
| 23  | export the spine zip → every record written this run is in it                                            | ✅                               |
| 24  | rollover F26 → S27 → S27 roster (2 continuing), handoff stubs, /about shows S27 current + F26 in history | ✅ `24-rollover.png`             |
| 25  | sign out → /os → login with NOT_SIGNED_IN                                                                | ✅ `25-signout.png`              |

### `scripts/board_break.mjs` — the hostile board member, 16/16 (`make break`, in CI)

| #   | case                                                              | result                                                                                                          |
| --- | ----------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| 01  | every create form empty                                           | ✅ 4/4 forms flag per-field errors; counts unchanged; API 422                                                   |
| 02  | 50,000 chars                                                      | ✅ client caps (200 / 60000) with counters; server 422 naming `title`                                           |
| 03  | two "Welcome Back" posts                                          | ✅ `welcome-back-N`, `welcome-back-N-2`                                                                         |
| 04  | unicode / emoji / RTL / `<script>` / SQL                          | ✅ stored; rendered as literal text; no alert; no inline script; table intact                                   |
| 05  | 20 MB / .exe-as-.png / 1×1 / truncated                            | ✅ 413 · 415 · 422 · 415, each with the reason, `field: file`                                                   |
| 06  | double-click, Enter ×10, same client_id twice                     | ✅ one row each (one client_id per form session + in-flight guard)                                              |
| 07  | API down mid-write                                                | ✅ SAVED_LOCALLY · WILL_SYNC toast, 1 queued in the browser outbox → replayed on the next OS load, no duplicate |
| 08  | refresh mid-edit                                                  | ✅ beforeunload guard armed; DRAFT_RESTORED with the text                                                       |
| 09  | back/forward ×10, stale form                                      | ✅ 409 envelope; one row; the list re-renders fresh                                                             |
| 10  | session cleared, then Save                                        | ✅ `/os/login?next=/os/events&reason=session_expired`, chip shown, draft kept, restored after sign-in           |
| 11  | 16 write endpoints × anon / officer / tampered token (48 calls)   | ✅ 401 / 403 (officer never 500), all JSON envelopes                                                            |
| 12  | delete the current term / a handoff-filer / a category with links | ✅ 409 with the reason · archived instead (409 says so) · 409 naming the links, then cascade 200                |
| 13  | maintenance banner on / off                                       | ✅ shown on the public site, then gone (the public site now honours it)                                         |
| 14  | every feature flag off                                            | ✅ /projects labelled (slots), chat hidden, 7 pages 200, no page errors                                         |
| 15  | OS at 390 px, acts 2–3                                            | ✅ post saved, public submit lands, panel fits, no h-scroll, tables scroll                                      |
| 16  | keyboard only, acts 2–3                                           | ✅ Tab reaches the button, focus trapped, ⌘↵ saves, arrows walk rows, Enter opens, Esc closes; `make a11y` 0/0  |

Bugs these two scripts found and fixed on the way (all in the log): a Tier-1 write race that silently
re-seeded a table (the file vanished between two renames); Join reading the static Discord link; /about
hiding an empty current term; category order and `group_sort` dropped; the public site ignoring the
maintenance banner and the feature flags; one client_id per click; the local role cached per session;
drafts discarded before the request; the panel focusing its close button.

### Backend

Error envelope on every endpoint (`{ok:false, error:{code,message,field?}}`, HTTP and validation errors,
never HTML); `client_id` idempotency; `expected_updated_at` → 409 with both versions; archive / unarchive /
duplicate from `crud.make_router`; `patch_many` (one write for reorders / renames); atomic Tier-1 writes
(tmp → copy `.bak` → `os.replace`, a process lock around every read-modify-write) + `make restore` /
`make restore-empty`; uploads by magic bytes (≤ 2 MB, ≥ 16 px, 1600 px, EXIF stripped); structured write
logs; `/api/health` with row counts + last write; rate limit 5 / 5 min on public submits (already there);
**workshops** as a first-class entity (`routers/workshops.py`, `0004_workshops.sql`, `/api/workshops`,
`/os/workshops`, the Events page section). **pytest 125** (was 49; every router: roundtrip · 422 · 401 ·
404 · 409 · client_id · archive/duplicate, parametrised over 7 entities, plus the entity actions).

## Gate table

| Gate                        | Result                                                                                                                                                                       |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Matrix                      | ✅ 118 · ⚠️ 5 (named) · ❌ 0                                                                                                                                                 |
| `board_sim` / `board_break` | **25/25** · **16/16**, both in CI (`functional` job)                                                                                                                         |
| `make smoke`                | OS gate 12/12 · functional smoke 9/9 (adapted to the new form markup, a real date field, three featured)                                                                     |
| Fonts                       | grep gate 0 · build gate 0 · `font_audit` green on 13 routes · `type_target.png`                                                                                             |
| `make check`                | green at every commit (ruff · prettier · stylelint · markdownlint · oxlint · mypy --strict · tsc · pytest 125 · vitest · audits · guards · validators · ts-prune · depcheck) |
| `make a11y`                 | pa11y 10/10 · axe 0                                                                                                                                                          |
| Lighthouse                  | not re-run this run (run 9: 92 / 94 on the preview build; the font set is the only change to the public bundle)                                                              |
| Tracked repo                | ≈ 14.3 MB (fonts +0.4 MB)                                                                                                                                                    |
| Tests                       | pytest 125 · vitest unchanged (≥ 25 asked: the vitest count did not grow — named in the log)                                                                                 |
| Public site                 | unchanged except typography, the maintenance banner, the flags, the Workshops section and Join's live Discord link                                                           |

## What was cut (see `41_RUN10_LOG.md` "Left out")

`validate_data.py` cross-checks; inheritance `supersedes` picker / owners multi-select; typed per-key
site-settings controls; audit actor/date filters + per-item replay; `RUN SNAPSHOT`; a Lighthouse re-run;
the vitest count. Every OS control that exists works; the five partials say what is missing on their page.
