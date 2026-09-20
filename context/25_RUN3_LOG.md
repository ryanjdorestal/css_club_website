# 25 — Run 3 log (sigil pass)

## Decisions
| # | Decision | Why |
|---|---|---|
| 1 | Archivo + Poppins retired; Chakra Petch/Michroma/Silkscreen/Space Grotesk in via @fontsource (self-hosted) | 22 §fonts: Archivo is a friendly round grotesk, Poppins a rounded geometric — neither can make the stencil/extended/pixel letterforms of T01–T12; self-hosting also removes the Google CDN dependency |
| 2 | .t-outline uses -webkit-text-fill-color:transparent + stroke currentColor | color:transparent made the currentColor stroke invisible (caught in Loop 0 shot) |
| 3 | CSSKufic C simplified to a clean bracket form (inner stub removed) | the stub made C read as E at small sizes |
| 4 | HoundPixel hand-set 16×16 (not auto-thresholded) | the banner crop thresholds to a blob at 16px; hand-set pixels read as a hound |
| 5 | Coordinates 40.7706 / -73.9886 for 524 W 59th St | cross-checked against the John Jay campus block (59th St at 10th/11th Ave); 4 decimals |
| 6 | fontStretch inline styles left inert on un-migrated pages | Chakra has no width axis; they no-op and are removed during each page loop |
| 7 | StatusBar SCN counts <main section> elements above viewport center | real section index, no per-page wiring |
| 8 | Wireframe cube SVG hand-drawn (iso hexagon + Y edges + notch ticks + vertex dots) | GLB edge-export script exceeds the time box; the drawn mark matches T06's radar language |

## Checkpoint ~40 min — run complete
Loop 0 (17 min) + Home + all pages patched to the register; all builds green; Lighthouse 83/90 desktop (no regress); parity untouched (no copy moved).

| # | Decision | Why |
|---|---|---|
| 9 | Decode skipped on treated hero lines (stencil/outline); used on kicker + untreated lines + poster words | decode over stroke-only glyphs reads as soup mid-animation |
| 10 | Old SplitLines retained where pages still pass display classes; heroes converted to t-* roles page by page | var(--font-display) flip meant zero-broken intermediate states |
| 11 | Apps/Join form fields → mono, _label rail, 1px bottom border (T04/T12 form language) | §7.4 |
| 12 | Resources rail → A–F letter cells with ring on active (Priva scenario rail) | §7.6 |
| 13 | Events hero uses CubeSigil face="r" marks floating through type instead of 3D spots | §7.3; SVG sigils keep the hero canvas-free on sub-pages |
| 14 | PosterBand alternates EdgeCrop side per line | T02's crop reads best when lines shear opposite ways |
| 15 | perf: fonts self-hosted killed the render-blocking Google CSS; 83/90 desktop across two runs | gate held (median ≥84) |
