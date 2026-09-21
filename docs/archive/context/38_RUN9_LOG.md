# 38 — Run 9 log (type v4 · folder cards · T03 login · OS bento · ops layer)

Start 2026-09-21 (see checkpoints). Budget 210 min (+10 report). Brief pasted as "37 — RUN 9"
(`KICKOFF_PROMPT_RUN9_TYPE_V4_OS_GRID.md`). First run of Opus 5 on this repo.

## Baseline
Dev server already up (web :5173 200, api :8000 ok, tier local). `make check` run once before any edit — see §A.
Mac font folders (`~/Library/Fonts`, `/Library/Fonts`): DM Mono, IBM Plex Mono, Space Mono, Syne Mono,
Press Start 2P, VT323, Arial Unicode — no wide-rounded-geometric face on this machine; every display
candidate comes from `@fontsource/*` (OFL), installed into a scratch folder for the match, and only the
winners into `apps/web`.

## Decisions
| # | Decision | Why |
|---|---|---|
