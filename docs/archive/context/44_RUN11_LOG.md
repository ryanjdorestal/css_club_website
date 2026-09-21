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
