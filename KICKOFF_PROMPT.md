# Kickoff prompt for Claude Code

Paste everything below the line into Claude Code, opened in `~/Desktop/jjay_css`.

---

You are building the John Jay Computer Science Society website + internal platform in this folder. Everything is already decided and documented — your job is execution, not planning.

Start by reading, in this order: `CLAUDE.md`, `DESIGN.md`, `context/15_EXECUTION_PLAN.md`, `context/05_DESIGN_SYSTEM.md`, `context/08_SITE_STRUCTURE.md`, `context/17_MASCOT_AND_CHATBOT.md`, `context/16_RESOURCES_ON_LAPTOP.md`. Then look at every image in `assets/refs/jj_inspo/` and `assets/refs/club/` before you write a single component — that is the look you are matching, by hand.

Run `context/15_EXECUTION_PLAN.md` phase by phase: 0 scaffold → 1 content extraction → 2 design system + shell → 3 public pages → 4 cube + Bloodhound mascot + chat widget → 5 Python API + Supabase migrations + CI → 6 OS shell if time remains. Each phase ends with a verification artifact in `qa/` (screenshots via Playwright, test logs, check output) and a git commit. Respect each phase's time box and its "minimum" line.

Rules you do not break:
- Do not ask me anything for the first 120 minutes. When something is ambiguous, choose the option most consistent with `DESIGN.md`, the `jj_inspo` refs, and rhecwb's structure, write the choice and a one-line reason to `context/18_BUILD_LOG.md`, and keep going.
- The theme is John Jay's own (`DESIGN.md`): navy `#1E4664` family, teal `#6ED2E6`, section accents red `#CE4A4A` / green `#40A33F` / blue `#1E80F0`, fonts Archivo + Poppins + JetBrains Mono + VT323. No cream, no Inter, no rhecwb colors. One accent per section. `apps/web/src/tokens.css` and `brand/brand.config.ts` exist before any component.
- `~/Desktop/LAGCC/rhec_web/rhecwb` is a read-only reference for structure (endpoint contracts, SQL shapes, OS route list, project-rules, QA scripts). Re-implement; copy nothing verbatim; never write there. Use `~/Desktop/skills/*` (see `context/16`) wherever the plan names them. Everything else on this Mac is available to read; write only inside this folder.
- Backend is Python: one FastAPI app in `api/index.py`, ≤ 2 files in `api/`, CI-enforced, so Vercel's function limit can never be hit and deploys can never silently go stale. No LLM providers, no API keys for features. The chatbot is a static-KB port of rhecwb's assistant, in Python, fronted by the John Jay Bloodhound mascot with emotes that you design from the YouTube banner.
- Tier 1 always works: `npm run dev` + `uvicorn` with zero accounts; every API read falls back to committed JSON, every write to a local inbox. Public pages never break when a service is down.
- Old-site content is extracted by script into `data/` and `content/` (re-clone `github.com/jjcss/CSS_Website` into `.cache/`), never pasted into components. Keep the MIT notice; cite commit `a8fca55`.
- Commit after every phase. Never push. No secrets, no `.env*` committed.

At 120 minutes (or earlier only if every phase through 5 is green), stop and write `context/18_BUILD_LOG.md`, `qa/REPORT.md` (what's green, what was cut, screenshot index), and `SETUP.md` (the ~10-minute human steps: Vercel project, new Supabase project + migration, env vars, repo secret). Then give me the exact list of what I need to do or decide next. Go.
