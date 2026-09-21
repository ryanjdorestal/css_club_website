# 42 — OS matrix: every entity × every action (run 10 §5)

Derived at the start of run 10 by clicking through the running app (Tier 1, LOCAL_DEV admin + officer)
and reading the routers when a control was missing. Legend: ✅ works · ⚠️ partial · ❌ absent · n/a — why.
The **before** column set is the state at 13:45; **after** is the state at the close (every ⚠️/❌ became a
task in §6/§7 of the brief; what was cut is named in `qa/REPORT_RUN10.md`).

## Before (13:45)

| Entity | list | view | create | edit | publish/unpublish | archive | delete | reorder | bulk | export | undo |
|---|---|---|---|---|---|---|---|---|---|---|---|
| post | ✅ | ✅ | ✅ | ✅ panel | ⚠️ publish only — no unpublish | ⚠️ status select, no chip/unarchive | ❌ | n/a — dated | ❌ | ❌ | ❌ |
| project | ✅ | ✅ | ✅ (public form + OS) | ✅ panel | ✅ publish · ⚠️ no unpublish | ⚠️ via decide | ❌ | ✅ ▲▼ | ❌ | ❌ | ❌ |
| event | ✅ | ✅ | ✅ | ✅ panel | ✅ publish · ⚠️ no unpublish | ⚠️ status only | ❌ | n/a — by date | ❌ | ❌ | ❌ |
| **workshop** | ❌ read-only JSON | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| resource category | ⚠️ implied by links | n/a | ⚠️ by adding a link | ❌ rename | n/a | n/a | ❌ | ❌ | n/a | ❌ | ❌ |
| resource link | ✅ | ✅ | ✅ | ✅ panel | n/a | n/a | ✅ | ✅ within group | ❌ paste | ❌ | ❌ |
| site link | ✅ | ✅ | n/a — fixed keys | ✅ inline | n/a | n/a | n/a | n/a | ✅ check all | n/a | ❌ |
| member | ✅ | ✅ | ✅ + import | ✅ panel | n/a | ⚠️ status `left` | ⚠️ officer delete, no confirm | n/a | ⚠️ transition, no import-undo | ✅ csv | ❌ |
| officer / seat | ✅ | ✅ | ✅ admin | ✅ panel | n/a | ⚠️ active toggle | ❌ | ❌ | n/a | ❌ | ❌ |
| term | ✅ | ✅ | ⚠️ API only, no UI | ❌ | n/a | n/a | ❌ | n/a | n/a | n/a | ❌ |
| inheritance record | ✅ | ✅ | ✅ 8 types | ✅ | n/a — status field | n/a | ❌ | n/a | n/a | ✅ zip | ❌ |
| handoff | ✅ (a record type) | ✅ | ✅ | ✅ | n/a | n/a | ❌ | n/a | n/a | ✅ zip | ❌ |
| site setting | ✅ | ✅ | n/a — fixed keys | ⚠️ raw JSON textarea | n/a | n/a | n/a | n/a | n/a | n/a | ❌ |
| feature flag | ✅ | ✅ | n/a | ⚠️ inside the JSON | n/a | n/a | n/a | n/a | n/a | n/a | ❌ |
| ticker item | ⚠️ inside a JSON list | ⚠️ | ⚠️ | ⚠️ | n/a | n/a | ⚠️ | ❌ | n/a | n/a | ❌ |
| ownership row | ✅ | ✅ | n/a — 9 fixed accounts | ✅ inline (admin) | n/a | n/a | n/a | n/a | n/a | n/a | ❌ |
| audit record | ✅ | ✅ diff | n/a — written by the system | n/a — append-only | n/a | n/a | n/a | n/a | ⚠️ filter by table only | ❌ | n/a |
| inbox item | ✅ | ✅ | n/a | n/a | n/a | n/a | n/a | n/a | ⚠️ replay all, no per-item | ❌ | n/a |
| upload | ⚠️ via a field | ✅ served | ✅ | ❌ replace | n/a | n/a | ❌ remove | n/a | n/a | n/a | ❌ |

Counts before: **✅ 47 · ⚠️ 29 · ❌ 60 · n/a 55**. Cross-cutting: no 409 on stale writes, no error
envelope, no idempotent `client_id`, no typed confirms, no undo, no unsaved-changes guard, no keyboard
submit, no empty-state cards, no CSV export except members, uploads by extension only.

## After (the close — filled in by the run)

See the bottom of this file; `qa/REPORT_RUN10.md` carries the counts.
