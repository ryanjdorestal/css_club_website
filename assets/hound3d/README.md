# Cyberhound — the Cyberhounds pitbull as a 3D asset

Procedurally built, no Blender, no AI generation, no downloaded models — the
same way the cube was built (`assets/cube/build_cube.py`). A serious pitbull
head-and-chest bust in the Cyberhounds logo's colours: black body, red edge
rim, red emissive eye slits. ~9.3k triangles, four nodes, no textures.

Refs: `assets/refs/hound/cyberhound_logo_red_outline.png` (colour + attitude),
`photo_pitbull_standing.png` / `photo_pitbull_bully_profile.png` (anatomy:
cropped ears, blocky head, heavy chest). The stylized vinyl-figure refs were
used for the head-to-body ratio only — no round glossy eyes, no toy look.

## Files
- `cyberhound.glb`   the asset (copied to `apps/web/public/hound/cyberhound.glb`).
                     Nodes: `body` (chest + neck + collar), `head` (skull, muzzle,
                     jaw, brows, ears; eye slits + jowl lines cut in), `eyes`
                     (two strips, emissive), `nose` (rounded pad, low emissive).
- `build_hound.py`   rebuilds the GLB. Edit the numbers under PROPORTIONS.
                     `.venv/bin/python assets/hound3d/build_hound.py` (`SEG=36` for the shipped density).
- `viewer.html`      Three.js reference viewer with the material/lighting recipe.
                     Serve the REPO ROOT (`python3 -m http.server 8787`) and open
                     `/assets/hound3d/viewer.html?view=front|three|side|back|up|low`.
                     `apps/web/qa-scripts/hound_render.mjs <tag>` shoots the three angles.
- `renders/`         v1…v6 iterations at three angles; `qa/loops/run5/hound_compare.png`
                     is the compare sheet against the logo and the standing photo.

## Frame + pivot
y up, +z is the direction the dog faces, x right. Chest base at y = 0, ear tips
≈ 1.67. The head is exported in world space; `HEAD_PIVOT = (0, 0.96, 0.10)` is
the neck point the R3F component yaws it around (`CyberhoundCanvas.tsx`).

## Parameter table (world units; `build_hound.py` PROPORTIONS)
| Part | Numbers | Note |
|---|---|---|
| Head | rbox 1.08 × 0.74 × 0.86, r 0.22, centre (0, 1.14, 0.12) | hull of 8 spheres |
| Cheeks | x × 1.14 around local y −0.12 (σ 0.20); two r 0.19 spheres at (±0.43, −0.12, 0.14); skull tapers −10 % x toward the crown | jaw muscles, trapezoid front |
| Forehead | plane cut 30° leaning back through (0, 0.33, 0.26) head-local; median furrow 0.03 × 0.30, 0.02 deep | the pitbull "stop" + furrow |
| Muzzle | rbox 0.76 × 0.46 × 0.46, r 0.17, centre y −0.12, sunk 0.26 into the front; x flares +10 % toward the bottom | blocky, hanging jowls |
| Jaw | rbox 0.60 × 0.20 × 0.44, r 0.09, y −0.22 under the muzzle | closed mouth |
| Nose | rbox 0.24 × 0.13 × 0.12, r 0.045 at the muzzle tip-top | separate node, emissive 0.35 |
| Jowl lines | philtrum 0.12 + two lips 0.24 at ±40°, width 0.028, depth 0.035 | the logo's inverted V |
| Eyes | recess 0.26 × 0.07 × 0.08 at (±0.27, +0.11), tilted ∓12° (inner end lower) | strips 0.24 × 0.054, emissive 1.4 → 2.2 on hover |
| Brows | two rbox 0.38 × 0.085 × 0.22 at (±0.26, eye +0.09), tilt 14°, 0.035 proud | the frown |
| Ears | cropped prism, base 0.30 × 0.20, 0.19 tall, tip r 0.035, at x ±0.40, z −0.06, tilt 26° out, sunk 0.08 | pitbull crop |
| Neck | cone r 0.52 → 0.40, h 0.50 from y 0.45, x × 1.20, leans +0.12 z | |
| Chest | rbox 1.36 × 0.60 × 0.76, r 0.20 + shoulder spheres r 0.24 at (±0.52, 0.34, −0.04) | bottom cut flat at y 0.02 |
| Collar | torus R 0.50 (× 1.15 x), tube 0.05 at y 0.74, 6 pyramid studs | the only ornament |

## Material recipe (viewer.html = CyberhoundCanvas.tsx)
Body `MeshStandardMaterial #0B0B0D`, roughness 0.55, metalness 0.15, RoomEnvironment 0.35.
Red rim = `EdgesGeometry(40°)` → `LineSegments2` 1.5 px in `--color-red` **plus** a
BackSide shell of the same geometry scaled 1.03 in `--color-red` at 0.9 opacity
(the logo's thick stroke). Eyes + nose emissive `--color-red-hi #E0242C`
(1.4 / 0.35), Bloom threshold 0.8, intensity 0.5, page-local. Key light
1.4 upper-left-front, fill 0.5 right-rear, a red-hi rim 0.9 from behind,
NeutralToneMapping at 0.9.

## Iterations (renders/)
v1 sphere nose + full-width brow bar read as a clown/visor · v2 split brows,
jaw, box nose · v3 ears cropped shorter and tilted, muzzle blended, cheek
spheres · v4 pec spheres removed (their crease read as a scratch), brows off the
slits · v5 eye slits 0.062 tall, SEG 36 · **v6 skull taper, jowl flare, median furrow, slits 0.07 — shipped** (9.3k tris, 247 KB).
