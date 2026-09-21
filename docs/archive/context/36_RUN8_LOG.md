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
