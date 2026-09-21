# qa/REPORT_RUN6.md — vector pennant · clean hound matte · footer map (run 6), 2026-09-20

Ryan's run-5 review (context/30 §0): the flag with the pitbull showed crop traces
→ a real pennant with the black-and-red hound blended in; the footer hound
showed matte traces → blend them out; drop `CSS · JOHN JAY`; put a map linked
to John Jay's Google Maps address on the left, the way jjay.cuny.edu does.
All done in one commit. Log: context/31_RUN6_LOG.md. Assets by Cowork used
as supplied, not regenerated.

## What changed

- **Cyberhounds pennant** (`components/Pennant.tsx`): the raster header art and
  its `PhotoFrame` are gone. The pennant is Cowork's `cyberhounds_pennant.svg`
  inlined (600×780, field #0A0A0C, straight sides to y=600 then a point at
  (300,780), 2px red inset hairline, the vector head centred, CYBERHOUNDS in
  mono), with the red as `var(--color-red)`. It fills the §1 column at 520 px
  inside the run-3 frame furniture (Brackets, `VISUAL · 01 / FRAME · 001`,
  caption `CYBERHOUNDS · PENNANT · VECTOR`); the point hangs 24 px below the
  frame's bottom hairline, which is drawn behind it. Motion: drops 24 px into
  place (0.6 s), the head's outline draws on a 1 px non-scaling stroke (0.9 s),
  then the fill fades in (0.3 s); hover sways 1.5° around the top edge (1.2 s).
  The traced head path lives once in `sigils/cyberhoundHeadPath.ts`;
  `CyberhoundHead` (40 px) is now the PosterCard corner mark on this page.
  `public/img/photos/cyberhounds-header.webp` deleted; `scripts/images.py`
  and the parity row updated.
- **Footer hound**: `public/img/jj_bloodhound.webp` is now Cowork's proper
  matte (`assets/brand/jj_bloodhound_alpha.webp`, 160 KB; the lossless `.png`
  stays in assets as master). Same placement (right-anchored, cropped ~10 %
  below the bottom, 6 % bleed, slide-up entrance); the left-third gradient is
  removed. 56 vh at md, 62 vh from xl so nothing overlaps its face at 1024.
- **No wordmark**: `CSS · JOHN JAY` removed from the rail. The rail is mono
  only: © · `HANDED_TO_THE_BOARD` · version · `BACK_TO_TOP`, and it clears the
  fixed status bar and the hound at every width.
- **Map** (`components/MapCard.tsx`, modelled on jjay.cuny.edu's footer): a
  keyless Google Maps embed (`?q=524+W+59th+St…&z=16&output=embed`, lazy,
  `no-referrer-when-downgrade`, titled) inside Brackets with a
  `//LOCATION · 40.7706° N / 73.9886° W` rail, 300 px tall on desktop / 220 on
  mobile. Dark treatment `invert(.92) hue-rotate(185deg) saturate(.6)
  contrast(.9)` that eases to `invert(0)` on hover (the map lights up). The
  whole card is a link to Google Maps; the iframe is `pointer-events: none`;
  `[ OPEN_IN_MAPS ↗ ]` sits top-right so Google's attribution strip stays
  visible. The iframe mounts only when the card scrolls into view; if it has
  not loaded in 4 s, or `navigator.onLine` is false, a DotGrid + Crosshair
  panel with the same link shows — it is also the loading state, so there is
  never a grey box. Under it, the address block from new `brand.campus.*`
  fields (524 West 59th Street / New York, NY 10019 / Main 212.237.8000 as
  `tel:` / the club email as `mailto:`). Privacy note in SOURCES.md.
- **Layout**: at 1440 the left column is 640 px (map + address), the hound
  bleeds off the right; 460 px at 1024–1279; below md the map stacks above the
  hound (42 vh).

## Gate (context/30 §4)

| Check | Result | Evidence (`qa/loops/run6/`) |
|---|---|---|
| Pennant edges crisp, no crop traces, blends with the field | ✅ | `cyber-s1-pennant.png` (520 px), `cyber-s1-pennant-crop.png`, `cyber-s1-pennant-drawing.png` (outline mid-draw) |
| Vector head as the poster corner mark | ✅ | `cyber-posters.png` |
| No visible matte fringe at 100 % | ✅ | `hound-edge-100pct.png` (asset on #0C183C), `footer-1440-hound-edge-100pct.png` (live page) |
| Map loads dark, lights up on hover | ✅ | `footer-1440.png` (dark), `footer-1440-map-hover.png` (lit, CTA filled) — `data-map="ok"` at every width |
| Address block present | ✅ | every footer shot |
| No `CSS · JOHN JAY` anywhere | ✅ | grep in `apps/web/src` = 0 |
| Nothing overlaps the hound's face at 1024 / 1280 / 1440 / 1920; mobile stacks | ✅ | `footer-1024.png`, `footer-1280.png`, `footer-1440.png`, `footer-1920.png`, `footer-390-a.png`, `footer-390-b.png` |

Build: `tsc -b` + `vite build` green; no page errors in any shot.

## Notes
- Vite dev on macOS: `cyberhoundHead.ts` next to `CyberhoundHead.tsx` resolved to
  the wrong module (case-insensitive FS) and the dev server cached it. The
  path module is `cyberhoundHeadPath.ts`, the component file
  `CyberhoundHeadMark.tsx` (exported as `CyberhoundHead`). Don't reintroduce a
  case-only sibling.
- The Google chip "Open in Maps" at the tile's top-left is Google's own UI
  inside the embed (inert under `pointer-events: none`); ours is the bracketed
  CTA top-right.

## Dev commands
```
cd apps/web && npm run dev
.venv/bin/uvicorn api.index:app --port 8000
```
