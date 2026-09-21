# First week — five days, one goal each

By Friday you have merged one real pull request. Everything else is optional.

## Day 1 — Run it, break nothing

Goal: `make dev` running, `make check` green, and you have published a post in the OS and seen it on `/news`.
Read `00_START_HERE.md`, `01_WHAT_THIS_IS.md`, `03_LOCAL_SETUP.md`. Open every public page and every OS module
once. Change `primary` in `data/site_settings.json`, reload `/`. Stop when the loop feels obvious.

## Day 2 — Learn the shape

Goal: you can say where a public page's data comes from and where an OS write goes. Read `ARCHITECTURE.md`
(one page) and `02_REALITY_MAP.md`. Then trace one thing end to end: `/os/events` → `apps/web/src/os/OsEvents.tsx`
→ `POST /api/os/events` in `api/_core/routers/events.py` → `store.Collection.create` → `data/events.local.json` and
`.cache/inbox/` → `GET /api/events` → `apps/web/src/pages/Events.tsx`. Run `make sim` once and watch the 25
steps go by — that is the whole platform used as the board.

## Day 3 — Pick an issue

Goal: a branch with a failing check that describes your change. Open the repo's issues filtered by
**good first issue**; each names the file, what "done" looks like and the command that proves it. Read
`CONTRIBUTING.md` (the worked examples) and `docs/CODE_STANDARDS.md` (what review checks). Branch:
`git checkout -b feat/<short-name>`. Write or extend the test first if the issue has one.

## Day 4 — Make it green

Goal: `make check` green, plus `make smoke` (and `make sim` if you touched the OS or an API write). Fix what
the linters say rather than silencing them. If your change touches UI, run `make a11y` and take a screenshot
for the PR. Commit in conventional form (`feat(os): …`, `fix(api): …`, `docs: …`).

## Day 5 — Ship it

Goal: the PR merged. Push, open the PR with the template (what · why · how verified · gate · docs), watch CI.
Address review comments the same day. When it merges, `main` deploys (once the Vercel project exists) and the
`post-deploy-smoke` workflow confirms the live SHA. Then write two lines in the issue about what surprised you —
that is the next doc fix.

## By Friday you should have

- `make dev`, `make check`, `make smoke` running from memory
- one merged PR and a second issue picked
- the three rules in `00_START_HERE.md` burned in, and `09_RISKS_AND_TRAPS.md` read once

## What not to do in week one

Touch Supabase or Vercel settings (nothing you need is there); rewrite a module "the right way"; add a
dependency; skip `make check` because "it is just docs" (markdownlint is in there for a reason); commit
`data/*.local.json`.
