# 06 — The cube asset (logo → vector → 3D)

Files: `assets/brand/` (2D) and `assets/cube/` (3D). Everything here was produced in
the planning session; nothing is AI-generated.

## Step 1 — the 2D logo

- Ryan's source: a screenshot of the logo from the old site, cut out in Pixlr and
  saved as `pre_upscale_cs_jj.png` (494×418, RGBA, logo ~308 px across, some artifact
  streaks from the background remover). Kept at `assets/source/`.
- First attempt (from a *screenshot of the Pixlr window*) was bad: checkerboard baked
  into pixels, colors washed by Pixlr's display scaling. Discarded.
- Final method: **vector trace**. Sample the real palette from the file, de-matte the
  edge pixels (replace the 1–2 px anti-aliasing rim with interior color so it doesn't
  quantize into a ragged band), **upscale first (bicubic, 5×), quantize second**
  (k-means, 22 flat colors, boundary band excluded and filled from interior labels),
  smooth the dithered alpha edge (the source's coverage jumped 143→207→159 along
  straight runs), then trace each region with potrace as **cumulative masks** (region i
  = itself + everything drawn after it) so there are no seams and no base-color bleed.
- Output: `cs_logo_sharp.svg` (true vector), `cs_logo_3000.png` (2944×2934),
  `cs_logo_1024.png`. These replace `cssclub.png` / `csslogo.png` from the old site.
- Caveat recorded: a trace is an interpretation — the shading is flat regions rather
  than the original's smooth gradients. At a glance identical; not the original artwork.
  The genuinely original asset would be whatever file the source site served; that
  was never located.

## Step 2 — the AI 3D attempt (Supavoxel) — rejected as an asset

Ryan ran the 3000 px PNG through Supavoxel (image → 3D, 3 credits). Screenshots in
`assets/refs/supavoxel/`. Verdict:
- Front three faces: decent silhouette, plastic feel, bevel radius and groove depth
  convincing. Concept validated: the logo *works* as a physical object.
- **Back faces are garbage** (smeared texture, no letters — the model never saw them).
- Color bleeding on visible faces (purple stripe on blue, blue smear on red).
- The green "S" isn't an S (two disconnected slits).
- **1,500,000 triangles** — decimation would chew up the one thing it got right.
- Kept only as reference for bevel/groove proportions.

## Step 3 — the procedural rebuild (the actual asset)

Insight: the logo is geometrically simple once you see it — **six rounded plates on a
dark core; each letter is notches cut into a plate.** Red C = one thick notch from the
seam edge. Blue S = two notches from opposite edges. Green S = two grooves from
opposite edges. Opposite faces carry the same letter so it reads C-S-S from any angle.

Built in Python with `manifold3d` (robust CSG) + `trimesh`, exported to GLB.
`assets/cube/build_cube.py` regenerates it; edit the numbers under `PROPORTIONS`:

```
T=0.24   plate thickness           R=0.13   plate edge radius
GAP=0.015 plate inset from cube edge (widens seams)
C_W,C_D,C_L = 0.27, 0.075, 0.62    C notch width/depth/length
S_W,S_D,S_L = 0.12, 0.065, 0.58    S notch width/depth/length
S_OFF=0.16  S notch offset from face center     G_OFF=0.14  top-face groove offset
RED=(216,32,40) GREEN=(112,184,64) BLUE=(32,88,160) CORE=(26,22,24)
```

Construction details that matter if you touch it:
- Rounded plate = convex hull of 8 spheres (gives radius-R edges everywhere).
- Each plate is **clipped to its face's pyramid** (the Voronoi cell of that face) so plates
  never overlap — that's what killed the neighbor-color bleeding at notch mouths.
- Notch cutters are small rounded boxes (rounded groove ends and floors).
- Dark core = cube half-size 0.40 (must stay **below** the notch floors at 0.425, or it
  pokes through) + eight r=0.09 spheres at ±0.36 plugging the corner cavities.
- Normals are split at 40° via `calculate_normals` — without exported normals, three.js
  smooths across shared vertices and everything looks flat/dim (this was a real bug).
- Result: ~7k triangles (core 12 + 3 plates ~1.9–2.9k each), 3 flat PBR materials, ~400 KB.

Face map (world axes):
```
+Z / -Z   red   C     (viewer's left in the logo view)
+X / -X   blue  S     (viewer's right)
+Y / -Y   green S     (top)
camera at (+1, +0.85, +1) looking at origin = the logo's angle
```
Letter orientation was matched against the sharp logo: C opens toward the seam; blue S
upper notch opens right (away from seam), lower opens left (seam side); green top grooves
run along Z, the far-edge groove at x=+G_OFF, the near-edge groove at x=−G_OFF.

## Material + lighting recipe (what the renders use — start here in R3F)

```
MeshPhysicalMaterial: roughness 0.42, metalness 0, clearcoat 0.55, clearcoatRoughness 0.22
core: MeshStandardMaterial #111114, roughness 1
RoomEnvironment, environmentIntensity 0.3
key DirectionalLight 1.0 from (-1.5, 4.5, 3.5), castShadow (2048 map, PCFSoft)
fill DirectionalLight 0.45 from (4, 1.5, -2); ambient 0.15
NeutralToneMapping, exposure 0.8
```
`assets/cube/viewer.html` is a runnable Three.js reference (importmap → local
`node_modules/three`; `npm install` then serve the folder). Query params:
`?view=front|back|left|right|top|bottom|straight&spin=deg&tm=none|aces|agx|neutral
&exp=&env=&key=&transparent=1&nofloor=1&noshadow=1&debug=normals`.

## Renders

`assets/cube/renders/`: `render_{front,back,left,right,top,bottom}.png` (1200×1000),
`contact.png` (all six), `hero_transparent.png` (1600×1400, alpha), `cs_cube_turntable.gif`
(36 frames, 480×420).

## Known differences from the original render (taste calls, all tunable)

- Original is puffier: plates bulge more, groove walls softer/deeper. Ours is crisper,
  more toy-like. Adjust `R`, `T`, `C_D`, `S_D`.
- A hair of neighbor color shows at some edges where rounded plates meet; physically
  correct for a cube of separate plates; tune with `GAP`.

## Using it in the site (plan)

- `useGLTF('/cube/cs_cube.glb')` in R3F; apply the material recipe above (the GLB's
  materials are flat base colors only).
- Home hero only; lazy-loaded; single canvas; paused off-screen; reduced-motion → SVG.
- The three plates are separate meshes named `red_C`, `green_S`, `blue_S` (+ `core`),
  so per-face hover/click (cube-as-nav) is a raycast against a named mesh.
- Scroll-driven "explode into three faces" animates the three plate groups apart.
- Fallbacks: `hero_transparent.png` and `cs_logo_sharp.svg`.
