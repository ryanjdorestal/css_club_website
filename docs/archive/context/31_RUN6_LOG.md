# 31 — Run 6 log (pennant · clean hound matte · footer map, no wordmark)

Start 2026-09-20 22:20 EDT. Budget 45 min. Prompt: context/30 (pasted). Assets by Cowork in assets/brand/.

## Decisions
| # | Decision | Why |
|---|---|---|
| 1 | SVGs inlined as TSX (no vite-plugin-svgr); the C2PA `<metadata>` manifests (≈30 KB each) are stripped; `sigils/cyberhoundHead.ts` holds the traced path once | no new deps; the red becomes `var(--color-red)`; assets/brand keeps the signed originals |
| 2 | Hound height 56 vh at md, 62 vh from xl (1280+) | at 1024 a 62 vh hound's ear would sit under a 460 px map; 56 vh clears it by ~30 px with the same crop/bleed |
| 3 | Map iframe mounts only in view (+200 px), 4 s load timer starts then; `navigator.onLine === false` → fallback at once | a mount-time timer would flip every page to the fallback before the footer is ever scrolled to |
| 4 | Fallback panel is shown *under* the iframe while it loads (iframe opacity 0 → 1 on load) | "never a grey box" — the DotGrid + Crosshair is the loading state too |
| 5 | Address block reads `brand.campus.*` (new fields, jjay.cuny.edu footer); phone as `tel:`; email as `mailto:` | §3.3; no literals in the component |
| 6 | Pennant outline = motion.path `pathLength` on a 1 px non-scaling stroke in red-hi, then fill fades in; sway is a CSS keyframe on hover | §2 motion spec; reduced motion renders the filled pennant statically |
| 7 | `cyberhoundHead.ts` → `cyberhoundHeadPath.ts` | macOS's case-insensitive FS made Vite resolve `./CyberhoundHead` to the data module (no such export → blank page); the file names now differ beyond case |
| 8 | OPEN_IN_MAPS CTA sits top-right of the tile, not bottom-right | Google's attribution strip lives bottom-right inside the embed and must stay visible; Google's own "Open in Maps" chip is top-left |
| 9 | Rail max-w 72 % at md, 60 % at xl; zone bottom padding 28 → the rail clears the fixed status bar | at 1024 the four mono items wrapped and BACK_TO_TOP slid under the status bar |
| 10 | Rail max-w 52 % at md (60 % at xl) | at 1024 BACK_TO_TOP sat on the hound's white paw; now the rail ends before the hound (probe: right 122 px vs hound left 528 px) |

## Run complete (22:32 — 12 min of the 45-min budget… plus ~6 min lost to the case-insensitive resolution bug)
Gate table in qa/REPORT_RUN6.md all ✅: pennant crisp at 520 px, matte clean at 100 % (asset + live page), map dark → lit on hover, address block, no wordmark, hound clear at 1024/1280/1440/1920/390. Build green. One commit, never pushed. No questions asked.
