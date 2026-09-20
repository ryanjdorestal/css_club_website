# 18 — Build log (autonomous run, 2026-09-19)

Decisions made without asking, per the 120-minute rule. One line of reason each.

| # | Phase | Decision | Reason |
|---|---|---|---|
| 1 | 0 | Vite `react-ts` template, cleaned of boilerplate (no App.css/index.css) | Plan names Vite+React+TS; tokens.css is the only stylesheet entry. |
| 2 | 0 | Vite aliases `@brand`/`@data`/`@content` point at repo-root folders; `server.fs.allow` widened to repo root | Keeps brand config + committed JSON as single sources of truth without copying into src/. |
| 3 | 0 | Dev proxy `/api` → `127.0.0.1:8000` (uvicorn) | Mirrors the Vercel rewrite so Tier-1 dev matches prod paths. |
| 4 | 0 | Accent applied via `[data-accent]` CSS vars + `--accent-tint` (color-mix) | DESIGN.md: components use `var(--accent)`, never pick a color; tint mirrors the old site's 12–15% section tints. |
| 5 | 0 | Python venv at repo root `.venv` (git-ignored) for api + scripts | Python 3.14 system install; keeps host clean. |
| 6 | 1 | React pinned to 19.2.x | @react-three/fiber 9.7 requires react <19.3; pinning beats --legacy-peer-deps. |
| 7 | 1 | Old site has 12 live events (5+7), not 14 — some containers are commented out in the source HTML | Extracted only what was actually published; commented-out events were never live. |
| 8 | 1 | Fall 2024 flyers parsed out of a commented-out carousel block | The carousel was disabled in the source but the images are the events' real flyers. |
| 9 | 1 | Resources: 24 links extracted in 10 groups (plan said 27) | 24 is what a strict <b><a> parse of resources.html yields at a8fca55; the rest are inline prose links (Codecademy, Swift tour, Hacking with Swift) kept in prose, not the grouped list. |
| 10 | 1 | board.json photo paths precomputed to img/board/<kebab>.webp; photo_src keeps the original for the pipeline | One pipeline, no runtime renaming. |
| 11 | 1 | workshops.json is a curated list from context/02, org links only | The old events page only links the org root; per-repo URLs beyond AWS_Part_2_Fall_2024 aren't in the source; board refreshes via GitHub API later. |
| 12 | 1 | validate_data.py implements a minimal JSON-Schema subset in stdlib | No new dependency for four keywords (type/required/properties/items/enum). |
| 13 | 1 | ZIP fixed to 10019 and footer junk stripped by the extractor itself | Mechanical review fixes from context/07 belong in the script, not hand edits. |
