# qa/REPORT_RUN5.md — fin line · footer hound · Cyberhounds 3D pitbull · red palette (run 5), 2026-09-20

Ryan's run-4 review (context/28 §0): END OF TRANSMISSION → END OF SECTION with a
hack/typing animation; the fudged footer dog → the official Bloodhound; the
Cyberhounds page must use the same pixel hound as Home; the red read
orange → dark modern red tuned to the blues; a 3D pitbull for the Cyberhounds
page in the logo's black + red. All five done; log in context/29_RUN5_LOG.md.
Three commits (loop 0 `cbd0111`, loop 1 `196bd15`, sweep), never pushed.

## What changed

- **Fin line** (`components/FinLine.tsx`): `END_OF_SECTION · nn` types itself in
  like a terminal — 22 ms/char, a 2–3 glyph hack buffer (`01<>/[]_#$%&`) ahead
  of the caret, block cursor ▮ that blinks at 1 Hz once the line lands — then
  `> next: /route_` in mono micro, then the binary whisper decodes in VT323 at
  12 ms/char. Hairlines draw in from the centre (scaleX 0→1, 0.6 s). Total
  ≈1.2 s. Reduced motion → instant. Every page passes its own `next` route.
  The Home fin's cube keyframe moved off the text (x 0.84) so the line is
  readable. `?finslow=N` is a QA-only multiplier for headless capture.
- **Footer** (`components/Footer.tsx`): the pixel-hound glaze is deleted. The
  official John Jay Bloodhound (`assets/brand/jj_bloodhound.webp` → alpha via
  `scripts/hound_alpha.py`, 133 KB, halo check OK on navy) sits right-anchored
  in a 58 vh bottom zone: 62 vh tall, bottom ~10 % cropped, right edge 6 % off
  the viewport, full colour, 100 % opacity, slides up 40 px on enter. One
  navy-900 gradient over its left third keeps the rail readable. Rail =
  CSS · JOHN JAY (Unbounded 900, clamp 34–64 px) · © · HANDED_TO_THE_BOARD ·
  version · BACK_TO_TOP. Mobile: rail above, hound 42 vh below. Cube + JJ
  wordmark lockup untouched.
- **HoundPixel single source** (`sigils/HoundPixel.tsx`): one 16×16 bitmap —
  the one Home's poster already used and Ryan approved — one component, size
  prop, always `--color-red`. Cyberhounds hero (260 px, front-left of the 3D
  bust), section marks §1/§3 (16 px), PosterCard corner rail (48 px, new
  `mark` prop), mobile hero (120 px), 3D fallback (320 px). `DotMatrix.tsx`,
  `hound_banner.png` and the footer's 32-grid raster are gone.
- **3D Cyberhound** (`assets/hound3d/`, `mascot/CyberhoundSpot.tsx` +
  `CyberhoundCanvas.tsx`): procedural pitbull head-and-chest bust in
  manifold3d (rounded-box head with cheek widen + skull taper + forehead cut +
  median furrow, blended muzzle with jowl flare, closed jaw, box nose, jowl V
  cut in, angled slit recesses, two angled brow bars, cropped ears, neck cone,
  rounded chest + shoulders, studded collar), 9.3k tris, nodes
  body/head/eyes/nose, head pivot documented. R3F: body #0B0B0D r.55 m.15 +
  RoomEnvironment; red rim = 40° Edges 1.5 px + BackSide shell 1.03 @ .9;
  eyes emissive red-hi 1.4 → 2.2 on hover, nose .35; page-local Bloom .8/.5;
  idle head turn ±8°/6 s, pointer-follow ±18°, breath 1.5 %/3 s, drag rotates.
  Mounted in the Cyberhounds hero's 460 px bracket frame (bust ≈ 380 px) with
  Scanlines + Halftone behind; no cube in that hero (cube stays in the poster
  band + footer). Six builds (renders/v1–v6, compare sheet vs the logo and the
  standing photo); shipped at minute 32 of the 60-min box.
- **Red palette** (`tokens.css`, `brand.config.ts`, DESIGN.md, context/05):
  `--color-red #B3202A` (accent), `--color-red-hi #E0242C` (emissive / hover /
  slits / ghost), `--color-red-deep #7A1119` (deep fills); cube red unchanged;
  blues untouched. Red paper tint stays 3 % (reads grey-warm, not pink).
  `--accent-fg` for red text retuned to #EE9A9E (4.61:1 on navy-600). The
  PosterCard "▶ FLAG CAPTURED" micro label moved to red-hi (§6 rule).

## Rubric (context/28 §8) — gate ≥ 4

| Line | Score | Evidence |
|---|---|---|
| 1 Fin line: END_OF_SECTION, types in with cursor + hack glyphs, hairlines draw | 5 | `qa/loops/run5/fin-motion-sheet.png` (8 frames: `[>1▮` → `END_OF_SE0%#▮` → `> NEXT: /AP<1▮` → binary decoding), hairlines short in frame 0; `data-fin-done` set on every route |
| 2 Footer: official Bloodhound, full colour, right-anchored, cropped, no glaze/fade; rail readable | 5 | `l0b-home-footer-bottom.png`, `l0b-home-footer-390.png`, `sweep/*-1440.png` (bottom) — the mascot at 100 %, TM kept, rail on the gradient side |
| 3 Cyberhounds uses the identical pixel hound as Home | 5 | `l2-cyber-hero-3d.png` (260 px front-left), `l0b-cyber-posters.png` (48 px corner rail + 16 px section mark), `l2-cyber-hero-390.png`; one bitmap in `sigils/HoundPixel.tsx`, grep = 1 |
| 4 3D Cyberhound: serious pitbull, black + red rim + emissive eyes, idle/follow/drag, ~380 px | 4 | `hound_compare.png` (logo · photo · v6 front/¾/side), `l2-cyber-hero-3d.png`, `l1-cyber-hero-3d-hover.png` (slits brighten), `l1-cyber-hero-3d-follow-left.png` (head yaws). Recognizably a scowling cropped-ear pitbull bust; still stylized-blocky — a 4, not a 5 |
| 5 Red is the #B3202A family everywhere, no orange cast, AA passes, blues untouched | 4 | `qa/contrast.txt` all pass (+1 INFO row: red is never text on navy); grep `#CE4A4A` in src = 0; blues/teal tokens byte-identical |
| 6 Nothing regressed | 5 | font_audit 9/9 (`qa/font-audit-run5.txt`); sweep of 9 routes no page errors; parity untouched (no content rows moved); status bar/readouts/cube rail intact in `sweep_heroes`; Lighthouse below |

## Lighthouse (desktop preset, prod dist)

| Route | Perf | LCP | TBT | CLS |
|---|---|---|---|---|
| / | **98** | 0.9 s | 10 ms | 0.008 |
| /cyberhounds (bust + bloom live) | **91** | 1.5 s | 100 ms | 0.002 |

Gate ≥ 83 held. Raw JSON not committed (regenerate: `npx lighthouse http://localhost:4173/ --preset=desktop` against `vite preview`).

## Artifacts
- `qa/loops/run5/` — fin motion frames + sheet, footer 1440/390, Cyberhounds hero
  (3D, hover, follow, 390), posters, `hound_compare.png`, `hound_alpha_proof.png`,
  `sweep/` full pages of every route.
- `assets/hound3d/` — `build_hound.py`, `cyberhound.glb`, `viewer.html`, `README.md`
  (parameter table), `renders/v1–v6-{front,three,side}.png`.
- `qa/font-audit-run5.txt`, `qa/contrast.txt`, `context/29_RUN5_LOG.md`.

## Next 5
1. Bust v7: split the head into skull + cheek masses with a proper stop, and
   round the muzzle corners more — the front view still reads a touch
   "bear-cub"; add a subtle ear-inner recess.
2. Head-turn on scroll: yaw the bust toward the page as the poster band enters
   (the rail cube already does this — share the scroll progress).
3. Footer hound at 1024–1280 widths: the `md:max-w-[60%]` rail can touch the
   gradient edge; add a `lg:` step.
4. The fin's `> next:` line could be a real link (currently decorative) — make
   the whole fin clickable to the next route with the same typing on hover.
5. Prerender (the run-2 follow-up) — mobile Lighthouse is still the CSR
   penalty, not this run's work.

## Dev commands
```
cd apps/web && npm run dev          # Vite :5173 (proxies /api → :8000)
.venv/bin/uvicorn api.index:app --port 8000   # API :8000 (README)
```
