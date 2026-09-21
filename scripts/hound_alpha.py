"""
hound_alpha.py — the official John Jay Bloodhound (assets/brand/jj_bloodhound.webp,
1472×1332, white background) → apps/web/public/img/jj_bloodhound.webp with a
clean alpha channel.

Method (run 5 §3): flood-fill the background from the four corners with a
12-level tolerance (PIL ImageDraw.floodfill), erode the resulting alpha by one
pixel so the white anti-alias fringe goes with the background, feather 1 px.
Then render a proof on navy-900 (#0C183C) to qa/loops/run5/hound_alpha_proof.png
and report the residual halo (mean brightness of the 2-px ring just outside the
mask — should be ≈ the navy, not white).

Usage:  .venv/bin/python scripts/hound_alpha.py
"""
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "assets/brand/jj_bloodhound.webp"
OUT = ROOT / "apps/web/public/img/jj_bloodhound.webp"
PROOF_DIR = ROOT / "qa/loops/run5"
NAVY = (12, 24, 60)
TOL = 12          # per-channel tolerance for the flood fill
SENTINEL = (255, 0, 255)

im = Image.open(SRC).convert("RGB")
w, h = im.size
work = im.copy()
for xy in [(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1)]:
    ImageDraw.floodfill(work, xy, SENTINEL, thresh=TOL)
arr = np.asarray(work)
bg = np.all(arr == SENTINEL, axis=-1)
alpha = Image.fromarray(np.where(bg, 0, 255).astype("uint8"), "L")
# 1 px erosion (kills the white anti-alias fringe), then a 1 px feather
alpha = alpha.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.8))

rgba = im.convert("RGBA")
rgba.putalpha(alpha)
# un-fringe: where alpha is partial, the RGB was blended against white — pull it toward the outline navy
a = np.asarray(alpha).astype(np.float32) / 255.0
rgb = np.asarray(rgba).astype(np.float32)
edge = (a > 0.02) & (a < 0.98)
# colour of the nearest opaque pixel is ~the navy outline; approximate with the outline colour
outline = np.array([30, 58, 107], dtype=np.float32)  # sampled from the mascot's stroke
for c in range(3):
    ch = rgb[..., c]
    ch[edge] = ch[edge] * a[edge] + outline[c] * (1 - a[edge])
rgba = Image.fromarray(np.clip(rgb, 0, 255).astype("uint8"), "RGBA")

OUT.parent.mkdir(parents=True, exist_ok=True)
for q in (88, 82, 76, 70):
    rgba.save(OUT, "WEBP", quality=q, method=6)
    if OUT.stat().st_size <= 200 * 1024:
        break
print(f"{OUT.relative_to(ROOT)}  {rgba.size}  q={q}  {OUT.stat().st_size // 1024} KB")

# proof on navy + halo measurement
PROOF_DIR.mkdir(parents=True, exist_ok=True)
proof = Image.new("RGBA", rgba.size, NAVY + (255,))
proof.alpha_composite(rgba)
proof.convert("RGB").resize((w // 2, h // 2), Image.LANCZOS).save(PROOF_DIR / "hound_alpha_proof.png")
mask = np.asarray(alpha) > 127
ring = np.asarray(Image.fromarray(mask.astype("uint8") * 255).filter(ImageFilter.MaxFilter(5))) > 127
ring &= ~mask
p = np.asarray(proof.convert("RGB")).astype(np.float32)
navy_l = np.mean(NAVY)
ring_l = p[ring].mean()
print(f"halo check: navy L={navy_l:.1f}  ring L={ring_l:.1f}  (white would be 255)  -> {'OK' if ring_l < navy_l + 12 else 'HALO'}")
