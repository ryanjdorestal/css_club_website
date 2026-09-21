# 23 — RUN 3: TYPOGRAPHY + COMPONENT REBUILD ("sigil pass") — continuous loop, no questions

Paste everything below the line into Claude Code (Fable, xhigh) opened in `~/Desktop/jjay_css`.
Run 2 fixed composition, rhythm, motion and the cube path — **keep all of it**. Run 3 replaces the
*type system*, the *micro-label system*, the *card/component anatomy* and the *texture layer* on every
public page until they read like `context/22_REF_STUDY.md`'s twelve target cells. Ryan's verdict on run 2,
verbatim: "typography and UI card design is your weak point, they don't look sharp or cyberpunk … this is
not the post-apocalyptic Watch Dogs code/sigil-esque typography … should feel like Mirror's Edge."

---

## 0. What is wrong, precisely (confirm each against `qa/loops/home/vp-0.png` before editing)

1. **The display face is the wrong species.** Archivo Black is a friendly heavy grotesk with round
   corners and open counters. Every target cell uses squared, stencil-cut, extended or pixel
   letterforms: straight strokes, cut corners, bars removed, flat curves. "DEBUG YOUR MIND" in Archivo
   reads like a gym poster; in a squared stencil face with the same words it reads like a faction slogan.
2. **The body face is soft.** Poppins is a rounded geometric. The refs' body is a squared grotesk or mono.
3. **Labels are polite.** Our mono labels are `01 — EVENTS` with an em dash. The refs' labels are
   *system output*: `/01`, `//SCN_01`, `_status`, `> RENDERING 83%`, `[1]`, `● LIVE`, `VERSION 2.0.0-RC1`,
   `X_40.7706`. Prefix glyphs, underscores, slashes, hex, coordinates, timestamps — and they are everywhere,
   including the nav and the bottom edge of the page.
4. **Cards are containers, not instruments.** Ours: rectangle, hairline, label row, barcode. The refs':
   chamfered corner with an accent stub, side tab, registration marks on the image frame, index `001`,
   ID code, two-tier key/value rail, segmented meter, bracketed CTA, `↗` end-cap. See T05, T08, T11, T12.
5. **No sigil layer.** The refs all carry a geometric mark system — a square-grid wordmark, a pixel eye,
   a lambda, four-point stars, pictograms with square-capped strokes — used as bullets, section marks,
   watermarks and hover states. We have the cube and nothing else.
6. **No readout layer.** Nothing on our pages looks *measured*: no coordinates, no hashes, no SYS.TIME,
   no version, no status bar, no `SCN:` / `NODE:` rail, no segmented meters, no tick rulers.
7. **Textures are one thing (rings).** Refs layer dot grids, hairline grids, contour lines, halftone
   masked to a corner, hatch strips, wireframe meshes, scanlines — all at 4–10%.
8. **Headlines don't *do* anything.** No solid+outline pairing, no half-outline word, no crop at the edge,
   no wireframe drawn through the letters, no stencil bars, no decode/scramble reveal.
9. **CTAs are pills-with-arrows.** Refs: `[ >_EXECUTE ]` brackets, flat blocks with a square end-cap
   holding `↗`/`+`, 1px outlines with tracked caps. Zero radius.
10. **Light sections are plain paper.** T04 shows the same register on white: `+` registration marks at
    section corners, hairline grid, hatch strip under the form, `/03 SELECTED WORK` indices, black
    notched CTAs. Ours are clean but characterless.

Not wrong (do not touch unless a rubric line forces it): the 12-movement rhythm, dark/light cutoffs,
Lenis + reveals, morph nav behaviour, cube rail keyframes, footer anatomy, parity table, data/API/OS.

## 1. Ground truth — load ALL of it before the first edit (≤ 12 min)

Read: `CLAUDE.md`, `DESIGN.md` (palette unchanged; **fonts change per §2 — update DESIGN.md as step 1 of
Loop 0**), `context/22_REF_STUDY.md` (the evidence — every line), `context/19_UI_REBUILD_PROMPT.md` §3–§7
(the composition you are keeping), `context/21_RUN2_LOG.md`.

Then run `scripts/collect_type_refs.mjs` (write it: copies the 12 T-cells + the secondary list from
`context/22` out of `~/Desktop/UI:UX INSPO/` — match on the time fragment in the filename, macOS screenshot
names contain U+202F before AM/PM — into `../jjay_css_refs/type/T01.png … T12.png` and `../jjay_css_refs/type/S01…`),
and **Read every T-cell at full resolution**. Write `context/24_TYPE_NOTES.md`: for each T-cell, three
lines — the letterform facts, the micro-system facts, the one thing you will reproduce on which page.
No line = you did not look.

Also Read `../jjay_css_refs/rhecwb/home_1440_b.png` bottom third (Ryan's own footer) and `../jjay_css_refs/jj_inspo/jj_07.jpg` (the Kufic sigil).

## 2. Type system v2 (`apps/web/src/tokens.css` + `apps/web/src/type.css`, both before any component)

### 2a. Faces — install with `@fontsource/<name>` (self-hosted, no CDN, no keys); subset latin; `font-display: swap`

| Token | Face | Weights | Role |
|---|---|---|---|
| `--font-display` | **Chakra Petch** | 600, 700 | all H1/H2, poster words, stat numerals ≥ 40px, section headlines |
| `--font-wide` | **Michroma** (fallback Syncopate 700) | 400 | wordmarks, footer brandmark, nav logotype `CSS`, the fin line, poster-band single words |
| `--font-pixel` | **Silkscreen** | 400, 700 | poster-band eyebrows, big counters (`1 /5`, `104 : 0768`), 404, loading % |
| `--font-mono` | **JetBrains Mono** | 400, 600 | every label, readout, nav item, button, table, caption, form label, code |
| `--font-body` | **Space Grotesk** | 400, 500 | paragraphs, list titles, card titles ≤ 28px, form inputs |
| `--font-legacy` | **VT323** | 400 | binary rings digits, ticker digits only |

Retire Archivo and Poppins entirely (`grep -r "Archivo\|Poppins" apps/web/src` must return 0 after Loop 0).
Log the retirement in `context/25_RUN3_LOG.md` with the reason from `22 §fonts`.

OpenType everywhere: `font-feature-settings: "zero" 1, "tnum" 1, "ss01" 1` on mono; `font-variant-numeric:
tabular-nums slashed-zero` on every numeral; `text-rendering: geometricPrecision` on display.

### 2b. Scale (replace run 2's `--text-*`)

```
--type-hero:     clamp(72px, 12vw, 200px)   /* display, uppercase, leading .86, tracking -.03em */
--type-poster:   clamp(96px, 18vw, 320px)   /* wide, uppercase, leading .82, cropped by edge */
--type-h1:       clamp(48px, 7vw, 112px)    /* display, uppercase, leading .9,  tracking -.02em */
--type-h2:       clamp(32px, 4vw, 56px)     /* display, uppercase or sentence, leading .95 */
--type-h3:       clamp(20px, 2vw, 28px)     /* body 500 or display 600 */
--type-stat:     clamp(48px, 6vw, 96px)     /* display 700 tabular; unit at .35em raised */
--type-body-lg:  18px / 1.6                 /* body */
--type-body:     15px / 1.6                 /* body */
--type-label:    11px / 1, tracking .14em, uppercase, mono   /* 10px allowed inside cards */
--type-micro:    9px / 1, tracking .12em, uppercase, mono    /* readouts inside HUD frames only */
--type-pixel:    clamp(18px, 2vw, 28px)     /* Silkscreen, never below 18px */
```

Size contrast is the design: every band must contain one element ≥ `--type-h1` and ≥ six elements at
`--type-label` or smaller. Body copy is never wider than 56ch and never the visual center of a band.

### 2c. Headline treatments (`apps/web/src/components/type/`) — build all six, use each at least twice

1. `<Stencil>` — display text with **stencil bars**: an absolutely-positioned set of 2–3 horizontal
   rectangles in the band's background color, 3–4% of the cap height tall, cutting through the letters
   at 38% and 62% of cap height (like T01 "MASKED. MARKED."). Props: `bars: [0.38, 0.62]`, `gap`. On hover
   or in view, bars slide in from the left over 0.5s (that is the stencil "cutting" itself).
2. `<Outline>` — same face, `color: transparent; -webkit-text-stroke: 1.25px currentColor`. Used as the
   second word in a **solid + outline pair** (`UTOPIA` + `TOKYO` → `DEBUG` + `MIND`) and as the ghost layer
   behind a solid copy offset by 4px (T09 posters).
3. `<SplitFill>` — one word, first N letters solid, rest outline (T06 `VIT|ALITY`). Prop `at: 3`.
4. `<EdgeCrop>` — wraps a `--type-poster` word in `overflow:hidden` with `margin-inline: -0.06em`,
   anchored to a container edge, so the first/last glyph is cut (T02, rhecwb brandmark). Prop `side`.
5. `<Wireframe>` — an SVG line drawing rendered *through* the headline: `mix-blend-mode` on a 1px accent
   path that crosses the letters (T02's red vehicle). For us: the cube's edge-wireframe (export edges from
   `assets/cube/cs_cube.glb` to an SVG once via a script; 12 outer edges + notch edges is enough).
6. `<Decode>` — reveal: characters cycle through `01<>/[]_#` for 350ms then settle left-to-right
   (18ms/char), triggered `whileInView` once; respects reduced-motion (instant). Used on every H1 and
   on poster words.

Glyph substitution rules (apply by hand in copy, not by font feature — legibility first): `0` may replace
`O` **only** in codes/labels, never in words; `_` joins words in CTAs and labels (`JOIN_THE_SOCIETY`);
`⁄` (U+2044) may replace a hyphen in a logotype; never leetspeak in body copy.

### 2d. Label grammar (`<Label>` component; `apps/web/src/components/type/Label.tsx`)

Every label is `prefix + text [+ value]` in `--font-mono --type-label`. Prefixes, in order of preference
by context:

| Context | Prefix | Example |
|---|---|---|
| Section index | `/` | `/01 WHAT THE CLUB IS ABOUT` |
| Sub-index inside a section | `//` | `//SCN_03` `//EVT_S25-01` |
| Key in a key/value rail | `_` | `_status  ARCHIVED` |
| Live/streaming value | `>` | `> RENDERING 83%` |
| Step / enumerated | `[n]` | `[1] SHOW UP` |
| State | `●` / `○` | `● LIVE` `○ IDLE` |
| Navigation / link | `↗` `→` `↳` | `ALL EVENTS ↗` |
| Coordinate / axis | `X_` `Y_` | `X_40.7706  Y_-73.9886` |

Separators inside a label: `·` and `/` only (no em dashes, no pipes except in the ticker). Every label
that carries a number uses tabular figures. Labels are 55% opacity on dark, 60% on paper; the prefix
glyph is at 100% in the section accent.

## 3. The sigil layer (`apps/web/src/sigils/` — SVG, 24-unit grid, square caps, miter joins, `stroke-width: 1.25`)

Build these as React components exporting `<svg viewBox="0 0 24 24">`; all strokes `currentColor`,
no fills except where noted. They are the icon set, the bullet set, the hover-state set and the watermark set.

1. `CubeSigil` — the cube's three faces as a square-grid mark (top rhombus flattened to a square, two
   side faces as L-shapes), 1.25px strokes. Variants: `face="r|g|b"` fills that face at 100%.
2. `CSSKufic` — the letters **C S S** drawn as square-Kufic strokes on a 5×5 grid each (T10: right-angle
   strokes, uniform width, no curves; the S is a rotational Z-form, the C is a bracket form), joined into
   one 17×5 mark. This is the new **footer brandmark ornament** and the Join/404 motif. Trace it by hand in
   SVG; write the path data in the file with a comment grid.
3. `HoundPixel` — the Bloodhound head as a 16×16 pixel sigil (from the run-1 dot-matrix sampler, thresholded).
4. `Flag`, `Terminal`, `Node`, `Shield`, `Bracket`, `Crosshair`, `Chevrons` (`»»»`), `Star4` (four-point),
   `Lambda`, `Eye` (pixel eye from T03), `Arrow` (`↗` in a square), `Plus` (registration `+`), `Tick`,
   `Barcode` (generated from a string hash: 40 bars of width 1–3), `Perforation` (dashed edge).

Usage rules: every section header has one sigil left of the index; every card has one in its header
rail; the Cyberhounds band uses `Shield`/`Flag`/`HoundPixel`; Apps uses `Terminal`/`Node`; Join uses
`CSSKufic`; watermarks are the sigil at 28–40vw, 5–7% opacity, bleeding off an edge (replacing the
generic "CSS" text watermark on Home §8 with `CSSKufic`).

## 4. The readout layer — real data only, never invented

Add `apps/web/src/lib/readouts.ts` exposing:
- `buildHash()` → short git SHA at build time (`vite define`), `buildTime()` → ISO, `version()` → package.json.
- `sysTime()` → live `HH:MM:SS` + `UTC-4/-5` (America/New_York), ticking each second (one interval, context).
- `coords` → John Jay College, 524 W 59th St: `40.7706° N / 73.9886° W` (verify to 4 decimals in the
  run; log the source). Format as `X_40.7706  Y_-73.9886` in HUD rails.
- `counts` → officers, events, resources, semesters, apps, KB entries from `data/`.
- `scn(sectionIndex)` → `SCN: 000N`, `node()` → `NODE: JJ_CSS_01`.
- `hexId(str)` → `0x` + first 6 hex of a stable hash of `str` (for cards: `HASH: 0x4A1F0C`).
- `ping()` → last `/api/health` latency (Tier-1: `--` when offline; never fake).

Place readouts here (minimum):
- **Nav** (§7): `SYS.TIME 21:04:18 UTC-4` right of the links; `● LIVE` when the API answered, `○ OFFLINE` when it didn't.
- **Hero**: coordinate rail top-right `X_40.7706 / Y_-73.9886 / NEW YORK, NY`; `VERSION {version}-{sha}` bottom-right; `//SCN_01`.
- **Every card**: `HASH:` or an ID code (`EVT-S25-01`, `APP-EX-0K`, `RES-04-02`, `BRD-F24-01`) in the header rail.
- **Bottom status bar** (new, fixed, 28px, mono micro, the last element on every page, T04): cells split by
  1px lines: `CONNECTION {SECURE|OFFLINE}` · `> ACCESS GRANTED_` (blinking `_`) · `SCN: {n}` (updates with
  the section in view) · `NODE: JJ_CSS_01` · `{sysTime}`. Hidden under 768px.
- **Stat rows**: label above value, unit raised at `.35em`, `▲ +n` delta only where a real prior value exists.
- **Section headers**: `/0N` index + sigil + title + right-aligned `//` code + hairline.

## 5. Component anatomy v2 (rebuild in place; keep run 2's props so pages don't break; then extend)

Global rules: `border-radius: 0` (status chips may use 2px); borders 1px at 14% alpha (dark) / 100%
`#C9D4E0` (paper); cards are tone-on-tone (`+3%` lightness over the band), no shadows except the 1px
accent line that appears on hover; every card has (a) a header rail, (b) an ID or index, (c) one sigil,
(d) one corner treatment from §5a, (e) a hover state that *reveals* something (a hidden readout row, a
meter filling, a bracket closing).

### 5a. Corner treatments (`apps/web/src/components/frame/`)
- `Chamfer` — one 45° cut, 16px (cards) / 24px (panels), bottom-right by default, via `clip-path`;
  optional 2px accent stub bar inside the notch (T05).
- `Brackets` — four 12px L-marks at the corners, 1px, accent; on hover they *close in* by 4px.
- `Registration` — `+` marks at the four corners of a section (paper bands) at 40%.
- `Perforation` — dashed 1px top edge + tick ruler (ticket stubs).
- `Tab` — a 6px-wide side tab (accent) on the left edge with a rotated micro label inside (T11).

### 5b. The card family (replace run 2's implementations; same names, richer anatomy)
- `TicketCard` (events, apps directory) — T11 + T08: header strip navy-900 with `Tab` on the left holding a
  rotated `EVT-S25-01`; title in display 600 uppercase 22px; image inset with `Brackets`; body a two-tier
  key/value rail (`_date`, `_room`, `_status`); footer `Barcode` + `HASH:`; `Chamfer` bottom-right with
  accent stub; hover: brackets close, `> OPEN_TICKET ↗` slides in over the barcode.
- `SpecSheet` (featured app, workshops, resources kits, OS tiles) — T12 + energrid: left column of `_keys`
  (micro, 55%), right column values (body 500 / stat numerals); rows share 1px lines; one `Meter` row
  (segmented) where a % exists; a `Wireframe` sigil in the top-right at 8%; `Registration` at corners on paper.
- `PosterCard` (Cyberhounds competitions, poster tiles) — T09 posters: navy-900 or accent field; one word
  in `--font-wide` at `--type-poster`/3 with `EdgeCrop`; 3-corner label rail (`//CTF_01` top-left, `2026`
  top-right, `PICOCTF · SPRING` bottom-left); halftone mask in one corner; 12px inset hairline frame;
  hover: the word's outline ghost offsets 4px.
- `IndexList` (news, resources, workshops, collaborate lists) — T04 `/03 SELECTED WORK`: rows `/01` ·
  sigil · title (body 500) · dek (label) · `↗`; hairline rows; hover: row background +3%, `↗` → `→ OPEN_`.
- `SlotCard` — dashed 1px frame, `Perforation` top, `[ OPEN ]` bracket CTA, `SLOT_02` label, 40% opacity;
  hover: brackets appear, opacity 100%.
- `StatChip` → rename `Readout` — a HUD box (T06): 1px border, `Brackets`, micro label, value in display,
  optional `Meter`; `backdrop-filter: blur(8px)` on dark only.
- `Meter` — segmented bar: `repeating-linear-gradient(90deg, accent 0 6px, transparent 6px 8px)`, dim
  segments beyond the value at 20%; mono `%` readout right; fills over 0.9s in view.
- `Pullquote` — keep, but the quote glyph becomes `Bracket` sigils at 120px and the text is display 600.
- `PhotoFrame` — `Brackets` + `Registration` + a **tracking box** overlay: one 1px accent rectangle over a
  subject region with a micro tag (`SUBJ_01 · 0.92`) — only on hero/spread photos; caption rail:
  `//IMG_003 · GENERAL MEETING · SPRING`.
- `Button` — two variants only: **Block** (flat accent fill, display 600 uppercase 13px tracking .08em,
  square end-cap 40px holding `↗` in navy-900; hover: end-cap slides out 4px) and **Bracket** (1px outline,
  mono `[ JOIN_THE_SOCIETY ]`; hover: brackets separate by 6px and the fill sweeps in). No pills.
- `Tag` — filled accent rectangle, mono 10px, navy-900 text, zero radius; `Tag variant="hatch"` uses a
  45° hatch fill at 30% with a 1px border (T04 hatch strip).
- `StatusChip` — `● LIVE` / `○ IDLE` / `● ARCHIVED`; dot 6px with a 2px halo; 1px border same color at 40%.

### 5c. Nav v2 (`Nav.tsx`)
Left: `CubeSigil` 20px + `CSS` in `--font-wide` 14px + `//JOHN_JAY` mono 10px at 55%. Center: links in
mono 12px uppercase tracking .12em, separated by `/` glyphs at 30%; active link gets the accent prefix `>`
and the `layoutId` underline. Right: `SYS.TIME 21:04:18 UTC-4` (mono micro, tabular), `● LIVE`/`○ OFFLINE`,
then the **Block** button `JOIN ↗`. Morph behaviour unchanged. Mobile overlay: routes in `--font-display`
`--type-h1` with `Decode` reveal, `/01`…`/08` indices, `CSSKufic` watermark.

### 5d. Footer v2 (`Footer.tsx`)
Keep anatomy. Column heads become `_navigate` `_connect` `_meta` (mono micro); links in body 500;
`CONNECT` rows keep the domain in mono; META adds `BUILD {sha} · {buildTime}`. Brandmark: `COMPUTER
SCIENCE` / `SOCIETY` in **`--font-wide`** (Michroma) — not Chakra — at 6% with `EdgeCrop`; `CSSKufic` at
18vw sits *behind* the stamp lockup at 5%. Tagline rail: `JJ · CSS · DEBUG YOUR MIND, COMMIT TO GROWTH`
in mono tracked caps (rhecwb's `RHEC · LAGCC · …` pattern). Bottom rail adds the §4 status bar cells.

## 6. Texture layer (`apps/web/src/textures/` — CSS/SVG, all ≤ 10% opacity, one per band max two)

- `DotGrid` — `radial-gradient(circle, ink 1px, transparent 1.2px) 0 0 / 24px 24px`; paper bands.
- `HairGrid` — 1px lines every 96px (12-col) + every 24px at half strength; hero + spec sheets.
- `Contour` — SVG topographic lines (generate once with simplex noise → marching squares, 40 lines); About spread, Resources.
- `Halftone` — dot raster 3px pitch masked with `radial-gradient(at 100% 0, #000, transparent 70%)`; poster bands, Cyberhounds hero.
- `Hatch` — `repeating-linear-gradient(-45deg, ink 0 1px, transparent 1px 6px)`; strips under forms, empty meter segments, `Tag variant="hatch"`.
- `Scanlines` — 1px/3px horizontal at 3%; Cyberhounds only.
- `CodeRain` — vertical columns of KB text (`data/kb.json` questions) in mono 10px at 4%, drifting 40s; hero right third, behind the cube.
- `CubeWire` — the cube edge SVG from §2c.5 at 32vw, 6%; Apps band watermark.
- `BinaryRings` — keep; digits in VT323; rotation unchanged.

## 7. Page application — what changes on each page (composition stays; these are the type/card/texture calls)

### 7.1 Home
- Hero: kicker → `//SCN_01 · JOHN_JAY_COLLEGE · CUNY · COMPUTER_SCIENCE_SOCIETY` (mono, `/` separators);
  H1 → three lines in `--font-display` at `--type-hero`: `DEBUG` (`<Stencil bars=[.4,.64]>`) / `YOUR MIND,`
  (`<Outline>`) / `COMMIT TO GROWTH.` with `GROWTH.` as `<SplitFill at=3>` in teal; `<Decode>` on all;
  the coordinate rail top-right; `VERSION` bottom-right; `HairGrid` + `CodeRain` textures; cube frame gets
  `Brackets` that close on hover; `Readout` chips replace `StatChip` (`13+ WORKSHOPS_RUN` → `_workshops 13+`).
- Stat row → four `Readout`s sharing 1px lines, labels *above* values, unit raised.
- Ticker → mono uppercase, `//` separators, `▮` block glyph between items, 32px height.
- About spread → `/01 WHAT_THE_CLUB_IS_ABOUT`; H2 in display 700 uppercase `A SOCIETY FOR` / `PEOPLE WHO BUILD.`
  (second line `<Outline>`); `PhotoFrame` with tracking box; `Registration` at band corners; `Contour` at 5%;
  meta grid → `SpecSheet` rows `_campus / _mode / _discord / _email`.
- Events band → `/02 EVENTS`; H2 display 700 with `<Wireframe>` cube edges drawn through; `TicketCard`s v2;
  watermark → `CubeSigil face="r"` 36vw at 6%.
- Apps spotlight → `/03 APPS · BUILT_AT_JOHN_JAY`; `SpecSheet` v2 with `Meter` (`review 3/3 steps`);
  `CubeWire` watermark; `Tag variant="hatch"` for `EXAMPLE`.
- Resources → `/04 RESOURCES`; `IndexList` v2; `DotGrid`.
- Cyberhounds poster → `CYBER` / `HOUNDS` in `--font-wide` at `--type-poster` with `EdgeCrop right`;
  `HOUNDS` as `<Outline>` in red over a solid ghost; `HoundPixel` 240px; `Halftone` corner; `Scanlines`;
  3-corner rail `//CTF_01` · `2026` · `PICOCTF · NCL · ANGSTROM · SDCTF`; CTA `[ >_WHAT_IS_CTF ]`.
- Collaborate → `/05 COLLABORATE`; watermark → `CSSKufic` at 40vw; column heads → `Tag`s; lists → `IndexList` v2 with `[1]` prefixes.
- Gallery → `/06 ON_CAMPUS`; `PhotoFrame`s with `//IMG_00N` captions.
- Partners → `/07 PROGRAMS_&_PARTNERS`; `SlotCard` v2.
- Fin → `END_OF_TRANSMISSION · 01` in `--font-wide` 12px tracked .3em; binary line in VT323.
- Footer → §5d. Status bar → §4.

### 7.2 About — H1 `WHO` / `WE ARE.` (`<Stencil>` + `<Outline>`); "Let's grow together!" pullquote in
display 700 with `Bracket` sigils; What We Do → `IndexList` with `[1]..[4]`; Discord card → `TicketCard`
v2 with `_server / _channels / _invite`; board grid → each officer a `PhotoFrame` with `BRD-F24-0N` tag and
`_role` rail; term history → `IndexList` rows `/F23-S24` with `Meter` of members; poster band `DEBUG YOUR
MIND.` / `COMMIT TO GROWTH.` in `--font-wide` with `EdgeCrop`.

### 7.3 Events — H1 `EVENTS` in `--font-wide` `--type-poster` with three `CubeSigil`s floating through the
letters (SVG, red face) instead of 3D spots; dossier meta block → `SpecSheet` micro (`_term / _count /
_venue`); Previous events → `IndexList` grouped by `//S25 //F24 …` rails with a date `Tab`; workshops →
`SpecSheet`s with `Meter` (sessions run / planned).

### 7.4 Apps — H1 `APPS` / `BUILT HERE.` (`<SplitFill>` on BUILT); featured `SpecSheet` with `HASH:`,
`_platform / _stack / _author / _for_john_jay`; directory `TicketCard`s with `Tag` filters (hatch when
inactive); submit form → a `SpecSheet` whose inputs are 1px-bottom-border mono fields with `_` prefixes;
`[ >_SUBMIT_APP ]` Bracket CTA; steps `[1] SUBMIT [2] BOARD [3] LIVE` with a `Meter`.

### 7.5 Cyberhounds — hero as Home §7 but full-bleed; `STAY SHARP. CAPTURE THE FLAG. FOLLOW PROTOCOL.`
protocol line (T09) in mono tracked caps under the H1; What is CTF → spread with `Shield` sigil; How It
Works → `[1]..[4]` `IndexList` with `Chevrons`; Competitions → `PosterCard` v2 ×4; Join → `TicketCard` with
`_step_1 / _step_2 / _step_3`; poster band `NO FLAG` / `LEFT BEHIND.` in `--font-wide`.

### 7.6 Resources — H1 `RESOURCES` + `Readout` `24 LINKS`; sticky category rail as vertical `A B C D E F`
letters with a ring on the active (Priva scenario rail); rows `/01`…; link-check status → `StatusChip`;
starter kits → `SpecSheet`s.

### 7.7 News — list `IndexList` with date `Tab`s; article: reading column keeps Space Grotesk 18/1.7,
title display 700, meta rail `_author / _date / _read_time`, `Registration` corners, `Contour` 4%.

### 7.8 Join — H1 `JOIN` with `CSSKufic` 60vw watermark in cube blue at 8%; why-join → three `Tag`s +
copy; lists → `IndexList` `[1]`; form/Discord → `TicketCard`; CTA `[ >_JOIN_THE_SOCIETY ]`.

### 7.9 404 — `404` in Silkscreen at `--type-poster`, `CSSKufic` behind, `ROUTE_NOT_FOUND · 0x194`,
`Brackets` around the whole viewport, `[ ← RETURN_HOME ]`.

### 7.10 Styleguide (`/styleguide`) — rebuild as the **type specimen + component sheet**: every face at
every role, all six headline treatments, the label grammar table, all sigils at 24/48/96px, every card
v2 on dark and paper, every corner treatment, every texture at its opacity, the status bar. This page is
Loop 0's screenshot and is compared against T01–T12 directly.

### 7.11 OS (`/os/*`, ≤ 10 min) — apply `SpecSheet` v2 + `Readout` + `StatusChip` to Today/Queue; table IDs
in the `PL-HV-119` style (`SUB-2026-0N`); nothing else.

## 8. Light ("paper") bands in this register (T04 is the model)

Paper stays `#F5F7FA`/`#E9EFF5`, ink `navy-900`. Add: `Registration` `+` at band corners (40%), `HairGrid`
at 6%, one `Hatch` strip (16px tall) under any form or at the band's bottom edge, section index `/0N` in
the accent, Block CTAs in navy-900 with the accent end-cap, `↗` on every card, mono micro captions. Never
soft shadows, never rounded, never a tint that reads warm (red tint capped at 3%).

## 9. Motion additions (type-specific; everything from run 2 stays)

1. `Decode` on H1s/poster words (§2c.6). 2. `Stencil` bars slide in (§2c.1). 3. `Brackets` close on
hover (4px, 0.2s). 4. `Meter` fills in view (0.9s, ease-out). 5. Status-bar `_` blinks at 1Hz; `SCN:`
value changes with the section in view via the existing IntersectionObserver. 6. Label prefixes type in
(`>` then text, 12ms/char) on section headers. 7. `CodeRain` drifts. 8. Ticker unchanged. 9. `Halftone`
mask breathes ±4% over 8s. 10. Reduced motion: all of the above become instant/static; nothing is lost.
Perf gate unchanged (desktop ≥ 84; do not regress).

## 10. Loop protocol (identical to run 2 §2, with these substitutions)

- **Loop 0 (≤ 35 min):** fonts + tokens + `type.css` + `DESIGN.md` update + the six headline treatments +
  Label + sigils + corner treatments + card v2 + textures + readouts + nav/footer v2 + styleguide. Shoot
  `/styleguide` at 1440 and build `qa/loops/type/compare_0.png`: for each of T01–T12, [ref | the
  styleguide region that answers it | one line saying what matches and what doesn't]. Score §11. Iterate
  ≤ 3 times. Commit `feat(type): loop 0 — type system v2, sigils, card anatomy v2, readouts`.
- **Per page:** plan → apply §7 → shoot (same shots + 6 motion frames) → compare sheet (this time the ref
  crops come from `../jjay_css_refs/type/`, not rhecwb) → score → fix the 3 lowest → ≤ 4 iterations → commit.
  Order: Home, Cyberhounds, Apps, Events, About, Join, Resources, News, 404, OS.
- **Time budget: 150 min.** Checkpoints at 30/60/90/120 in `context/25_RUN3_LOG.md`. No questions.
  Ambiguity → the option closest to the named T-cell; log it.

## 11. Rubric (1–5 per line, ship gate ≥ 4 on all twelve; evidence sentence required)

1. **Letterforms** — display is squared/stencil/extended/pixel (Chakra/Michroma/Silkscreen); zero Archivo/Poppins; body is Space Grotesk; mono everywhere else.
2. **Headline treatments** — ≥ 2 of the six treatments visible per page; H1 uses ≥ 2 at once.
3. **Label grammar** — every label has a prefix glyph from §2d; no em dashes; `/0N` indices; `//` codes.
4. **Readouts** — coordinate rail, SYS.TIME, VERSION/SHA, status bar, ID/HASH on every card — all real.
5. **Card anatomy** — every card has header rail + ID + sigil + corner treatment + a revealing hover; no plain rectangles.
6. **Sigils** — `CubeSigil`, `CSSKufic`, `HoundPixel` + ≥ 6 pictograms in use; watermark is a sigil, not text.
7. **Corners & frames** — chamfers, brackets, registration marks, perforation, tabs present and consistent (1px, square caps).
8. **Meters & chips** — segmented meters and dot-status chips where any state/percentage exists; zero pills.
9. **Textures** — ≥ 2 per page from §6 at ≤ 10%; none competing with type.
10. **Scale contrast** — one ≥ `--type-h1` element and ≥ 6 label-size elements per band; poster words cropped by an edge somewhere on the page.
11. **Paper bands** — §8 applied: registration marks, hair grid, hatch strip, index, notched CTA.
12. **Craft** — tabular numerals, slashed zeros, tracking per role, no orphans, mobile 390 intact, AA contrast on both tones (labels at 55% must still pass on their band — raise to 65% where they don't, log it).

## 12. Don'ts

No Archivo, Poppins, Inter, Orbitron, Audiowide, Zen Dots, Press Start. No neon glow bloom on text, no
gradient text, no glassmorphism panels, no drop shadows, no border-radius > 2px, no pills, no em dashes in
labels, no invented numbers/coordinates/hashes, no lorem, no leetspeak in words, no purple/pink/cyan
outside the JJ palette (teal `#6ED2E6` is the only cool accent), no cream, no rhecwb hex or copy, no
CDN fonts, no MCPs, no API keys, no changes to `api/`, the schema, the cube GLB, the cube keyframes, the
12-movement order, or the footer anatomy. Do not skip the compare sheet. Do not score without reading it.

## 13. End of run

Commit; write `qa/REPORT_RUN3.md` (per page: iteration, 12 scores, compare-sheet paths, motion frames,
Lighthouse), `context/24_TYPE_NOTES.md`, `context/25_RUN3_LOG.md`; update `DESIGN.md` §type and
`context/05_DESIGN_SYSTEM.md` §type to v2. Print the score table, the five things you'd fix next, and
`npm run dev --prefix apps/web` + `.venv/bin/uvicorn api.index:app --port 8000`. Never push.
