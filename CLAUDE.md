# jjay_css — John Jay Computer Science Society: site + internal platform

**Status: BUILD AUTHORIZED under `context/15_EXECUTION_PLAN.md`.** Ryan's instruction:
run autonomously for **2 hours** without asking questions; decide, log, continue. All
prior decisions, analysis, references and assets are in `context/` and `assets/`.

## What this is

A public website + internal club platform ("OS") for the **Computer Science Society
(CSS) at John Jay College (CUNY)**. Built by Ryan Dorestal to hand to the club's board
once it's functional. Structured on the LaGuardia platform he already built
(`rhecweb` / RHEC OS) — **as a reference for structure, not as code to copy or migrate.**
New Supabase project, Vercel hosting, Python API, React front end, John Jay's own theme.

## Reading order (do this first, every session)

1. `DESIGN.md` — the look. Non-negotiable. John Jay's own palette/type; NOT rhecwb's.
2. `context/15_EXECUTION_PLAN.md` — the phased 2-hour plan with verification per phase.
3. `context/05_DESIGN_SYSTEM.md` — full design spec, refs by filename, tokens.
4. `context/08_SITE_STRUCTURE.md` — routes, OS, data model, repo layout.
5. `context/17_MASCOT_AND_CHATBOT.md` — the Bloodhound + the keyless Python chat.
6. `context/16_RESOURCES_ON_LAPTOP.md` — what you may read on this machine.
7. `context/04_STACK.md`, `03_PRIOR_ART_RHECWB_LAGCC.md`, `02_PRIOR_ART_JJCSS_OLD_SITE.md`, `07_CONTENT_MIGRATION.md` as needed.
8. `context/12_DECISION_LOG.md` and `13_CHAT_TRANSCRIPT_CONDENSED.md` for history; `11_OPEN_QUESTIONS.md` for what's still Ryan's call.

## Hard rules

- **Do not ask Ryan anything for the first 120 minutes of a build run.** Choose the option most consistent with `DESIGN.md` + `jj_inspo` + rhecwb's structure; log it in `context/18_BUILD_LOG.md`; continue.
- **Theme is John Jay's** (`DESIGN.md`): navy `#1E4664` family, teal `#6ED2E6`, section accents red `#CE4A4A` / green `#40A33F` / blue `#1E80F0` (the old site's own trio), Archivo + Poppins + JetBrains Mono + VT323. **No cream. No Inter. No rhecwb colors.** One accent per section.
- **`tokens.css` and `brand/brand.config.ts` exist before any component.** Components use `var(--accent)` and the brand config; never literal club names or hex.
- **Match `assets/refs/jj_inspo/` by hand.** No MCPs, no component registries. shadcn primitives only for OS forms/tables, restyled.
- **rhecwb (`~/Desktop/LAGCC/rhec_web/rhecwb`) is read-only.** Re-implement its endpoint contracts and SQL shapes; copy nothing verbatim; never write there; never touch its Supabase.
- **Vercel function-count guard:** `api/` holds ≤ 2 files (one FastAPI app). CI fails otherwise. This is what stops silent stale deploys.
- **Tier 1 always works:** `npm run dev` + `uvicorn` with zero accounts. Every API read falls back to committed JSON; every write falls back to a local inbox. Public pages never break when a service is down.
- **No secrets in the repo, no LLM providers, no API keys of any kind for features.** Supabase/Vercel env vars are infrastructure config, read only from the host.
- **Content from the old site** is extracted by script into `data/` + `content/`, never pasted into components. Keep the MIT notice; cite `jjcss/CSS_Website@a8fca55`.
- **The cube is the identity object**; the **Bloodhound is the mascot**. Red C = Events, Green S = Apps, Blue S = Join.
- Commit after every phase. Never push. Every phase produces a verification artifact in `qa/`.

## Repo layout (target — see `context/08`)

```
apps/web/        React + TS + Vite — public site and /os (one SPA); src/tokens.css
api/index.py     the one FastAPI app (+ requirements.txt) — ≤ 2 files in api/
brand/           brand.config.ts
data/ content/   committed JSON + markdown the site renders from (Tier 1)
supabase/        migrations for the NEW John Jay project
scripts/         extract_old_site.py, images.py, build_kb.py, validate_data.py, check_api_count.py
qa/              screenshots, test logs, REPORT.md
context/ assets/ this planning package + canonical brand files (read-only during builds)
```

## Owner

Ryan Dorestal — ryanjdorestal@gmail.com — GitHub `ryanjdorestal`. Not a `jjcss` org owner;
the repo is handed to the board when functional. Club: computersocjjay@gmail.com, org `jjcss`.
