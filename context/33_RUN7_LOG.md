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

## Checkpoint 30 min (23:45)
Read pass done (RHEC shape via a sub-agent: whoami rule, audit rows, one-handoff-per-person-per-term, honest status panel, "what is not here"). Contract written (34_OS_PLAN.md). api/_core scaffolded: config/db/tier1/store/audit/auth/lifecycle/models/crud/seeds/collections + 10 routers; index.py = one function. Smoke: every public read falls back; project → decide → publish → public; post → publish → /api/posts; link edit → /api/links; event → publish → nested shape; settings admin-gated; rollover.

## Checkpoint 60 min (00:15)
44 pytest green (api/_core/tests). Front end: session.tsx (Supabase OTP or LOCAL_DEV picker, PROD-guarded), osFetch, ui/{OsPage,OsTable,OsForm,Upload,useOs}, all 11 OS pages, routes wired, tsc clean. docs/RUNBOOK.md + docs/INDEX.json rendered on /os/inheritance.
