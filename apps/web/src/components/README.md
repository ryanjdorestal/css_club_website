# Components ↔ reference map (`assets/refs/jj_inspo/`)

| Component | Ref | What it takes |
|---|---|---|
| `SectionHeader` | jj_04 (numbered content index), jj_06 (CATCH giant grotesque) | Big number + expanded-width uppercase Archivo title + `//` mono kicker |
| `SpecCard` | jj_11 (TRA/D350 spec sheets), jj_10 (phone spec labels) | Title, body, then a bordered mono key/value row |
| `StatTile` | jj_11 stat tiles, jj_03 stat chips (240+/92%) | Big VT323 number over a mono label, accent left rule |
| `Ticker` | jj_03 ticker marquee | Tagline 2 on loop, ✦ separators |
| `BinaryRings` | jj_01 (old site header art) | VT323 digits on circular paths, faint, drifting — replaces dot-grids |
| `StampLockup` | jj_01 circular stamp | College/club on arcs around the cube |
| `CornerBrackets` | jj_11/Utopia-style data brackets | Hero + featured cards only, sparingly |
| `PixelDivider` | Lithosquare pixel blocks | Between major sections |
| `Nav`, `Footer` | old site nav order + stamp | One component each; brand from `brand.config.ts` |
| `Button` | jj_06/jj_11 solid accent CTAs | primary = section accent, ghost = teal outline |

Every component reads `var(--accent)` — never a literal hex, never a club name.
