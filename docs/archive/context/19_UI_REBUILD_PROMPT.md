# 19 — UI/UX REBUILD PROMPT (run 2) — continuous loop, no questions

Paste everything below the line into Claude Code (Fable, xhigh) opened in `~/Desktop/jjay_css`.
This is not a new build. The scaffold, data, API, cube, mascot, OS shell and CI from run 1 are
kept. **Run 2 replaces the visual layer of every public page** until it scores ≥ 4/5 on every
line of the rubric in §12 against the reference images. Run 1's visual output is the baseline
to beat, not the thing to polish.

---

## 0. Mission, and why run 1 failed

Run 1 (commits `2cc91f5`…`403fd88`) got every *system* right — tokens, data extraction, Python
API with Tier-1 fallbacks, ≤2-file `api/` guard, keepalive, cube GLB, Bloodhound emotes, OS
shell — and got the *look* wrong. Ryan's verdict, verbatim: "that ui/ux is garbage. where's the
animation? the modern look?" Read `qa/shots/03-home-1440.png` and `qa/shots/03-about-1440.png`
now and confirm each of these against your own eyes before you touch code:

1. **No motion at all.** Nothing reveals on scroll, nothing parallaxes, the nav doesn't change
   state, numbers don't count, there is no smooth scroll, the cube spins in place in a box.
   `apps/web/package.json` has `motion` installed and `Home.tsx` imports nothing from it.
2. **No composition rhythm.** Every page is one flat navy column with stacked cards. There is no
   dark → light → dark alternation, no full-bleed light "cutoff" sections, no editorial spread
   with a framed photo + pullquote, no watermark motif bleeding off a section edge, no section
   that is *visually different in kind* from the one above it. rhecwb's home has seven
   different section anatomies; ours has one, repeated.
3. **Cards don't match the refs.** `SpecCard`/`StatTile` are generic bordered rectangles. The
   refs (`jj_04`, `jj_10`, `jj_11`) are *industrial spec sheets*: label rails in mono caps,
   numbered indices, a colored tag/stub, thin rule grids, a barcode/ID strip, a big number, a
   bracketed corner, a one-word category in the corner. Our cards have none of that vocabulary.
4. **The cube is decoration, not the spine of the page.** It sits in the hero and dies.
   Spec (context/05, 06): the cube is the identity object AND the navigation — it must travel
   with the reader, turning its red C / green S / blue S face toward the section that face
   owns, and settle at the footer.
5. **The footer is a stamp and three links.** Spec: rhecwb's footer — a dark, tall, closing
   *movement*: grid of columns → divider with CTA → bottom rail → giant faded wordmark
   spelling the club out, cropped off the bottom edge, with the John Jay seal and the CSS
   cube stamp locked up above it. `Footer.tsx` is 76 lines; it needs to be a section, not a bar.
6. **Old-site sections were dropped, not revamped.** Home lost the four photo bands
   (What the Club is About / Events / Resources / Collaborate). About lost "Let's grow
   together!", "Discussion With Your Peers", the per-term board history. Collaborate's
   openings/committees/project-ideas/suggestions collapsed into a form. Cyberhounds lost
   "How It Works" and the competitions list. §10 is the parity table; every row must be green.
7. **Copy bugs that read as broken:** hero kicker `EST. STAMP 2020S` is nonsense; status
   strip shows "TBA" where a real number or nothing should be; section kickers are filler.
8. **Type is set but not *used*.** Archivo Black is on the H1 and nowhere else. The refs use
   scale contrast as the primary design move: a 160px word next to 11px mono meta. We have
   28px headings and 14px body everywhere. VT323 appears once.

The cause was a sparse brief. This brief is not sparse. Follow it literally where it is
literal and match the refs where it says "match".

## 1. Ground truth — load ALL of this before the first edit (≈10 min, budgeted)

Read, in order:
- `CLAUDE.md`, `DESIGN.md` (palette/type are unchanged and non-negotiable — no cream, no
  Inter, no rhecwb colors, one accent per section).
- `context/05_DESIGN_SYSTEM.md` §refs, §motion, §cube-as-nav.
- `context/08_SITE_STRUCTURE.md` (routes + per-section spec).
- `context/02_PRIOR_ART_JJCSS_OLD_SITE.md` §sections and `context/07_CONTENT_MIGRATION.md`
  (what the old site had — the parity source).
- `context/03_PRIOR_ART_RHECWB_LAGCC.md` §home-composition.
- `context/18_BUILD_LOG.md` (run 1's 34 decisions; keep the ones about contrast/tokens/React
  pin; you are overriding the ones about layout).

Then **look at every one of these images with the Read tool, and write one line per image
into `context/20_REF_NOTES.md` saying what you will take from it.** No line = you didn't look.

### 1a. `../jjay_css_refs/rhecwb/home_1440.png` — the composition benchmark (NOT the color benchmark)
Full-page render of rhecwb's home at 1440 wide (7357px tall). Scroll it top to bottom with
`Read` on the crops in the same folder (`home_1440_a.png`, `home_1440_b.png`). What to take —
*structure only, recolored into John Jay's palette*:
- Dark hero: eyebrow chip → 2-line display headline → sub → CTA pair → **stat row** with
  mono labels under numbers. Height ≈ 100vh.
- **Light cutoff** starts immediately after the hero: a full-bleed light band with an
  "about-spread" — framed photo left, editorial headline + paragraph right, a pullquote
  in display type, a meta grid (4 label/value pairs) beneath.
- "Divisions" section with the **section-motif watermark**: the org logo at ~40vw, 6–8%
  opacity, bleeding off the section's right edge, behind a 3-column card grid.
- "Featured system" project spotlight: one big card, image left, spec list right, index
  number `01`, tags row, one CTA.
- Bulletin / journal: a list (not cards) — date rail on the left in mono, title, one-line
  dek, arrow. Hover shifts the row.
- Partners: a row of empty labeled slots ("Slot 01 — Open") — it makes absence look intended.
- Gallery: a masonry/three-column photo grid with captions in mono.
- **Closing fin line**: a single centered line "End of issue · 001" with hairlines either side.
- **Dark footer**: 3–4 column grid (org / navigate / contact / meta) → divider → CTA line →
  bottom rail (copyright, license, "built by") → **giant brandmark wordmark** in display
  type at ~18vw, fill at 6–8% opacity, positioned so the baseline is below the viewport
  edge (cropped). That footer alone is the thing Ryan said looks "1000 years ahead".
- Navbar morphs on scroll: transparent full-width at top → after 24px, compact pill/bar
  with blur backdrop, thinner, logo shrinks. Class toggled from a rAF-throttled scroll listener.
- Every block enters via `data-reveal` (IntersectionObserver → opacity/translate).

Do **not** take: its cream, its serif, its black, its wordmark text, any copy.

### 1b. `../jjay_css_refs/jj_inspo/` — the taste benchmark (12 images)
- `jj_01.jpg` — old site header: binary rings + the round "John Jay College · Computer
  Science Society" stamp. Keep both as first-class brand marks (rings = background system,
  stamp = footer/hero seal).
- `jj_02.jpg` — YouTube banner: "COMPUTER SCIENCE SOCIETY / Debug Your Mind, Commit To
  Growth!" on navy with the cube and the John Jay shield. This is the palette source for
  navy `#1E4664` and teal `#6ED2E6`, and the source for the taglines. The Bloodhound is on it.
- `jj_03.jpg` — dark Web3 agency site. TAKE: the hero anatomy (headline left, glowing 3D
  object right, two floating stat chips "240+ / 92%" *overlapping* the object), the
  **marquee ticker strip** with ✦ separators directly under the hero, the "Our Services"
  band where each service has a 3D illustration and a checklist, the 4-up stat row with
  big numbers. Recolor to navy/teal; the "glow" is teal at 20% around the cube.
- `jj_04.jpg` — white presentation system with orange accent. TAKE: **this is what a
  "white cutoff" section looks like** — light `#F5F7FA` surface, hairline grid, one
  accent used as a *tag* (small filled rectangle with label) and as a *big number*
  ("245+"), numbered index lists (`01 / 02 / 03` with a hairline under each), a
  half-tone/ribbon image inside a rounded card, tiny mono meta in corners. Our accent
  replaces orange per section (red/green/blue/teal).
- `jj_05.jpg` — red/black poster grid. TAKE: the *poster* as a card format: black card,
  one giant glyph/word, red accent, mono index in the corner, a hairline frame inset 12px.
  Use for Cyberhounds and for Event posters.
- `jj_06.jpg` — CATCH conference poster (the key ref in context/05). TAKE: giant condensed
  display type stacked 4 lines, **3D cubes with glyphs floating through the type**, a
  dossier meta block (Project Type / Client / Year) in tiny mono at the top, the mix of
  180px type with 10px type. This is the Home hero and the Events hero.
- `jj_07.jpg`, `jj_08.jpg` — "Trouble" blue lettering poster. TAKE: a single-color
  (cube blue `#2058A0`) geometric wordmark on light ground inside a framed panel — use
  as the *section-motif* treatment for the Join/blue section and as the 404 page.
- `jj_09.jpg` — red dot-matrix figure + vertical binary column + date. TAKE: **the vertical
  mono rail** (`04/11/19 · 0000100100…`) as a section-edge element, and the dot-matrix
  treatment for the Bloodhound in the Cyberhounds section. Binary rings + this = our
  background system.
- `jj_10.jpg` — phone tickets (navy/red). TAKE: the **ticket/stub card**: two-tone split
  (navy top, light bottom), model-number label, a barcode strip, corner notches, a
  "Performance 0.719" big-number field. This is the Event card and the App card.
- `jj_11.jpg` — TRA / Orion N5 industrial spec sheets. TAKE: the **spec table**: label
  column in mono caps, value column bold, hairlines, a telemetry mini-chart, "95%" big
  stat, a black-on-yellow tag → for us black-on-teal / white-on-accent. This is the Apps
  spotlight and the Resources index and the OS Today tiles.
- `jj_12.jpg` — Supavoxel screenshot: proportion reference for the cube only.

### 1c. `../jjay_css_refs/old-site/*.png` — what must survive
Twelve desktop/mobile renders of jjaycss.tech. Every section visible in them is in §10.

### 1d. `../jjay_css_refs/club/*.png`
`youtube_banner.png` (Bloodhound + palette), `old_site_header_binary_rings_and_stamp.png`
(rings + stamp at full res), `github_org_page.png`, `discord_links_pin_2021.png`.

### 1e. Also available on this Mac (read-only; §context/16)
`~/Desktop/LAGCC/rhec_web/rhecwb/{index.html,css/style.css,js/main.js}` — read `main.js`
for the morph-nav and `data-reveal` implementations and `style.css` for `.site-footer__brandmark`,
`.section-motif`, `.about-spread`, `.hero-stage` — then re-implement in React/Motion.
Ryan's portfolio at `~/Desktop/portfolio` (or wherever `context/16` says) uses **Lenis**
smooth scroll + a `NavOverlay` + `Dossier`/`FolderCard` components — read them for the
Lenis wiring pattern and the dossier card anatomy.

## 2. The loop protocol (this is the whole method — do not skip steps)

You run **one loop per page**, Home first, then in the order of §6. Each loop:

```
LOOP(page):
  A. PLAN     write qa/loops/<page>/plan.md: the section list for this page (from §6),
              each with: anatomy (dark|light|poster|spread|spec|list|fin|footer), accent,
              the ref image it is matching, the motion it gets, the old-site section it
              carries (from §10).
  B. BUILD    implement every section in plan.md. Real data from data/ and content/.
              No placeholder text except the §5 "Slot NN — Open" pattern.
  C. SHOOT    npm run shoot -- --page <route>   (Playwright, full-page, 1440 and 390,
              plus a 1440x900 viewport shot at scrollY = 0, 25%, 50%, 75%, 100%, and a
              shot of the nav after scrolling 200px). Also record a 6-second WebM
              at 1440x900 scrolling from top to bottom at constant speed (Playwright
              video) and extract 6 frames from it with ffmpeg into qa/loops/<page>/motion/.
  D. COMPARE  npm run compare -- --page <route>  → builds qa/loops/<page>/compare_<n>.png:
              a 3-column sheet, [ref crop | our shot | diff notes column rendered as text],
              for each section in plan.md, using the ref image named in the plan.
              Then READ that image. Actually read it. You are the reviewer now.
  E. SCORE    fill qa/loops/<page>/score_<n>.md with the §12 rubric: 12 lines, 1–5 each,
              one sentence of evidence per line naming what in the screenshot proves the
              score. Be brutal; a 3 is "would not embarrass us", a 5 is "indistinguishable
              from the ref's quality".
  F. GATE     if every line ≥ 4 AND the §10 rows for this page are all green → commit
              ("feat(ui): <page> loop <n> — passes rubric") and go to the next page.
              else → write the 3 lowest-scoring lines into fix_<n>.md with the concrete
              change for each (not "improve spacing" — "hero H1 from 72px to
              clamp(96px,11vw,168px); add stat chips overlapping the cube at 62%/78% x"),
              apply them, n += 1, go to C. Max 5 iterations per page; on the 5th, commit
              whatever you have with the score in the message and move on.
```

**Time budget: 150 minutes.** Checkpoints at 30/60/90/120 min: write `context/21_RUN2_LOG.md`
with page, iteration, scores, minutes used. Home may take up to 45 minutes (it carries the
shared components everyone else uses). At 150 minutes stop wherever you are, commit, write
the report (§13). **Ask nothing for the whole run.** Ambiguity → pick the option closest to
the named ref, log it in `context/21_RUN2_LOG.md`, continue.

Before Home's loop starts, do **Loop 0 (shared layer, ≤ 25 min)**: §3 primitives, §4 motion
infrastructure, §5 cube path, §7 footer, §8 nav — because Home's first screenshot is
meaningless without them. Loop 0 has its own rubric subset (§12 lines 6, 7, 9, 10, 11).

Tooling to add in Loop 0 (all local, no accounts):
- `scripts/shoot.mjs` (Playwright, already a dev dep) — the shots + video described in C.
- `scripts/compare.mjs` — composes the compare sheet with `sharp` (add as dev dep) from a
  JSON map `qa/loops/<page>/plan.json` ({section, refImage, refCrop:[x,y,w,h], ourCrop}).
  You choose the ref crops when you write the plan. Left column ref, middle ours, right
  column: rendered text of the section's plan line so the sheet is self-describing.
- `ffmpeg` is on this Mac (`which ffmpeg`; if not, `brew install ffmpeg` is allowed).

## 3. Global composition rules (apply to every public page)

**Rhythm.** A page is a sequence of *movements*, not a stack of cards. The base rhythm is:

```
DARK hero (100vh, navy-600, cube or poster art, stat row)
LIGHT cutoff #1 (paper, editorial spread)            ← "the modern white cutoff"
DARK band (navy-700, watermark motif, grid of things)
LIGHT cutoff #2 (paper tinted with the section accent at 6%, spec sheet / list)
DARK poster band (navy-900, one giant word, one accent)
LIGHT cutoff #3 (paper, gallery or partners/slots)
FIN line (paper → navy-900 transition, "End of transmission · 01")
DARK footer (navy-900 → seam, giant wordmark)
```

Not every page uses all eight, but **every page has at least two light cutoffs and ends
with fin + footer.** Light and dark bands meet at a hard horizontal edge — no gradients
between bands (gradients are for glows *inside* a band). The edge is the design.

**Light surfaces** are `--color-paper: #F5F7FA` and `--color-paper-2: #E9EFF5` (navy-tinted),
and per-section `color-mix(in oklab, var(--accent) 6%, var(--color-paper))`. Ink on paper
is `navy-900`. Muted on paper is `#4E6480`. Hairlines on paper are `#C9D4E0`. **This is not
cream.** If it reads warm, you've drifted — check the hex.

**Section anatomy** (every section, dark or light, gets these — it's what makes the page
read as *designed* rather than *generated*):
- **Index + rail**: top-left `01 — EVENTS` in `--font-mono` 11px, `0.08em`, accent colored,
  with a 1px accent rule to the right that runs to the section edge.
- **Vertical mono rail** (from `jj_09`): on the left or right gutter at ≥1280px, a rotated
  mono string — the section's slug + a binary string + a date — at 10px, 30% opacity.
- **Display headline**: `--font-display` 800–900, uppercase or sentence-case per section,
  `clamp(40px, 6vw, 96px)`, tight leading 0.95, letter-spacing −0.02em. Two lines max.
- **Dek**: `--font-body` 17–18px, max 56ch, muted.
- **Meta grid**: 3–4 label/value pairs in mono/body, hairlines between.
- **One accent per section**, used exactly three ways: the index/rail, the tag, the CTA.
  Never as a large fill unless it's the poster band.
- **Corner brackets** on featured elements (`CornerBrackets` exists — use it on the hero
  cube frame, the featured app, the pullquote, not on everything).
- Section padding: `clamp(96px, 12vw, 160px)` vertical at desktop, 64px mobile. Max width
  1280 with a 12-col grid; editorial spreads use 5/7 or 7/5 splits, spec sheets 4/8.

**Cards** — replace `SpecCard` and `StatTile` with this family (`apps/web/src/components/cards/`):
- `TicketCard` (from `jj_10`): two-tone split, top navy with mono model label + title,
  bottom paper with meta rows, a `BarcodeStrip` (SVG bars from a string hash) along the
  bottom, corner notches via `clip-path`. Used for Events and Apps.
- `SpecSheet` (from `jj_11`): label column mono caps 11px / value column body 600, hairline
  rows, optional `BigStat` cell (display 64–96px), optional `MiniChart` (sparkline from an
  array). Used for the featured App, Resources categories, OS tiles.
- `PosterCard` (from `jj_05`/`jj_06`): navy-900 or accent fill, one giant word or glyph
  (display 96–160px), 12px inset hairline frame, mono index in a corner, hover lifts the
  frame 4px and shifts the glyph 8px. Used for Cyberhounds competitions, section hero tiles.
- `IndexList` (from `jj_04`/rhecwb bulletin): rows `01 — Title — dek — ↗` with hairlines,
  hover translates the row 8px and brightens the arrow. Used for News, workshops, resources.
- `SlotCard`: dashed hairline, "Slot 01 — Open", mono. Used wherever data is empty
  (partners, upcoming events with none scheduled, apps before submissions).
- `StatChip` (from `jj_03`): pill with big number + mono label, `backdrop-filter: blur`,
  positioned absolutely over art.
- `Pullquote`: display 32–44px, accent open-quote glyph at 160px behind at 8% opacity.
- `PhotoFrame`: image with a 1px hairline frame inset 10px, a mono caption rail beneath,
  optional accent tag. Club photos from `content/images/` (run 1 converted them to WebP).

**Type scale** (tokens.css, add): `--text-display-xl: clamp(64px, 11vw, 176px)` (hero, poster
bands, footer wordmark is separate), `--text-display-lg: clamp(40px, 6vw, 96px)`,
`--text-display-md: clamp(28px, 3.2vw, 44px)`, `--text-body-lg: 18px`, `--text-body: 16px`,
`--text-label: 11px`. VT323 at ≥20px for taglines and the ticker digits only.

## 4. Motion spec (the "dynamic flow")

Install: `lenis`, keep `motion`. Everything below is required; `prefers-reduced-motion`
disables the scroll-linked and parallax parts and keeps opacity reveals.

1. **Smooth scroll**: Lenis at `lerp: 0.1`, `wheelMultiplier: 1`, wired into a single rAF loop
   in `apps/web/src/motion/LenisProvider.tsx`; expose the instance via context so the cube
   and the nav read `scroll` from it. React Router navigations call `lenis.scrollTo(0, {immediate:true})`.
2. **Reveals**: `<Reveal>` wrapper using Motion `whileInView` with `viewport={{ once: true,
   margin: "-12% 0px" }}`: opacity 0→1, y 24→0, 0.7s, `[0.22, 1, 0.36, 1]` ease. Children
   stagger 60ms via `staggerChildren`. Headlines reveal per-line (split into spans) with a
   clip-path wipe from the bottom. **Every section's headline, dek, cards and images use it.**
3. **Nav morph** (§8): scroll > 24px → `data-scrolled` → height 72→56, background
   `navy-900/70` + `backdrop-blur(12px)`, border-bottom hairline, logo scales 0.85.
   Scrolling up reveals it, scrolling down past 400px hides it (translateY −100%).
4. **Parallax**: `useScroll` + `useTransform` on `PhotoFrame` (image moves −8% over the
   section's scroll range), on watermark motifs (+12%), on the hero cube frame (rotates 6°).
5. **Counters**: `BigStat` and stat-row numbers count from 0 with `animate()` over 1.2s when
   in view (once). Format with tabular figures (`font-variant-numeric: tabular-nums`).
6. **Ticker**: the marquee under the hero (exists as `Ticker`) — rewrite as a true
   infinite CSS marquee (two copies, `translateX(-50%)` loop, 40s, pauses on hover), with
   ✦ / `//` separators, content = taglines + next event + "Apps open for submissions".
7. **Hover**: cards lift 4px + shadow `0 24px 48px -24px navy-900/60`; arrows translate
   4px/−4px; links get an underline that draws in from the left (`background-size` trick).
   PosterCard glyph shifts 8px. Buttons: filled accent → on hover the fill slides off to
   reveal an outline (pseudo-element translate).
8. **Page transitions**: `AnimatePresence` on the route outlet — outgoing page fades 0.2s,
   incoming page's hero reveals. A 2px accent progress bar at the top of the viewport
   scales to the page's `--accent` on route change.
9. **Cube** — §5.
10. **Footer wordmark**: as the footer enters the viewport, the giant wordmark rises from
    +80px to 0 and opacity 0→0.08 tied to scroll progress (`useScroll` on the footer ref).
11. **Binary rings**: slow rotation (one ring cw at 120s, one ccw at 180s) via CSS; opacity
    per band (dark 7%, light 5% in navy ink).
12. **Perf gate**: Lighthouse performance ≥ 85 at 1440 on Home with the cube; no layout
    shift from reveals (reserve space; reveals only transform/opacity); canvas is `dpr ≤ 1.5`;
    all Motion values are transforms. Record in the loop score.

## 5. The cube — scroll-path-following, cube-as-nav

Replace `CubeHero` with `apps/web/src/cube/CubeRail.tsx`, mounted **once** in the Home layout
(not inside a section): a `position: fixed` full-viewport R3F `<Canvas>` with
`pointer-events: none` except on the cube mesh, `z-index` above the bands but below the nav
and the chat widget. The cube is the *only* thing in that canvas. Every visible section
declares where the cube should be while that section is in view; the cube tweens between
those keyframes as a function of Lenis scroll progress.

Keyframes (Home; x/y are viewport fractions from the left/top, scale relative to hero size,
rotation is which face points at the camera — face map from `context/06_CUBE_ASSET.md`):

| Section in view | x | y | scale | facing | extra |
|---|---|---|---|---|---|
| Hero | 0.68 | 0.50 | 1.0 | 3-quarter (R+G+B visible) | idle float ±4px, slow y-spin 0.15 rad/s, teal rim glow, bloom 0.6 |
| Ticker → Light cutoff #1 (About spread) | 0.86 | 0.30 | 0.45 | R+G edge | drifts to the top-right corner, sits *over* the light band — a navy object on paper reads great |
| DARK band 01 Events (red) | 0.12 | 0.55 | 0.7 | **red C** | face snaps toward camera with a 0.6s spring; rim glow turns `--color-red` |
| LIGHT cutoff #2 Apps (green) | 0.88 | 0.60 | 0.7 | **green S** | glow `--color-green` |
| DARK poster band Cyberhounds | 0.50 | 0.85 | 0.35 | edge-on | sinks behind the poster text (render order / z-offset) then re-emerges |
| LIGHT cutoff #3 Join (blue) | 0.15 | 0.40 | 0.7 | **blue S** | glow `--color-blue` |
| Gallery / Partners | 0.92 | 0.20 | 0.3 | 3-quarter | small, parked |
| Fin line | 0.50 | 0.50 | 0.5 | 3-quarter | centered, pauses — this is the fin's ornament |
| Footer | 0.50 | 0.62 | 0.9 | 3-quarter | descends into the stamp lockup, stops spinning, becomes the seal next to the JJ shield |

Implementation: each section registers `{id, ref, keyframe}` with a `CubeRailContext`; on each
Lenis frame compute the section-space progress and `damp` (`maath/easing.damp3`) position,
scale and target quaternion toward the active keyframe (lambda 4–6 so it *trails* the scroll
by ~150ms — that trailing is the "follows a path" feel). Between keyframes interpolate along a
cubic through the two positions with a lateral bulge so it arcs, not slides. Facing: slerp to
the face quaternion; while a face is targeted, the cube still idle-rotates ±6° around it.
Clicking a targeted face navigates to its route (Events/Apps/Join); hovering shows a mono
label chip next to the cube ("→ Events"). Mobile (<768px): cube renders only in the hero and
the footer (fixed canvas off; two static `<CubeSpot>` mounts) — path-following on mobile
is a perf trap, log this decision.

Other pages mount `CubeSpot` (existing) in the hero at the accent facing, plus in the footer.

Materials: keep run 1's material recipe + `RoomEnvironment`; add `@react-three/postprocessing`
Bloom (`luminanceThreshold 0.8, intensity 0.6`) and a colored rim via an `EffectComposer`-free
trick: a second slightly-larger mesh with `BackSide` and additive accent color at 0.25 opacity
(cheaper than a real outline pass). Fallback: WebGL unavailable → the vector logo
(`assets/brand/cs_logo_sharp.svg`) in the same positions via a 2D fixed layer using the same
keyframes (so the page still has a moving identity object).

## 6. Page-by-page composition (the sections, in order, with anatomy · accent · ref · motion · old-site row)

Notation: `[anatomy | accent | ref | motion | carries]`.

### 6.1 Home (`/`) — 12 movements

1. **Hero** `[dark navy-600 | teal | jj_03 + jj_06 | cube keyframe 1, headline line-wipe, chips fade-in 0.4s later]`
   - Left: mono kicker `JOHN JAY COLLEGE · CUNY · COMPUTER SCIENCE SOCIETY` (fix: no "Est.
     stamp"); H1 in `--text-display-xl`: `DEBUG YOUR MIND,` / `COMMIT TO` / `GROWTH.` (the
     banner's tagline *is* the headline; the club name is the kicker and the nav) — 3 lines,
     the third in teal; dek from `content/home.md`; CTA pair `Join the Society` (filled
     blue) + `See the Apps ↗` (outline).
   - Right: the cube at keyframe 1 inside a `CornerBrackets` frame 560px square with the
     binary rings behind it at 7%; two `StatChip`s overlapping the frame: `{nWorkshops}+
     workshops` at (62%, 18%) and `{nTerms} boards since 2019` at (78%, 74%) — only real
     numbers from `data/`; if a number is 0, the chip is omitted (never "TBA").
   - Bottom: stat row 4-up in mono/display: Members (from `board.json` count → label
     "Officers, all terms"), Events logged, Resources, Semesters — with counters.
   - Background: navy-600 with a teal radial glow behind the cube at 18%, `jj_09` vertical
     rail on the far left: `01 — HOME · 0100100101 · SINCE 2019`.
2. **Ticker** `[dark navy-700, 48px | teal | jj_03 | infinite marquee]` — taglines ✦ next
   event ✦ "Apps: submissions open" ✦ "Cyberhounds CTF" ✦ repeat.
3. **About spread** `[LIGHT paper | teal | rhecwb about-spread + jj_04 | reveal, photo parallax]`
   — index `01 — WHAT THE CLUB IS ABOUT` (old-site band title, kept verbatim as the index
   label); `PhotoFrame` with the old site's club photo (the one used in its "What the Club
   is About" band) 5 cols; right 7 cols: display-lg headline `A society for people who
   build.` (or the old band's first sentence if stronger — check `content/home.md`), the
   old band's paragraph as dek, a `Pullquote` from the About page ("Let's grow together!"),
   meta grid: Founded / Meets / Discord / Email from `brand.config`.
   **Carries: old Home band "What the Club is About" + old About "Let's grow together!".**
4. **Events band** `[DARK navy-700 | red | rhecwb divisions + jj_10 | watermark motif parallax, cards stagger]`
   — index `02 — EVENTS`; watermark: the cube's red-C face as an SVG at 42vw, 7%, bleeding
   right; headline `Workshops, panels, and the occasional pizza.`; 3 `TicketCard`s: next
   upcoming (or `SlotCard` "Next event — Open, propose one ↗ /join"), the two most recent
   past from `events.json`; CTA `All events →`.
   **Carries: old Home band "Events" (its photo becomes the band's `PhotoFrame` at the far right, 3 cols).**
5. **Apps spotlight** `[LIGHT paper tinted green 6% | green | rhecwb featured-system + jj_11 | reveal, BigStat counter]`
   — index `03 — APPS · BUILT AT JOHN JAY`; the featured App as one wide `SpecSheet` (image
   or screenshot left 5 cols; right: title display-md, author, platform, stack tags, "Why it
   matters for John Jay" row, links); beneath, the other apps as `TicketCard`s 3-up, and
   `SlotCard`s to fill to 3 minimum ("Slot 02 — Your app here ↗ submit").
6. **Resources index** `[LIGHT paper-2 | teal | jj_04 numbered list | IndexList rows stagger]`
   — index `04 — RESOURCES`; headline `27 links we actually use.` (count from
   `resources.json`); the 6 categories as `IndexList` rows with counts and a `Browse all ↗`.
   **Carries: old Home band "Resources" (photo top-right as a small `PhotoFrame`).**
7. **Cyberhounds poster** `[DARK navy-900 | red | jj_05 + jj_06 + jj_09 | giant word wipe; dot-matrix hound reveals dot-by-dot]`
   — full-bleed; display-xl `CYBER` / `HOUNDS` stacked; right: dot-matrix Bloodhound
   (procedural: sample the mascot SVG into a 48×48 red dot grid, animate dots in by row);
   3 mono lines: `CTF TEAM · PICOCTF · NCL`; CTA `What is CTF? →`. Cube keyframe 5 sinks behind.
8. **Join / Collaborate** `[LIGHT paper tinted blue 6% | blue | jj_07 motif + jj_04 tags | reveal]`
   — index `05 — COLLABORATE`; headline `Open seats.`; 4 columns from the old Collaborate
   page: **Openings** (board roles), **Committees**, **Project ideas**, **Suggestions** —
   each an `IndexList` of 3–5 rows from `content/`/`data/`, each column with a blue tag;
   CTA `Join the Society` filled blue. Section-motif: a `jj_07`-style geometric "CSS"
   lettering panel in cube blue at the right edge, 8% opacity.
   **Carries: old Home band "Collaborate" + old Collaborate page's four lists.**
9. **Gallery** `[LIGHT paper | teal | rhecwb home-gallery | masonry reveal, hover zoom 1.03]`
   — index `06 — ON CAMPUS`; 6–9 club photos from `content/images/` in a 3-col masonry,
   mono captions (event name · term). If fewer than 6 photos exist, 2 rows of 3 with
   `SlotCard`s — never an empty band.
10. **Partners / Programs** `[LIGHT paper-2 | teal | rhecwb partners | reveal]` — index
    `07 — PROGRAMS & PARTNERS`; row of 5 slots: MSRC, PRISM, (Discord), and two
    `SlotCard`s "Slot — Open"; from `links.json`.
11. **Fin** `[transition paper → navy-900 | teal | rhecwb closing | cube keyframe 8 pauses]`
    — centered mono `END OF TRANSMISSION · 01` with hairlines; below it a VT323 line
    `01001010 01001010` at 24px, 30%.
12. **Footer** — §7.

### 6.2 About (`/about`) — 8 movements
1. Hero `[dark | teal | jj_06]`: kicker `ABOUT`, display-xl `WHO` / `WE ARE`, dek = old
   "Who We Are" first paragraph; `CubeSpot` right; stat row: officers / terms / years.
2. **Let's grow together** `[LIGHT | teal | about-spread]`: `PhotoFrame` + the old
   section's copy verbatim as headline + dek + pullquote. **Carries old About §1.**
3. **What We Do During The Semester** `[DARK navy-700 | red | jj_04 index]`: 4–6 `IndexList`
   rows (workshops, guest speakers, hackathons, socials — from `content/about.md`).
   **Carries old About §3.**
4. **Discussion With Your Peers** `[LIGHT tinted blue | blue | jj_10]`: Discord card as a
   `TicketCard` (server name, channels, invite), plus copy. **Carries old About §4.**
5. **The Board** `[LIGHT paper-2 | green | jj_04 people row]`: current term as a 4–6 up
   grid of `PhotoFrame`s (or initials tiles) with role in mono; below, **term history** as
   an `IndexList` accordion — one row per term from `board.json` (all 10 semesters), expand
   → names + roles. **Carries old About board-by-term.**
6. Poster band `[DARK navy-900 | teal | jj_05]`: `DEBUG YOUR MIND.` / `COMMIT TO GROWTH.`
7. Fin. 8. Footer.

### 6.3 Events (`/events`) — 7 movements
1. Hero `[dark | red | jj_06]`: display-xl `EVENTS`, three cubes-with-glyphs floating
   through the type (three small `CubeSpot`s at red facing, or SVG faces), dossier meta
   block top-right (`Term · Count · Venue`).
2. **Upcoming** `[LIGHT tinted red | red | jj_10]`: `TicketCard`s or `SlotCard` "Nothing
   scheduled — propose one".
3. **Previous events by semester** `[DARK navy-700 | red | rhecwb bulletin]`: `IndexList`
   grouped by term, date rail left, row expands to description + photo. **Carries old
   Events + Previous Events (all semesters).**
4. **Workshops** `[LIGHT | red | jj_11 spec]`: `SpecSheet` per workshop series from
   `workshops.json`.
5. Poster band: `SEE YOU` / `THERE.` 6. Fin. 7. Footer.

### 6.4 Apps (`/apps`) — 7 movements
1. Hero `[dark | green | jj_03]`: `APPS` / `BUILT HERE.`, cube green-facing, chips.
2. **Featured** `[LIGHT tinted green | green | jj_11]`: wide `SpecSheet`.
3. **Directory** `[DARK navy-700 | green | jj_10]`: `TicketCard` grid with filter chips
   (platform / stack) — filter animates with `layout` (Motion).
4. **Submit** `[LIGHT | green | jj_04]`: the submission form as a spec sheet (labels in the
   left column, inputs right), posting to `/api/apps/submit` with the local-inbox fallback.
5. **How review works** `[LIGHT paper-2 | green]`: 3-step `IndexList`.
6. Fin. 7. Footer.

### 6.5 Cyberhounds (`/cyberhounds`) — 8 movements
1. Hero `[DARK navy-900 | red | jj_05 + jj_09]`: `CYBER` / `HOUNDS`, dot-matrix hound,
   vertical binary rail, mono `CAPTURE · THE · FLAG`.
2. **What is CTF** `[LIGHT tinted red | red | about-spread]`. **Carries old §1.**
3. **How It Works** `[DARK navy-700 | red | jj_04 numbered]`: 4 numbered steps. **Carries old §2.**
4. **Competitions** `[LIGHT | red | jj_05 posters]`: `PosterCard` per competition
   (picoCTF, NCL, CSAW, …from `content/cyberhounds.md`) with dates in mono. **Carries old §3.**
5. **Join the team** `[LIGHT paper-2 | red | jj_10]`: `TicketCard` CTA. **Carries old §4.**
6. Poster band `NO FLAG` / `LEFT BEHIND.` 7. Fin. 8. Footer.

### 6.6 Resources (`/resources`) — 6 movements
1. Hero `[dark | teal]`: `RESOURCES`, count BigStat.
2. **Index** `[LIGHT | teal | jj_11 + jj_04]`: sticky left column of categories (mono,
   active one accent), right: `IndexList` per category, all 27 links, each row: `01 —
   Title — one-line why — domain in mono — ↗`. Link-check status dot from `links.json`.
3. **Starter kits** `[DARK navy-700 | teal]`: 3 `SpecSheet`s (Learn C++ / Learn the web
   stack this site uses / CTF starter) — from `content/`, if absent build from the 27 links.
4. Poster band. 5. Fin. 6. Footer.

### 6.7 News (`/news`, `/news/:slug`) — list: hero + `IndexList` (date rail) + fin + footer.
Article: `[LIGHT reading column 68ch | teal]` with display-md title, mono meta rail, body
in Poppins 18/1.7, pullquotes; **carries the graduate-events article and the blog posts.**

### 6.8 Join (`/join`) — 6 movements
1. Hero `[dark | blue | jj_07]`: `JOIN` with the blue geometric-lettering motif.
2. **Why join** `[LIGHT tinted blue | blue | jj_04]`: 3 tags + copy from old Collaborate.
3. **Openings · Committees · Project ideas · Suggestions** `[DARK navy-700 | blue]` four
   `IndexList` columns (same data as Home §8, full lists).
4. **Form / Discord** `[LIGHT | blue | jj_10]`: `TicketCard` with the Discord invite and
   the Google Form link from `links.json`; suggestion box posting to the API.
5. Fin. 6. Footer.

### 6.9 404 — `[LIGHT | blue | jj_07]`: the geometric "404" lettering panel, mono `ROUTE NOT
FOUND · 0100`, cube edge-on, `← Home`.

### 6.10 OS (`/os/*`) — out of the visual loop except: apply `SpecSheet`/`IndexList` to Today
and Queue so the OS reads as the same family (jj_11 is exactly an ops dashboard). ≤ 10 min.

## 7. Footer (`apps/web/src/components/Footer.tsx` → rewrite, ~250 lines)

Anatomy top to bottom, all on `navy-900` → `--color-seam` at the very bottom:
1. **Grid** (4 cols at ≥1024, 2 at tablet, 1 mobile), padding-top 96px:
   - col 1: stamp lockup (`StampLockup` exists) = the round JJ·CSS stamp, next to it the
     **John Jay shield** (extract from `youtube_banner.png` → `assets/brand/jj_shield.png`
     or trace to SVG if clean; if the crop is too low-res, render a typographic seal
     "JOHN JAY COLLEGE · CUNY" in a ring instead and log it) and the cube (2D SVG; on Home
     the 3D cube parks here per §5); under it the tagline in VT323 24px teal.
   - col 2: NAVIGATE — the 8 routes, `IndexList`-style with hover underline draw.
   - col 3: CONNECT — Discord, GitHub org, Email, YouTube, Linktree from `links.json`,
     each with a mono domain.
   - col 4: META — `Built with React · Python · Supabase`, `Source ↗ github.com/jjcss`,
     `MIT · content from CSS_Website@a8fca55`, `OS login →` (small).
2. **Divider + CTA**: hairline, then a row: left display-md `Ready to commit?`, right a
   filled-teal button `Join the Society` + outline `Submit an app`.
3. **Bottom rail**: mono 11px: `© {year} John Jay Computer Science Society` · `Handed to the
   board` · `v{pkg.version} · {short SHA from Vite define}` · "Back to top ↑" (Lenis scrollTo).
4. **Brandmark**: `<div aria-hidden>` with `COMPUTER SCIENCE` on line 1 and `SOCIETY` on
   line 2 — Archivo 900, `font-size: clamp(96px, 17.5vw, 260px)`, line-height 0.82,
   letter-spacing −0.04em, color `--color-ink` at **6% opacity**, `white-space: nowrap`,
   the block's bottom edge set so the second line's baseline is **~35% below the viewport
   bottom** (`margin-bottom: -0.32em; overflow: hidden` on the footer) — the crop is the
   effect. Enters per §4.10. On hover of the footer, opacity 6% → 9% over 0.6s (subtle).
   Mobile: 3 lines (`COMPUTER` / `SCIENCE` / `SOCIETY`) at 26vw.
5. Binary rings at 4% behind the grid, one ring bleeding off the top-right.

## 8. Nav (`Nav.tsx` → rewrite)

- Left: cube mark (SVG, 28px) + `CSS` in Archivo 800 + `John Jay` in mono 11px muted.
- Center (≥1024): 8 routes in body 14px 500; active route gets the page's `--accent`
  underline (2px) that animates between items (Motion `layoutId`).
- Right: `Join` filled accent button (page accent), and the Bloodhound chat trigger.
- Morph per §4.3. Mobile: hamburger → full-screen overlay (navy-900, routes in display-lg
  stacked, revealing line-by-line 60ms stagger, cube mark spinning slowly top-right, socials
  in mono at the bottom) — the `NavOverlay` pattern from Ryan's portfolio.
- A 1px accent progress bar under the nav shows page scroll progress (`useScroll`).

## 9. Component inventory to ship (all in `apps/web/src/components/`, each with a story block on `/styleguide`)

`cards/TicketCard`, `cards/SpecSheet` (+`BigStat`, `MiniChart`), `cards/PosterCard`,
`cards/IndexList` (+`IndexRow`), `cards/SlotCard`, `cards/StatChip`, `Pullquote`, `PhotoFrame`,
`BarcodeStrip`, `SectionIndex` (index + rail), `VerticalRail`, `Watermark` (motif, parallax),
`Band` (replaces `Section`: props `tone: dark|dark-2|dark-3|light|light-2|tinted`, `accent`,
`index`, `rail`), `FinLine`, `Marquee` (replaces `Ticker`), `Reveal`, `SplitLines`,
`Counter`, `DotMatrix` (SVG → dot grid), `Footer`, `Nav`, `NavOverlay`, `ProgressBar`,
`motion/LenisProvider`, `cube/CubeRail`, `cube/CubeRailContext`, `cube/CubeSpot` (kept).
Delete `SpecCard`, `StatTile`, `Section`, `Ticker`, `CubeHero` once nothing imports them.
`/styleguide` shows every one on both a dark and a light band — it is Loop 0's screenshot.

## 10. Old-site parity table (every row must be green in `qa/loops/parity.md` before the report)

| Old site (jjaycss.tech @ a8fca55) | Where it lives now | Status |
|---|---|---|
| Home band: What the Club is About (+ photo) | Home §3 About spread | |
| Home band: Events (+ photo) | Home §4 Events band (photo right) | |
| Home band: Resources (+ photo) | Home §6 Resources index | |
| Home band: Collaborate (+ photo) | Home §8 Join/Collaborate | |
| Header: binary rings | `BinaryRings` on every band | |
| Header: round stamp | `StampLockup` hero seal + footer | |
| Taglines (banner + site) | Hero H1, ticker, footer VT323 | |
| About: Let's grow together! | About §2 | |
| About: Who We Are | About hero dek + §2 | |
| About: What We Do During The Semester | About §3 | |
| About: Discussion With Your Peers | About §4 | |
| About: board by term (all terms) | About §5 accordion | |
| Events: upcoming | Events §2 | |
| Events: Previous Events (all semesters) | Events §3 | |
| Resources: all 27 links, categorized | Resources §2 + Home §6 | |
| Collaborate: Openings | Join §3 + Home §8 | |
| Collaborate: Committees | Join §3 + Home §8 | |
| Collaborate: Project ideas | Join §3 + Home §8 | |
| Collaborate: Suggestions (form) | Join §4 (API + inbox fallback) | |
| Cyberhounds: What is CTF | Cyberhounds §2 | |
| Cyberhounds: How It Works | Cyberhounds §3 | |
| Cyberhounds: Competitions | Cyberhounds §4 | |
| Cyberhounds: Join | Cyberhounds §5 | |
| Graduate-events article | News article | |
| Blog posts | News list | |
| Discord / Form / Linktree / MSRC / PRISM links | Footer CONNECT + Home §10 + Join §4 | |
| MIT notice + attribution | Footer META + LICENSE | |
| Club photos (all that survived run 1's conversion) | Home §9 gallery + PhotoFrames | |

Plus rhecwb-derived additions that must exist: stat row, ticker, spotlight, slots, fin,
brandmark footer, morph nav, reveals, OS shell — all covered above.

## 11. Copy rules

- Kicker/labels come from `brand.config` and the data files; no invented facts. The words
  "Est.", "stamp", "TBA", "coming soon", "lorem" may not appear anywhere in the DOM.
- Headlines are short declaratives or the old site's own phrases. The banner tagline is the
  Home H1. Section indexes reuse the old site's band titles verbatim (that is the revamp).
- Empty data → `SlotCard` with a real action, never an empty band, never a fake entry.
- All images have alt text from their filename/caption; every icon-only control has a label.

## 12. Rubric (score each 1–5 in every loop; ship gate is ≥ 4 on all twelve)

1. **Rhythm** — alternating dark/light movements with hard edges; ≥2 light cutoffs; no two
   adjacent sections share an anatomy.
2. **Scale contrast** — at least one display-xl moment per page; mono labels ≤ 11px present
   in every section; the ratio reads like `jj_06`.
3. **Card vocabulary** — cards are Ticket/Spec/Poster/Index/Slot from the refs, not generic
   bordered boxes; barcode/notch/tag/index details present.
4. **Palette discipline** — John Jay navy family + paper; one accent per section used as
   index/tag/CTA; zero warm/cream surfaces; contrast AA on both tones.
5. **Editorial spread** — at least one photo+headline+pullquote+meta-grid spread per page
   where a photo exists.
6. **Motion — reveals** — every section's headline and content reveals; stagger visible in
   the motion frames; no layout shift.
7. **Motion — scroll-linked** — Lenis smooth, nav morphs, parallax on photos/watermarks,
   footer brandmark rises; visible in the 6 motion frames.
8. **Cube** — on Home, position/facing changes across ≥6 of the motion frames along the
   keyframe path; face glows match section accents; parks in the footer.
9. **Footer** — grid → divider/CTA → rail → giant cropped brandmark with JJ shield + CSS
   stamp lockup; at 1440 the brandmark is ≥ 15vw and cropped at the bottom.
10. **Nav** — morph on scroll, active underline, overlay on mobile, progress bar.
11. **Parity** — this page's §10 rows all green, with the old-site phrases present.
12. **Craft** — hairlines aligned to the grid, consistent 12-col gutters, no orphan words in
    headlines, mobile (390) has no horizontal scroll and every section still reads.

## 13. End of run

At ≤150 min: commit, then write
- `qa/REPORT_RUN2.md`: per page → final iteration, 12 scores, the compare-sheet paths, the
  motion frames, Lighthouse numbers, what was cut.
- `qa/loops/parity.md` filled.
- `context/21_RUN2_LOG.md` finalized (every decision made without asking, one line each).
- Update `README`/`SETUP.md` only if a dev step changed (Lenis/sharp deps).
Then print: the per-page score table, the 5 things you'd fix next, and the exact commands
Ryan runs to see it (`npm run dev` + `uvicorn`). Never push.

## 14. Don'ts (repeat of the hard rules that this run is most likely to break)

- No cream, no warm neutrals, no Inter, no rhecwb hex, no rhecwb copy. No MCPs, no
  component registries, no API keys, no LLMs. No writing outside this folder. No
  pasting old-site text into components (it stays in `data/`/`content/`). No new files in
  `api/`. No `alert()`s. No questions until the run ends.
- Do not "improve" the API, the schema, the OS logic, or the cube GLB — this run is the
  visual layer. If a data shape blocks a section, add a field to the JSON + schema and
  log it.
- Do not skip step D. If you catch yourself scoring without having read the compare sheet,
  stop and read it. The loop is the product.
