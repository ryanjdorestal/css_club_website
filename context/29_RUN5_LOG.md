# 29 — Run 5 log (fin line · footer hound · Cyberhounds 3D pitbull · red palette)

Start 2026-09-20 20:35 EDT. Budget 150 min. Prompt: context/28_RUN5_PROMPT.md.

## Decisions
| # | Decision | Why |
|---|---|---|
| 1 | HoundPixel single source = the **16×16** bitmap Home's poster uses (not a 32×32) | §4 says "that exact component at that exact resolution" and Ryan approved the Home mark; the 32-grid lived only in the footer glaze he rejected. Deleted with HoundGlaze. |
| 2 | `--color-red` on navy fails AA as *text* at every size (#B3202A/navy-900 = 2.6:1, /navy-600 = 1.5:1; the old #CE4A4A was 2.2:1 too) | red is a fill/rim/display-poster color; red *text* keeps using `--accent-fg` (retuned to #EE9A9E, 4.6:1 on navy-600). HOUNDS poster word stays `--color-red` with its white ghost (decorative, ≥100px). Logged per §6. |
| 3 | Cube glow literals (#CE4A4A in Home/Events/Cyberhounds) → `brand.colors.red` | §6 "everywhere red was"; the three.js material needs a real color string, so it reads the brand config, not a var(). |
| 4 | Home fin cube keyframe moved x 0.5 → 0.84 (rides the right hairline, scale 0.42) | at x 0.5 the cube sat on top of the typed line — the animation Ryan asked for was invisible; the keyframe "stays" but off the text |
| 5 | `?finslow=N` QA param in FinLine | headless Chromium on this Mac renders ~3 rAF/s with the cube canvases live; the 1.2 s typing finishes between two screenshots. Real browsers are unaffected (SLOW = 1). |
| 6 | Footer rail brandmark "CSS · JOHN JAY" scaled to clamp(34px, 4.4vw, 64px) | at 24px the left 60 % of the 58 vh bottom zone was dead navy; the glaze used to fill it |
| 7 | 3D nose: rounded box, emissive 0.35 (eyes 1.4) | v1's emissive sphere at 1.4 read as a clown nose; the logo's nose is a black pad with a red edge |

## Checkpoint 30 min (21:05)
Loop 0 in: tokens (#B3202A family), FinLine typing (probe shows hack glyphs + 1 Hz caret), footer = official Bloodhound alpha (133 KB, halo check OK), HoundPixel single source (16×16) in Cyberhounds hero/marks/posters. Loop 1 started: build_hound.py v1→v3 (5.8k→8k tris), viewer + render harness live.
| 8 | PosterCard "▶ FLAG CAPTURED !" micro label → `--color-red-hi` @70 % | §6: `--color-red` fails AA at label sizes on navy (2.6:1); red-hi is 3.7:1 on navy-900 — decorative flavour text, logged as the brief asks |
| 9 | `DotMatrix.tsx` + `public/img/brand/hound_banner.png` deleted | §4 "delete any duplicate hound rasters" — the Cyberhounds hero was the only user (the re-rasterized hound Ryan didn't want) |
| 10 | Edges threshold 28° → 40° in CyberhoundCanvas | at 28° the hull triangulation drew stray diagonals across the forehead/cheeks at 460 px; the red rim is carried by the BackSide shell anyway; real creases (muzzle, brows, ears, slits) survive 40° |

## Checkpoint 32 min (21:06) — loop 1 landed early (the 60-min box for §5 closed at 32)
Loop 0 committed (cbd0111). Loop 1: build_hound.py v5 (9.2k tris, SEG 36), viewer + render harness, compare sheet vs logo/photo, CyberhoundSpot/Canvas (R3F: body #0B0B0D, 40° edges 1.5 px + 1.03 BackSide red shell, emissive slits 1.4→2.2 hover, idle ±8°/6 s, pointer-follow ±18°, breath, drag, page-local Bloom .8/.5, RoomEnvironment). Live in the Cyberhounds hero at 460 px frame (bust ≈ 380 px), pixel hound 260 px front-left; fallback = pixel hound only (front hound hidden via :has). Font audit 9/9 (qa/font-audit-run5.txt). Contrast all pass (+ INFO row).

## Checkpoint 45 min (21:20)
Loop 2 sweep: all 9 routes shot full-page (qa/loops/run5/sweep/), no page errors; fins typed on every route, footer hound on every route; two `tsc -b` errors fixed (unused brand import, HoundPixel color prop in Styleguide). Prod build green. Lighthouse desktop (prod dist, --preset=desktop): **Home 98** (LCP 0.9 s, TBT 10 ms, CLS 0.008) · **Cyberhounds 91** (LCP 1.5 s, TBT 100 ms, CLS 0.002) — gate ≥ 83 held with the bust + bloom live. Fin motion frames captured with ?finslow=6 (qa/loops/run5/fin-motion-sheet.png).
| 11 | Bust v6 shipped over v5 (skull taper −10 %, jowl flare +10 %, median furrow, slits 0.07) | side-by-side (renders/v5-* vs v6-*): wider jaw + narrower crown reads more pitbull, slits brighter from the front; 6 builds total, all under the 60-min box |
| 12 | Cyberhounds hero <md: HoundPixel 120 px under the H1 | the frame is hidden on mobile; the page had no hound at all on phones |
