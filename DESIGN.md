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
  - Red family: `--color-red #B3202A` the accent (fills, rims, poster words) · `--color-red-hi #E0242C` emissive / hover / eye slits / stencil ghost only · `--color-red-deep #7A1119` poster-band fills, chamfer stubs, hound rim shadow. Red is never body text on navy (2.6:1 on navy-900) — red _text_ uses `--accent-fg #EE9A9E`.
- Cube colors (only on the cube and its 3D-derived marks): red `#D82028` · green `#70B840` · blue `#2058A0`
- **Mascots**: the official John Jay Bloodhound (`assets/brand/jj_bloodhound.webp`, John Jay's mark, board-owned) sits full-colour, right-anchored and cropped in the footer — no glaze, fade or tint. The **Cyberhound** (`assets/hound3d/`, black body + red rim, from the Cyberhounds logo) is the CTF sub-club's mark: the 3D bust in the Cyberhounds hero, the 16×16 `HoundPixel` everywhere else.
- Light surfaces (reading pages, OS documents): `#F5F7FA` with the section accent at 12–15% tint — exactly how the old site tinted its sections, modernized. Not cream.
- Rule: **one accent per section.** Teal is the only color allowed everywhere.

**Type — v5 (run 10: the real game face, everywhere; `apps/web/src/fonts/FONTS.md`, `qa/REPORT_RUN10.md`)**

- Display: **Turret Road 800** (`--font-display`) — every headline ≥ 28 px, poster words, KPI numerals, buttons at 12–13 px. The only free family with the S01/DEMON skeleton: extended monoline, 45° chamfered corners, squared counters, shallow-V M — with a real weight range so solid + hollow pairs work. Weights 200–800 ship; 900 does not exist (no faux-bold).
- Display-wide: **Michroma 400** (`--font-display-wide`, `.t-wide`) — fin lines, the nav logotype, single-word rails. Single weight → display-only.
- Mono-display: **Martian Mono 500** (`--font-mono-display`) — deks (`.t-dek` 17/1.6 caps +.03em), protocol lines, ticker, readouts, every label ≥ 11 px (`.t-label`, `.mono-label`), OS tile labels.
- Mono: **JetBrains Mono** — micro labels (9 px), code, tables, form inputs. Body: **Space Grotesk** 16/1.65 — paragraphs over 3 lines only.
- OS realm: **Silkscreen 700** (`--font-os-display`) — page titles, the T03 login headline, tile F/I words, ≥ 20 px (chosen over VT323 at 72 px: chunkier, cleaner — `qa/loops/run10/os_face.png`). VT323 stays for the binary rings + ticker digits only. Orbitron 700–900 ships as a reserve, unused.
- Every face is self-hosted from `src/fonts/<family>/*.woff2` with its OFL LICENSE (`fonts.css`, one `@font-face` per file, latin `unicode-range`); the two above-the-fold faces are preloaded in `index.html`. No font packages, no CDN — `grep -riE "fontsource|googleapis"` over `src` is 0.
- Scale (`type.css`): hero clamp(52, 8.8vw, 148) · poster clamp(76, 14vw, 240) · h1 clamp(40, 6vw, 96) · h2 clamp(28, 3.6vw, 48) · h3 clamp(19, 2vw, 26) · stat clamp(44, 5.6vw, 88); tabular + slashed-zero on every numeral; `geometricPrecision` on display.
- Treatments (each H1 uses two): stencil bars (4.5 % cap at 38 % / 64 %) · solid+outline (**3 px** dark / 3.5 px paper — thinner vanishes against the chamfers) · split-fill · edge-crop · wireframe-through · decode. The hollow/solid/two-colour compositions Ryan approved (`~/Desktop/jjay_css_refs/run10/mock_turret.png`) stay exactly as composed.
- Retired: the run-9 drawn SVG alphabet (read as CAD tubing and only covered 12 words) and the run-4 geometric display face (round bowls; the wrong species). `qa-scripts/font_audit.mjs` enforces the per-realm sets on every route.

**Cards — the folder (run 9)**: `FolderCard` is the T11 folder-tab silhouette (tab top-left with a 45° cut, one chamfer, optional mirrored tab, 4 px radius — the one place a radius is allowed, two-tone split, rotated edge label, barcode). Used for records (inheritance), resource categories, non-app projects, officers, the Join Discord card, open event slots, OS titled tiles. **Never** on `TicketCard` / `PosterCard` surfaces.

**The OS realm (run 9)**: every module page is the R9_06 bento (9 tiles A–I in fixed slots, measured in `context/39_OS_GRID.md`) over a hairline, then the working surface. Page navy-900 with scanlines 3 % + a 32 px grid 4 %, tiles navy-800, accent tiles teal 18 % over navy-700, one paper tile; a 56 px icon rail (active cell = red edge, 1 Hz), the launcher glyph + ⌘K, a 7-cell ticker, the user chip, `SYS VER` bottom-right; dossier cards, activity traces from real per-day counts (flat is flat), the red segmented tab strip, subject sheets, ring segments. Terse system voice (`NEEDS_ATTENTION · 3`, `NO_DATA_YET`). No cube in the OS — login only.

**Identity elements**: cube (`assets/brand/cs_logo_sharp.svg`, `assets/cube/cs_cube.glb`) ·
binary rings `01001…` in VT323 on circular paths, faint, drifting (background texture; from
the old header) · circular stamp lockup (footer) · taglines _Debug Your Mind, Commit To
Growth_ / _Algorithm Thinking | Dev Journeys | Tech Motivation_ (ticker) · **the John Jay
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
