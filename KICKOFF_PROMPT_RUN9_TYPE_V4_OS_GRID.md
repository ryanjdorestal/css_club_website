# 37 — RUN 9: TYPOGRAPHY v4 (the S01 face) · FOLDER-TAB CARDS · T03 LOGIN · OS AS THE DASHBOARD (exact) · DEEP-STATE OPS LAYER

Paste everything below the line into Claude Code (**Opus, xhigh**) opened in `~/Desktop/jjay_css`.
Read anything on this Mac; write only inside this folder; never push; never touch rhecwb or its Supabase.

---

## 0. Ryan's brief (verbatim) → the five workstreams

> "Do you have the exact typography of S01? I feel like that upgrades the game/cool vibes amazingly.
> Also shouldn't the login look like T03 (obviously with its own colors) but with the 3D cube logo on the
> left? Also I ain't see the folder style on T11 integrated nowhere — try that, but not on the components
> that already look like tickets, those are already cool. The OS should give gov-ops vibes, but make the
> structure exact like the last screenshot — no BS adaptations. I also attached some sci-fi refs for that
> deep-state vibe."

| # | Workstream | Short name | Time box |
|---|---|---|---|
| A | Identify and adopt the S01 (DEMON) display face + its body mono, site-wide; keep every treatment | **TYPE v4** | 45 min |
| B | The T11 folder-tab card as a new component family, used where tickets are *not* | **FOLDER** | 25 min |
| C | `/os/login` rebuilt to T03's layout with the 3D cube in the left field | **LOGIN** | 25 min |
| D | Every OS page rebuilt on the exact structure of R9_06 (the dashboard screenshot), no adaptations | **OS GRID** | 70 min |
| E | The deep-state ops layer from R9_04/R9_05 on top of D (rail, dossiers, activity traces, tabs+bars) | **OPS** | 35 min |

**Budget 210 min** (+ 10 min report). Checkpoints every 30 min in `docs/archive/context/38_RUN9_LOG.md`.
No questions. Ambiguity → the option closest to the named reference image, measured, not guessed; log it.
Hard rules carry over: Python API in `api/index.py` + `api/_core/`, no keys, no LLMs, Tier 1 always works,
John Jay palette (navy family / teal / `#B3202A` red family / `#40A33F` / `#1E80F0`), no cream, never push.

This is the **model's first run on this repo**. Before anything: read `README.md`, `ARCHITECTURE.md`,
`CONTRIBUTING.md`, `DESIGN.md`, `docs/SKILLS_ADOPTED.md`, `docs/archive/context/22_REF_STUDY.md`
(the vocabulary study), `23_TYPE_REBUILD_PROMPT.md` §2–§5 (the treatments/label grammar you must keep),
`26_RUN4_WEIGHT_PROMPT.md` §2 (why Unbounded), `32_RUN7_OS_PROMPT.md` §3 (the OS modules and their data),
`35_RUN8_PROMPT.md` §2–§3 (login gate, inheritance spine). Then run `make dev` and `make check` once so you
know the baseline is green before you touch it. `make check` must be green at every commit in this run.

## 1. Reference files for this run

New, from Ryan, at **`~/Desktop/jjay_css_refs/run9/`** (outside the repo on purpose; read with the Read tool):

| File | What it is | Used by |
|---|---|---|
| `R9_01_demon_S01_full.png` | The S01 site: the DEMON hero — the display face, the OCR-style body mono, `SEC-01…04` tags, red outline paths, halftone image blocks, hairline grid, `SCROLL TO REVEAL` bracket button | A, and the "dossier hero" variant in §3.6 |
| `R9_01a_demon_wordmark_crop.png` | Just the word DEMON, for the overlay match | A |
| `R9_01b_demon_body_mono_crop.png` | Just the body paragraph, for the mono overlay match | A |
| `R9_02_permitify_T03_login_layout.png` | T03: the login layout to copy — nav bar; left red field with `+` corner marks, a `FEATURES` micro-label, the pixel sigil centered, a pager row; right black panel with pixel headline, dek, `[1][2][3]` list, `1  /5` giant pagination, chamfered bottom-right | C |
| `R9_03_phone_folder_tabs_T11.png` | T11: the **folder-tab** card — a label tab protruding from the card's top-left (and a mirrored one bottom-right), one 45° cut corner, two-tone body, mono model labels, rotated edge text, barcode | B |
| `R9_04_scifi_eeg_monitor_ops.png` | Ops monitor: left vertical icon rail (8 icons in square cells), main field of green multichannel traces with channel labels, right column of stacked info panels (subject sheet, session panel, radial control), bottom summary box + a 5-cell segmented tab strip with the active cell red + two bar meters | E |
| `R9_05_scifi_cyberpunk_dossier_hud.png` | Dossier HUD: subject cards (portrait tile + key/value sheet in caps micro-labels), bracket-cornered panels, scanline grid background, stacked/overlapping ID cards with photo + name + code, a radial dial, a bar-histogram strip, `SYS VER 55.001.1014` readout | E |
| `R9_06_OS_DASHBOARD_STRUCTURE_EXACT.png` | **The OS structure. Exact.** Measured in §6.1 | D |

Existing (repo or `~/Desktop/jjay_css_refs/`): `type/T01…T12`, `type/S01…` (S01 = the DEMON site's other
page — same face), `rhecwb/home_1440.png`, `jj_inspo/*`.

## 2. WORKSTREAM A — TYPE v4: the S01 face

### 2.1 What the S01 display face is (measure it, don't eyeball it)

Read `R9_01a_demon_wordmark_crop.png` at full size. The letterforms: **extended** (cap width ≈ 1.15–1.25×
cap height), **uniform stroke** (monoline-ish, ~14 % of cap height), **outer corners rounded** with a
radius ≈ 22–28 % of stroke width, **inner counters squared** (the D and O counters are rounded-rect, not
circular), **single-storey**, the **M**'s inner V drops to ~85 % of cap height, the **N** has one true
diagonal, the **E**'s arms are equal length, no serifs, no stencil cuts, cap-only in use. Tracking in the
hero is ≈ +2 % of cap height (near-touching). Weight reads as a heavy 700–800.

**I (Cowork) cannot confirm the exact commercial typeface from a screenshot, and neither can you — so
identify it empirically.** Write `scripts/type_match.mjs`:

1. Render the word `DEMON` in each candidate face at the crop's cap height, white on `#0E1116`, tracking
   +2 %, using Playwright (self-hosted `@fontsource/*` packages or the free files listed).
2. Overlay-compare against `R9_01a` (binarize both, align by bounding box, compute IoU per glyph and
   overall; also compare stroke-width ratio and corner-radius ratio measured by morphological opening).
3. Print a ranked table; save the side-by-side sheet to `qa/loops/run9/type_match_display.png`.

Candidates (all self-hostable, no keys; install via `@fontsource/<name>` where it exists, otherwise the
free OFL file from the foundry's GitHub, saved under `apps/web/src/fonts/` with the license file):
`Michroma`, `Bruno Ace`, `Audiowide`, `Orbitron` (700/900), `Zen Dots`, `Krona One`, `Nasalization`
(Typodermic — check the license permits web embedding for a non-commercial club site; if not, drop it),
`Unbounded` (900, the current face — the baseline to beat), `Chakra Petch` 700, `Syncopate` 700,
`Exo 2` 800 (with `font-stretch` expanded if available), `Saira Extra Condensed`? no — **skip anything
condensed**; `Big Shoulders Display`? no — not rounded. Add any face you find on this Mac under
`~/Library/Fonts` / `/Library/Fonts` that is wide-rounded-geometric (list what you tried).

**Decision rule:** adopt the top-ranked face as `--font-display` if its overall IoU ≥ 0.82 **and** it beats
Unbounded by ≥ 0.06. If two are within 0.02, prefer the one with real 700+ weight (no faux-bold). If nothing
clears 0.82, keep Unbounded and instead **build the display alphabet as SVG** (`apps/web/src/type/glyphs/`,
26 caps + digits + `.,:/-_` — extended rounded-square monoline on a 24-unit grid, the way `CSSKufic` was
drawn) and use it for **hero and poster words only** (≤ 12 distinct words on the site — enumerate them),
keeping Unbounded for H1/H2. Log which path you took and the numbers. Do not spend more than 25 minutes on
identification; the match sheet is the evidence Ryan asked for ("the exact typography").

### 2.2 The S01 body mono

Read `R9_01b`. It's an **OCR-B-style rounded monospace in caps**: slab-ish terminals, round bowls, wide
set, ~0.6 em advance, cap height ≈ 0.72 em, used at ~26 px with +4 % tracking, in an off-white
(`#E8E4D8`-ish on the ref — ours will be `--color-ink`). Run the same overlay test with candidates:
`Kode Mono`, `Share Tech Mono`, `Martian Mono`, `Space Mono`, `Sometype Mono`, `Chivo Mono`,
`Azeret Mono`, `JetBrains Mono` (current, baseline), `IBM Plex Mono`, `Major Mono Display` (caps only —
display use). Decision: the winner becomes `--font-mono-display` (used for deks, protocol lines, ticker,
fin lines, label grammar ≥ 12 px, OS readouts); **JetBrains Mono stays for code/tables/labels < 12 px**
(legibility). If the winner is JetBrains itself, fine — say so.

### 2.3 The OS realm faces (see §5–§6; decided here so tokens are set once)

The OS is a different register (gov-ops) and gets its own display: a **pixel/bitmap caps** face for OS
page titles and the login headline (T03's `AI-POWERED PLAN REVIEW`): candidates `Silkscreen` 700,
`Pixelify Sans` 700, `Departure Mono` (OFL), `VT323` (already in), `Press Start 2P` (too loud — exclude
unless nothing else), `DotGothic16`. Overlay-match against the T03 crop the same way; winner →
`--font-os-display`. Numerals on OS tiles (R9_06's `1.8`, `24`, `1.592`) are a **rounded mono at 64–96 px**
— use `--font-mono-display` from 2.2 at weight 500–600 with `tabular-nums slashed-zero`.

### 2.4 Tokens v4 (`tokens.css`, `type.css`) — two realms, one audit

```
/* public realm */
--font-display:       "<S01 winner>", "Unbounded", sans-serif;   /* hero, H1, H2, poster, PosterCard, buttons */
--font-mono-display:  "<mono winner>", "JetBrains Mono", monospace; /* deks, ticker, protocol, fin, labels ≥12px, readouts */
--font-mono:          "JetBrains Mono", monospace;               /* code, tables, labels <12px, forms */
--font-body:          "Space Grotesk", sans-serif;               /* long paragraphs only (news articles, about copy) */
--font-legacy:        "VT323", monospace;                        /* binary rings + ticker digits only */
/* os realm (applied under [data-realm="os"]) */
--font-os-display:    "<pixel winner>", "VT323", monospace;      /* OS page titles, login headline, empty-state words */
```
Everything else (the treatments `Stencil / Outline / SplitFill / EdgeCrop / Wireframe / Decode`, the label
grammar prefixes, the scale tokens, tabular/slashed-zero, tracking rules) **stays exactly as run 3–4
defined them** — swap the faces underneath, re-tune only what a wider face forces:
- `--type-hero` → `clamp(56px, 9.5vw, 160px)` (the S01 face is ~15 % wider than Unbounded; the hero must
  still fit 3 lines at 1440 without a horizontal scroll — measure).
- `--type-poster` → `clamp(80px, 15vw, 260px)` with `EdgeCrop` always.
- Stencil bars: 4 % of cap height (rounded corners make bars read heavier).
- Outline stroke: 2 px dark / 2.5 px paper, unchanged.
- Decks/protocol lines in `--font-mono-display` uppercase at 15–18 px, tracking +.04em, max 64ch —
  this is the S01 body look ("BRUTAL AND RELENTLESS…"); body paragraphs > 3 lines stay Space Grotesk
  sentence-case (a whole About page in OCR caps is unreadable — that's the line).

`scripts/font_audit.mjs` gets per-realm allowed sets:
public ≥ 28 px → `{display}`; 12–27 px → `{mono-display, body, mono}`; < 12 px → `{mono}`;
OS ≥ 28 px → `{os-display, mono-display}`; 12–27 px → `{mono-display, mono, body}`; < 12 px → `{mono}`.
Any other family anywhere fails the loop. Retire Unbounded only if the winner replaced it everywhere
(grep → 0), else it stays as the H1/H2 face and the audit allows it in the public ≥ 28 px set.

### 2.5 Apply across the public site (composition unchanged — this is a re-set, not a re-layout)
Home, Cyberhounds, Projects, Events, About, Resources, News, Join, 404, styleguide: swap faces via tokens,
re-tune sizes/tracking per 2.4, re-shoot every page at 1440/390, diff against run 8's shots — the only
differences allowed are glyph shapes, line breaks forced by width, and the 3.6 dossier-hero additions.
Fix orphans and any headline that now wraps to a third line. `/styleguide` gets a **TYPE v4 specimen**
section: the match sheets, the winners at every role, before/after of the hero.

### 2.6 The "dossier hero" variant (from R9_01 — apply to Home and Cyberhounds heroes only)
S01's hero is not just a face; it's a composition. Add, behind/around the existing hero content, without
moving the cube or the H1:
- a **hairline grid** at 48 px pitch, 6 % (`HairGrid` exists; retune pitch),
- **two halftone image blocks** (`Halftone` texture over club photos, red-tinted for Cyberhounds /
  teal-tinted for Home, 1-bit threshold look) anchored top-left and right-middle, each with a
  `SEC-0N` tag in a tiny filled label (mono 10 px, ink-on-paper chip, bottom-right of the block),
- **one red/teal outline path** (SVG, 1 px, page accent) that wanders across the hero like S01's —
  a 6–8 point polyline that crosses the H1 once and ends in a small hollow-circle registration mark,
  drawn in on reveal (`stroke-dasharray`),
- a `[ ↓ SCROLL_TO_REVEAL ]` bracket button centered at the hero's bottom (mono-display, 14 px), which
  scrolls to the first band via Lenis; hides after the first scroll.
Cyberhounds' hero keeps the pitbull bust + pixel hound; the halftone blocks use the old-site cybersecurity
photo and the hound logo. Gate: the H1 remains the loudest element; nothing overlaps the cube's mesh.

## 3. WORKSTREAM B — the T11 folder-tab card family

Read `R9_03` at full size. The card anatomy (measure): a rounded-rect body (radius ≈ 3 % of width — the one
place a small radius is allowed; ours: 4 px), a **tab** protruding from the top-left corner (≈ 34 % of the
card width, ≈ 9 % of card height tall, same fill as the body, its outer top corners rounded, its inner
edge a 45° cut into the body), a **second tab mirrored at the bottom-right** on some cards, **one 45°
chamfer** on the corner opposite the tab, two-tone bodies (navy/paper or red/paper split at ~55 %), mono
labels in the tab (`CMD™`, `Model S21Y4`), a rotated micro label on the right edge, a barcode strip on some.

Build `apps/web/src/components/cards/FolderCard.tsx` (+ story on `/styleguide`):
```
<FolderCard
  tab="INH · F26"            // mono 11px in the tab, uppercase, tracking .12em
  tone="navy|paper|red|teal" // body fill + auto ink
  split={0.55}               // optional two-tone split fraction (0 = none)
  chamfer="br|tr|bl"         // one cut corner, opposite the tab by default
  mirrorTab={false}          // bottom-right tab
  edgeLabel="//ROSTER_001"   // rotated 90° on the right edge, micro
  barcode={id}               // optional Barcode sigil in the footer
>{children}</FolderCard>
```
Implementation: the silhouette is a single `clip-path: path()` (tab + body + chamfer) so the fill is one
shape; the inner edge of the tab meets the body with the 45° cut; hairline border via a second layer
(`::before` with the same path, inset 1 px). Hover: the tab lifts 2 px and the edge label brightens.
Keyboard focus ring follows the path (outline-offset on the same clip). Reduced motion: none.

Where it is used (**never** on `TicketCard`/`PosterCard` — "those are already cool"):
1. **Inheritance records** (`/os/inheritance` list + record view) — the file metaphor is literal here: tab
   = `<TYPE> · <TERM>`, edge label = the slug, body = title/owners/date/summary, chamfer BR; the record
   view is one large FolderCard with the markdown inside.
2. **Resources categories** (public `/resources` + `/os/resources`): each category is a FolderCard with
   the tab = category name and the `IndexList` of links inside.
3. **Projects directory** (public `/projects` "Projects" subsection — the *non-app* kinds; Apps keep
   TicketCards): tab = `kind · term`, two-tone split with the screenshot in the upper tone.
4. **Board members** (public About §5 + `/os/board`): tab = role, body = photo + name + term, edge
   label = `BRD-F26-0N`.
5. **OS panels** in §6 where R9_06 shows a tile with a header + a menu glyph (`⋮`): those tiles are
   FolderCards with the tab as the tile title — *only* where R9_06 has a titled tile; the numeric KPI
   tiles stay plain (see §6.1).
6. **The Join page's Discord/Form card** and the **Events "Upcoming" empty slot** — FolderCard `tone=paper`
   with `mirrorTab`.
Gate: FolderCard appears on ≥ 5 surfaces; no ticket/poster component changed; the silhouette matches R9_03
in a side-by-side on the styleguide.

## 4. WORKSTREAM C — `/os/login` as T03, exactly, with the cube

Read `R9_02`. Reproduce the layout **1:1 in proportion** (measure the ref: nav bar ≈ 6 % height; below it
a full-bleed field split ≈ 48 / 52; left panel is the accent field with `+` marks 24 px from each corner
and a centered micro-label at the top (`FEATURES` → ours `//CSS_OS · BOARD_ACCESS`); right panel is a
black card inset 0 from the top/right/bottom with a chamfered **bottom-right** corner ≈ 7 % of its width;
inside: headline in the pixel face at ≈ 12 % of panel height per line (two lines), a dek in body 15 px,
a hairline, a `[1] [2] [3]` list in mono caps 11 px with hairlines between, and the giant `1` bottom-left /
`/5` bottom-right in the pixel face at ≈ 20 % of panel height; a pager row of 5 dots bottom-center of the
**left** panel).

Ours, with our colors and content:
- **Nav bar:** the public nav in its compact (scrolled) state, `[ CSS_OS · BOARD ]` active.
- **Left field:** `--color-navy-700` (not red — Ryan: "with its own colors"; red is Cyberhounds'), `+`
  registration marks, top micro-label `//CSS_OS · BOARD_ACCESS`, and **the 3D cube** (`CubeSpot`, scale
  0.9 ≈ 380 px, three-quarter, teal rim, idle spin, drag) centered where T03 has the pixel eye; behind it
  `DotGrid` 6 %. Bottom-center: the 5-dot pager becomes a **5-step readout** `● LOGIN ○ ROSTER ○ SESSION
  ○ OS ○ AUDIT` (the dots fill as the login progresses — link sent → link opened → session → OS loaded).
- **Right panel:** `#0A0A0C` field, chamfer BR, headline `BOARD` / `ACCESS` in `--font-os-display`,
  dek (the roster explanation from run 8, 2 lines), hairline, the list → `[1] ENTER_YOUR_SCHOOL_EMAIL`
  `[2] OPEN_THE_LINK_WE_SEND` `[3] YOU'RE_IN_IF_YOU'RE_ON_THE_ROSTER`; **the form sits between the list
  and the pagination**: `_school_email` field (1 px bottom border, mono), `[ >_SEND_LOGIN_LINK ]` Bracket
  button; states from run 8 (`LINK_SENT`, cooldown, `NOT_ON_ROSTER` reason chips) unchanged. Bottom:
  giant `1` / `/5` → ours is `01` / `/05` meaning step 1 of 5 (ties to the pager) — pixel face.
- **LOCAL_DEV panel** (dev builds only): a thin strip *under* the right panel, not inside it, mono 11 px,
  `LOCAL_DEV · pick a role → OFFICER · ADMIN`; hidden in PROD as before.
- Mobile (< 900 px): the two panels stack (field with cube at 42 vh on top; black panel below).
- Motion: cube idle; on submit the pager's second dot pulses; the chamfer corner draws in on load.
Gate: overlay the ref and the shot at the same aspect — panel split, chamfer, headline block, list block,
pagination positions within ±3 % of the ref's proportions; `make smoke` OS gate 12/12 still green.

## 5. WORKSTREAM D — the OS on the R9_06 structure, exact

### 5.1 Measure R9_06 (do this first; write the numbers into `docs/archive/context/39_OS_GRID.md`)
The screenshot is 1120×788. Its structure:
- **Top strip** (full width, ≈ 7 % height): left a 3×3 dot **app-grid glyph**; then a **stat ticker** of 7
  cells, each `LABEL` (micro caps, dim) over `value` (mono, bright), evenly spaced, with the 4th/5th
  separated by a hairline gap; right: **user chip** (avatar circle + `NAME` + `#ID`).
- Below it a **12-column bento grid** with ~16 px gutters, three rows:
  - **Row 1** (≈ 33 % height): tile A (cols 1–3, **accent-filled**: `TODAY'S FOCUS` + `1.8` + `/ 6H`, a
    `⋮` top-right) stacked over tile B (cols 1–3: `COMPLETED TASKS` `2` `/ 5`) — i.e. col 1–3 holds two
    half-height tiles; tile C (cols 4–6, full row height: `PAID INVOICES` `24` `/ 32`, hairline, `TOTAL
    $6,000 / 12,000`); tile D (cols 7–12: `TOTAL BALANCE (BTC)` with a **range selector** `7D 30D 3M 12M`
    top-right, big `1.592` left, a **5-bar histogram** right with one bar accent-colored and a value
    callout above it).
  - **Row 2** (≈ 50 % height): tile E (cols 1–3: `MJ FAST HOURS` with a circle `↗` button top-right, big
    `6.9` `/ 15H`, then a hairline + `LATEST WORKS` label + a **2×3 thumbnail grid**); tile F (cols 4–6,
    **accent-filled, editorial**: a large geometric line-art (quarter circle + diagonals) top, then
    `AESTHETIC-USABILITY EFFECT` in display caps, a 3-line dek, and a 5-dot pager bottom); tile G
    (cols 7–9: `CHATGPT API USAGE` big `5.01` `/ $18.00` + a thin progress bar); tile H (cols 10–12: a
    **ring gauge** with `7.89` + `WORK-LIFE BALANCE` centered).
  - **Row 3** (≈ 17 % height, cols 7–12 only): tile I (**paper-filled**: `CUSTOM DASHBOARD` in display
    caps left, `10/ 20 TEMPLATES` mono right, a circle `↗` button top-right).
- Tile anatomy: 0 radius (looks ~2 px), no border, fill = 1 step above the page (`#1A1D22` on `#0F1115`),
  padding ≈ 20 px, title micro caps top-left, `⋮` or `↗` top-right, **big numeral bottom-left** with the
  `/ denominator` small to its right and baseline-aligned.
- Palette in the ref: near-black page, charcoal tiles, one slate-blue accent, one bone-paper accent,
  off-white ink. **Ours:** page `navy-900`, tiles `navy-800`, accent tiles `navy-500`→ use **teal at 18 %
  over navy-700** for the "slate" accent tiles and **paper `#F5F7FA`** for the paper tile; ink as tokens.
  Nothing else changes — same grid, same tile count, same tile roles, same positions.

Build `apps/web/src/os/ui/Bento.tsx` (the 12-col grid with named areas A–I matching the above) and
`Tile.tsx` (`title`, `menu|arrow`, `tone: base|accent|paper`, `children`), `Kpi.tsx` (big numeral +
`/ denom` + optional `Meter`/`Histogram`/`Ring`), `TopStrip.tsx` (app glyph + 7-cell ticker + user chip).
The OS rail from run 7 (left `/01 TODAY …`) **becomes the app-grid glyph's popover** (click the 3×3 glyph
→ the module list drops down as a 3×4 grid of FolderCard-less square cells, mono labels, like a launcher)
— the ref has no left rail, so ours doesn't either. Keyboard: `⌘K`/`Ctrl K` opens the same launcher.

### 5.2 Map every module onto the grid (same A–I slots; content differs; **no slot is removed, moved or
resized**; if a module has nothing for a slot, the slot holds a labeled empty state in the same tile)

**Top strip (every page):** ticker cells = `TERM F26` · `OFFICERS 6` · `PENDING 3` · `POSTS 12` ·
`PROJECTS 4` · `DB TIER1|LIVE` · `SYS.TIME hh:mm:ss`; user chip = initials circle + `NAME` + `#ADMIN`.

| Slot | Today | Projects | Posts | Events | Resources | Members | Board | Site | Inheritance | System | Audit |
|---|---|---|---|---|---|---|---|---|---|---|---|
| A (accent) | NEEDS ATTENTION `3` `/ open` | SUBMITTED `2` `/ queue` | DRAFTS `1` `/ 12` | UPCOMING `0` `/ term` | DEAD LINKS `0` `/ 86` | INTERESTED `14` `/ new` | OFFICERS `6` `/ seats 8` | FLAGS ON `3` `/ 5` | HANDOFFS `0` `/ 6` | INCIDENTS `0` `/ open` | TODAY `27` `/ writes` |
| B | HANDOFFS FILED `0` `/ 6` | PUBLISHED `4` `/ all` | PUBLISHED `11` `/ 12` | THIS TERM `3` `/ logged` | CATEGORIES `6` `/ 24 links` | ACTIVE `31` `/ members` | TERMS `10` `/ on file` | BANNER `OFF` | RECORDS `2` `/ F26` | UPTIME `100%` `/ 30d` | REPLAY `0` `/ inbox` |
| C | THIS TERM sheet (term, ends, next event, last post) + hairline + `INBOX 0 unsynced` | REVIEW SLA `2d` `/ avg` + hairline + `FEATURED 1` | REVIEW `0` `/ waiting` + `LAST PUBLISHED date` | FLYERS `2` `/ 3` + `NEXT date` | CHECK AGE `3d` + `LAST RUN date` | BY STATUS meters ×5 | ROLLOVER `S27` + `READY ○` | TICKER ITEMS `4` | TYPES `8` + `LAST RECORD date` | DB `TIER1` + `SNAPSHOT never` | BY TABLE meters |
| D (wide + histogram + range) | ACTIVITY: writes per day, 5-bar histogram, range `7D 30D 3M 12M`, big total | SUBMISSIONS per month | POSTS per month | EVENTS per term (5 bars = 5 terms) | LINK CHECKS per week (dead count) | JOINS per month | OFFICERS per term (5 terms) | SETTINGS CHANGES per week | RECORDS per term | HEALTH CHECKS per day (fails) | WRITES per day |
| E (big + thumbnails) | LAST POST `6.9`→ `DAYS AGO` `/ 14 max` + LATEST WORKS = last 6 posts' covers | FEATURED `1` `/ 3` + last 6 project screenshots | COVERS: last 6 | FLYERS: last 6 | — big `24` `/ links` + 6 category tiles | RECENT: last 6 avatars/initials | CURRENT BOARD: 6 photos | PAGES: 6 setting groups as tiles | LATEST 6 records (FolderCard minis) | CHECKS: 6 status tiles | LATEST 6 records' diffs |
| F (accent editorial + pager) | the "what is not here" text becomes this tile: display caps title `WHAT THIS IS` + 3-line dek + pager cycling 5 principles | `HOW REVIEW WORKS` `[1][2][3]` | `WRITING RULES` | `EVENT CHECKLIST` | `LINK POLICY` | `WHO COUNTS AS A MEMBER` | `TERM ROLLOVER` (the wizard's entry) | `WHAT SITE CONTROLS` | `WHY INHERITANCE` (the continuity blurb) + `HOW_TO_WRITE_ONE ↗` | `RUNBOOK` (5 pages paged) | `WHAT GETS AUDITED` |
| G (big + progress) | SNAPSHOT AGE `∞` `/ 24h` bar | REVIEW PROGRESS `2` `/ 5 steps` | DRAFT AGE `3` `/ 14 d` | FLYER COVERAGE `66%` | CHECK COVERAGE `100%` | IMPORT LAST `0` `/ rows` | ROSTER COMPLETE `75%` | FLAGS `3` `/ 5` | HANDOFF PROGRESS `0` `/ 6` | KEEPALIVE `3` `/ 3 d` | REPLAY PROGRESS |
| H (ring) | PLATFORM `100` `/ health` | APPROVAL RATE ring | PUBLISH RATE ring | ATTENDANCE (if logged) ring | ALIVE `100%` ring | RETENTION ring | SEATS FILLED ring | COMPLETENESS ring | SPINE COMPLETE ring | UPTIME ring | SYNC ring |
| I (paper, bottom-right) | `OPEN QUEUE` `3/ 3 pending ↗` | `NEW PROJECT` `↗` | `NEW POST` `↗` | `NEW EVENT` `↗` | `CHECK ALL LINKS` `↗` | `IMPORT CSV` `↗` | `ADD OFFICER` `↗` | `EDIT SETTINGS` `↗` | `NEW RECORD` `↗` | `RUN CHECKS` `↗` | `EXPORT LOG` `↗` |

**Where do the actual tables/editors live?** Under the grid. Every module page = the exact R9_06 grid
(its "dashboard face") **then** a hairline and the module's working surface (the run-7 tables, editors,
queues, forms — unchanged in function, restyled to §6's ops layer). The grid is the top of every page;
the work is below the fold. That is the "no BS adaptations" reading: the structure is the screenshot's;
the content is ours. Numbers are real (data/DB); if a metric has no data yet the tile shows `—` `/ n`
with a micro `no data yet` line, never a fake.

Gate for D: a side-by-side of R9_06 and `/os` at 1120×788 with the grid lines overlaid — every tile's
bounding box within ±2 % of the ref; same tile count (9) and roles; the ticker has 7 cells; the user chip
is where the ref's is. Repeat the overlay for two more modules.

## 6. WORKSTREAM E — the deep-state ops layer (R9_04 + R9_05) on top of D

This is the *vibe* on the *structure*. Everything here is additive and must not move a tile.

1. **Realm shell:** `[data-realm="os"]` sets: page `navy-900`, a **scanline** texture at 3 % (R9_05's
   background), a **hairline grid** at 32 px pitch at 4 %, the pixel display face, and a **corner
   readout** bottom-right `SYS VER {version}.{sha7}` (R9_05's `SYS VER 55.001.1014`) in mono micro.
   The public status bar remains the last element.
2. **Left icon rail (R9_04):** a 56 px rail of square cells with 1 px dividers, 8 sigils (the module
   set: Projects/Posts/Events/Resources/Members/Board/Inheritance/System) + Today at the top and Audit
   at the bottom; active cell has a red left edge (R9_04's active tab is red); tooltips in mono. It sits
   *left of* the bento grid (the grid keeps its proportions inside the remaining width; the ref's grid was
   measured at full width — scale it, don't reflow it). The 3×3 launcher glyph from §5.1 stays in the top
   strip and opens the same list.
3. **Dossier cards (R9_05)** — `DossierCard`: a portrait tile (photo or initials on `DotGrid`) left, a
   key/value sheet right in micro caps labels (`NAME / ROLE / TERM / EMAIL / STATUS / ID`), bracket corners,
   a 1 px accent frame, a `SUBJECT 0N` tag top-left, an ID code bottom-right. Used for: **Members** rows
   (expandable), **Board** officers (in `/os/board` and the public About §5 — on the public side keep the
   FolderCard from §3 as the outer shape and the dossier layout inside), the **Audit** "who" column on
   hover. Stacked/overlapping variant (`DossierStack`) for the Members "recent" tile E.
4. **Activity traces (R9_04's EEG field):** `TraceStrip` — a canvas drawing N horizontal channels of a
   thin line (1 px, teal on dark) whose amplitude comes from **real** per-day counts (writes, logins, link
   checks, posts) — one channel per table/module, labels on the left in mono micro (`PRJ-01`, `PST-02`…),
   scrolling slowly left; on Audit it is the hero of the working surface (full width, 8 channels); on Today
   it lives *inside* tile D as the histogram's background at 30 % (the histogram stays on top). No fake
   noise — flat channels are flat.
5. **Segmented tab strip + bar meters (R9_04 bottom):** the module working surfaces' filter tabs (`ALL /
   DRAFT / REVIEW / PUBLISHED / ARCHIVED`) become the 5-cell strip with 1 px dividers, active cell filled
   red (`--color-red`) with ink text, others outline; beside it two `Meter` bars (e.g. `PUBLISHED 11/12`,
   `THIS TERM 3/5`).
6. **Subject sheet (R9_04 right column):** `/os/system` and `/os/audit` right-hand panels: stacked
   panels with a header row (`title` + `REFRESH` `CHANGE_STATUS` Bracket buttons), a key/value sheet, a
   radial dial (`Ring`) for one metric, a small waveform.
7. **Radial dial (R9_04 bottom-right):** `Ring` gets a `segments` mode (8 segments with sigils, one
   active) used on `/os/system` for the 8 health checks — click a segment → that check's runbook page.
8. **Motion (ops):** scanlines static; traces drift at 8 px/s; the active red cell pulses 1 Hz; ring
   gauges fill on load; dossier cards slide in from the right 12 px; launcher opens 120 ms. Reduced motion:
   static. No cube in the OS (login only).
9. **Voice:** OS copy is terse system voice — `NEEDS_ATTENTION · 3`, `NO_DATA_YET`, `RUN_CHECKS`,
   `HANDOFF_NOT_FILED` — labels in the run-3 grammar; body sentences only in tile F.
10. **Accessibility holds:** every rail cell has an accessible name; the trace canvas has `aria-hidden` and
    a text summary; contrast ≥ AA on tiles (`make a11y` stays 0/0).

## 7. Loop protocol

Order: **A** (type v4 — Loop 0: identification + tokens + audit + styleguide; Loop 1: all public pages;
Loop 2: dossier heroes) → **B** (FolderCard + the 6 surfaces) → **C** (login) → **D** (Bento shell +
Today first, then all 10 modules) → **E** (ops layer, Today/Members/Board/Audit/System first, then the
rest). Each loop: plan line → build → shoot (1440 + 390; OS also at 1120×788 for the overlay) → compare
sheet against the named ref (overlay where the ref is a layout: T03, R9_06) → score → fix 3 lowest →
≤ 3 iterations → `make check` green → commit (`feat(type): v4 …`, `feat(ui): folder cards`, `feat(os):
login T03`, `feat(os): bento grid`, `feat(os): ops layer`). Public visual diff after A must show only
glyph/line-break changes and the §2.6 additions (`ui-preservation`).

## 8. Rubric (1–5, gate ≥ 4)

1. **Face match** — the display winner's IoU ≥ 0.82 on the match sheet (or the SVG alphabet path logged); the mono winner chosen by the same test; `font_audit` green per realm.
2. **Type applied** — every public page re-set; no third line on H1s; treatments intact; specimen on `/styleguide`.
3. **Dossier heroes** — Home + Cyberhounds carry grid, halftone blocks with `SEC-0N` tags, the outline path, the scroll bracket; H1 still dominant.
4. **FolderCard** — silhouette matches R9_03; used on ≥ 5 surfaces; tickets/posters untouched.
5. **Login** — overlay within ±3 % of T03; cube on the left; states intact; smoke 12/12.
6. **Bento exact** — overlay within ±2 % of R9_06 on `/os` + 2 modules; 9 tiles, 7-cell ticker, user chip; all numbers real or `—`.
7. **Ops layer** — rail, dossiers, traces from real counts, red segmented tabs, ring segments, SYS VER; nothing moved a tile.
8. **Nothing regressed** — `make check`, `make a11y` 0/0, `make smoke` 9/9 + 12/12, parity, Lighthouse desktop ≥ 85, tracked repo ≤ 15 MB.

## 9. Don'ts

No commercial font files without a license that permits web embedding (log the license per face). No
faux-bold. No condensed faces. No cube in the OS except the login. No third display face in the public
realm. No fake metrics, no random waveforms. No moving/removing/merging R9_06 tiles. No radius > 4 px
(FolderCard only). No keys, no LLMs, no pushes, no rhecwb writes, no questions.

## 10. End of run

Commit per workstream; `qa/REPORT_RUN9.md` (match sheets with numbers and the chosen faces + licenses,
T03/R9_06 overlays, FolderCard sheet, before/after hero, a11y/lighthouse/smoke numbers);
`docs/archive/context/38_RUN9_LOG.md`; update `DESIGN.md` (type v4, FolderCard, the OS realm), `docs/
HANDOFF.md` (the new OS layout in two paragraphs), `README.md` map. Print: the two font winners with their
scores, the gate table, and `make dev`.
