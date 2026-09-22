# 45 — RUN 12 LOG (2026-09-22)

Ryan made the repo public, saw `a11y` and `lighthouse` red on `main`, and asked for them fixed and
the site polished before handing the repo to the club president. Worked in a two-core Linux clone of
the pushed repo, because both failures were environment-shaped and neither reproduces on a Mac.

| # | step | outcome |
|---|---|---|
| 1 | Reproduced the a11y failure on a build served by `vite preview` | the dev server was not the cause — same timeouts |
| 2 | Read the error text properly: `Target.closeTarget` = crashed tab | WebGL in software rendering, two tabs, two cores |
| 3 | `--force-prefers-reduced-motion` + `concurrency: 1` | pa11y 10/10 in ~3 min, deterministic |
| 4 | Noticed axe would pass on eleven login screens if the API were down | `axe.mjs` fails on a redirect; `a11y.sh` starts the API |
| 5 | Split the Lighthouse gate: bytes and category scores hard, timings recorded | job passes; a11y 100, SEO 100, best-practices 100 |
| 6 | Fixed the five accessibility defects Lighthouse found that our own gates missed | contrast, three Label-in-Name, heading order |
| 7 | robots.txt + generated sitemap, drift-checked in `make check` | SEO 92 → 100 |
| 8 | Read 17 screenshots (11 desktop, 6 mobile) and fixed eight layout collisions | hero chip, IndexList rows, JOIN cube, face caption, SlotCard, coordinate rail, map caption, OS thumbs |
| 9 | Found the footer map never fell back and fixed the detection | both paths verified |
| 10 | One `browser.mjs`; deleted 15 dead one-off scripts; `qa-scripts/README.md` | 30 files → 15 |
| 11 | Pinned `ubuntu-24.04`, moved every action off Node 20, `import.meta.dirname` | no deprecation warnings left |
| 12 | Corrected `CLAUDE.md`, which still named Unbounded and the old size budget | matches the code again |
| 13 | Full gate pass | check · a11y · smoke 12/12 + 9/9 · sim 25/25 · break 16/16 · lhci |

Evidence and the reasoning for each decision: `qa/REPORT_RUN12.md`.

One commit to know about: the footer map's fallback fix (step 9) rode along in the
`fix(a11y): contrast, label-in-name and heading order` commit, because it touches the same file.
The message names only the aria change.

Open afterwards: issue #6 (runner perf, by design) and `valid-source-maps` on the lazy Gltf chunk.
Issue #14 (pa11y on the runner) is fixed by this run and can be closed.
