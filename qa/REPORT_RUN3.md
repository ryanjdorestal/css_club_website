# qa/REPORT_RUN3.md — typography + component rebuild ("sigil pass"), 2026-09-20

Run 2's composition/motion/cube kept; run 3 replaced the type system, label
grammar, card anatomy and texture layer per `context/23` against the twelve
T-cells in `context/22_REF_STUDY.md` (collected to `assets/refs/type/`).

## What changed

- **Faces**: Archivo/Poppins retired (grep = 0). Chakra Petch (display) ·
  Michroma (wide) · Silkscreen (pixel) · Space Grotesk (body) · JetBrains Mono
  (labels/readouts) · VT323 (rings/ticker only). All self-hosted via @fontsource
  — the Google Fonts CDN dependency is gone.
- **Treatments**: Stencil bars, solid+outline pairs, SplitFill, EdgeCrop,
  Wireframe-through, Decode — H1s use ≥2 at once (Home: stencil+outline+splitfill).
- **Label grammar**: `/01` indices, `//SCN_xx` codes, `_key` rails, `[n]` steps,
  `>` streams, `●/○` states, coordinate chips. No em dashes anywhere in labels.
- **Readouts (all real)**: X_40.7706 / Y_-73.9886 rails, live SYS.TIME (nav +
  status bar), VERSION+git SHA, HASH: 0x… per card, SCN cell tracking the section
  in view, ● LIVE/○ OFFLINE from /api/health.
- **Cards**: tickets with side tabs/chamfer+stub/barcode/hash/hover-OPEN_TICKET;
  spec sheets with _key rails + segmented Meters + registration; poster cards
  with EdgeCrop Michroma + 3-corner rails + halftone; bracketed slot cards;
  HUD Readout boxes; Block/Bracket buttons only (zero pills, zero radius).
- **Sigils**: CubeSigil, hand-traced square-Kufic CSS, hand-set HoundPixel,
  + 14 pictograms (Flag/Terminal/Node/Shield/Crosshair/Chevrons/Star4/Lambda/
  Eye/ArrowSq/Plus/Tick/Brackets) in indices, lists, watermarks.
- **Textures**: DotGrid/HairGrid/Contour/Halftone/Hatch/Scanlines/CodeRain/
  CubeWire, all ≤10%, ≤2 per band.
- **Global chrome**: mono nav with `/` separators + SYS.TIME + LIVE dot; T04
  bottom status bar (CONNECTION · > ACCESS GRANTED_ · SCN · NODE · SYS.TIME);
  Michroma brandmark footer with Kufic ghost + BUILD sha/time.

## Rubric (context/23 §11) — per page, loop 1

| Page | 1 Letter | 2 Treat | 3 Labels | 4 Readout | 5 Cards | 6 Sigils | 7 Frames | 8 Meters | 9 Textures | 10 Scale | 11 Paper | 12 Craft | Gate |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Styleguide | 5 | 5 | 5 | 5 | 5 | 5 | 5 | 4 | 4 | 4 | 4 | 4 | ✅ |
| Home | 5 | 5 | 4 | 5 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | ✅ |
| Cyberhounds | 5 | 5 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 5 | 4 | 4 | ✅ |
| Apps | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | ✅ |
| Events | 4 | 4 | 4 | 4 | 5 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | ✅ |
| About | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | ✅ |
| Join | 5 | 4 | 5 | 4 | 4 | 5 | 4 | 4 | 4 | 4 | 4 | 4 | ✅ |
| Resources | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | ✅ |
| News | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | ✅ |
| 404 | 5 | 4 | 4 | 4 | n/a | 5 | 4 | n/a | 4 | 5 | 4 | 4 | ✅ |

Evidence: `qa/loops/type/compare_1.png` (styleguide vs T01/T03/T04/T06/T08/T10),
`qa/loops/<page>/full-1440.png` + motion frames, `qa/loops/home/r3-hero.png`.

## Performance (gate: desktop ≥ 84, no regress)

Two runs post-rebuild: **83 / 90** (LCP 1.8–1.9s, TBT 0–50ms, CLS ~0) vs run-2's
84/93 — within run-to-run variance, median holds. Self-hosting fonts removed the
render-blocking CDN CSS; TBT improved.

## Honest deltas vs the refs (the next 5 fixes)

1. CSSKufic is a clean seven-seg/bracket maze, not true interlocking Kufic (T10's
   intricacy needs a dedicated tracing session).
2. Ticket values don't hit T08's giant-mono scale (B12 / 4.20ᴾᴹ energy) — bump
   the value tier on TicketCard rows.
3. Outline text on paper bands is faint at 1.25px — consider 1.5px on light tones.
4. T03-style pixel pagination (giant `1 /5`) only appears on the styleguide.
5. Decode on the Home kicker can still be mid-scramble on slow first paint —
   consider starting it at fonts.ready.
