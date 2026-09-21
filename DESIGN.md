# DESIGN.md — the short version (full spec: `context/05_DESIGN_SYSTEM.md`)

Any tool generating UI for this repo reads this first. **The theme is John Jay's own —
derived from the club's existing repo CSS, its YouTube banner, its GitHub org, and the
`jj_inspo` references. It is NOT rhecwb's red/cream theme. No cream. No rhecwb tokens.**

**Direction:** modern industrial-editorial (the `jj_inspo` folder): big grotesque type,
one accent per section, spec-sheet mono labels, numbered sections, the 3D cube as the one
hero object. Key refs (`assets/refs/jj_inspo/`): jj_06 CATCH Conference (3D glyph cubes,
giant type), jj_11 TRA/D350 (spec sheets, stat tiles, "user manual" framing), jj_03 Web3
agency (stat chips + ticker), jj_04 Swiss deck (numbered index, arrows ↗), jj_05 Chinese
posters (halftone, geometric type), jj_10 phone UI (technical labels), jj_12 Supavoxel
(dark tool UI, mono readouts).

**Palette — all sampled from John Jay CSS's own assets**
- Base navy (YouTube banner, JJ seal): `--navy-900 #0C183C` · `--navy-700 #183C60` · `--navy-600 #1E4664` (the banner's dominant color; default page background) · `--navy-500 #305484` (raised surfaces)
- Ink `#F4F7FB` · muted `#9DB0C4` · line `#2A4460`
- **Teal glow** `#6ED2E6` (the ring around the logo in the banner) — links, focus rings, cube bloom, the "live" dot
- **Section accents = the old site's own trio** (they used these as 15% tints):
  red `#B3202A` = Events + Cyberhounds (run 5: dark modern red, tuned to the blues — `#CE4A4A` read orange on navy) · green `#40A33F` = Apps · blue `#1E80F0` = Join/community
  - Red family: `--color-red #B3202A` the accent (fills, rims, poster words) · `--color-red-hi #E0242C` emissive / hover / eye slits / stencil ghost only · `--color-red-deep #7A1119` poster-band fills, chamfer stubs, hound rim shadow. Red is never body text on navy (2.6:1 on navy-900) — red *text* uses `--accent-fg #EE9A9E`.
- Cube colors (only on the cube and its 3D-derived marks): red `#D82028` · green `#70B840` · blue `#2058A0`
- **Mascots**: the official John Jay Bloodhound (`assets/brand/jj_bloodhound.webp`, John Jay's mark, board-owned) sits full-colour, right-anchored and cropped in the footer — no glaze, fade or tint. The **Cyberhound** (`assets/hound3d/`, black body + red rim, from the Cyberhounds logo) is the CTF sub-club's mark: the 3D bust in the Cyberhounds hero, the 16×16 `HoundPixel` everywhere else.
- Light surfaces (reading pages, OS documents): `#F5F7FA` with the section accent at 12–15% tint — exactly how the old site tinted its sections, modernized. Not cream.
- Rule: **one accent per section.** Teal is the only color allowed everywhere.

**Type — v3 (run 4: ONE heavy display face; `context/26` §2)**
- Display: **Unbounded 700/800/900** — every headline ≥28px, poster words, stat numerals, buttons (700 @ 12–13px), nav logotype, footer brandmark line. Heavy is the point.
- Body: **Space Grotesk** 400/500/700 — paragraphs, card titles <28px, inputs.
- Labels/readouts: **JetBrains Mono** with prefix glyphs (`/01`, `//SCN_01`, `_status`, `>`, `[1]`, `●`).
- Legacy pixel: **VT323** — binary rings + ticker digits only.
- Treatments (each H1 uses two): stencil bars (4.5% cap) · solid+outline (2px dark / 2.5px paper) · split-fill · edge-crop · wireframe-through · decode (≤600ms, fonts-ready-gated).
- Retired across runs: Archivo, Poppins (r3), Chakra Petch, Michroma, Silkscreen (r4 — three display voices fought; Michroma's single 400 weight read thin). **Never Inter.** Self-hosted @fontsource only. `qa-scripts/font_audit.mjs` enforces the buckets.

**Identity elements**: cube (`assets/brand/cs_logo_sharp.svg`, `assets/cube/cs_cube.glb`) ·
binary rings `01001…` in VT323 on circular paths, faint, drifting (background texture; from
the old header) · circular stamp lockup (footer) · taglines *Debug Your Mind, Commit To
Growth* / *Algorithm Thinking | Dev Journeys | Tech Motivation* (ticker) · **the John Jay
Bloodhound** as the chatbot mascot (see `context/17_MASCOT_AND_CHATBOT.md`).

**Layout**: numbered section headers with a mono kicker (`// FALL 2026 · 06 EVENTS`) ·
status strip on Home (next event · members · apps shipped — real numbers or nothing) ·
cards are spec sheets (title, then a mono label row) · corner brackets sparingly ·
pixel-block dividers · ticker marquee.

**Motion**: cube idle + parallax on Home only; scroll-explode into three faces; teal bloom on
edges; number tickers; hover tilt. One canvas, lazy-loaded, paused off-screen,
`prefers-reduced-motion` → static SVG.

**Do not**: Inter · cream/beige anything · rhecwb's red-on-black · purple/violet gradients ·
centered hero + 3-col feature grid as the default shape · unmodified shadcn radius/shadows ·
glassmorphism · generic dot-grid (use the rings) · animation on every page · decorative 3D
beyond the cube · mixed accents · fake stats · dead placeholders · Poppins for headlines ·
VT323 under 20px.

**Order of operations**: `tokens.css` (Tailwind v4 `@theme`) exists → then components.
