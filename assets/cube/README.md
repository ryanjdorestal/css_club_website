# CS cube — John Jay CSS logo as a 3D asset

Procedurally built, no Blender. Six rounded plates on a dark core; letters are
notches cut into the plates. Opposite faces carry the same letter, so it reads
C-S-S from every angle. ~7k triangles, three flat materials (no textures).

## Files
- `cs_cube.glb`          the asset. Drop into Three.js / R3F (`useGLTF`).
- `build_cube.py`        rebuilds the GLB. Edit the numbers under PROPORTIONS.
                         `pip install manifold3d trimesh numpy` then `python3 build_cube.py`
- `viewer.html`          Three.js reference viewer + the material/lighting recipe
                         that produced the renders. `npm install` then serve the folder
                         (`python3 -m http.server`) and open `viewer.html?view=front`.
- `renders/`             six views, transparent hero, turntable GIF.

## Material recipe (what the renders use)
MeshPhysicalMaterial: roughness 0.42, clearcoat 0.55, clearcoatRoughness 0.22.
RoomEnvironment at intensity 0.3, one key DirectionalLight 1.0 from upper-left-front,
a 0.45 fill from the right-rear, NeutralToneMapping at exposure 0.8.
The GLB carries no NORMAL smoothing groups you need to fix — normals are split at 40°.

## Face map (for the "cube as nav" idea)
+Z / -Z  red   C
+X / -X  blue  S
+Y / -Y  green S
Camera at (+1, +0.85, +1) looking at the origin reproduces the logo's angle.
