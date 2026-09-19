# 05 — Design system

> **Revised after Ryan's answers (T18):** the theme is John Jay's own — sampled from the
> club's repo CSS, YouTube banner, GitHub org, and `jj_inspo`. It is **not** rhecwb's
> red/cream. Cream is removed everywhere. Pole B below is kept as *analysis of the ref
> library*, not as a surface to use.

**Read this before generating any UI.** The point of this file is that whatever tool
generates a component (Claude Code, Cursor, v0, 21st.dev) inherits *this* look instead
of the default look.

## Where the references live

`~/Desktop/UI:UX INSPO/` — ~540 images, 836 MB. All of it was reviewed for this project.
Contact sheets (3×3 grids, numbered) of the entire library are at
`~/Desktop/UI:UX INSPO/_contact_sheets/` (66 sheets), with the 12 John Jay refs at full
size in `_contact_sheets/jj_detail/jj_01..12.jpg` and copied into
`assets/refs/jj_inspo/`.

Subfolders and what they are:
- `(root)` 232 — general taste library (the pole analysis below is from these)
- `jj_inspo/` 12 — **the John Jay direction** (see below)
- `rhec_refs/` 28 — LaGCC's refs (red/black/beige; Swiss posters; the RHEC palette swatch A92523 / 707070 / 000000 / F1EDD0 / FFFFFF)
- `ref_update/` 46 — Sator, HyLight, robotics/agtech sites (light-cream editorial + dark technical)
- `matter/` 19 — Matter Intelligence (light, circle-mask hero, aerial imagery with data labels)
- `untitled folder/` 18 — HyLight, Floema
- `effluent/` 30 and `ux:ui peices/` 153 (Argus, LetsGrow, Priva, Ridder, SCADA) — **Ryan's other venture** (water/greenhouse SCADA UI). Not club refs; read for taste only.

## The two taste poles (what the library actually says)

**Pole A — dark industrial-editorial. ~70% of the library. This is the John Jay direction.**
- Black / near-black base. **ONE hot accent** — coral (Shift5), red (Utopia Tokyo, rhec_refs
  posters), orange (CATCH conference, Apptronik "Get Started →", Palantir CTA), lime (TRA / D350
  system, Supavoxel UI).
- Giant grotesque headlines, often expanded/wide.
- Numbered sections (01 / 02 / 03), "spec sheet" data labels, stat tiles
  (Sator: "73% · 0.92 · 100% · Clear"), monospace metadata, corner brackets, coordinates,
  barcodes, "System Status" sidebars (Shift5).
- A 3D object as the hero (CATCH's glyph cubes, Web3 agency's fractured head, HyLight's
  wireframe airship over dot-grid terrain, Lithosquare pixel-block header).
- Root refs by filename that define it: Shift5 (`2026-06-24 10.22.59`, `10.26.33`,
  `10.26.45`, `10.26.52`, `10.26.59`), Utopia Tokyo (`2026-06-24 7.57.03` → `7.59.27`),
  Sator/NexHacks dark (`2026-01-18 2.03.00`, `3.00.17`, `5.20.13`, `5.20.21`, `8.02.09`,
  `8.06.37`), Cyber Brutalism (`2026-05-27 5.36.52`), Lithosquare (`2026-04-17 4.01.32`,
  `6.39.20`, `6.40.05`), HyLight (`2026-06-19 4.06.40` → `4.07.13`), CATCH-style
  posters in rhec_refs (`2026-05-10 9.00.02`, `9.00.18`, `9.00.40`, `9.02.41`, `9.03.44`,
  `9.04.39`), backend "checklist" posters (`2026-07-31 12.52.24` → `12.53.09`).

**Pole B — warm-cream editorial. ~30%.**
- Off-white / beige, quiet, big type, cards on cream, thin rules.
- Anthropic (`2026-02-21 11.43.19`, `11.44.27`, `2026-02-22 9.50.36`), Sator light pages
  (`ref_update` 06-22 10.39.43 → 06-23 11.57.50), Clarion (`2026-04-17 3.58.18` → `4.00.58`),
  Fauna Robotics (`ref_update 06-22 10.49.36`, `10.50.11`), Matter (all of `matter/`),
  Floema, Tavily light (`2026-01-25 11.40.57`, `11.41.12`).
- Analysis only. **Not used as a surface for John Jay** (that was rhecwb's cream). Light
  reading surfaces here come from the *old John Jay site's* tinted white sections instead.

## The `jj_inspo` folder, one by one

| # | What it is | What we take |
|---|---|---|
| jj_01 | Old site header: binary rings `01001…` on white, cube stamp "JOHN JAY COLLEGE / COMPUTER SCIENCE SOCIETY", cube on an orange autumn pattern (Pixlr tab) | **The binary rings** → background texture. **The stamp** → footer mark. |
| jj_02 | YouTube channel banner: navy/teal, bloodhound mascot, "COMPUTER SCIENCE SOCIETY", "Debug Your Mind, Commit To Growth!", "Algorithm Thinking \| Dev Journeys \| Tech Motivation", John Jay seal | **Both taglines** (second one is a ticker marquee already). **The navy base** (sampled: `#1E4664`) and the **teal ring glow** (`#6ED2E6`). **The Bloodhound = the chatbot mascot** (see 17). |
| jj_03 | "Web3 Design Agency." dark hero: fractured 3D head, stat chips (240+ / 92%), ticker marquee, purple-orange glow | Stat chips + ticker marquee. **Not the palette.** |
| jj_04 | Swiss pitch-deck template: gray/white, orange accent blocks, numbered content index, arrows ↗ | Numbered index, arrow glyphs, orange-block callouts, editorial grid. |
| jj_05 | Chinese poster series: red/black/white, halftone dots, geometric type, "NUCLEAR MATTER" | Halftone/dot textures, red as a section accent, geometric display type. |
| jj_06 | **CATCH Community Conference 2020**: giant grotesque, black + orange, **3D cubes with glyphs on their faces** as the identity object | **The strongest ref.** Validates cube-as-identity. Type scale. One accent. |
| jj_07, jj_08 | "Trouble" blue Kufic-style geometric lockup on cream | Blue as a geometric accent; monolith logotype treatment. |
| jj_09 | Red dot-matrix barcode label with pictograms | Barcode/label vocabulary for metadata strips. |
| jj_10 | Phone UI, red/navy, technical labels ("CMD Model S21Y4", "Performance 0.719") | Spec-label pattern for cards (platform / model / version). |
| jj_11 | **TRA / D350 industrial system**: lime + black + orange, spec sheets, "USER MANUAL", stat tiles, numbered modules | The spec-sheet language for the Apps section and the OS. |
| jj_12 | Supavoxel app UI: dark, lime accent, mono readouts (Triangles 1,500,000 / Size mm) | Dark tool UI with one accent; mono readouts. |

Through-line: **industrial-technical editorial**, not "web3 glow." Big type, one accent,
spec-sheet labels, the cube as an object.

## What carries over from the existing John Jay identity (modernized, not replaced)

1. **The cube** — `assets/brand/cs_logo_sharp.svg` (2D) and `assets/cube/cs_cube.glb` (3D).
2. **The binary rings** — thin mono digits on circular paths, faint, drifting slowly.
   Replaces the generic dot-grid every AI site has. Nobody else has it; it says "CS"
   without saying it.
3. **The circular stamp lockup** — footer mark; favicon-adjacent.
4. **The taglines** — *Debug Your Mind, Commit To Growth* / *Algorithm Thinking |
   Dev Journeys | Tech Motivation*.
5. **Cyberhounds** (the CTF sub-club) keeps its own identity within the red section.

## Palette — sampled from John Jay CSS's own assets (not rhecwb)

Sources measured: old repo CSS (`styles/*.css`, `a8fca55`), the YouTube banner
(`assets/refs/club/youtube_banner.png`), the GitHub org avatar, the old header art.

**What the old site actually used** (hex counts across its CSS):
`#ce4a4a` ×37 (primary/CTA red) · `#333` · `#0e76a8` (LinkedIn) · `#c13584` (Instagram) ·
`#5865f2`/`#7289da` (Discord) · `#4267b2` (Facebook) · `#40a33f` (green) · `#1e80f0`/`#2976e8`
(blue) · `#2d3044` (dark navy-gray) · `#ee2b2a`/`#c80f28` (reds) · section tints
`rgb(238,43,42,.15)` red, `rgb(99,148,76,.15)` green, `rgb(30,128,240,.15)` blue on white.
→ **The old site already used the cube's red/green/blue trio as section colors.** We keep
exactly that mapping.

**What the banner uses:** dominant `#1E4664` (steel navy, 48–65% of every crop),
`#183C60`, `#0C183C` (seal navy), `#305484`, white `#FAFAFA`, teal ring glow
`#6ED2E6`/`#6EC8DC`, green `#60A854`, red `#DC503C`.

**Tokens**
```
--navy-900  #0C183C   seal navy / deepest backgrounds
--navy-800  #12294A
--navy-700  #183C60   banner deep
--navy-600  #1E4664   banner dominant — DEFAULT page background
--navy-500  #305484   raised surfaces, cards on dark
--ink       #F4F7FB   text on dark
--muted     #9DB0C4
--line      #2A4460
--teal      #6ED2E6   links, focus, "live" dot, cube bloom — the only color allowed everywhere
--red       #CE4A4A   Events, Cyberhounds (old-site primary)
--green     #40A33F   Apps
--blue      #1E80F0   Join / community
--cube-red  #D82028 · --cube-green #70B840 · --cube-blue #2058A0   (cube + 3D-derived marks only)
--light     #F5F7FA   light reading surfaces (News, OS docs), tinted 12–15% with the section accent
--seam      #1A1618   cube seams
```
Rules: **one accent per section**; teal is the global utility color; dark is the default,
light surfaces are deliberate per-page choices tinted like the old site's sections.
No cream, no beige, no gradients as fills; glow only as bloom off the cube/teal.

## Typography

Old site used **Poppins** (10 declarations) and **VT323** (pixel terminal mono, 2) —
both kept as John Jay's own choices, re-cast:
- **Display:** Archivo (variable; expanded widths for hero and section titles — the
  CATCH / TRA / Chinese-poster feel in `jj_inspo`). Large, tight, uppercase or expanded.
- **Body:** Poppins, text weights (400/500) only. Never for headlines.
- **Labels / metadata:** JetBrains Mono, uppercase, ~11px, 0.08em tracking. Numbers are
  the design — dates, counts, versions, IDs get room.
- **Accent mono:** VT323 at ≥20px only — the binary rings, ticker digits, big counters,
  the 404 page. It is illegible small; never use it for labels.
- **Never Inter.** All fonts via Google Fonts `<link>`.

## Layout language

- Numbered sections (`01 — Events`). Section headers carry a mono kicker
  (`// SPRING 2027 · 06 EVENTS`).
- Stat strip on Home: *next event · members · apps shipped* — the "System Status" idea.
- Cards are spec sheets: title, then a mono label row (platform / stack / author / status).
- Corner brackets on hero and featured cards (Utopia Tokyo / Matter data-label style), used
  sparingly.
- Pixel-block dividers between major sections (Lithosquare).
- Ticker marquee for the second tagline.
- Light (`--light`, section-tinted) surfaces for reading pages; dark navy for navigation/showcase.

## Motion (in order of payoff)

1. Cube: slow idle rotation + mouse parallax (table stakes).
2. Scroll-driven: the cube separates into its three faces as you scroll; each face becomes
   its section's header.
3. Bloom on cube edges (`UnrealBloomPass`) over a faint reflective floor.
4. Cube as the loading state; tiny CSS-3D cube as the animated favicon.
5. Cards tilt on hover; numbers count up (number ticker).
Constraints: lazy-load Three on Home only; one `<canvas>`; pause off-screen
(IntersectionObserver); lower pixel ratio on phones; `prefers-reduced-motion` → static SVG.

## The cube as navigation

Three faces, three colors, three destinations. Red C → Events, Green S → Apps, Blue S →
Join. Hover a face: it glows and the label fades in; click: navigate. The cube *is* the
nav on Home. Face map (world axes, from `06_CUBE_ASSET.md`): +Z/-Z red C, +X/-X blue S,
+Y/-Y green S; camera at (+1, +0.85, +1) reproduces the logo angle.

## Do-not-do (the AI-look ban)

- No Inter. No cream/beige (that's rhecwb). No rhecwb red-on-black. No violet/purple gradients. No centered hero over a 3-column feature grid
  as the default page shape. No default shadcn radius/shadows unmodified.
- No mixing the three accents on one page.
- No generic dot-grid background — use the binary rings.
- No stock "glassmorphism" cards. Spec sheets, not glass.
- No animation that runs on every page; the cube runs on Home.
- No decorative 3D beyond the cube. One object.
- No light and dark in the same section; switch per page, deliberately. Poppins never for headlines; VT323 never under 20px.
- No dead placeholder sections, no fake stats. If a number isn't real, don't show a number.

## The rule that makes this stick

Before any component is generated, the repo must contain:
1. `tokens.css` (Tailwind v4 `@theme`): palette, type scale, radius, spacing, mono label style.
2. `DESIGN.md` (a shortened version of this file) at the repo root, so Claude Code /
   Cursor / v0 read it first.
Everything generated after that inherits the look. Everything generated before it will
have to be redone.

## Tokens (final — write these into `apps/web/src/tokens.css` first)

```css
@theme {
  --color-navy-900: #0C183C; --color-navy-800: #12294A; --color-navy-700: #183C60;
  --color-navy-600: #1E4664; --color-navy-500: #305484;
  --color-ink: #F4F7FB; --color-muted: #9DB0C4; --color-line: #2A4460;
  --color-teal: #6ED2E6;
  --color-red: #CE4A4A; --color-green: #40A33F; --color-blue: #1E80F0;
  --color-cube-red: #D82028; --color-cube-green: #70B840; --color-cube-blue: #2058A0;
  --color-light: #F5F7FA; --color-seam: #1A1618;
  --font-display: "Archivo", system-ui, sans-serif;
  --font-body: "Poppins", system-ui, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, monospace;
  --font-pixel: "VT323", monospace;
  --radius-sm: 4px; --radius-md: 8px; --radius-lg: 14px;
  --label-size: 11px; --label-tracking: 0.08em;
}
```
Section accent is set per route as `--accent` (one of red/green/blue) so components use
`var(--accent)` and never pick a color themselves.
