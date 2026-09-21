# Fonts shipped with this repo (self-hosted, no CDN, no keys)

Downloaded and match-tested by Cowork on 2026-09-21 against the S01 / DEMON reference
(`~/Desktop/jjay_css_refs/run9/R9_01a_demon_wordmark_crop.png`). All are SIL Open Font
License 1.1 — the `LICENSE` file sits next to each family's `.woff2` files and must ship
with them.

| Family | Weights here | Role | Why |
|---|---|---|---|
| **Turret Road** | 200 300 400 500 700 800 | `--font-display` — every headline ≥ 28 px, poster words, buttons, KPI numerals | The closest free face to the S01/DEMON skeleton: extended, monoline, **45° chamfered corners**, squared counters, shallow-V `M`. Unlike Michroma it has a real weight range, so solid/outline pairs work. |
| **Michroma** | 400 | `--font-display-wide` — fin lines, the footer brandmark, single-word rails | Ultra-wide monoline; the widest free face in the DEMON lane. One weight only, so display-only. |
| **Martian Mono** | 400 500 600 700 | `--font-mono-display` — deks, protocol lines, ticker, readouts, labels ≥ 12 px | Wide technical mono with generous counters = the S01 body ("BRUTAL AND RELENTLESS…") register. |
| **Silkscreen** | 400 700 | `--font-os-display` — OS page titles, the T03 login headline, tile F/I words | **Chosen in run 10** (`qa/loops/run10/os_face.png`): at 72 px Silkscreen 700 reads chunkier and cleaner than VT323 against the T03 headline (VT323 is a thin terminal face and stays for the binary rings + ticker digits). |
| **Orbitron** | 700 800 900 | reserve — unused in run 10 | The canonical game face. Held in reserve: if Turret Road reads too light at poster size on a given band, Orbitron 900 is the heavier substitute — never both on one page. Every poster band read fine in Turret Road 800, so the files ship unused (`fonts.css` still declares them; nothing references the family). |

Already in the repo and unchanged: **JetBrains Mono** (labels < 12 px, code, tables),
**Space Grotesk** (long body paragraphs), **VT323** (binary rings, ticker digits).

Retired: the run-4 geometric display face (round bowls, not squared — the reason headlines read generic) and the
hand-drawn SVG alphabet from run 9 — both deleted in run 10 (`grep` gate: 0 hits).

Evidence: `~/Desktop/jjay_css_refs/run10/` holds the DEMON overlay comparison
(`demon_compare.png`), the 24-face specimen sheet (`spec_sheet.png`), the 12-face mono sheet
(`mono_sheet.png`) and the Turret Road hero mock (`mock_turret.png`).
