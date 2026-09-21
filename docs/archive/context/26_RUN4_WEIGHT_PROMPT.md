# 26 — RUN 4: WEIGHT · CONSISTENCY · CUBE EVERYWHERE · FOOTER — continuous loop, no questions

Paste everything below the line into Claude Code (Fable, xhigh) in `~/Desktop/jjay_css`. Full read access to
this Mac is granted for reference (see §1). Write only inside this folder. Never push.

---

## 0. Ryan's review of run 3 (verbatim, then the diagnosis)

"getting much better but stuff still is off — some of the typography isn't consistent and it feels not heavy
as well, not just not sharp … didn't you say the 3D cube would be in the hero banner? … why is the footer
logo given a circular edge, along with the John Jay logo? they should just be the normal cube and the John
Jay logo … the text at the bottom looks like a bullshit template, thin, doesn't feel heavy or premium like
rhecwb … replace the cascading fade text with a cascade-fade glaze of the Bloodhound logo … CYBER HOUNDS
typography needs to be tweaked … need the 3D cube throughout."

Confirm each of these in the current build before editing (`qa/loops/*/vp-0.png`, `home/full-1440.png`):

1. **Three display faces are fighting.** Chakra Petch (hero/H2), Michroma (posters/brandmark/nav logotype),
   Silkscreen (counters/404), plus Space Grotesk body — four voices. Michroma ships only at weight 400, so
   every poster word (`CYBER HOUNDS`, `DEBUG YOUR MIND.`, `COMPUTER SCIENCE / SOCIETY`) is *light*. The refs
   (`../jjay_css_refs/type/T02` LAST SURVIVOR, rhecwb's brandmark which is Space Grotesk **700**) are heavy.
   Outline treatments on a light face read as wire, not as type.
2. **The 3D cube is still an icon.** Hero cube ≈ 140 px inside a 560 px frame; other pages have no cube in
   the hero at all (Cyberhounds has a 60 px pixel hound where a cube should be); the footer shows a 2D cube
   inside a circle.
3. **The footer lockup is a circular stamp** (`StampLockup.tsx` — ring + text on arcs) with the John Jay
   shield also cropped to a circle. Ryan wants the plain cube and the plain John Jay logo.
4. **The footer brandmark is a thin wordmark** in Michroma 400 at 6 % — reads as a template. Ryan wants the
   giant faded element to be the **Bloodhound**, rendered as a cascading fade "glaze", not the club name.
5. **Run-3 follow-up never landed:** `truncate` on IndexList titles ("Presi…", "Treas…"), Decode caught
   mid-scramble in screenshots, red-tinted paper reads pink, paper labels below AA.

Everything else from runs 2–3 (composition, movements, label grammar, sigils, readouts, status bar, motion,
cube rail keyframes, parity) is kept.

## 1. Reference access — full reign on this Mac (read-only outside this folder)

- `~/Desktop/LAGCC/rhec_web/rhecwb/` — read `css/style.css` `.site-footer*` and `index.html` footer for the
  exact weights/sizes/opacity/spacing Ryan calls "heavy and premium" (its brandmark is Space Grotesk 700 at
  ~14 vw, ~7 % white). Match the *weight feel*, not the font or colors.
- `~/Desktop/UI:UX INSPO/` — all 533 images; `context/22_REF_STUDY.md` indexes them; `../jjay_css_refs/type/T01–T12`.
- `~/Desktop/portfolio*` (Ryan's) — his own footer/nav components for what he considers premium.
- **John Jay logo:** search the whole Mac for a real one before falling back: `mdfind -name "john jay"`,
  `mdfind -name "jjay"`, `mdfind kind:image "john jay college"`, look in `~/Desktop`, `~/Downloads`,
  `~/Documents`, any JJ coursework folder (read only, copy only a logo file). Prefer SVG/PDF/high-res PNG of
  the official John Jay College mark (the shield/wordmark). If nothing usable exists locally, fetch the
  official mark from `https://www.jjay.cuny.edu` (brand/identity or press page) — it is a CUNY college mark
  used on a John Jay student-club site; note the source URL in `SOURCES.md`. Save to
  `assets/brand/jj_logo.{svg|png}` at ≥ 1024 px. Never crop it to a circle; keep its native shape and
  clear space. If only the YouTube-banner crop (`jj_shield.png`, 284 px) exists, upscale it cleanly
  (Lanczos ×4 + slight unsharp) and log that the board must supply the official file.
- Bloodhound: `apps/web/src/mascot/Bloodhound.tsx` (run-1 SVG, 6 emotes) and `../jjay_css_refs/club/youtube_banner.png`.

## 2. Type system v3 — ONE display face, heavy, everywhere

| Token | Face | Weights | Where |
|---|---|---|---|
| `--font-display` | **Unbounded** (`@fontsource/unbounded`) | 700, 800, 900 | every headline ≥ 28 px: hero, H1, H2, poster words, PosterCards, footer brandmark line, nav logotype `CSS`, stat numerals, fin line, buttons (700, 12–13 px, tracking .08em) |
| `--font-body` | **Space Grotesk** | 400, 500, 700 | paragraphs, card titles < 28 px, list titles, inputs |
| `--font-mono` | **JetBrains Mono** | 400, 600 | labels, readouts, nav links, tables, captions, codes |
| `--font-legacy` | VT323 | 400 | binary rings + ticker digits only |

Retire **Chakra Petch, Michroma, Silkscreen** entirely (`grep -r "Chakra\|Michroma\|Silkscreen" apps/web/src`
→ 0). 404's big numerals use Unbounded 900. Unbounded is extended, geometric and genuinely heavy at 800/900 —
it gives the T02 / rhecwb weight with the squared-off feel; if a specific word's round counters look soft,
fix with the treatments below (stencil bars, edge crop), not with another font.

Display rules (in `type.css`, applied by class, no per-component overrides):
- `.t-hero` 900 · `clamp(64px, 10.5vw, 176px)` · leading .88 · tracking −.035em · uppercase
- `.t-poster` 900 · `clamp(88px, 16vw, 280px)` · leading .84 · tracking −.04em · uppercase · always `EdgeCrop`
- `.t-h1` 800 · `clamp(44px, 6.5vw, 104px)` · leading .9 · tracking −.03em · uppercase
- `.t-h2` 800 · `clamp(30px, 3.8vw, 52px)` · leading .95 · tracking −.02em · uppercase
- `.t-stat` 800 · tabular · slashed zero · unit at .35em raised, weight 600
- `.t-brand` 900 · used once, in the footer (see §5)
- Outline (`<Outline>`) stroke: **2px** on dark, **2.5px** on paper — a heavy face needs a heavy stroke or
  it reads thin; ghost copies offset 6px.
- Stencil bars: 4–5 % of cap height at 900 weight (they were 3 % on a lighter face).
- Every H1 keeps two treatments (Stencil / Outline / SplitFill / EdgeCrop / Wireframe / Decode).

Consistency gate (new rubric line): on any page, the set of font families rendered in text ≥ 28 px is exactly
`{Unbounded}`; in 12–27 px is `{Space Grotesk, JetBrains Mono}`; below 12 px is `{JetBrains Mono}`. Write
`scripts/font_audit.mjs` (Playwright: walk all text nodes, `getComputedStyle`, bucket by size, print the
set per bucket per page). It runs in every loop and fails the loop on any extra family.

## 3. The 3D cube — in every hero, and throughout

- **Size.** In `CubeRailCanvas`, scale 1 must render the cube's bounding box at **~420 px** on a 1440-wide
  viewport (currently ~140). Recompute the camera/fov or mesh scale once; then retune every Home keyframe
  by eye: hero 1.0 (fills the 560 px bracket frame), Events/Apps/Join 0.62 (~260 px), Cyberhounds sink 0.35,
  fin 0.5, footer 0.8, parks 0.28. Verify in vp-0/25/50/75/100.
- **Every page hero gets the cube** via `CubeSpot` at 0.85 (~360 px), right column, inside `Brackets`, facing
  the page's face (Events → red C, Apps → green S, Join → blue S, About/Resources/News → three-quarter,
  Cyberhounds → red C **beside** the pixel hound, cube at 0.7 and hound at 240 px), page-accent rim glow,
  drag-to-rotate, idle float, click a face → its route. `CodeRain` behind it on dark heroes.
- **Throughout:** each page's poster band gets a `CubeSpot` at 0.45 edge-on behind the poster word (z below
  text); every page's footer gets `CubeSpot` at 0.8 in the lockup slot (§5) — on Home the rail parks there
  instead. Mobile: hero + footer only.
- Cyberhounds hero: cube red-facing at 0.7 right, hound 240 px overlapping the cube's lower-left, in red,
  with a 2 px halo; cube glow red.

## 4. CYBER HOUNDS (and every poster word) — the treatment

`CYBER` Unbounded 900 white, `HOUNDS` Unbounded 900 **solid red** with a white **outline ghost** offset
(+6px, +6px) behind it (not a hollow word — hollow reads thin), both lines `EdgeCrop right` so the S is cut
by the viewport, stencil bars through `HOUNDS` at 40 % / 66 % of cap height in navy-900 (the band color),
`Decode` on reveal. 3-corner rail stays (`//CTF_01` · `2026` · `PICOCTF · NCL · ANGSTROM · SDCTF`), protocol
line stays. Apply the same recipe (solid + ghost + crop, page accent) to every `.t-poster`: `DEBUG YOUR MIND.
/ COMMIT TO GROWTH.`, `SEE YOU / THERE.`, `NO FLAG / LEFT BEHIND.`, `EVENTS`, `APPS`, `JOIN`, `404`.

## 5. Footer v3

Keep the column grid, divider/CTA, bottom rail, status bar. Replace the lockup and the brandmark:

1. **Lockup (col 1):** delete `StampLockup`. Render, left to right, vertically centered: the **3D cube**
   (`CubeSpot` 0.8, ~330 px canvas, three-quarter, teal rim; Home: the rail parks here) — then a 1 px vertical
   hairline 64 px tall — then the **John Jay logo** from §1 at its native aspect, height 72 px, white
   (or its official two-color version on dark if that's what the file is), no ring, no crop, no circle.
   Under them: `JOHN JAY COLLEGE · CUNY` mono label, then the tagline `DEBUG YOUR MIND, COMMIT TO GROWTH.`
   in Unbounded 800 at 18 px (not VT323, not mono). `CSSKufic` watermark behind col 1 at 5 % stays.
2. **Column heads** `_navigate _connect _meta` stay; link text Space Grotesk 500 16 px at 85 % (they are
   too dim now); META adds `BUILD {sha} · {time}`.
3. **Divider + CTA:** `READY TO COMMIT?` in Unbounded 900 at `--type-h1`; buttons are the §5b Block/Bracket
   variants (the current "Join the Society" pill-ish buttons are run-2 leftovers — replace).
4. **Brandmark → Bloodhound glaze.** Remove the `COMPUTER SCIENCE / SOCIETY` wordmark block. In its place,
   the **Bloodhound head** (from `Bloodhound.tsx`, neutral emote, simplified to its silhouette + 3 interior
   strokes if the full SVG is busy at scale) at **~70 vw wide**, centered, bottom-anchored so the lower 35 %
   is cropped by the footer's bottom edge. Fill = a vertical **glaze**: `linear-gradient(180deg, ink 0 %,
   ink 55 %, transparent 100 %)` masked onto the SVG, at 9 % opacity, with the John Jay red `#CE4A4A` at 4 %
   mixed in on the lower half (so it warms as it fades). Over it, a **cascading fade**: 6 horizontal bands of
   the same silhouette, each 24 px lower and 1.5 % fainter, so the mark appears to sink into the page
   (T13 "SUPERHUMAN" cropped ghost, but as the mascot). Motion: the bands rise into place over 0.9 s tied to
   footer scroll progress; on hover, opacity 9 → 12 %. Reduced motion: static. Optional, small: the club
   name `CSS · JOHN JAY` in Unbounded 900 at 24 px sits on the bottom rail's left, replacing the mono
   copyright's first item (copyright moves right).
5. Status bar stays the last element.

## 6. The run-3 follow-up (still open — do these in Loop 0)

1. Remove `truncate` from `IndexList` titles/deks (`IndexList.tsx:41–42`); titles wrap 2 lines with
   `text-wrap: balance`, deks clamp to 2; 4-column layouts use `--type-h3` min 20 px. Check Collaborate,
   Resources, Join.
2. Gate `Decode` on `document.fonts.ready`, total ≤ 600 ms, emit `data-decode-done`; `shoot.mjs` waits for it.
3. Red-tinted paper bands cap at 3 % (or plain paper) — Cyberhounds §2/§5, Events upcoming.
4. Paper labels ≥ 65 % opacity, micro ≥ 10 px outside HUD frames; run the AA script on both tones.
5. Pixel hound sizes per §3.

## 7. Loop protocol (as run 3 §10)

- **Loop 0 (≤ 35 min):** fonts v3 + `type.css` + `font_audit.mjs` + Outline/Stencil retune + cube scale +
  `CubeSpot` in heroes + footer v3 + JJ logo sourcing + Bloodhound glaze + §6. Shoot `/styleguide`, Home
  vp-0, the footer at 1440×900 scrolled to bottom, Cyberhounds vp-0. Compare sheet against **T02, rhecwb
  footer crop (`../jjay_css_refs/rhecwb/home_1440_b.png` bottom 900 px), T01, T09**. Score. ≤ 3 iterations. Commit.
- **Per page** (Home, Cyberhounds, About, Events, Apps, Join, Resources, News, 404): apply §2–§5, shoot, run
  `font_audit`, compare, score, fix 3 lowest, ≤ 3 iterations, commit.
- **Budget 120 min**, checkpoints 30/60/90 in `context/27_RUN4_LOG.md`. No questions; ambiguity → the
  heavier option; log it.

## 8. Rubric (1–5, gate ≥ 4 on all)

1. **Weight** — every display element is Unbounded 800/900; nothing ≥ 28 px reads light; outline strokes ≥ 2 px.
2. **Consistency** — `font_audit` shows exactly the §2 sets on every page.
3. **Cube presence** — ≥ 360 px cube in every hero; cube in every poster band and footer; Home rail keyframes retuned.
4. **Poster words** — solid + ghost + edge-crop + stencil on every `.t-poster`; CYBER HOUNDS per §4.
5. **Footer lockup** — plain 3D cube + plain John Jay logo, no circles; tagline in Unbounded.
6. **Bloodhound glaze** — ~70 vw, cropped, gradient glaze with red warmth, cascading bands, scroll-tied rise.
7. **Follow-up closed** — no truncation, no scramble in shots, no pink paper, AA on both tones.
8. **Nothing regressed** — composition, label grammar, sigils, readouts, status bar, motion, parity 28/28, Lighthouse desktop ≥ 83.
9. **Craft** — no orphans, tabular numerals, 390 px intact.

## 9. Don'ts

No new fonts beyond §2. No circles/rings around any logo. No hollow-only poster words. No CDN fonts, no
cream, no rhecwb hex/copy, no MCPs, no API keys, no `api/` changes, no invented readouts. Do not shrink the
cube to make layouts easier — move the layout. Do not skip `font_audit` or the compare sheet.

## 10. End of run

Commit; `qa/REPORT_RUN4.md` (scores, font_audit output per page, compare sheets, footer shot, hero shots);
`context/27_RUN4_LOG.md`; update `DESIGN.md` + `context/05` to type v3; `SOURCES.md` gets the JJ logo source.
Print the score table, the five next fixes, and the two dev commands.
