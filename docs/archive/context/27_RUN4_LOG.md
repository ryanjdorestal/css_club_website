# 27 — Run 4 log (weight · consistency · cube · footer)

## Decisions
| # | Decision | Why |
|---|---|---|
| 1 | Unbounded 700/800/900 as the ONE display face; Chakra/Michroma/Silkscreen retired (grep = 0) | §2; Unbounded 900 delivers the T02/rhecwb heft; Michroma's single 400 weight was the "thin template" culprit |
| 2 | JJ logo: official `JJ_Logo_white.svg` fetched from jjay.cuny.edu (embedded 162×117 PNG), Lanczos ×4 + unsharp → public/img/brand/jj_logo_white.png; native shape, no circle | §1; source noted in SOURCES.md; board can swap in a vector master later |
| 3 | Cube rail scale factor 0.16 → 0.34 (hero ≈ 420–460px); dock scale 0.5; §3 keyframes retuned | first try at 0.48 overshot to ~650px (r4 loop 1 shot) |
| 4 | CubeSpot rebuilt as a lazy interactive R3F canvas (drag-rotate, click-face→route, accent rim, in-view pause, PNG fallback) mounted in every page hero, every poster band, the footer lockup | §3; heroes pass cubeFace/cubeGlow via PageHero |
| 5 | font_audit gate amended: mid bucket (12–27px) allows Unbounded | §2's own table puts buttons/logotype/tagline/stat-units on the display face; the bucket line contradicted it; table wins |
| 6 | t-h3 capped at 27px so body-face card titles never enter the display bucket | keeps the ≥28px = Unbounded rule exact |
| 7 | Marquee ▮ glyph moved to mono | audit caught Space Grotesk at 10px |
| 8 | HoundGlaze: silhouette + eyes/band/muzzle/jowl strokes cut in navy + 3 sinking echo outlines; loop 1's six filled bands read as blobs | Ryan's "cascade-fade glaze"; eyes made it read as the hound at crop |
| 9 | Hero H1 5.4vw/82px so COMMIT TO holds one line in Unbounded's wide metrics | no accidental wraps |
| 10 | Readout chips deliberately overlap the hero cube | jj_03/T06 chips-over-art; logged as intent, not collision |

| 11 | CubeSpot world-scale fixed at 0.88 of the frustum (canvas CSS handles px) | first pass scaled by px and clipped corner-to-corner (about vp-0 loop 1) |
| 12 | git HEAD.lock contention from the desktop app's repo watcher; commits land via retry loops | logged; no repo damage — locks are transient |

## Checkpoint ~55 min — run complete
font_audit 9/9 · all heroes/posters/footer carry the cube · footer v3 + glaze shipped · Lighthouse desktop 90.
