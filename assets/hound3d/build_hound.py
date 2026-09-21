"""
Cyberhound — procedural pitbull head-and-chest bust for the Cyberhounds page.
Built the way the cube was built (assets/cube/build_cube.py): SDF/CSG in
manifold3d, no sculpting, no AI, no downloaded models. Colour + attitude ref:
assets/refs/hound/cyberhound_logo_red_outline.png (black fill, red outline,
cropped ears, narrowed eye slits, inverted-V jowl lines). Anatomy ref:
photo_pitbull_standing.png / photo_pitbull_bully_profile.png.

Frame: y up, +z is the direction the dog faces, x right (viewer's left = -x).
Unit: chest base at y=0, ear tips ≈ 1.6. Head pivot (for the R3F head turn)
is HEAD_PIVOT below — the head mesh is exported in world space; the viewer
offsets it around that point.

Edit the numbers under PROPORTIONS and re-run:
    .venv/bin/python assets/hound3d/build_hound.py
Output: cyberhound.glb (nodes: body, head, eyes, nose)
"""
import os, sys, math
import numpy as np, trimesh
from manifold3d import Manifold, CrossSection, set_circular_segments

set_circular_segments(int(os.environ.get("SEG", 28)))

# ---------- PROPORTIONS (world units; see docstring) ----------
HEAD_W, HEAD_H, HEAD_D, HEAD_R = 1.08, 0.74, 0.86, 0.22
HEAD_C = (0.0, 1.14, 0.12)            # head centre
CHEEK_SCALE, CHEEK_Y, CHEEK_SIG = 1.14, -0.12, 0.20
SKULL_TAPER = 0.10                    # x narrows by this fraction at the top of the head (trapezoid front)
FURROW_W, FURROW_D, FURROW_LEN = 0.03, 0.02, 0.30   # median furrow down the forehead
CHEEK_BULGE_R, CHEEK_BULGE = 0.19, (0.43, -0.12, 0.14)   # jaw-muscle spheres, head-local   # widen x at head-local y=-0.1
BROW_CUT_DEG, BROW_CUT_Y, BROW_CUT_Z = 30.0, 0.33, 0.26   # forehead slopes back from the brow

MUZ_W, MUZ_H, MUZ_D, MUZ_R = 0.76, 0.46, 0.46, 0.17
JOWL_FLARE = 0.10                     # muzzle x widens by this fraction toward its bottom (hanging jowls)
JAW_W, JAW_H, JAW_D, JAW_R, JAW_DY = 0.60, 0.20, 0.44, 0.09, -0.22   # closed lower jaw under the muzzle
MUZ_DY, MUZ_OVERLAP = -0.12, 0.26      # muzzle centre below head centre; how far it sinks into the head

NOSE_W, NOSE_H, NOSE_D, NOSE_R = 0.24, 0.13, 0.12, 0.045   # nose pad (rounded box so its edge lines draw)
JOWL_DEPTH, JOWL_T, JOWL_ANGLE, JOWL_LEN = 0.035, 0.028, 40.0, 0.24
PHILTRUM_LEN = 0.12

EYE_W, EYE_H, EYE_D, EYE_TILT = 0.26, 0.07, 0.08, 12.0
EYE_X, EYE_DY = 0.27, 0.11             # ± x, y above head centre
EYE_STRIP = (0.24, 0.054, 0.02)

BROW_W, BROW_H, BROW_D, BROW_R, BROW_TILT, BROW_PROUD = 0.38, 0.085, 0.22, 0.035, 14.0, 0.035   # two angled brow bars (inner ends lower = frown)
BROW_X, BROW_DY = 0.26, 0.09   # per side; above the eye

EAR_H, EAR_BASE_W, EAR_BASE_D, EAR_X, EAR_TILT = 0.19, 0.30, 0.20, 0.40, 26.0
EAR_TIP_R = 0.035
EAR_Z, EAR_SINK = -0.06, 0.08

NECK_H, NECK_R_LOW, NECK_R_HIGH, NECK_XSCALE, NECK_LEAN = 0.50, 0.52, 0.40, 1.20, 0.12
NECK_Y0 = 0.45

CHEST_W, CHEST_H, CHEST_D, CHEST_R = 1.36, 0.60, 0.76, 0.20
PEC_R, PEC_X, PEC_Y, PEC_Z = 0.0, 0.25, 0.30, 0.21   # 0 = no pec spheres (v3: crease read as a scratch)
SHOULDER_R, SHOULDER_X, SHOULDER_Y, SHOULDER_Z = 0.24, 0.52, 0.34, -0.04

COLLAR = True
COLLAR_R, COLLAR_TUBE, COLLAR_Y, COLLAR_STUDS, COLLAR_XSCALE = 0.50, 0.05, 0.74, 6, 1.15

HEAD_PIVOT = (0.0, 0.96, 0.10)

BODY_RGB = (11, 11, 13)
EYE_RGB = (224, 36, 44)

# ---------- helpers ----------
def rbox(w, h, d, r):
    """Rounded box centred at origin: hull of 8 spheres (same as the cube plates)."""
    r = min(r, w / 2, h / 2, d / 2)
    hw, hh, hd = w / 2 - r, h / 2 - r, d / 2 - r
    pts = [Manifold.sphere(r).translate([sx * hw, sy * hh, sz * hd])
           for sx in (-1, 1) for sy in (-1, 1) for sz in (-1, 1)]
    return Manifold.batch_hull(pts)

def half_space_cut(man, point, normal):
    """Remove everything on the +normal side of the plane through `point`."""
    n = np.asarray(normal, float); n /= np.linalg.norm(n)
    big = 20.0
    box = Manifold.cube([big, big, big], True).translate([0, 0, big / 2])   # occupies z >= 0
    # rotate +z onto n
    z = np.array([0, 0, 1.0]); v = np.cross(z, n); s = np.linalg.norm(v); c = float(np.dot(z, n))
    if s < 1e-9:
        R = np.eye(3) if c > 0 else np.diag([1, -1, -1])
    else:
        vx = np.array([[0, -v[2], v[1]], [v[2], 0, -v[0]], [-v[1], v[0], 0]])
        R = np.eye(3) + vx + vx @ vx * ((1 - c) / s ** 2)
    M = np.eye(4); M[:3, :3] = R; M[:3, 3] = np.asarray(point, float)
    return man - box.transform(M[:3, :])

def warp_xyz(man, fn):
    """Vectorised warp: fn(np.ndarray[N,3]) -> np.ndarray[N,3]."""
    if hasattr(man, "warp_batch"):
        return man.warp_batch(fn)
    return man.warp(lambda v: fn(np.asarray([v], float))[0].tolist())

# ---------- HEAD ----------
hx, hy, hz = HEAD_C
head = rbox(HEAD_W, HEAD_H, HEAD_D, HEAD_R)
# cheeks: widen x around local y = CHEEK_Y
def cheeks(v):
    v = v.copy()
    g = np.exp(-((v[:, 1] - CHEEK_Y) / CHEEK_SIG) ** 2)
    v[:, 0] *= 1 + (CHEEK_SCALE - 1) * g
    t = np.clip(v[:, 1] / (HEAD_H / 2), 0, 1)           # 0 at centre, 1 at the crown
    v[:, 0] *= 1 - SKULL_TAPER * t
    return v
head = warp_xyz(head, cheeks)
# forehead: slice the top-front corner with a plane leaning back (the pitbull "stop")
ang = math.radians(BROW_CUT_DEG)
head = half_space_cut(head, [0, BROW_CUT_Y, BROW_CUT_Z], [0, math.cos(ang), math.sin(ang)])
for sgn in (1, -1):
    head = head + Manifold.sphere(CHEEK_BULGE_R).translate([sgn * CHEEK_BULGE[0], CHEEK_BULGE[1], CHEEK_BULGE[2]])
head = head.translate([hx, hy, hz])

head_front = hz + HEAD_D / 2                       # z of the flat front plane
# muzzle
muz_c = (0.0, hy + MUZ_DY, head_front - MUZ_OVERLAP + MUZ_D / 2)
def jowls(v):
    v = v.copy()
    t = np.clip(-v[:, 1] / (MUZ_H / 2), 0, 1)            # 0 at centre, 1 at the muzzle bottom
    v[:, 0] *= 1 + JOWL_FLARE * t
    return v
muzzle = warp_xyz(rbox(MUZ_W, MUZ_H, MUZ_D, MUZ_R), jowls).translate(list(muz_c))
muz_tip = muz_c[2] + MUZ_D / 2
# lower jaw (closed mouth) under the muzzle
jaw = rbox(JAW_W, JAW_H, JAW_D, JAW_R).translate([0, muz_c[1] + JAW_DY, muz_tip - JAW_D / 2 - 0.03])
# brow ridges (the frown): two bars angled like the eyes, proud of the front plane
eye_y = hy + EYE_DY
brow = None
for sgn in (1, -1):
    b = rbox(BROW_W, BROW_H, BROW_D, BROW_R).rotate([0, 0, sgn * BROW_TILT]).translate([sgn * BROW_X, eye_y + BROW_DY, head_front - BROW_D / 2 + BROW_PROUD])
    brow = b if brow is None else brow + b
# ears: cropped triangular prisms, tilted outward
def ear(sign):
    bw, bd = EAR_BASE_W / 2, EAR_BASE_D / 2
    base = [[-bw, 0, -bd], [bw, 0, -bd], [bw, 0, bd], [-bw, 0, bd]]
    # rounded crop tip: hull of the base rectangle + two small spheres at the apex
    tips = [Manifold.sphere(EAR_TIP_R).translate([0, EAR_H - EAR_TIP_R, z]) for z in (-bd * 0.3, bd * 0.3)]
    e = Manifold.batch_hull([Manifold.hull_points(base + [[0, 0.01, 0]])] + tips)
    e = e.rotate([0, 0, -sign * EAR_TILT])
    top_y = hy + HEAD_H / 2 - EAR_SINK
    return e.translate([sign * EAR_X, top_y, hz + EAR_Z])
ears = ear(1) + ear(-1)

head = head + muzzle + jaw + brow + ears

# eye slit recesses (angled down toward the nose)
def eye_box(sign, w, h, d):
    b = Manifold.cube([w, h, d], True).rotate([0, 0, sign * EYE_TILT])
    return b
eye_cut_z = head_front - EYE_D / 2 + 0.045                 # cuts ~0.045 into the front plane
cuts = [eye_box(s, EYE_W, EYE_H, EYE_D).translate([s * EYE_X, eye_y, eye_cut_z]) for s in (1, -1)]
# jowl lines: philtrum + inverted V from under the nose, cut into the muzzle tip
nose_c = (0.0, muz_c[1] + MUZ_H / 2 - NOSE_H * 0.7, muz_tip - NOSE_D / 2 + 0.05)
phil = Manifold.cube([JOWL_T, PHILTRUM_LEN, JOWL_DEPTH * 2], True).translate([0, nose_c[1] - NOSE_H / 2 - PHILTRUM_LEN / 2, muz_tip])
cuts.append(phil)
for s in (1, -1):
    lip = Manifold.cube([JOWL_LEN, JOWL_T, JOWL_DEPTH * 2], True)
    lip = lip.translate([JOWL_LEN / 2, 0, 0]).rotate([0, 0, -JOWL_ANGLE if s > 0 else 180 + JOWL_ANGLE])
    cuts.append(lip.translate([0, nose_c[1] - NOSE_H / 2 - PHILTRUM_LEN, muz_tip]))
# median furrow: a thin groove up the forehead from between the brows
furrow = Manifold.cube([FURROW_W, FURROW_LEN, FURROW_D * 2], True).rotate([-BROW_CUT_DEG * 0.5, 0, 0]).translate([0, eye_y + BROW_DY + 0.05 + FURROW_LEN / 2, head_front - 0.06])
cuts.append(furrow)
for c in cuts:
    head = head - c

# emissive parts (separate meshes)
eyes = None
for s in (1, -1):
    strip = Manifold.cube(list(EYE_STRIP), True).rotate([0, 0, s * EYE_TILT]).translate([s * EYE_X, eye_y, head_front - 0.045 + EYE_STRIP[2] / 2 + 0.004])
    eyes = strip if eyes is None else eyes + strip
nose = rbox(NOSE_W, NOSE_H, NOSE_D, NOSE_R).translate(list(nose_c))

# ---------- BODY ----------
chest = rbox(CHEST_W, CHEST_H, CHEST_D, CHEST_R).translate([0, CHEST_H / 2, 0])
for s in (1, -1):
    if PEC_R > 0:
        chest = chest + Manifold.sphere(PEC_R).translate([s * PEC_X, PEC_Y, PEC_Z])
    chest = chest + Manifold.sphere(SHOULDER_R).translate([s * SHOULDER_X, SHOULDER_Y, SHOULDER_Z])
neck = Manifold.cylinder(NECK_H, NECK_R_LOW, NECK_R_HIGH).rotate([-90, 0, 0])   # along +y
def lean(v):
    v = v.copy()
    t = np.clip(v[:, 1] / NECK_H, 0, 1)
    v[:, 2] += NECK_LEAN * t
    v[:, 0] *= NECK_XSCALE
    return v
neck = warp_xyz(neck, lean).translate([0, NECK_Y0, 0.02])
body = chest + neck
if COLLAR:
    ring = CrossSection.circle(COLLAR_TUBE).translate([COLLAR_R, 0])
    collar = Manifold.revolve(ring, 36).rotate([-90, 0, 0]).scale([COLLAR_XSCALE, 1, 1])
    for i in range(COLLAR_STUDS):
        a = 2 * math.pi * i / COLLAR_STUDS + math.pi / COLLAR_STUDS
        px, pz = math.cos(a) * COLLAR_R * COLLAR_XSCALE, math.sin(a) * COLLAR_R
        stud = Manifold.hull_points([[-0.035, -0.035, 0], [0.035, -0.035, 0], [0.035, 0.035, 0], [-0.035, 0.035, 0], [0, 0, 0.06]])
        stud = stud.rotate([0, math.degrees(math.atan2(px, pz)), 0]).translate([px, 0, pz])
        collar = collar + stud
    collar = collar.translate([0, COLLAR_Y, 0.08])
    body = body + collar
# flat open bottom
body = body - Manifold.cube([6, 6, 6], True).translate([0, -3 + 0.02, 0])

# ---------- export ----------
def to_trimesh(man, rgb, sharp=28):
    man = man.calculate_normals(0, sharp)
    mesh = man.to_mesh()
    props = np.asarray(mesh.vert_properties)
    v, n = props[:, :3], props[:, 3:6]
    f = np.asarray(mesh.tri_verts)
    tm = trimesh.Trimesh(v, f, vertex_normals=n, process=False)
    tm.visual = trimesh.visual.TextureVisuals(material=trimesh.visual.material.PBRMaterial(
        baseColorFactor=[*rgb, 255], metallicFactor=0.15, roughnessFactor=0.55))
    return tm

out = os.path.join(os.path.dirname(os.path.abspath(__file__)), "cyberhound.glb")
scene = trimesh.Scene()
total = 0
for name, man, rgb in [("body", body, BODY_RGB), ("head", head, BODY_RGB), ("eyes", eyes, EYE_RGB), ("nose", nose, EYE_RGB)]:
    tm = to_trimesh(man, rgb)
    scene.add_geometry(tm, node_name=name, geom_name=name)
    total += len(tm.faces)
    b = tm.bounds
    print(f"{name:5s} tris={len(tm.faces):6d} watertight={tm.is_watertight}  y[{b[0][1]:.2f},{b[1][1]:.2f}] x[{b[0][0]:.2f},{b[1][0]:.2f}] z[{b[0][2]:.2f},{b[1][2]:.2f}]")
scene.export(out)
print(f"total tris={total}  {os.path.basename(out)} {os.path.getsize(out)//1024} KB  head_pivot={HEAD_PIVOT}")
