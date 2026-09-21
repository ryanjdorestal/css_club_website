# jjay_css — John Jay Computer Science Society: site + board platform

The public website (`/`) and the board's internal platform (`/os`) for the
Computer Science Society at John Jay College (CUNY). One React app, one
Python API, one Supabase project — and a **Tier 1** mode where everything
runs from the committed JSON with zero accounts.

## The 10-minute start

Needs Node 22+ and Python 3.12+ (see `.nvmrc`, `.python-version`).

```bash
git clone <this repo> jjay_css && cd jjay_css
make install        # npm deps + a .venv with the API deps        (~3 min)
make dev            # web on http://localhost:5173, API on :8000   (Tier 1)
```

- `http://localhost:5173/` — the site, reading `data/*.json` through the API.
- `http://localhost:5173/os` — the board platform (also `[ CSS_OS · BOARD ]` in the site's nav);
  pick **admin** in the LOCAL_DEV panel under the login form (no auth until Supabase is
  configured — SETUP.md).
- `make check` — lint + types + tests + guards (what CI runs). Should be green.

Try it: change `primary` in `data/site_settings.json` → reload `/` (the hero
tagline). Or add a resource on `/os/resources` → it appears on `/resources`,
and the write is logged in `data/records.local.json` + `.cache/inbox/`.

## The map

```
apps/web/          React + TS + Vite (Tailwind v4, Motion, R3F)
  src/pages/       one file per route; pages/home/ holds Home's sections
  src/os/          the board platform: session, ui/ (Bento · Dashboard · specs · TopStrip · Dossier · Trace), one file per module
  src/type/glyphs/ the drawn S01 display alphabet (hero + poster words)
  src/components/  cards/, frame/, type/ + the page-level pieces (Nav, Footer, PageHero…)
  src/cube/        the 3D cube (rail + spots); src/mascot/ the hound + chat
  src/sigils/ textures/ motion/ lib/   marks, backgrounds, reveals, helpers
api/index.py       the ONE Vercel function; api/_core/ holds the real code
                   (store, auth, audit, routers/, tests/)
data/ content/     the Tier-1 fallback: committed JSON + markdown the site renders;
                   content/inheritance/ is the board's spine (one folder per term, markdown + frontmatter)
supabase/          migrations + the schema the API expects
scripts/           snapshot, bootstrap_admin, extract_old_site, validators (each has --help)
brand/ assets/     brand.config.ts (names, palette, links) + brand files, cube, hound
docs/              RUNBOOK, HANDOFF, DECISIONS, LATER; docs/archive/ = planning history
qa/                REPORT_*.md per run + the latest shots (qa/loops is local: overlays, match sheets)
```

Read next: **ARCHITECTURE.md** (one page), **CONTRIBUTING.md** (how to add a
page / field / endpoint / OS module, with an example each), **SETUP.md** (going
live), **docs/HANDOFF.md** (the board's side).

## Rules that keep it working
- `api/` holds exactly `index.py` + `requirements.txt` + `_core/`. More top-level
  files = more Vercel functions = the silent-stale-deploy failure. CI checks.
- Every API read has a JSON fallback; every write has a local inbox. The public
  site never depends on Supabase being up.
- No API keys for features. No LLMs. The chatbot is a static keyword KB.
- Palette, type and voice: `DESIGN.md`. One accent per section.

## The gates (what green means)
`make check` is CI. `make a11y` (pa11y + axe, 0 findings), `make smoke` (the OS gate + the
9-step board-member smoke) and `make links` need `make dev` running. Every tool, where it
came from and what it found: `docs/SKILLS_ADOPTED.md`. Pushing: `docs/RELEASE.md`.

## Where to ask
computersocjjay@gmail.com · the club Discord · issues on this repo. Built by
Ryan Dorestal (2026) and handed to the board; content from the old site is MIT
(`SOURCES.md`).
