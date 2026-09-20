# 21 — Run 2 log (UI/UX rebuild, 2026-09-19)

## Checkpoint ~45 min
Loop 0 (shared layer) + Home loop 1 committed; About/Events/Apps/Cyberhounds/Resources/Join/News/404 rebuilt, shooting in progress.

## Decisions without asking (one line each)
| # | Decision | Why |
|---|---|---|
| 1 | `--accent-ink` var per band tone instead of Tailwind arbitrary variants | one var, no unparseable selectors; accent text auto-adapts dark/light |
| 2 | Watermark motif = the cube logo SVG on every dark band | rhecwb uses its one logo everywhere; we own exactly one mark |
| 3 | jj_07 "CSS" motif implemented as vertical display type in cube-blue, not traced Kufic panels | honest approximation; tracing Kufic-style lettering exceeds the time box |
| 4 | Cube trailing uses maath damp (λ≈4-6) rather than a literal cubic path with bulge | damp gives the ~150ms trail the brief wants; a bezier layer on top read as wobble in testing |
| 5 | Cube parks at gutter corners on light bands without their own keyframe row in the brief | it kept covering IndexList text at kf-less sections; parked = readable + still traveling |
| 6 | Footer cube dock: fixed-canvas cube shrinks onto the stamp lockup; static SVG under it hidden on md+ | "descends into the stamp lockup" with one canvas, no re-parenting |
| 7 | Ticket/stub corner notches via clip-path polygon, barcode from FNV hash of model string | deterministic, zero assets |
| 8 | Fall-2024 stat chips only where numbers are real; Apps hero states 0 LIVE APPS · REAL | no-fake-stats rule |
| 9 | HOUNDS/poster giant words use saturated --color-red on navy-900 (3.2:1, large-text AA) | accent-fg salmon reads weak at 176px; large-text threshold applies |
| 10 | rhecwb main.js/style.css read for morph-nav + reveal patterns; re-implemented in React/Motion, nothing copied | rules |
| 11 | compare.mjs notes rendered as plain SVG text (sharp has no foreignObject) | tooling fix mid-run |
| 12 | data/collaborate.json added via extractor + schema (openings/committees/ideas/suggestions) | Join/Home needed the old Collaborate lists; extraction stays scripted |
| 13 | Old About "What We Do" carried as its four activity-tile titles with one-line summaries | tile prose in the old page is image-embedded; titles are the content |
| 14 | 404 uses the jj_07 framed-panel treatment on paper with cube-blue | brief 6.9 |
| 15 | News planned issues use rhecwb's ISSUE NNN · PENDING + PLANNED chip pattern | makes an almost-empty section look intended, no fake posts |
