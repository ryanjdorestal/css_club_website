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
| 14 | 2 | `--muted` nudged #9DB0C4 → #A2B4C8 | 4.46:1 on navy-600 missed WCAG AA by a hair; +2% lightness clears it (4.68) and is visually identical. Logged as the one palette deviation. |
| 15 | 2 | Added `--accent-fg` (lightened accent for text on dark) and `--accent-contrast` (text on accent fills) per accent | Saturated red/blue fail AA as text on navy-600; fills/borders keep the true accent, text uses the AA-passing tint. |
| 16 | 2 | Red/blue primary buttons use ink text at 4.16/3.62 (AA-large pass) | Matches the old site's own white-on-red CTAs; flagged in qa/contrast.txt; strict-AA option (tint fills) left as Ryan's call. |
| 17 | 2 | Ticker is CSS-only marquee; rings are pure SVG textPath | No JS animation cost; global reduced-motion rule freezes both. |
| 18 | 3 | Status strip shows TBA for next event + derived counts (board terms, events on record, resources) | No future events exist in the migrated data; "real numbers or nothing" — these are real and derived from committed JSON at build. |
| 19 | 3 | hero_transparent.png had no alpha (flattened on black); rebuilt via border flood-fill → alpha | Render pipeline artifact; keyed only border-connected black so cube seams survive. |
| 20 | 3 | Old repo's Fall 2024 flyer files are cross-named (First_General_Meeting.png contains the Sep-25 AI flyer); swapped in extractor | Verified against the artwork's own printed dates. |
| 21 | 3 | About page dedupes identical paragraphs (old site published the same copy under two headings) | Content bug carried in source; display-level dedupe keeps content/ faithful to the extraction. |
| 22 | 3 | Forms fall back to a localStorage inbox with an honest "saved on this device" message | Tier-1: no dead forms; API lands in phase 5. |
| 23 | 3 | News uses the light blue-tinted surface; every other public page stays dark | DESIGN.md: light surfaces are deliberate per-page choices; News is the reading page. |
