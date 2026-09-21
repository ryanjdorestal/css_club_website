<!-- CLAUDE.md stays at the repo root on purpose: it is the entry point for the coding agent (Claude Code). Humans start at README.md. -->
# jjay_css — John Jay Computer Science Society: site + board platform

**Status: feature-complete and audited (2026-09-21). Public site (`/`) + board
platform (`/os`) both work in Tier 1 with zero accounts. Next: the board goes
live with `SETUP.md` (8 steps) and takes over per `docs/HANDOFF.md`.**

## What this is
A public website + the board's internal platform ("CSS OS") for the Computer
Science Society at John Jay College (CUNY). Built by Ryan Dorestal to hand to
the board. Structured on the LaGuardia RHEC OS platform *as a reference for
structure only* (`~/Desktop/LAGCC/rhec_web/rhecwb` is read-only; nothing copied).
New Supabase project, Vercel hosting, one Python function, React front end,
John Jay's own theme.

## Read first
`README.md` (10-minute start + map) → `ARCHITECTURE.md` (one page) →
`CONTRIBUTING.md` (four worked examples) → `DESIGN.md` (the look, non-negotiable).
Planning history and every build-run prompt/log live in `docs/archive/context/`
(run numbers survive only there).

## Hard rules
- **Theme is John Jay's** (`DESIGN.md`): navy `#1E4664` family, teal `#6ED2E6`,
  section accents red `#B3202A` (Events, Cyberhounds) / green `#40A33F`
  (Projects) / blue `#1E80F0` (Join, About, News). Unbounded + Space Grotesk +
  JetBrains Mono (+ VT323 for the binary whisper). **No cream. No Inter. No
  rhecwb colors.** One accent per section. Tokens only — `var(--accent)`,
  `brand.*` — never literal club names or hex in components.
- **`api/` = `index.py` + `requirements.txt` + `_core/`. Nothing else.** One
  Vercel function, always; `scripts/check_api_count.py` fails CI otherwise.
  This is what stops silent stale deploys.
- **Tier 1 always works:** `make dev` with zero accounts. Every read falls back
  to `data/*.json`; every write lands in `data/*.local.json` + `.cache/inbox/`
  (replayable). The public site never depends on Supabase being up.
- **No secrets in the repo, no LLM providers, no API keys for features.** The
  service key exists only in Vercel's env; the browser holds the anon key only.
- **Every OS write is audited** (`records`), roster-gated (`board_profiles`
  active row on the current term → officer/admin; else guest), and has a
  "What is not here, and why" block on its page.
- **Content from the old site** is extracted by script into `data/` +
  `content/`, never pasted into components. MIT notice kept; cite
  `jjcss/CSS_Website@a8fca55` (`SOURCES.md`).
- **The cube is the identity object** (red C = Events, green S = Projects,
  blue S = Join); the **Bloodhound is John Jay's mascot** (footer, board-owned);
  the **Cyberhound** (pixel + 3D pitbull) is the CTF sub-club's mark.
- Size budget: files ≤ 400 lines, components ≤ 200, Python functions ≤ 60.
  `make check` must stay green (ruff, mypy --strict, pytest, vitest, tsc,
  ts-prune, depcheck, api-count, schemas).
- Commit per phase. Never push from an agent session. Every run leaves a
  `qa/REPORT_*.md`.

## Layout
```
apps/web/     React + TS + Vite — pages/, os/, components/, cube/, mascot/, sigils/, textures/, motion/, lib/
api/          index.py (the one function) + _core/ (store · auth · audit · crud · routers/ · tests/)
data/ content/  Tier-1 fallback (JSON + markdown); snapshot.py keeps them current
supabase/     migrations 0001 (site) + 0002 (OS)
scripts/      snapshot, bootstrap_admin, check_api_count, validate_data, gen_types, newcomer_test, migration
brand/ assets/  brand.config.ts · logos, cube, hound (+ builders), refs
docs/         RUNBOOK · HANDOFF · DECISIONS · LATER · archive/context (history)
qa/           REPORT_*.md + the latest shots
```

## Owner
Ryan Dorestal — ryanjdorestal@gmail.com — GitHub `ryanjdorestal`. Club:
computersocjjay@gmail.com, org `jjcss`. The repo transfers to the board when
they go live.
