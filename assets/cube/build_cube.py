"""
CS cube — clean procedural rebuild of the John Jay CSS logo as 3D.
Six rounded plates on a dark core. Letters are notches cut into the plates:
  red   C : one thick notch from the seam edge
  blue  S : two notches from opposite edges
  green S : two grooves from opposite edges
Opposite faces carry the same letter so any rotation reads C-S-S.
Edit the numbers under PROPORTIONS and re-run.  Output: cs_cube.glb
"""
import numpy as np, trimesh
from manifold3d import Manifold, set_circular_segments

set_circular_segments(48)

# ---------- PROPORTIONS (fraction of cube edge = 1.0) ----------
T      = 0.24   # plate thickness
R      = 0.13   # plate edge radius
GAP    = 0.015  # plate inset from the cube's true edge (widens the seams a touch)
C_W, C_D, C_L = 0.27, 0.075, 0.62   # C notch: width, depth, length
S_W, S_D, S_L = 0.12, 0.065, 0.58   # S notch: width, depth, length
S_OFF  = 0.16   # S notch offset from face centre (both directions)
G_OFF  = 0.14   # top-face groove offset from centre

RED   = (216, 32, 40)
GREEN = (112, 184, 64)
BLUE  = (32, 88, 160)
CORE  = (26, 22, 24)

def rbox(w, h, d, r):
    """Rounded box centred at origin: hull of 8 spheres."""
    hw, hh, hd = w/2-r, h/2-r, d/2-r
    pts=[Manifold.sphere(r).translate([sx*hw, sy*hh, sz*hd])
         for sx in (-1,1) for sy in (-1,1) for sz in (-1,1)]
    return Manifold.batch_hull(pts)

def plate(letter):
    """
    Plate in local frame: outer surface at z=+T/2, face spans x,y in [-0.5,0.5].
    Local u=+x (viewer's right), v=+y (up) when looking at the face from +z.
    """
    w = 1.0 - 2*GAP
    p = rbox(w, w, T, R)
    cuts=[]
    def notch(u0, u1, v_c, width, depth):
        # box from u0..u1, centred at v_c, cutting `depth` into the outer surface
        cx=(u0+u1)/2; L=abs(u1-u0)
        # rounded cutter so the groove ends and floor are softly rounded like the render
        cuts.append(rbox(L + 0.06, width, depth*2 + 0.08, min(0.03, width*0.35))
                    .translate([cx + (0.03 if u0 > u1 else -0.03), v_c, T/2 + 0.04]))
    if letter=='C':
        notch(0.5, 0.5-C_L,  0.0, C_W, C_D)            # opens to the right (seam side)
    elif letter=='S':
        notch(0.5, 0.5-S_L, +S_OFF, S_W, S_D)          # upper notch opens right
        notch(-0.5, -0.5+S_L, -S_OFF, S_W, S_D)        # lower notch opens left
    elif letter=='S_top':
        notch(0.5, 0.5-S_L, +G_OFF, S_W, S_D)
        notch(-0.5, -0.5+S_L, -G_OFF, S_W, S_D)
    for c in cuts: p = p - c
    a = 0.5 - GAP; z0 = 0.5; z1 = 0.7; a1 = a * z1 / z0   # same slope, extended past the surface
    pyramid = Manifold.hull_points([[0,0,0],[a1,a1,z1],[-a1,a1,z1],[a1,-a1,z1],[-a1,-a1,z1]])
    # plate lives at local z in [-T/2, T/2]; shift pyramid so its outer square sits at the plate's outer surface
    return p ^ pyramid.translate([0,0,T/2 - z0])

def place(p, face):
    """Move a local plate (outer surface +z) onto a cube face."""
    off = 0.5 - T/2
    if face=='+Z': return p.translate([0,0,off])
    if face=='-Z': return p.rotate([0,180,0]).translate([0,0,-off])
    if face=='+X': return p.rotate([0,90,0]).translate([off,0,0])
    if face=='-X': return p.rotate([0,-90,0]).translate([-off,0,0])
    if face=='+Y': return p.rotate([-90,0,0]).translate([0,off,0])
    if face=='-Y': return p.rotate([90,0,0]).translate([0,-off,0])

# Front-left iso view (camera at +X,+Y,+Z):  +Z on viewer's left = red C,
# +X on viewer's right = blue S, +Y top = green S.  Backs mirror the fronts.
red   = place(plate('C'), '+Z') + place(plate('C'), '-Z')
blue  = place(plate('S'), '+X') + place(plate('S'), '-X')
# top: local +x must map to world -Z so the grooves run along Z and the
# "open" ends land on the far (-Z) and near (+Z) edges like the logo.
top   = plate('S_top').rotate([0,0,90])      # grooves now run along local y
green = place(top, '+Y') + place(top.rotate([0,0,180]), '-Y')
# Dark core: a cube that stays below every notch floor, plus corner plugs so the
# rounded plate corners never show daylight through the cube.
core  = Manifold.cube([0.80]*3, True)
for sx in (-1,1):
    for sy in (-1,1):
        for sz in (-1,1):
            core = core + Manifold.sphere(0.09).translate([sx*0.36, sy*0.36, sz*0.36])

def to_trimesh(man, rgb):
    # split normals at edges sharper than 40deg -> crisp box edges, smooth rounded ones
    man = man.calculate_normals(0, 40)
    mesh = man.to_mesh()
    props = np.asarray(mesh.vert_properties)
    v, n = props[:, :3], props[:, 3:6]
    f = np.asarray(mesh.tri_verts)
    tm = trimesh.Trimesh(v, f, vertex_normals=n, process=False)
    tm.visual = trimesh.visual.TextureVisuals(material=trimesh.visual.material.PBRMaterial(
        baseColorFactor=[*rgb, 255], metallicFactor=0.0, roughnessFactor=0.35))
    return tm

scene = trimesh.Scene()
for name, man, rgb in [('core',core,CORE),('red_C',red,RED),('green_S',green,GREEN),('blue_S',blue,BLUE)]:
    tm = to_trimesh(man, rgb); scene.add_geometry(tm, node_name=name, geom_name=name)
    print(f'{name:8s} tris={len(tm.faces):6d}  watertight={tm.is_watertight}')
scene.export('cs_cube.glb')
import os; print('cs_cube.glb', os.path.getsize('cs_cube.glb')//1024, 'KB')
