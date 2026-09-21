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

| #   | Decision                                                                                                                                                                                                                                | Why                                                                                                                                                                                   |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `.gitleaks.toml` carried a literal Google browser key (`AIzaSy…`) in its allowlist since run 8 — nothing in the repo or its history ever used it (the old site's public Maps key, allowlisted while `.cache/CSS_Website` was being read). Removed from the allowlist and scrubbed from history with `--replace-text` during the rewrite. | the file's own header says "allowlist by NAME only"; a key-shaped literal in a public repo invites a false report even when it is not ours |
| 2   | `apps/web/src/assets/hero.png` + `vite.svg` deleted (unreferenced Vite scaffold files) and `hero.png` removed from history as the brief asks                                                                                             | 13 KB, referenced nowhere                                                                                                                                                             |
| 3   | The nightly snapshot never pushes to `main` (the ruleset requires a PR + a green `check`, and `GITHUB_TOKEN` is not a bypass actor). It commits to the `snapshot` branch, opens one PR, dispatches CI on it (`workflow_dispatch` is the one event a `GITHUB_TOKEN` action may trigger) and enables auto-merge. | the brief asks for both "require a PR" and a committing bot; this is the only way both hold without a personal token in the secrets |
| 4   | The keepalive commits nothing. It writes `site_settings.keepalive` and reads it back (`scripts/keepalive.py`); `/api/health` and the OS read that row, and the HOSTING panel reads the workflow's last run from the GitHub API. `qa/keepalive.json` stays as a legacy fallback read only.                     | a bot commit every 3 days is a deploy trigger and a branch-protection fight for a timestamp                                     |
| 5   | "Deployments today" = CI runs on `main` pushes from the public GitHub API, read in the browser (60 req/h per viewer, no token). UNKNOWN while the repo is private.                                                                                                                                       | Vercel's own count needs a Vercel login or a token; the brief forbids a token for a feature                                    |
| 6   | The audit prune is ≥ 6 months, admin, typed PRUNE, and leaves its own record.                                                                                                                                                                                                                           | `records` is the only unbounded table; the pruned rows are in the nightly snapshot already                                    |
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
  + `GET /api/os/hosting`; `/os/system` HOSTING panel (`os/system/HostingPanel.tsx`, GitHub runs from the
  browser); audit prune ≥ 6 months (`POST /os/records/prune`, PRUNE typed confirm on /os/audit);
  `scripts/check_migrations.py` (sqlparse, in `scripts/requirements-dev.txt`) and `scripts/check_assets.mjs` in
  `make check` — 38 findings fixed (10 `<img>` tags, the PNG logo → WebP); `docs/HOSTING_LIMITS.md`,
  `docs/ENVIRONMENT.md`, `.env.example`. pytest 146.
