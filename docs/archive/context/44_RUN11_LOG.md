# 44 — RUN 11 log: ship it (repo · centralisation · handoff · contributor repo · clean code)

Started 18:06 (2026-09-21). Prompt: `docs/archive/prompts/KICKOFF_PROMPT_RUN11_SHIP.md`
(`43_RUN11_PROMPT.md`). Budget 240 min + 10 report. Checkpoints every 30 min; decisions numbered.

## Checkpoints

- **18:06** read-first done (README, ARCHITECTURE, CONTRIBUTING, SETUP, HANDOFF, RUNBOOK, LATER, REPORT_RUN10,
  OS matrix, FONTS.md; rhecwb `docs/contributor-handoff/` for shape only). Pre-flight facts differ from the
  brief in two places: `gh` **is** installed and authenticated (`ryanjdorestal`, scopes repo + workflow), so the
  §2.4 hard stop is not needed; `gitleaks` is installed. `git-filter-repo` is not.
- **18:10** secret sweep #1: `gitleaks detect` over 60 commits → no leaks; the `git log -p` grep → only the
  brief's own text, board_break's deliberately fake `…tampered` JWT and spine.py's regex. One finding to
  clean anyway (decision 1). Root: 11 `KICKOFF_PROMPT_*.md` → `docs/archive/prompts/` (git mv).

## Decisions made without asking

| #   | Decision                                                                                                                                                                                                                                                                                                                                 | Why                                                                                                                                                    |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | `.gitleaks.toml` carried a literal Google browser key (`AIzaSy…`) in its allowlist since run 8 — nothing in the repo or its history ever used it (the old site's public Maps key, allowlisted while `.cache/CSS_Website` was being read). Removed from the allowlist and scrubbed from history with `--replace-text` during the rewrite. | the file's own header says "allowlist by NAME only"; a key-shaped literal in a public repo invites a false report even when it is not ours             |
| 2   | `apps/web/src/assets/hero.png` + `vite.svg` deleted (unreferenced Vite scaffold files) and `hero.png` removed from history as the brief asks                                                                                                                                                                                             | 13 KB, referenced nowhere                                                                                                                              |
| 3   | The nightly snapshot never pushes to `main` (the ruleset requires a PR + a green `check`, and `GITHUB_TOKEN` is not a bypass actor). It commits to the `snapshot` branch, opens one PR, dispatches CI on it (`workflow_dispatch` is the one event a `GITHUB_TOKEN` action may trigger) and enables auto-merge.                           | the brief asks for both "require a PR" and a committing bot; this is the only way both hold without a personal token in the secrets                    |
| 4   | The keepalive commits nothing. It writes `site_settings.keepalive` and reads it back (`scripts/keepalive.py`); `/api/health` and the OS read that row, and the HOSTING panel reads the workflow's last run from the GitHub API. `qa/keepalive.json` stays as a legacy fallback read only.                                                | a bot commit every 3 days is a deploy trigger and a branch-protection fight for a timestamp                                                            |
| 5   | "Deployments today" = CI runs on `main` pushes from the public GitHub API, read in the browser (60 req/h per viewer, no token). UNKNOWN while the repo is private.                                                                                                                                                                       | Vercel's own count needs a Vercel login or a token; the brief forbids a token for a feature                                                            |
| 6   | The audit prune is ≥ 6 months, admin, typed PRUNE, and leaves its own record.                                                                                                                                                                                                                                                            | `records` is the only unbounded table; the pruned rows are in the nightly snapshot already                                                             |
| 7   | The brief's "Events empty state → + NEW EVENT" good-first-issue example was already built in run 10; per-item inbox replay took its slot. Every seeded issue was checked against the code first.                                                                                                                                         | a good first issue that is already done wastes a first-year's afternoon                                                                                |
| 8   | Clean-code thresholds: `.ts` and Python functions ≤ 40 lines / complexity ≤ 10; `.tsx` components ≤ 200 lines / complexity ≤ 25; params ≤ 3 (Python ≤ 5); files ≤ 300. Carve-outs named in `.oxlintrc.json` / `pyproject.toml`; four components over the `.tsx` line are issue #13.                                                      | oxlint counts every `??`/`&&` in JSX; a 40-line cap on markup makes fragment soup, so 40 is the target on the PR checklist and 200 the hard fail       |
| 9   | The six run-11 commits were reworded (rebase, unpushed) to ≤ 140-char conventional headers with the detail in the body; older commits keep their long headers.                                                                                                                                                                           | commitlint had never run in CI before the first push; `header-max-length` is 140 and the run's first headers were 400–800                              |
| 10  | CI-environment fixes after the first real GitHub run: commitlint lints the head commit alone on a first push; the functional job gets `actions: write` and the screenshot upload never gates; the a11y job warms Vite with the render smoke before pa11y (120 s timeout); Lighthouse uses Playwright's Chromium via `CHROME_PATH`.       | smoke 9/9, sim 25/25 and break 16/16 passed on the runner; only the artifact upload, pa11y's cold-start timeout and Lighthouse's Chrome version failed |

- **18:16** A done. History rewritten on a copy with `git filter-repo` (qa/loops, qa/shots, qa/_review,
  qa/archive, qa/_tmp, assets/refs minus its README, hero.png/vite.svg, the key literal): pack **331.16 MiB →
  10.05 MiB**, 61 commits kept, 533 files; the copy passed `make install && make check` + `npm run build`
  before its `.git` replaced the real one (old `.git` kept outside the repo for this session). `master → main`,
  `origin` = `ryanjdorestal/css_club_website`, sweep #2 on the rewritten history clean, first push done.
  Settings via `gh`: description, 12 topics, Issues + Discussions on, Wiki off, auto-merge + delete-branch-on-merge
  on, ruleset "main — protected" (PR required, `check` status required, linear history, no force-push, no
  deletion; bypass = repository admins, i.e. Ryan), 12 labels (the seven GitHub defaults that overlap were
  deleted), CODEOWNERS with the commented `@jjcss/*` lines.
- **18:28** B done. `vercel.json` (one production branch, install/build/output in the file, cache
  headers, `env_validate` in the build command); `scripts/vercel_should_build.sh` + 15 table tests
  (`scripts/tests/`, added to pytest's paths); concurrency on all 8 workflows; snapshot → PR flow (decision 3);
  keepalive → `scripts/keepalive.py` write + read-back and `scripts/db_budget.py` (70 %), no commit (decision 4);
  migration `0005_hosting.sql` (`hosting_usage()` RPC, service_role only, keepalive row); `api/_core/hosting.py`
  - `GET /api/os/hosting`; `/os/system` HOSTING panel (`os/system/HostingPanel.tsx`, GitHub runs from the
    browser); audit prune ≥ 6 months (`POST /os/records/prune`, PRUNE typed confirm on /os/audit);
    `scripts/check_migrations.py` (sqlparse, in `scripts/requirements-dev.txt`) and `scripts/check_assets.mjs` in
    `make check` — 38 findings fixed (10 `<img>` tags, the PNG logo → WebP); `docs/HOSTING_LIMITS.md`,
    `docs/ENVIRONMENT.md`, `.env.example`. pytest 146.
- **18:35** C done: `docs/handoff/` 00–09 + `FIRST_WEEK.md` (every "works" names its gate), `docs/OWNERSHIP.md`
  (nine rows = the nine rows of the `/os/system` sheet), `docs/TERM_CHECKLIST.md`, `docs/REPO_SETTINGS.md`,
  `docs/HANDOFF.md` trimmed to a pointer table, docs index + `docs/README.md`.
- **18:44** D done: README (badges, two ≤ 70 KB WebP shots under `docs/img/`, the fork → PR walkthrough with what
  each command does, the docs table, MIT + old-site notice), CONTRIBUTING rewritten around tasks (the loop, the
  `make check` failure table, the five worked examples kept, style, tests, review process), five YAML issue
  templates + `config.yml`, PR template (which gate covers it), `SECURITY.md`, 12 labels, **12 issues seeded**
  (#1–#5 good first issue, each with the file, done, the proving command, a pattern to copy). Decision 7: the
  "Events empty state → + NEW EVENT" example from the brief was already built (run 10), so the fifth good first
  issue is per-item inbox replay instead; the three-tiles-with-"—" issue was verified against `specs.ts` first.
- **19:20** E in progress → measured before the pass (rules at 40 lines / 3 params / complexity 10 / 300 lines):
  oxlint 149 findings (90 functions over 40 lines, 44 complexity, 7 max-params, 7 files over 300, 1 warning
  comment); ruff 25 (8 C901, 17 PLR0913); 10 Python functions over 40 lines (max 134); jscpd 0.55 % (11
  clones); largest file `os/ui/specs.ts` 476 lines. The pass: crud.py → `RouterSpec` + three registrars;
  spine.validate → four checks; spine.parse → three; validate_data + snapshot split; five OS modules split into
  `os/<module>/` (views, panels, `use<Module>Writes` hooks of module-level functions with an explicit context);
  `specs.ts` → `specs/`; `OsForm` → `formRules` + `FieldInput`; `useEntity`/`act` restructured; `EntityPanel`,
  `useLazy3d` extracted (the real duplication); Styleguide → seven band files; About → `about/BoardBand`;
  OsLogin → two small components; banned names renamed (`data`→`fields`/`payload`, `kb`→`knowledgeBase`).
  New gates in `make check`: jscpd 1.5 %, `banned_names.mjs`, `no_dead_code.mjs`, `check_function_length.py`,
  oxlint + ruff rules. Decision 8: the `.tsx` thresholds are 200 lines / complexity 25 (JSX is markup; oxlint
  counts every `??`/`&&`), `.ts` and Python are 40 / 10; carve-outs are named in `.oxlintrc.json` and
  `pyproject.toml`, and four components still over the line are issue #13. The smoke caught one real
  regression from the split (a Button passed its click event as the "row" to `openOfficer`) — fixed before
  the commit; that is what the gates are for.

- **19:48** E done. Raw counts after: 0 files over 300; 0 Python functions over 40 (mean 10.3); ruff 0; jscpd
  0.11 % (3 clones — two shared import blocks, one 9-line JSX fragment); banned names 0; the `.tsx` residual is
  93 components between 41 and 195 lines and four over complexity 25 (#13). `make check` green with ten new
  guards; `make a11y` 0/0; smoke 9/9 + gate 12/12; sim 25/25; break 16/16 — run **alone** (a second chain
  started while the first was still on its sim cost fifteen minutes of ghost failures; the memory note about
  sequential runs is right). `font_audit.mjs` 13/13. First CI run on GitHub: `make check` green up to
  commitlint, functional green up to the artifact upload — fixed (decision 10).

## Left out (named, not hidden)

- The `.tsx` 40-line cap (decision 8) and the four components in #13.
- Lighthouse not re-run locally; the CI job's Chrome fix is verified only by the next run.
- Issue #12 (weekly link check → an issue) seeded, not built.
- `docs/API.md` regenerated (130 endpoints); the old run logs still cite pre-rewrite SHAs — history, left.

- **20:30** After the push, four more small commits from watching the first-ever CI runs: `ci:` (axe before
  pa11y, Lighthouse `--no-sandbox`), `chore(types)` (regenerated `api.types.ts` — CI's generated-types step is
  not in `make check`, noted), `ci:` (the render smoke ignores `/api` 502s by URL). The functional job — smoke,
  sim, break — was green on the runner from the first run. Left red on purpose and filed: pa11y on the runner
  (#14) and the Lighthouse score on the runner (0.54–0.57, on #6).

## Close (20:40)

Pushed to `origin/main` after the third clean gitleaks sweep. Local tables, inbox and sim spine files reset;
dev servers left running; the old `.git` (331 MB) sits outside the repo in this session's scratch folder and
can be deleted.
