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
