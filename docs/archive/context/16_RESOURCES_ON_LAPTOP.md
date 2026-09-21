# 16 — Resources on Ryan's laptop the build may use

Ryan (T18): "all my folders, skills, anything on my laptop is at your disposal as a
resource to help you build." Read freely. **Write only inside `~/Desktop/jjay_css/`.**

| Path | What it is | Use it for |
|---|---|---|
| `~/Desktop/LAGCC/rhec_web/rhecwb/` | The LaGCC platform (public site + RHEC OS). **Read-only.** | Endpoint contracts (`netlify/functions/*.js`, `netlify.toml`), SQL shapes (`supabase/migrations/*.sql`), OS route list (`os/`, `os/apps/`), `project-rules/*`, `docs/contributor-handoff/*`, QA scripts (`scripts/check-*.mjs`, `os-shots.mjs`, `os-contrast-rendered.mjs`), `data/*.schema.json`, the chat assistant KB shape. Re-implement; don't copy verbatim. |
| `~/Desktop/LAGCC/jjcss_cube/` | Same cube files as `assets/cube/` | — |
| `~/Desktop/LAGCC/google-survival-mode.md`, `inheritance.zip`, `rhec_ui_v3/` | RHEC's survival-mode manual, inheritance records, an earlier UI pass | Tier-1 patterns; record templates |
| `~/Desktop/UI:UX INSPO/` | 540-image reference library; `jj_inspo/` is the John Jay set; `_contact_sheets/` are 3×3 grids of everything | Look at `jj_inspo` before every component. |
| `~/Desktop/skills/` | Ryan's reusable skills, with `INVENTORY.md` | **Adopt:** `ui/design-tokens`, `ui/modern-reset`, `ui/prettier`, `ui/stylelint-static`, `accessibility/html-validate`, `accessibility/pa11y`, `accessibility/axe-runner`, `auditing/link-check` (lychee), `auditing/route-validator`, `auditing/broken-image-scan`, `auditing/repo-audit`, `static-cms/frontmatter-schema`, `static-cms/content-indexer`, `workflows/github-actions/*` (ci, pa11y, link-check, lighthouse), `workflows/pr-templates`, `workflows/issue-templates`, `discord/*`. Each has a `SKILL.md`. |
| `~/Desktop/ryanjdorestal/` | Ryan's portfolio (Next 16, React 19, Tailwind 3.4, framer-motion 12) | His own React/Tailwind conventions and component style; `assets/proof/rhec-os/` has RHEC OS screenshots |
| `~/Desktop/Graphics/` (`Flyers/`, `Appealing Visuals/`, `rhec_images/`) | Flyer and visual work | Flyer layout conventions for event cards |
| `~/Desktop/JJ/` | Ryan's John Jay coursework (CSCI 375, PHI 216, AFR 320, MAT 310) | Course names for the curriculum page; nothing else |
| `~/Downloads/` | `pre_upscale_cs_jj.png`, `cs_logo_sharp*.{svg,png}`, rhec logo files, flyers (`rhecflyer*.pdf`) | Already copied into `assets/`; flyers are RHEC's, not JJ's |
| `~/.claude/` (skills/settings) | Claude Code user config | Whatever skills are installed there apply |
| Cloud clone of the old site (session-only) | `github.com/jjcss/CSS_Website` at `a8fca55` | **Re-clone it** into `.cache/CSS_Website/` (git-ignored) for the extraction script. |

Rules: never modify rhecwb; never commit anything from `~/Desktop/JJ/`, `Resumes/`,
`Fourthorse/`, `AFRL/`, `Sator/`, `RyanOS/`, `Startup Archive/` — unrelated projects,
some sensitive. Never commit `.env*`.
