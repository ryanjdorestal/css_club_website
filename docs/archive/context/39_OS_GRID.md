# 39 — The OS grid, measured (R9_06 · 1120 × 788)

Run 9 §5.1. Every number below was read off `~/Desktop/jjay_css_refs/run9/R9_06_OS_DASHBOARD_STRUCTURE_EXACT.png`
by column/row projection (page bg ≈ rgb(14,14,16); tiles rgb(31,31,33); accent tiles rgb(83,90,127);
paper tile rgb(173,172,164)). `apps/web/qa-scripts/bento_overlay.mjs` re-checks the built page against
these boxes (gate: every edge within ±2 % of the grid box; measured 0.15 %).

## Frame

| Part | px | of page |
|---|---|---|
| Top strip | y 0–74 (ticker text at y 32–53: label row 32–38, value row 47–53) | 9.4 % |
| Grid box | x 17–1098 · y 75–771 | width 96.5 % · height 88.3 % |
| Margins | left 17 · right 22 · bottom 17 | ~1.5–2 % |
| Column bands | 17–280 · 290–553 · 563–825 · 836–1098 (≈ 264 each) | 23.6 % |
| Gutters | 10 px (columns and rows) | 0.9 % |
| Row tracks | 75–203 (129) · 214–340 (127) · 352–613 (262) · 624–771 (148) | 18.5 · 18.2 · 37.6 · 21.2 % of the grid height |

The 12-column grid is the four bands × 3. In CSS: `grid-template-columns: repeat(12, 1fr);
grid-template-rows: 129fr 127fr 262fr 148fr; gap: 10px; aspect-ratio: 1081 / 697`.

## Tiles

| Slot | Box (px) | Grid area | Role in the ref | Fill |
|---|---|---|---|---|
| A | 17,75 → 280,203 | 1 / 1 / 2 / 4 | `TODAY'S FOCUS` · `1.8` `/ 6H` · `⋮` | accent (slate) |
| B | 17,214 → 280,340 | 2 / 1 / 3 / 4 | `COMPLETED TASKS` · `2` `/ 5` · `⋮` | tile |
| C | 290,75 → 553,340 | 1 / 4 / 3 / 7 | `PAID INVOICES` · `24` `/ 32` · hairline · `TOTAL $6,000 / 12,000` · `⋮` | tile |
| D | 563,75 → 1098,340 | 1 / 7 / 3 / 13 | `TOTAL BALANCE (BTC)` · range `7D 30D 3M 12M` · big `1.592` · 5-bar histogram with one accent bar + callout | tile |
| E | 17,352 → 280,771 | 3 / 1 / 5 / 4 | `MJ FAST HOURS` · `↗` · `6.9` `/ 15H` · hairline · `LATEST WORKS` · 2×3 thumbnails | tile |
| F | 290,352 → 553,771 | 3 / 4 / 5 / 7 | line-art (quarter circle + diagonals) · `AESTHETIC-USABILITY EFFECT` · 3-line dek · 5-dot pager | accent (slate) |
| G | 563,352 → 825,613 | 3 / 7 / 4 / 10 | `CHATGPT API USAGE` · `5.01` `/ $18.00` · thin progress bar | tile |
| H | 836,352 → 1098,613 | 3 / 10 / 4 / 13 | ring gauge · `7.89` · `WORK-LIFE BALANCE` | tile |
| I | 563,624 → 1098,771 | 4 / 7 / 5 / 13 | `CUSTOM DASHBOARD` · `10/ 20 TEMPLATES` · `↗` | paper |

Tile anatomy: 0 radius, no border, padding ≈ 20 px, title micro caps top-left, `⋮` / `↗` top-right,
big numeral bottom-left with the `/ denominator` small and baseline-aligned to its right.

## Ours

Page `navy-900`, tiles `navy-800`, accent tiles = teal 18 % over `navy-700` (`--os-accent`), paper tile
`--color-paper`, ink as tokens. Tiles with the `⋮` menu (A, B, C) are `FolderCard`s with the tab as the
title (§3.5); the rest are plain `Tile`s. The icon rail (56 px, §6.2) sits left of the grid; the grid keeps
its proportions inside the remaining width. Under 900 px the tiles stack in A→I order.
Slot contents per module: `apps/web/src/os/ui/specs.ts` (the §5.2 table, numbers from the module's rows).
