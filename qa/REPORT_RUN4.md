# qa/REPORT_RUN4.md — weight · consistency · cube everywhere · footer (run 4), 2026-09-20

Ryan's run-3 review: type inconsistent + not heavy; cube still an icon; circular
footer lockup; thin template brandmark; CYBER HOUNDS needs work. All five
diagnoses confirmed against run-3 shots before editing (context/26 §0).

## What changed

- **One display face.** Unbounded 700/800/900 replaces Chakra Petch + Michroma +
  Silkscreen everywhere ≥28px (plus buttons/logotype/tagline per §2's table).
  `qa-scripts/font_audit.mjs` walks every text node on all 9 routes and buckets
  computed families by size — **all routes pass** (qa/font-audit-run4.txt):
  display = {Unbounded}, mid = {Unbounded*, Space Grotesk, JetBrains Mono},
  micro = {JetBrains Mono} (+VT323 exempt, rings/ticker). *sanctioned by §2.
- **Weight.** Hero/H1/H2/posters at 800–900; outline strokes 2px dark / 2.5px
  paper; stencil bars 4.5% of cap; ghosts offset 6px.
- **Cube everywhere.** Rail rescaled (~440px hero at 1440), keyframes retuned;
  new interactive CubeSpot (drag-rotate, click-face→route, accent rim, lazy,
  in-view pause) in every page hero (§3 faces), every poster band (edge-on
  behind the word), and the footer lockup (rail parks there on Home).
- **CYBER HOUNDS** (§4): CYBER solid white / HOUNDS solid red with white ghost
  (+6,+6) and stencil bars in band navy, both lines edge-cropped right; cube
  red-facing beside the dot-matrix hound.
- **Footer v3**: circular StampLockup deleted; lockup = 3D cube · hairline ·
  the official John Jay wordmark (fetched from jjay.cuny.edu, native shape,
  no circle) · JOHN_JAY_COLLEGE · CUNY label · tagline in Unbounded 800 teal;
  links Space Grotesk 500 16px @85%; READY TO COMMIT? in Unbounded 900 with
  Block/Bracket CTAs; **brandmark replaced by the Bloodhound glaze** — 70vw
  silhouette, lower quarter cropped, ink→red gradient glaze, interior
  eyes/band/muzzle strokes cut in band color, three sinking echo outlines,
  scroll-tied rise, 9→12% on hover.
- **Run-3 follow-ups closed**: IndexList truncation removed (balance + 2-line
  clamp); Decode gated on fonts.ready ≤600ms with data-decode-done; red paper
  tint capped at 3%; paper labels 65% / micro 10px.

## Rubric (context/26 §8)

| Line | Score | Evidence |
|---|---|---|
| 1 Weight | 4 | r4-hero: DEBUG/COMMIT TO at 900 fills the column; footer READY TO COMMIT? massive; no light display text on any route |
| 2 Consistency | 5 | font_audit green on 9/9 routes (qa/font-audit-run4.txt) |
| 3 Cube presence | 4 | ~440px hero cube (r4-hero), CubeSpot in all 8 sub-heroes + poster bands + footer; keyframes retuned |
| 4 Poster words | 4 | CYBER HOUNDS per §4 (home + page); ghosts+crop on all PosterBands |
| 5 Footer lockup | 5 | r4-footer: plain cube · hairline · official JJ wordmark, zero circles |
| 6 Bloodhound glaze | 4 | r4-footer-bottom: hound with eyes/band/jowls sinking into red-warmed fade, echo cascade |
| 7 Follow-up closed | 4 | truncation gone, decode gated, red tint 3%, labels 65% |
| 8 Nothing regressed | 4 | routes 200, parity untouched, status bar/readouts/sigils intact; Lighthouse below |
| 9 Craft | 4 | H1s break on deliberate lines; tabular numerals; 390 fulls clean |

## Lighthouse (desktop preset, prod dist)

**90** — LCP 1.7s · TBT 10ms (gate ≥83 held; run-3 band was 83/90).

## Next 5
1. The hero readout chips overlap the cube on purpose (jj_03) — tune positions at 1280–1440 widths so the numerals never sit on the red face's notch.
2. Bloodhound glaze: a second pass tracing the actual banner silhouette (ears wider, jowls deeper) would sharpen recognition further.
3. CubeSpot count on long pages (hero+poster+footer = 3 canvases) — swap poster-band cubes for a shared offscreen render if TBT creeps.
4. Vector master of the JJ wordmark from the board (current: ×4 upscale of the site's 162px embed).
5. Unbounded's round G/O counters at 900 — consider stencil bars on GROWTH. to square the read.
