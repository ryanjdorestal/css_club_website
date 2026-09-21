# 28 — RUN 5: FIN LINE · FOOTER HOUND · CYBERHOUNDS 3D PITBULL · RED PALETTE — loop, no questions

Paste everything below the line into Claude Code (Fable, xhigh) in `~/Desktop/jjay_css`. Read anything on
this Mac; write only inside this folder; never push.

---

## 0. Ryan's review of run 4 (verbatim → what to do)

"the site is good but a couple of sections could be improved:
1. I don't like the END OF TRANSMISSION thing — make it END OF SECTION and give it that hack/typing animation.
2. The footer with the fudged dog at the bottom is ass — fuck the fade if it looks like that. I put the actual
   Bloodhound logo in the assets folder; use that to replace the ugly dog.
3. On the main page the pixel Cyberhound image is good but you didn't keep the same dog icon on the actual CTF
   page — locate the one on the main page and replicate it on the Cyberhounds page.
4. You chose a reddish-orange for red — use a dark modern red and match it with modern blues; there aren't many
   things that use the red anyway.
5. Like you made the 3D cube, make a 3D asset for the Cyberhounds page. The dog in the Cyberhounds logo is a
   pitbull — refs attached. Make it look serious, in the colors of the original Cyberhounds logo: black and red."

Everything else (type v3, composition, motion, cube rail, readouts, status bar, parity) is kept and must not
regress. Budget **150 min** (the 3D asset is the long pole — §5 has its own 60-min box). Checkpoints at
30/60/90/120 in `context/29_RUN5_LOG.md`. No questions; ambiguity → the choice closest to the named ref; log it.

## 1. New assets on disk (read them first)

- `assets/brand/jj_bloodhound.webp` — **the official John Jay Bloodhound mascot** (1472×1332, full color: navy
  outline, white/ice-blue fur, blue net beanie, TM mark). This is the footer mark now.
- `assets/refs/hound/cyberhound_logo_red_outline.png` — **the Cyberhounds logo**: a pitbull head, black fill,
  thick red outline, cropped ears, red eye slits, red nose/muzzle lines. This is the 3D asset's color and
  attitude reference.
- `assets/refs/hound/photo_pitbull_standing.png`, `photo_pitbull_bully_profile.png` — real pitbull anatomy
  (cropped ears, blocky head, heavy chest, wide stance, serious expression).
- `assets/refs/hound/stylized_*.png` — a stylized big-head/small-body vinyl-figure look Ryan grabbed for
  **proportion** only (blocky head ≈ 55 % of total height, stubby legs). Do **not** reproduce that toy style
  or its round glossy eyes — the Cyberhound is *serious*: narrowed eye slits from the logo, brow ridge, closed
  jowls, cropped ears, chest forward.
- `assets/refs/type/T09` (N1–N5 poster) and `T05` for how a mascot mark sits in a HUD frame.

## 2. Fin line → `END_OF_SECTION` with a hack/typing animation

Replace `FinLine.tsx`:
- Copy: `END_OF_SECTION · {n}` where `n` is the section index it closes (`01`…), mono/wide as now, then a
  second line `> next: /{route-or-section-slug}_` in mono micro.
- **Animation (in view, once; reduced-motion → instant):** the line types itself in at 22 ms/char with a
  block cursor `▮` that blinks at 1 Hz; before each real character lands, it shows 2–3 "hack" glyphs from
  `01<>/[]_#$%&` (the existing `Decode` scramble, but sequential like a terminal, not all-at-once). Total
  ≤ 1.4 s. After the line finishes, the binary whisper below decodes the same way in VT323 at 24 px.
- Hairlines either side draw in from the center (scaleX 0→1, 0.6 s) as the typing starts.
- The cube keyframe at the fin stays.

## 3. Footer brandmark → the official Bloodhound, no glaze

Delete the pixel-hound glaze (`HoundGlaze` / the cascade bands). In its place:
- `assets/brand/jj_bloodhound.webp` → convert once to `apps/web/public/img/jj_bloodhound.webp` (≤ 200 KB,
  1472 px) **and** produce a clean alpha version (`scripts/hound_alpha.py`: remove the white background by
  flood-fill from the corners with a 12-level tolerance, feather 1 px; verify no white halo on navy by
  rendering a test PNG on `#0C183C` and Reading it).
- Place it **right-anchored** in the footer's bottom zone: height ≈ 62 vh at 1440, bottom edge ~10 % below the
  footer's bottom (cropped), right edge bleeding 6 % off the viewport, at **full color, 100 % opacity** — it is
  the mascot, not a watermark. A single soft navy-900 gradient (`linear-gradient(90deg, navy-900 0 %,
  transparent 40 %)`) sits over its left third so the bottom-rail text stays readable. No fades, no glaze, no
  cascade, no tint.
- Left of it, the bottom rail keeps `CSS · JOHN JAY` (Unbounded 900) + copyright + `BACK_TO_TOP`.
- Motion: the hound slides up 40 px and settles (0.7 s, `[0.22,1,0.36,1]`) as the footer enters; on hover the
  beanie's net texture does nothing (leave it; no gimmicks).
- Mobile: height 42 vh, right-anchored, same crop. Keep the 3D cube + JJ wordmark lockup exactly as run 4.

## 4. Cyberhounds page — same pixel hound as Home

The Home §7 poster's `HoundPixel` (the red dot-matrix pitbull, `apps/web/src/sigils/HoundPixel.tsx` at its
Home resolution and color) is the mark Ryan likes. On `/cyberhounds`:
- Hero: use **that exact component at that exact resolution** (not the re-rasterized one) at 260 px, left of
  the cube, overlapping the cube's left edge by ~40 px, in front — per the run-4 follow-up. The 3D pitbull
  (§5) replaces the *cube* on this page's hero, so the final hero = pixel hound (260 px) + 3D pitbull (§5) in
  the bracket frame; no cube in the Cyberhounds hero. Cube stays in the poster band + footer.
- Section sigils on this page: `HoundPixel` at 16/24 px wherever `Shield`/`Flag` was used as the section mark.
- `PosterCard`s: the pixel hound at 48 px in the top-right corner rail.
- Make `HoundPixel` a single source of truth: one bitmap (32×32), one component, `size` prop only. Delete any
  duplicate hound rasters.

## 5. The 3D Cyberhound (`assets/hound3d/`, then `apps/web/public/hound/cyberhound.glb`) — 60-min box

Build it the way the cube was built: **procedural, in Python, no AI generation, no downloads of models**
(`assets/cube/build_cube.py` is the pattern; `manifold3d` + `trimesh` are installed in `.venv`; `numpy`).
Target: a **serious pitbull head-and-chest bust**, low-poly-clean (8–14 k tris), matching the Cyberhounds
logo's colors: **black body, red edge-lines**.

### 5a. Geometry (SDF/CSG, then mesh; keep the code parameterized like PROPORTIONS in `build_cube.py`)
- **Head**: a rounded box (hull of 8 spheres, like the cube plates) 1.0 × 0.82 × 0.9 (w×h×d), slightly wider
  at the cheeks (scale x 1.08 at y = −0.1), flat brow plane on top-front.
- **Muzzle**: a second rounded box 0.62 × 0.42 × 0.5 unioned to the front, lower third; **nose**: a
  flattened sphere r 0.13 at the muzzle tip; **jowl line**: a shallow V-groove (subtract a thin wedge) from
  the nose down and out to both sides (the logo's inverted-V muzzle lines).
- **Eyes**: two narrow slit **recesses** (subtract elongated boxes 0.22 × 0.05 × 0.08, rotated −12° / +12°
  so they angle down toward the nose — the logo's stern look) at y = +0.12, x = ±0.26. A red emissive strip
  fills each recess (separate mesh, material below).
- **Brow ridge**: a low rounded bar across above the eyes, unioned, giving the frown.
- **Ears**: two **cropped** triangular prisms (pitbull crop from the photos and the logo), 0.22 tall, set
  high and outward at x = ±0.42, y = +0.42, tilted 15° out.
- **Neck + chest**: a truncated cone into a wide rounded-box chest 1.3 × 0.55 × 0.7, so the bust reads
  heavy-shouldered (photo_pitbull_bully_profile). Bottom face flat and open (it sits on/behind the hero frame).
- **Collar**: a torus band with 6 small pyramid studs — the only ornament; omit if over time.
- Export with **split normals**, y-up, unit ≈ 1.6 tall, centered at the chest base; write
  `hound3d/README.md` with the parameter table and a `viewer.html` like the cube's.

### 5b. Materials (`CyberhoundSpot.tsx`, R3F, same lighting recipe as `CubeSpot`)
- Body: `MeshStandardMaterial` color `#0B0B0D`, roughness .55, metalness .15, with `RoomEnvironment`.
- **Red edge-lines** (the logo's outline): `EdgesGeometry(threshold 28°)` → `LineSegments` in `--color-red`
  (§6's new red) at 1.5 px via `Line2`/`LineMaterial`, plus a `BackSide` shell mesh scaled 1.03 in the same
  red at 0.9 opacity (gives a solid red rim like the logo's thick stroke). Eyes + nose: emissive red
  `#E0242C` intensity 1.4, Bloom threshold .8 intensity .5 (page-local).
- Idle: slow head turn ±8° over 6 s, breath (chest scale y 1.00→1.015, 3 s); pointer-follow: head yaws
  toward the cursor ±18°, eased; drag rotates the whole bust; on hover the eye slits brighten (emissive 1.4→2.2).
- Fallback (no WebGL): the pixel hound at 320 px.
- Mount: Cyberhounds hero bracket frame (`scale` so the bust is ~380 px tall at 1440), right column, with
  `Scanlines` + `Halftone` behind; pixel hound 260 px overlapping its lower-left (front).
- If the bust is not recognizably a pitbull by minute 45 (Read your own render at 3 angles + a compare sheet
  against the logo and the standing photo), ship a **head-only** version (§5a head+muzzle+ears+eyes) — better
  a good head than a bad bust — and log it.

## 6. Red palette — dark modern red, tuned to the blues

Current `--color-red: #CE4A4A` reads orange-ish against navy. Replace:

```
--color-red:       #B3202A;   /* dark modern red — the accent (Cyberhounds, Events) */
--color-red-hi:    #E0242C;   /* emissive / hover / eye slits / stencil ghost only */
--color-red-deep:  #7A1119;   /* poster-band fills, chamfer stubs, hound rim shadow */
--color-cube-red:  #D82028;   /* unchanged — the physical cube face */
```

- Tinted red paper stays ≤ 3 % (`color-mix` with the new `--color-red`); check it doesn't read pink.
- `HOUNDS` solid word → `--color-red`; its ghost outline → white as now; stencil bars unchanged.
- AA check: `--color-red` on navy-600 for text ≥ 18 px passes (verify with the run-1 contrast script; if it
  fails for 11 px labels, labels use `--color-red-hi`, log it).
- Blues stay exactly as tokens (navy family, teal, `#1E80F0`). Update `DESIGN.md` §palette and `context/05`.

## 7. Loop

- Loop 0 (≤ 25 min): §6 tokens → §2 FinLine → §3 footer hound → §4 HoundPixel single source + Cyberhounds
  page placement. Shoot Home fin + footer-bottom, Cyberhounds vp-0; compare vs `assets/brand/jj_bloodhound.webp`
  (footer) and the Home poster (hound consistency); score; ≤ 2 iterations; commit `feat(ui): run5 loop0`.
- Loop 1 (≤ 60 min): §5 hound3d build → render 3 angles → compare sheet vs `cyberhound_logo_red_outline.png`
  + `photo_pitbull_standing.png` → iterate ≤ 4 → `CyberhoundSpot` → Cyberhounds hero → shoot → commit
  `feat(3d): cyberhound bust`.
- Loop 2 (≤ 30 min): every page — fin lines, red tokens, regressions; `font_audit`; parity; Lighthouse ≥ 83;
  commit `fix(ui): run5 sweep`.

## 8. Rubric (1–5, gate ≥ 4)

1. Fin line says END_OF_SECTION, types in with cursor + hack glyphs, hairlines draw; visible in motion frames.
2. Footer shows the official Bloodhound at full color, right-anchored, cropped, no glaze/fade/cascade; rail readable.
3. Cyberhounds page uses the identical pixel hound as Home (same bitmap, same red) in hero, section marks, posters.
4. 3D Cyberhound: recognizably a serious pitbull (cropped ears, slit eyes, blocky muzzle, heavy chest); black
   body + red edge rim + red emissive eyes; idle + pointer-follow + drag; ~380 px in the hero frame.
5. Red is `#B3202A` family everywhere red was; no orange cast; AA passes; blues untouched.
6. Nothing regressed (type audit, cube rail, readouts, status bar, parity 28/28, Lighthouse ≥ 83).

## 9. Don'ts

No AI-generated 3D, no downloaded models, no toy/vinyl-figure look, no round glossy eyes, no open-mouth
cartoon, no glaze/fade on the footer mascot, no new fonts, no cream, no pills, no `api/` changes, no
questions.

## 10. End

Commit; `qa/REPORT_RUN5.md` (scores, hound renders at 3 angles + compare sheet, fin motion frames, footer
shot); `context/29_RUN5_LOG.md`; `assets/hound3d/README.md`; update `DESIGN.md`/`context/05`/`SOURCES.md`
(Bloodhound mascot is John Jay's mark — note it in the handoff as board-owned). Print the score table, the
five next fixes, and the two dev commands.
