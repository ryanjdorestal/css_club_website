# REPORT_RUN9 — type v4 (the S01 face) · folder cards · T03 login · the OS on the exact grid · ops layer

2026-09-21, 10:58 → 12:35 (≈ 97 of 210 min). Brief: `docs/archive/context/37_RUN9_PROMPT.md`
(`KICKOFF_PROMPT_RUN9_TYPE_V4_OS_GRID.md`). Log with every decision: `docs/archive/context/38_RUN9_LOG.md`.
Shots, sheets and overlays: `qa/loops/run9/` (local, untracked — the repo stays slim).

## The two font winners, with their scores
- **Display: nothing clears the gate → the S01 alphabet is drawn.** `scripts/type_match.mjs` renders each
  candidate at the reference cap height, binarizes both, aligns by bounding box, fits tracking, and scores
  IoU (overall + per glyph), stroke ratio and corner fill. 43 candidates (every wide/rounded/squared face on
  fontsource + the brief's list; the Mac font folders hold no wide-rounded-geometric face). Best **Familjen
  Grotesk 700 at 0.523**; Unbounded 900 (the baseline) 0.321. The rule was IoU ≥ 0.82 → **fallback path**:
  Unbounded stays the H1/H2 face; hero + poster words are `apps/web/src/type/glyphs/` (26 caps + digits +
  `.,:/-_'!&`, stroke 12 % of cap, outer corners ≈ 2× stroke, squared counters, M 1.19 · N 0.90 · O 0.75 ·
  E 0.67 wide — all measured from `R9_01a`). `<S01Word>` keeps Stencil / Outline / SplitFill as SVG masks.
- **Body mono: Space Mono 700/400 — IoU 0.327** (Chivo Mono 0.310, Red Hat Mono 0.310; JetBrains Mono 600
  0.246 — beaten by 0.08). `--font-mono-display`. Licence: SIL OFL 1.1 (`@fontsource/space-mono`).
- **OS display: VT323 — IoU 0.451** vs the T03 headline (DotGothic16 0.439, Micro 5 0.395, Silkscreen 700
  0.205). Already installed → zero new bytes. `--font-os-display`, ≥ 20 px only. Licence: OFL 1.1.
- Dropped before rendering: Nasalization (Typodermic's free EULA is desktop-only; web embedding is a
  separate licence — no OFL file to test).

### Display — vs `R9_01a` (EMON; ref stroke 0.117 of cap, corner fill 0.26)
| # | face | IoU | glyph mean | width | stroke | tracking |
|---|---|---|---|---|---|---|
| 1 | Familjen Grotesk 700 | 0.523 | 0.49 | ×1.01 | 0.191 | +0.01em |
| 2 | Play 700 | 0.485 | 0.457 | ×1.00 | 0.213 | -0.05em |
| 3 | Exo 2 800 | 0.466 | 0.453 | ×1.00 | 0.237 | +0.01em |
| 4 | Bakbak One 400 | 0.460 | 0.435 | ×1.00 | 0.236 | -0.02em |
| 5 | Space Grotesk 700 | 0.451 | 0.436 | ×1.00 | 0.175 | +0.09em |
| 6 | Aldrich 400 | 0.449 | 0.485 | ×1.00 | 0.154 | -0.06em |
| 7 | Saira 900 | 0.435 | 0.428 | ×0.99 | 0.310 | +0.00em |
| 8 | Titillium Web 900 | 0.434 | 0.419 | ×1.00 | 0.334 | +0.03em |
| … | Unbounded 900 (baseline) | 0.321 | 0.305 | ×1.24 | 0.309 | -0.01em |

### Body mono — vs `R9_01b` (49 chars; ref stroke 0.145 of cap)
| # | face | IoU | glyph mean | width | stroke | tracking |
|---|---|---|---|---|---|---|
| 1 | Space Mono 700 | 0.327 | — | ×0.99 | 0.180 | -0.03em |
| 2 | Chivo Mono 600 | 0.310 | — | ×1.00 | 0.175 | +0.00em |
| 3 | Red Hat Mono 600 | 0.310 | — | ×1.00 | 0.164 | +0.02em |
| 4 | Ubuntu Mono 700 | 0.299 | — | ×1.00 | 0.170 | +0.05em |
| 5 | B612 Mono 700 | 0.287 | — | ×1.02 | 0.178 | +0.02em |
| 6 | Fira Mono 700 | 0.280 | — | ×1.02 | 0.183 | +0.05em |
| … | JetBrains Mono 600 (baseline) | 0.246 | — | ×1.00 | 0.142 | +0.04em |

### OS pixel — vs the T03 headline crop (AI-POWERED; ref stroke 0.128 of cap)
| # | face | IoU | glyph mean | width | stroke | tracking |
|---|---|---|---|---|---|---|
| 1 | VT323 400 | 0.451 | — | ×1.00 | 0.144 | +0.08em |
| 2 | DotGothic16 400 | 0.439 | — | ×1.00 | 0.088 | +0.20em |
| 3 | Micro 5 400 | 0.395 | — | ×0.99 | 0.186 | +0.02em |
| 4 | Jersey 25 400 | 0.386 | — | ×1.01 | 0.205 | +0.04em |
| 5 | Pixelify Sans 700 | 0.384 | — | ×1.02 | 0.185 | -0.02em |
| 6 | Jersey 20 400 | 0.384 | — | ×1.00 | 0.204 | +0.05em |

Sheets: `qa/loops/run9/type_match_{display,mono,pixel}.png` (+ `.json`); the specimen (alphabet, before/after
of the hero, the three roles) is the first band of `/styleguide`.

## What changed
1. **Type v4** — tokens `--font-mono-display` / `--font-os-display`; `.t-dek` (S01 body register for deks
   ≤ 3 lines; longer paragraphs stay Space Grotesk sentence-case), `.t-kpi`, `.t-os-display`; the ticker and
   fin lines in Space Mono; `--type-hero` clamp(56px, 9.5vw, 160px). Per-realm `font_audit.mjs` (public ·
   OS), green on 13 routes. The S01 words on Home (4 lines), Cyberhounds (CYBER / HOUNDS), the Home
   Cyberhounds poster, every PosterBand. **Dossier heroes** on Home + Cyberhounds: 48 px grid, two 1-bit
   halftone photo blocks (`SEC-01`/`SEC-02` chips), the accent outline path drawn in on reveal ending in a
   registration circle, `[ ↓ SCROLL_TO_REVEAL ]` (Lenis, gone after the first scroll). H1 still dominant;
   nothing over the cube's mesh.
2. **FolderCard** (`components/cards/FolderCard.tsx`) — one `clip-path: path()` measured by ResizeObserver:
   tab top-left (34 % · 9 %, 4 px outer radius, 45° inner cut), optional mirrored tab, one chamfer, hairline
   on the same path, two-tone split, rotated edge label, barcode; hover lifts the tab; the focus ring follows
   the path. Surfaces: Resources categories (public + OS), non-app Projects (two-tone, screenshot above),
   About §5 officers (dossier sheet inside), Join's Discord card (paper, mirrored), Events slot 02, OS
   inheritance records + the record view, OS board officers, OS tiles with a `⋮` (A, B, C), styleguide story.
   TicketCard / PosterCard untouched.
3. **Login on T03** — compact public nav; 48 / 52 field; `+` marks 24 px in; `//CSS_OS · BOARD_ACCESS`; the
   3D cube (420 px, teal rim, idle spin, drag) on `DotGrid`; the 5-step readout `● LOGIN ○ ROSTER ○ SESSION
   ○ OS ○ AUDIT` (fills as the login progresses); the black panel with a bottom-right chamfer, `BOARD /
   ACCESS` in VT323, the two-line dek, `[1] [2] [3]`, the form between the list and `01 / 05`. Run-8 states
   unchanged; `LOCAL_DEV` is a strip under the panel (dev only). Mobile stacks (field 42 vh).
4. **The OS on the R9_06 grid, exact** — `docs/archive/context/39_OS_GRID.md` (every box in px, measured
   by projection). `os/ui/Bento.tsx` (12 cols, row tracks 129 · 127 · 262 · 148, 10 px gutters, aspect
   1081 / 697, tiles A–I in fixed areas, stacked under 900 px), `Tile` · `Kpi` · `Histogram` · `Ring`
   (+ `segments`) · `Bar` · `Range`; `TopStrip` (launcher glyph → 3×4 module grid, `⌘K`, 7-cell ticker
   TERM · OFFICERS · PENDING · POSTS · PROJECTS · DB · SYS.TIME, user chip); `Dashboard` + `specs.ts` (the
   §5.2 table: every module fills the same nine slots from its own rows; `—` + `NO_DATA_YET` where there is
   nothing to count). Every module page = the grid, a hairline, then the run-7 working surface.
5. **Ops layer** — realm shell (scanlines 3 %, 32 px grid 4 %, `SYS VER {version}.{sha7}`), the 56 px icon
   rail (sigils, red pulsing edge on the active cell, tooltips, accessible names), `DossierCard` +
   `DossierStack` (Members rows, Board officers inside folders, Audit who-hover, the Members tile E), `TraceStrip`
   (canvas, real per-day counts per table, 8 px/s drift, static under reduced motion; Audit's hero + Today's
   tile D background), the red 5-cell segmented tab strip (`Chips`) + `Meter`s beside it, `SubjectSheet`
   (`[ REFRESH ]`, key/values, dial, waveform) on System + Audit, the System dial in `segments` mode (one per
   health check, red when not live, click → the runbook line). No cube in the OS.

## Overlays and gates
| Gate | Result |
|---|---|
| Face match (rubric 1) | display: no face ≥ 0.82 → drawn alphabet (logged); mono: Space Mono by the same test; pixel: VT323; `font_audit` green per realm (13 routes) |
| Type applied (2) | every public page re-shot at 1440 (+ 390 for Home, Cyberhounds, About, login); no H1 on a third line; treatments intact; specimen band on `/styleguide` |
| Dossier heroes (3) | `qa/loops/run9/{home,cyber}-hero-b.png` |
| FolderCard (4) | 8 public/OS surfaces + the story; silhouette sheet `qa/loops/run9/folder-0.png`, surfaces `folder-surfaces.png` |
| Login vs T03 (5) | `qa-scripts/login_overlay.mjs`: split Δ0.8 % · panel top Δ1.0 % · headline top Δ0.6 % · headline height Δ1.7 % · list Δ1.6 % · pagination Δ2.0 % · chamfer Δ1.3 % → **worst 2.0 % (≤ 3 %)**; `login-overlay-1440.png`; OS gate 12/12 |
| Bento vs R9_06 (6) | `qa-scripts/bento_overlay.mjs` on `/os`, `/os/members`, `/os/audit`: **worst edge Δ 0.15 %** (≤ 2 %); 9 tiles, 7-cell ticker, user chip; `overlay-os.png` shows the ref boxes in red over the page |
| Ops layer (7) | rail · dossiers · traces (real counts) · red tabs · ring segments · SYS VER — no tile moved (the overlay gate ran after) |
| Nothing regressed (8) | `make check` green at every commit (ruff · prettier · stylelint · markdownlint · oxlint · mypy · tsc · pytest · vitest · audits · guards · validators · ts-prune · depcheck); `make a11y` **0 / 0** (pa11y 10 URLs, axe 10 + OS); `make smoke` **12/12 + 9/9**; Lighthouse desktop (preview build) **/ 92 · /projects 94**, LCP 1.29 s / 0.96 s, JS 474 KB; tracked repo **13.9 MB** |

ui-preservation (run 8 → run 9, full page 1440, pixels differing > 60/765): Home 23.8 % · Projects 14.4 % ·
News 12.6 % · About 27.0 %. All of it is the declared set — glyph shapes (S01 words, Space Mono deks),
line breaks, the dossier layer, folder cards — plus one data effect: the functional smoke added an F26
officer, so About §5 shows that term (1 folder) instead of F24 (8) at shoot time; the local tables are
reset at the close.

## Rubric
| # | Line | Score |
|---|---|---|
| 1 | Face match | 4 — the empirical test is the evidence; the display winner is a drawn alphabet, not a font (the rule's own fallback) |
| 2 | Type applied | 5 |
| 3 | Dossier heroes | 5 |
| 4 | FolderCard | 5 |
| 5 | Login | 5 (worst 2.0 %) |
| 6 | Bento exact | 5 (0.15 %) |
| 7 | Ops layer | 4 — DossierStack is on Members only; the trace field is flat until the board writes (by design) |
| 8 | Nothing regressed | 5 |

## What is not here, and why
- No commercial face: the closest match to DEMON is a commercial family (the M's deep V, the narrow E, the
  rounded-square construction); the free candidates top out at 0.52, so the alphabet is drawn to the
  measurements instead. Adding a licensed font later is a token swap (`--font-display`) plus removing the
  `<S01Word>` calls — the treatments are the same.
- No fake metrics: Tier 1 has no members, no dead links, no incidents — those tiles say `0` or `—`.
- No cube in the OS, no left rail of text (the launcher replaced it), no radius over 4 px, no new keys.
