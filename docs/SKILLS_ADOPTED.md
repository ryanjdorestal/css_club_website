# SKILLS_ADOPTED.md — every skill in `~/Desktop/skills/`, decided (run 8)

The rule from the brief: **translate, don't transplant.** A skill was adopted only if it makes
this site or the board platform demonstrably more functional for a board with no developer.
"Adapt" = the idea, re-implemented for a React SPA + one FastAPI function. "Skip" = written
for another product (QUAY's Next.js/n8n, Sator's rover fleet, a Discord bot) or needs a key.

Every adopted tool runs from `make check` (CI) or from `make a11y` / `make smoke` / `make links`
(need a dev server or the network). Findings before → after are from this run, 2026-09-21.

## ui/
| Skill | Decision | Here | Findings |
|---|---|---|---|
| ui/prettier | adopt | `.prettierrc.json` + `.prettierignore` at the root; `npm run format` / `format:check` in `make lint` | reformatted once on adoption → 0 diffs |
| ui/stylelint-static | adopt | `.stylelintrc.json` (standard, Tailwind v4 at-rules allowed) over `src/**/*.css`; `npm run lint:css` in `make lint` | 2 → 0 |
| ui/design-tokens | adapt | `qa-scripts/tokens_gate.mjs`: no literal hex / club names in components; everything reads `tokens.css` + `brand.config.ts`. Allow-list: `Bloodhound.tsx` (mascot artwork) | 21 → 0 (glows now `brand.palette.*`, favicons trimmed) |
| ui/lighthouse-budget | adopt | `apps/web/lighthouserc.json` + `budget.json`; `.github/workflows/lighthouse.yml` on PRs (desktop preset, 2 URLs) | desktop 97 · mobile 60 (LCP 5.5 s, TBT 480 ms, JS 450 KB) — recorded, prerender in `docs/LATER.md` |
| ui/modern-reset | skip | Tailwind v4 preflight already is the reset; a second one would fight it | — |

## accessibility/
| Skill | Decision | Here | Findings |
|---|---|---|---|
| accessibility/pa11y | adopt | `.pa11yci.json`: 10 URLs (every public route + `/os/login`), WCAG2AA; `npm run a11y:pa11y`; `.github/workflows/a11y.yml` | 79 → 0 |
| accessibility/axe-runner | adopt | `qa-scripts/axe.mjs` (@axe-core/playwright) over the same routes + the OS as LOCAL_DEV admin | 233 → 0 |
| accessibility/html-validate | adopt | `.htmlvalidate.json`; `npm run lint:html` on `index.html` + `dist/index.html` (CI, after build) | 0 → 0 |

What the a11y fixes changed (all in tokens, none in layout): per-accent `--accent-paper` for text on
light tones, label opacity floors (0.72 dark / 0.85 light), `.sr-only` text instead of `aria-label`
on decorative spans, red on dark-3 uses `--color-red-hi`. See the ui-preservation diff in
`qa/REPORT_RUN8.md`.

**Manual checklist (not automatable — run once per new UI, tick in the PR):**
- Keyboard only: nav overlay opens/closes with Enter and Esc, focus returns to the button.
- Keyboard only: `/os/login` email form submits with Enter; the LOCAL_DEV buttons are reachable.
- Keyboard only: one OS editor (Posts) — open panel, tab through fields, save, close.
- Keyboard only: the chat widget opens, takes text, closes, restores focus.
- Screen reader (VoiceOver rotor): the cube canvas and the Cyberhound bust are announced once with
  a name, or not at all; the pennant, footer hound, marquees, binary rings and the status bar are
  `aria-hidden` (decorative) — nothing is read twice.

## auditing/
| Skill | Decision | Here | Findings |
|---|---|---|---|
| auditing/route-validator | adapt (SPA) | `qa-scripts/route_validator.mjs`: every `<Link to>` / `href` in `src/` resolves to a route in `App.tsx` or a public file | 0 |
| auditing/broken-image-scan | adapt | `qa-scripts/broken_image_scan.mjs`: every `src=` / `url()` in `src/` + `data/` + `content/` exists under `public/` | 0 |
| auditing/repo-audit | adapt | `scripts/repo_audit.mjs`: images over 400 KB (3D `.glb` budgeted by Lighthouse instead), TODO/FIXME markers in source, public assets nothing references | 6 → 0 |
| auditing/link-check | adopt | `lychee.toml` + `make links` (local) + `.github/workflows/link-check.yml` (weekly) | 86 links, 1 dead → 0 |
| auditing/html-validate | merged | same tool as accessibility/html-validate | — |

## static-cms/
| Skill | Decision | Here | Findings |
|---|---|---|---|
| static-cms/markdownlint | adopt | `.markdownlint.json` + `.markdownlintignore`; `npm run lint:md` in `make lint` (whole repo) | 20 → 0 |
| static-cms/frontmatter-schema | adapt | `data/schemas/inheritance.schema.json` + the single validator in `api/_core/spine.py` (required fields, enums, links, owners on roster, supersedes DAG, PII, secrets) | 0 |
| static-cms/inheritance-validator | adapt | `scripts/validate_inheritance.py` = the same rules, CLI, in `make check` + CI | 0 (smoke files pass too) |
| static-cms/content-indexer | adapt | `GET /api/os/inheritance` builds the index from the files (no generated index file to go stale); `docs/INDEX.json` for docs | — |
| static-cms/notion-fetch | skip | needs a Notion token; the spine is markdown in the repo on purpose | — |

## automation/ · workflows/
| Skill | Decision | Here | Findings |
|---|---|---|---|
| automation/env-validate | adapt | `scripts/env_validate.py` (in `make audit`) + the same check at API startup (`api/index.py`) — names, shapes, never values | 0 |
| automation/secret-scan | adopt | `.gitleaks.toml`; `.github/workflows/secret-scan.yml` on history; `gitleaks protect --staged` before a push | 0 leaks / 38 commits |
| automation/deploy-preview | skip | Vercel makes preview deploys itself; nothing to script | — |
| automation/netlify-functions | skip | Vercel, one FastAPI function | — |
| workflows/conventional-commits | adopt | `apps/web/commitlint.config.cjs`; CI lints the pushed range | last 6 commits pass |
| workflows/codeowners | adopt | `.github/CODEOWNERS` (`@ryanjdorestal` until the transfer; then the board's GitHub team) | — |
| workflows/pr-templates | adopt | `.github/pull_request_template.md` (what changed · which gate · manual a11y ticks) | — |
| workflows/issue-templates | adopt | `.github/ISSUE_TEMPLATE/{bug,content-update,feature,inheritance-update}.yml` | — |
| workflows/github-actions | adapt | `ci.yml` = `make check` + build + smoke; `a11y.yml`; `lighthouse.yml`; `link-check.yml`; `secret-scan.yml`; `functional` job = `make smoke` | — |

## discord/ — all skip
`interaction-handler`, `slash-commands`, `webhook-relay` each need a bot token or an application
public key — a key the club would have to own and rotate, which the brief forbids for features.
Recorded in `docs/LATER.md` with the env names they would need (`DISCORD_BOT_TOKEN`,
`DISCORD_PUBLIC_KEY`, `DISCORD_WEBHOOK_URL`). The invite link stays a plain link edited in `/os/site`.

## quay/ — selective
| Skill | Decision | Here |
|---|---|---|
| quay/deploy-push-checklist | adapt | `docs/RELEASE.md` |
| quay/ui-preservation | adapt | the run-8 gate: re-shoot Home/Projects/News/About, pixel-diff vs the run-7 baseline, only the nav button (and animations) may differ — `qa/REPORT_RUN8.md` |
| quay/supabase-schema | adapt | "Adding or changing a table" checklist in `supabase/README.md` |
| quay/architecture-review | adapt | "Boundaries" section in `ARCHITECTURE.md` (what may import what; checked by ts-prune/depcheck/mypy, not by a bot) |
| quay/safe-refactor | adapt (already) | `make check` is the pre/post gate; `scripts/gen_types.py` diff catches drifted API shapes |
| quay/internal-dashboard | skip | the OS is designed in `docs/archive/context/34_OS_PLAN.md`; QUAY's staff dashboard has different users |
| quay/client-portal · mentor-crm-model · activity-feed-model | skip | QUAY products (members portal, mentor CRM, Slack/Drive feed) — no equivalent here |
| quay/ai-feature-implementation · genius-team | skip | no LLMs in this repo (brief) |
| quay/n8n-boundaries | skip | no orchestrator; Vercel cron + one function |
| quay/vercel-nextjs-execution | skip | Vite SPA, not Next.js; `vercel.json` is 12 lines |

## sator/ — mostly skip
| Skill | Decision | Here |
|---|---|---|
| sator/readme-api-docs | adapt | `scripts/gen_api_docs.py` → `docs/API.md` from the FastAPI routes (84 endpoints); `make audit` fails if it drifts |
| sator/repo-audit | merged | into `scripts/repo_audit.mjs` (auditing/repo-audit) |
| sator/architecture-diagram | skip | `ARCHITECTURE.md` is one page by design; a generated C4 would be longer than the code |
| sator/test-scaffold | skip | pytest (49) + vitest already cover the API and lib; no testcontainers here |
| sator/clean-architecture-refactor · beta-execution-sequencer · sator-product-builder | skip | Sator process skills |
| sator/docker-deploy · edge-buffer-queue · incident-engine · mqtt-ingestion-adapter · sensor-hal · telemetry-schema · trust-contradiction-engine | skip | rover / telemetry platform — nothing to translate |

## tribunal — skip
An adversarial review panel for research artifacts. Nothing here is a manuscript; the closest need
(code review) is covered by CI + the PR template.

## docs/ (adoption-roadmap, do-not-pull, integration-notes, tier-guide)
Guidance, not skills. `do-not-pull.md` agrees with the skips above (no bots, no Notion).

## Totals
| Gate | Before | After |
|---|---|---|
| pa11y (10 URLs) | 79 | 0 |
| axe (10 URLs + OS) | 233 | 0 |
| stylelint | 2 | 0 |
| markdownlint | 20 | 0 |
| tokens gate | 21 | 0 |
| repo audit | 6 | 0 |
| route validator / broken images | 0 / 0 | 0 / 0 |
| html-validate | 0 | 0 |
| gitleaks (38 commits) | 0 | 0 |
| lychee (86 links) | 1 dead | 0 |
| functional smoke | 8/9 (sign-out covered by the status bar) | 9/9 |
| Lighthouse desktop / mobile | 97 / 60 | 97 / 60 (recorded) |
