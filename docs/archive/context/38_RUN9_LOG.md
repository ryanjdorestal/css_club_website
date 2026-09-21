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
| 1 | Display face: **no free face clears the gate** — `scripts/type_match.mjs` (Playwright render → binarize → bbox-align → tracking fit → IoU) over 43 candidates: best Familjen Grotesk 700 **0.523**, Exo 2 800 0.466, Aldrich 0.449; Unbounded 900 0.321. Measured ref: stroke 0.117 cap, E 0.67 · O 0.75 · N 0.90 · M 1.19 wide — the S01 face is *not* uniformly extended (the brief's eyeball said 1.15–1.25×; only the M is). The D is occluded by a halftone block in the crop → scored on EMON. → **fallback path: Unbounded stays the H1/H2 face; hero + poster words are the drawn S01 alphabet** (`apps/web/src/type/glyphs/`, 26 caps + digits + `.,:/-_'!&`, skeleton polylines on a 100-unit cap grid, stroke 12, rounded corners as tangent arcs; `<S01Word>` carries Stencil bars / Outline / SplitFill as SVG masks; EdgeCrop wraps it). Words: DEBUG · YOUR MIND, · COMMIT TO · GROWTH. · CYBER · HOUNDS · No flag · left behind. · See you · there. · Not sure where · to start? Here. · About's two poster lines (≤ 12 distinct) | the decision rule in §2.1; the sheet is `qa/loops/run9/type_match_display.png` (+ `.json`) |
| 2 | Body mono: **Space Mono 700/400** = `--font-mono-display` (IoU 0.327; Chivo Mono 0.310, Red Hat Mono 0.310; JetBrains Mono 600 0.246 — beaten by 0.08). OFL 1.1 (`@fontsource/space-mono`, +2 woff2). JetBrains Mono stays for code · tables · labels < 12 px | `qa/loops/run9/type_match_mono.png` |
| 3 | OS display: **VT323** = `--font-os-display` (IoU 0.451 vs the T03 headline; DotGothic16 0.439, Micro 5 0.395, Silkscreen 700 0.205). Already installed → zero new bytes; ≥ 20 px only (the run-3 rule holds) | `qa/loops/run9/type_match_pixel.png` |
| 4 | Nasalization dropped before rendering: Typodermic's free EULA covers desktop use; web embedding needs their web licence — no self-hostable OFL file, so no test | §2.1 "check the license permits web embedding … if not, drop it" |
| 5 | The Home hero dek stays Space Grotesk sentence-case (it is 5 lines); PageHero deks (1–2 lines) take `.t-dek` (Space Mono caps +.04em). Ticker + fin lines → mono-display | the > 3-lines rule in §2.4 |
| 6 | `--type-hero` clamp(56px, 9.5vw, 160px); the Home H1 is set at clamp(44px, 6.4vw, 96px) — the S01 words are narrower than Unbounded, 4 lines fit beside the cube at 1440 with no third-line wraps | measured on the 1440 shot |
| 7 | Dossier hero blocks are `<img>` + `grayscale(1) contrast(900%)` with the accent multiplied over the white (a true 1-bit look); CSS `mask-image` on a photo only reads alpha, so the first attempt was a flat rectangle | shot `qa/loops/run9/cyber-hero-b.png` |
| 8 | FolderCard silhouette is one `clip-path: path()` measured by ResizeObserver (path() needs px; a 45° cut is not expressible in objectBoundingBox units); the hairline is an inline SVG of the same path at 2 px (half clipped → 1 px); focus ring = the same path in teal via `:focus-within` | §3 "single clip-path: path()" |

## A done (11:41 — 43 min; 25 over the identification box because the first sheets scored the wrong crop — a bbox-on-cropped-mask bug, fixed)
Commit `feat(type): v4 …`. font_audit per realm green on /, /cyberhounds, /about, /styleguide. Specimen band on /styleguide. Shots `qa/loops/run9/{specimen-1,home-hero-b,cyber-hero-b}.png`.

## B done (11:47 — 6 min)
FolderCard on Resources (category folder), Projects (non-app kinds; the list is empty in Tier 1 → SlotCards show), About §5 (officers), Join (Discord), Events (slot 02), styleguide story (4 tones incl. two-tone + mirror). Commit `feat(ui): folder cards …`. Sheet `qa/loops/run9/folder-surfaces.png`.
| 9 | `/os/login` keeps the public `<Nav compact />` (the T03 nav bar) — a `compact` prop forces the scrolled state | the gate page is outside the public layout; the OS gate's `nav-os` checks still pass |
| 10 | The bento's height follows its width (`aspect-ratio: 1081 / 697` with `fr` row tracks in the ref's px) — the grid scales, never reflows, inside the width left by the rail; under 900 px the nine tiles stack A→I | §6.2 "scale it, don't reflow it"; the overlay gate measures fractions of the grid box |
| 11 | Every module's slot content is one builder in `os/ui/specs.ts` (rows in → nine slots out); pages pass `dash={…}` to `OsPage` | keeps every page under the 250-line budget; the table in §5.2 is literally one file |
| 12 | Timestamps in the store are epoch seconds — `series()` and the traces accept seconds, ms and ISO | the first histogram bucketed everything into 1970 |
| 13 | Tile-E thumbnails show id codes (`PST-82445`), never titles | the functional smoke's `text=<title>` locator matched the dashboard thumbnail before the table row (a real ambiguity, not a flake); titles are also the wrong register for a thumbnail fallback |
| 14 | `<S01Word>` keeps the word in the DOM as `sr-only` text next to an `aria-hidden` SVG | pa11y: "heading with no content" on the two heroes |
| 15 | PageHero deks over 170 characters stay Space Grotesk sentence-case | About's dek is 5 lines in caps otherwise (the > 3-lines rule) |
| 16 | Login proportions tuned to the T03 measures (headline clamp(40px, 4.2vw, 60px), two-line dek, pagination clamp(40px, 4.2vw, 58px) flush at the bottom) → worst Δ 2.0 % | the first cut was 13 % off on the list and pagination rows |

## C done (11:51 — 4 min)
OS gate 12/12. `feat(os): login on T03 …`. Shots `qa/loops/run9/os-login-{1440,390}.png`; overlay after the tune: `login-overlay-1440.png` (worst 2.0 %).

## D done (12:05 — 14 min)
`39_OS_GRID.md` (projection-measured boxes) → `Bento` / `Tile` / `Kpi` / `Histogram` / `Ring` / `Bar` / `Range`, `TopStrip` + launcher, `Dashboard` + `specs.ts`, `os.css` realm, the new `OsLayout` (rail + strip), `OsPage` dash slot + VT323 titles + red segmented `Chips`. All 11 modules wear the grid. `bento_overlay.mjs`: 0.15 % on /os, /os/members, /os/audit. `feat(os): bento grid …`.

## E done (12:21 — 16 min)
DossierCard/DossierStack (Members, Board-in-folders, Audit who-hover, About §5 sheet), TraceStrip (Audit hero 8 ch, Today tile D), Meters beside the tabs, SubjectSheet (System, Audit), ring segments → runbook, folder records (Inheritance list + view, OS Resources). pa11y 2 → 0 (sr-only heading text), axe 5 → 0 (progressbar names). Smoke 12/12 + 9/9 after the thumbnail fix. `feat(os): ops layer …`.

## Close (12:35 — 97 of 210 min)
Login retune (Δ 2.0 %), long deks stay body, SYS VER hidden on mobile, DESIGN.md (type v4 · folder · OS realm), HANDOFF.md (the OS in two paragraphs), README map, `39_OS_GRID.md`, `qa/REPORT_RUN9.md`. Lighthouse desktop 92 / 94 on the preview build. Tracked repo 13.9 MB. `make check` green; local tables + inbox reset after the final shots. Dev servers left running. Nothing pushed.
