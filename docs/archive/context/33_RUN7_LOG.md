# 33 — Run 7 log (CSS OS · Projects merge · code audit)

Start 2026-09-20 23:13 EDT. Budget 210 min (A ≤ 120 · B ≤ 30 · C ≤ 60). Contract: context/34_OS_PLAN.md.

## Decisions
| # | Decision | Why |
|---|---|---|
| 1 | `api/_core/` package (config, db, tier1, store, audit, auth, lifecycle, models, crud, seeds, routers/) — `index.py` stays the one function | §4; `_`-prefixed folders in api/ are helpers on Vercel; `vercel.json` also pins `includeFiles` (belt + braces, logged as unverified without a token) |
| 2 | Tier-1 OS writes go to `data/<table>.local.json` (gitignored) seeded from the committed JSON, plus a replayable inbox line | the OS is *usable* offline (edit → see it on the public page), not just "stored somewhere" |
| 3 | JWT verified by hand (HS256, `hmac`) — no PyJWT; emails validated with a 4-line check — no `email-validator` | zero new runtime deps; Supabase access tokens are HS256 |
| 4 | Public read endpoints reverse the flat rows into the existing JSON shapes (`{semesters:[…]}`, `{groups:[…]}`, `{terms:[…]}`) | the fallback contract and the page code stay the same; `useApi(path, fallback)` swaps sources |
| 5 | Current term = `F26` (Fall 2026) with an empty roster; migrated boards are `active:false` | nobody can log in by accident from the historical roster; `scripts/bootstrap_admin.py` adds the first admin |

## Checkpoint A (real clock 23:30 — 17 min)
Read pass done (RHEC shape via a sub-agent: whoami rule, audit rows, one-handoff-per-person-per-term, honest status panel, "what is not here"). Contract written (34_OS_PLAN.md). api/_core scaffolded: config/db/tier1/store/audit/auth/lifecycle/models/crud/seeds/collections + 10 routers; index.py = one function. Smoke: every public read falls back; project → decide → publish → public; post → publish → /api/posts; link edit → /api/links; event → publish → nested shape; settings admin-gated; rollover.

## Checkpoint B (real clock 23:36 — 23 min)
44 pytest green (api/_core/tests). Front end: session.tsx (Supabase OTP or LOCAL_DEV picker, PROD-guarded), osFetch, ui/{OsPage,OsTable,OsForm,Upload,useOs}, all 11 OS pages, routes wired, tsc clean. docs/RUNBOOK.md + docs/INDEX.json rendered on /os/inheritance.

## Checkpoint C (real clock 23:43 — 30 min)
Phase A committed (1818b10). Public pages now read the API first (News via /api/posts + /api/posts/:slug, Events, About board, Resources + links) with the committed JSON as the typed fallback (`lib/useApi.ts`). Phase B: /projects (Featured · Apps · Projects with 3 pitch slots · Submit with kind · How review works), /apps → /projects, nav PROJECTS, cube green face → /projects, Home §3 copy, KB + extractor + parity updated, Apps.tsx + apps.json deleted. Shots: qa/loops/run7/pub-*.png, no page errors.
| 6 | Public pages switched to `useApi(path, fallback)` rather than a global store | one hook, same JSON shape both sides; the pages' JSX did not change |
| 7 | The Google Maps footer embed loads Google's own scripts — that key is Google's public embed key, not ours | noted for the audit: no keys of ours anywhere in the bundle |

## Phase A + B closed (real clock 23:47 — 34 min)
All 11 modules shipped (no cut). scripts/snapshot.py (write · --check · --restore) run once so the committed JSON matches the OS shapes; scripts/bootstrap_admin.py; snapshot.yml (nightly, no-ops without secrets); keepalive.yml records qa/keepalive.json; SETUP.md = the 8 steps.

| 8 | Checkpoint headings above were first written with *estimated* times; corrected to the wall clock (`date`) at the audit | honesty — the run was far ahead of budget (A+B in 34 min, not 105) |
| 9 | `line-length = 200` in ruff | dense one-line dict rows are the house style; functions stay ≤ 60 lines; 14 wrapped lines were not worth the churn |
| 10 | Home split mechanically (sections → `pages/home/*.tsx`, tsc/oxlint prune the imports) | 446 → 34 lines; pixel diff vs the pre-split shot 1.4 % (live cube frames + marquee + clock), same height |
| 11 | `qa/archive/` (112 MB of run 2–6 loop shots) kept locally, gitignored, removed from the index | the repo a newcomer clones stays small; REPORT_*.md keep the conclusions |
| 12 | `scripts/test_api.py` deleted | its 11 tests are covered by `api/_core/tests/test_os.py` (44) |
| 13 | generated `api.types.ts` is ignored by ts-prune and used by the two public forms | a contract file is allowed to have unused members; CI checks it is current |

## Phase C (real clock 23:47 → 00:06 — 19 min)
`make check` green: ruff · mypy --strict · oxlint · tsc · pytest 44 · vitest 19 · api-count · schemas · ts-prune 0 · depcheck 0. Dead code removed (CornerBrackets, PixelDivider, SectionHeader, scn, StatChip alias, 4 retired font deps, 14 module-internal exports un-exported). README/ARCHITECTURE/CONTRIBUTING/SETUP + docs/{RUNBOOK,HANDOFF,DECISIONS,LATER,INDEX.json}; 17 folder READMEs; context/ → docs/archive/context/; CLAUDE.md rewritten to the current state; Makefile (install/dev/check/test/snapshot/hooks); CI rewritten; gen_types.py; newcomer_test.sh. Lighthouse desktop (prod dist): Home 97, Projects 94.

## Run complete (real clock 00:12 — 59 min of 210)
Newcomer test from a fresh clone: 53 s (gate ≤ 600 s), README steps only. Five commits + this one, never pushed. Rubric: every module ≥ 4 (qa/REPORT_RUN7.md). Not done: no Supabase project was provisioned (SETUP.md is the board's), so the online path is exercised by shape (db.py) not against a live database — logged honestly in the report.
