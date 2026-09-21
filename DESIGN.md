# DESIGN.md — the short version (full spec: `context/05_DESIGN_SYSTEM.md`)

Any tool generating UI for this repo reads this first. **The theme is John Jay's own —
derived from the club's existing repo CSS, its YouTube banner, its GitHub org, and the
`jj_inspo` references. It is NOT rhecwb's red/cream theme. No cream. No rhecwb tokens.**

**Direction:** modern industrial-editorial (the `jj_inspo` folder): big grotesque type,
one accent per section, spec-sheet mono labels, numbered sections, the 3D cube as the one
hero object. Key refs (`../jjay_css_refs/jj_inspo/`): jj_06 CATCH Conference (3D glyph cubes,
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

**Type — v4 (run 9: the S01 face, two realms; `context/38_RUN9_LOG.md` §A, `qa/REPORT_RUN9.md`)**
- **Hero + poster words are drawn, not typed** — the S01 alphabet (`apps/web/src/type/glyphs/`: 26 caps + digits + `.,:/-_'!&`, skeleton polylines on a 100-unit cap grid, stroke 12 % of cap, rounded-square outer corners, squared counters, wide M, narrow E — measured from the DEMON reference; no free face cleared the match, best IoU 0.52). `<S01Word>` carries the stencil bars / outline / split-fill as SVG masks; ≤ 12 words on the site (Home + Cyberhounds heroes, the poster bands).
- Display (H1/H2, stats, buttons, logotype): **Unbounded 700/800/900** — unchanged.
- Mono-display: **Space Mono 400/700** (`--font-mono-display`, IoU .327 vs the S01 body mono; JetBrains .246) — deks ≤ 3 lines (`.t-dek`: caps, +.04em, 15–18 px), ticker, fin lines, readouts, labels ≥ 12 px, OS KPI numerals (`.t-kpi`). Body paragraphs over 3 lines stay **Space Grotesk** sentence-case.
- Labels < 12 px, code, tables, forms: **JetBrains Mono** with prefix glyphs (`/01`, `//SCN_01`, `_status`, `>`, `[1]`, `●`).
- OS realm (`[data-realm="os"]`): **VT323** = `--font-os-display` (page titles, the login headline, empty-state words; ≥ 20 px only — IoU .451 vs the T03 headline) + Space Mono numerals. Legacy pixel elsewhere: binary rings + ticker digits only.
- Treatments (each H1 uses two): stencil bars (4 % cap on the drawn words, 4.5 % on Unbounded) · solid+outline (2px dark / 2.5px paper) · split-fill · edge-crop · wireframe-through · decode (≤600ms, fonts-ready-gated).
- The S01 dossier hero (Home, Cyberhounds): 48 px hairline grid, two 1-bit halftone photo blocks with `SEC-0N` chips, one accent outline path ending in a registration circle, `[ ↓ SCROLL_TO_REVEAL ]`.
- Retired across runs: Archivo, Poppins (r3), Chakra Petch, Michroma, Silkscreen (r4). **Never Inter.** Self-hosted @fontsource only. `qa-scripts/font_audit.mjs` enforces the buckets per realm. `scripts/type_match.mjs` is how a face gets in: render, binarize, overlay, IoU.

**Cards — the folder (run 9)**: `FolderCard` is the T11 folder-tab silhouette (tab top-left with a 45° cut, one chamfer, optional mirrored tab, 4 px radius — the one place a radius is allowed, two-tone split, rotated edge label, barcode). Used for records (inheritance), resource categories, non-app projects, officers, the Join Discord card, open event slots, OS titled tiles. **Never** on `TicketCard` / `PosterCard` surfaces.

**The OS realm (run 9)**: every module page is the R9_06 bento (9 tiles A–I in fixed slots, measured in `context/39_OS_GRID.md`) over a hairline, then the working surface. Page navy-900 with scanlines 3 % + a 32 px grid 4 %, tiles navy-800, accent tiles teal 18 % over navy-700, one paper tile; a 56 px icon rail (active cell = red edge, 1 Hz), the launcher glyph + ⌘K, a 7-cell ticker, the user chip, `SYS VER` bottom-right; dossier cards, activity traces from real per-day counts (flat is flat), the red segmented tab strip, subject sheets, ring segments. Terse system voice (`NEEDS_ATTENTION · 3`, `NO_DATA_YET`). No cube in the OS — login only.

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
