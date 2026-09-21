# 36 — Run 8 log (OS entrance · inheritance spine · skills-driven verification · slim repo)

Start 2026-09-21 00:49 EDT. Budget 150 min (§2 ≤ 20 · §3 ≤ 40 · §4 ≤ 70 · §5 ≤ 15). Brief pasted as "35 — RUN 8".

## Decisions
| # | Decision | Why |
|---|---|---|
| 1 | Inheritance validator = ONE implementation, in Python (`api/_core/spine.py`), CLI `scripts/validate_inheritance.py`; no Node twin | the brief said "pick one, log it"; the API must refuse bad records and `make check` must gate — one set of rules keeps them identical |
| 2 | The spine's Tier-1 truth is the files under `content/inheritance/` (the API reads/writes markdown directly); Tier 2 mirrors rows in `inheritance_records` and the snapshot writes files | Ryan: "an actual inheritance file / organization of files" — records must be readable with no software |
| 3 | The `handoffs` table/collection from run 7 is superseded by spine records of `type: handoff` (Today's nudge and rollover stubs now write files) | one place for board knowledge; the table stays in 0002 for history, 0003 adds `inheritance_records` |
| 4 | Public nav reads the session with `useWhoami()` (one /api/whoami per load); the button says `CSS_OS · BOARD` anonymous, `CSS_OS · <first name>` signed in | Ryan couldn't find the OS; RHEC's `RHEC OS · BETA` ghost button is the model, ours names what it is |
| 5 | A denied login is audited server-side (`login_denied`) only when the request carries `X-Login-Attempt` (set once after an OTP verify) | the message never reveals roster membership; whoami is called on every page so a plain guest must not spam the log |
| 6 | The OS shell's bounce is guarded by a ref and reads the path from `useLocation` | the first version fired twice and nested `next=` inside itself (os_gate.mjs caught it) |

## §2 done (01:06 — 17 min)
os_gate.mjs: 12/12 (anonymous → login + reason + next; guest → NOT_ON_ROSTER; admin picker honours next; nav button anonymous/signed-in; overlay entry). Shots qa/loops/run8/os-login-{1440,390}.png, home-nav-os-1440.png.
| 7 | Spine frontmatter is a YAML *subset* parsed by `spine.parse` (scalars, inline lists, block lists, block lists of label/url maps) | no PyYAML dependency; templates and the OS editor only ever emit this subset |
| 8 | `owners` on the roster is enforced only when that term has roster rows; `the board` is always allowed | F26 has no officers yet — a validator that fails on an empty roster would block the seed records |
| 9 | Rollover now writes `<next>/roster.md` + one draft `handoffs/<role>.md` per outgoing officer into the spine; the run-7 `handoffs` table is retired (0003 adds `inheritance_records`) | one place for board knowledge |

## §3 done (01:10 — 21 min)
/os/inheritance = blurb · readouts · term rail · grouped IndexList · record view (spec sheet, link buttons, article body) · editor (frontmatter form + markdown preview) · export zip · HOW-TO panel. /os/system = health + ownership + docs + runbook. Seed: HOW-TO, 8 templates, F26/roster.md, the platform-adoption decision. `scripts/validate_inheritance.py` in make check + CI. pytest 49. Shots qa/loops/run8/os-inheritance-*.png, os-system-1440.png.
| 10 | Every skill gets a row in `docs/SKILLS_ADOPTED.md` with adopt / adapt / skip and the reason; "adapt" means re-implemented for a SPA + one function, never copied | the brief: translate, don't transplant — a skill written for QUAY's Next.js or Sator's rover fleet is not a finding here |
| 11 | The OS status bar is `pointer-events-none` and the rail's bottom block gets `pb-12` | the functional smoke found the bar covering the sign-out button (a real mouse bug, not just a test flake) |
| 12 | `ci.yml` runs `make check` verbatim plus a `functional` job (`make smoke` = OS gate 12 + smoke 9 against dev server + API); lychee stays weekly with `--root-dir` for the built site | a newcomer and CI must run the same command; the network sweep is too slow/flaky for every PR |
| 13 | Lighthouse mobile 60 is recorded, not fixed, this run; the prerender line in `docs/LATER.md` carries the measured numbers | 70 minutes for §4 — the a11y counts (79 + 233 → 0) were the functional fixes; mobile LCP is a build-strategy decision (prerender / lazy R3F) for Ryan |
| 14 | Records' link check: the seed decision pointed at a `SETUP.md` in the old repo that never existed → now links the old repo itself | lychee: 86 links, 1 dead → 0 |

## §4 done (02:20 — 70 min)
`docs/SKILLS_ADOPTED.md`: 63 skills decided (adopt 14 · adapt 14 · skip 35). Counts: pa11y 79→0 · axe 233→0 · stylelint 2→0 · markdownlint 20→0 · tokens 21→0 · repo audit 6→0 · lychee 86 links 1→0 dead · gitleaks 0/38 commits · html-validate 0 · Lighthouse 97/60 (recorded). `scripts/functional_smoke.mjs` 9/9 (step 8 found the status bar covering sign-out — fixed) · `os_gate.mjs` 12/12 · `make check` green (ruff · prettier · stylelint · markdownlint · oxlint · mypy · tsc · pytest 49 · vitest 19 · audits · guards · validators · ts-prune · depcheck). CI: `make check` + commitlint + html-validate + build + render smoke; new `functional` job = `make smoke`. ui-preservation: heights identical on Home/Projects/News/About; 0.26–1.70 % pixels differ (nav button, cube/marquee animation, label contrast tokens) — `qa/REPORT_RUN8.md`.
