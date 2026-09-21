# 40 — RUN 10: TYPE v5 (the real game face, everywhere) · THE OS ACTUALLY WORKS (board-behaviour hardening)

Paste everything below the line into Claude Code (**Opus, xhigh**) in `~/Desktop/jjay_css`.
Read anything on this Mac; write only inside this folder; never push; never touch rhecwb or its Supabase.

---

## 0. Ryan's review of run 9 (verbatim) → what this run is

> "The game typography change never persisted across the entire site, nor was there… changes were made but
> it was not as I envisioned as per the inspo of typography I fed you. If you need a UI/UX pack, download
> it — don't rely on what you have, because it's not working and you're consistently getting the typography
> wrong. The chunky words and hollow stuff is OK, but the **game text vibes** replacement is what would
> raise the bar, as I've repeated several times already. Download what you need first — like exact matches.
> I like what you did with the hollow text and solid different colours and composition, but **the
> typography needs to be different**. I checked out the OS and it's not bad; we now need to get it to the
> point where it's **100 % functional — not just some sections work, others don't, you can't edit this,
> that**. Everything I touch on it should be functional. **Pretend you're the board. Break the system using
> it. Do real board behaviours** — events, workshops, etc. — as if they're using the platform."

Two workstreams, in this order:

| # | Workstream | Time box |
|---|---|---|
| **A** | **TYPE v5** — the real faces (already downloaded for you, §2), applied to every surface, public and OS, with the drawn alphabet and Unbounded deleted | 70 min |
| **B** | **OS HARDENING** — every entity fully editable, every control alive, every failure handled; proven by a scripted semester of real board behaviour plus an adversarial pass | 140 min |

**Budget 220 min** (+10 report). Checkpoints every 30 min in `docs/archive/context/41_RUN10_LOG.md`.
No questions; ambiguity → the option a board member would expect; log it. `make check` green at every commit.
Hard rules unchanged: one Vercel function (`api/index.py` + `api/_core/`), no API keys, no LLMs, Tier 1
always works, John Jay palette, never push.

**Read first** (≤ 10 min): `README.md`, `ARCHITECTURE.md`, `CONTRIBUTING.md`, `DESIGN.md`,
`apps/web/src/fonts/FONTS.md` (new — the fonts and why), `docs/archive/context/37_RUN9_PROMPT.md` §2–§6
(what run 9 built), `qa/REPORT_RUN9.md`, `docs/SKILLS_ADOPTED.md`, `docs/LATER.md`. Run `make dev` and
`make check` once before touching anything.

---

# WORKSTREAM A — TYPE v5

## 1. Why run 9's typography failed (confirm each before editing)

1. **The drawn SVG alphabet reads as wireframe tubing, not a typeface.** In `qa/loops/run9/home-hero-a.png`
   the outline line ("YOUR MIND,") is a double-stroked skeleton — it looks like a CAD path, not hollow type.
   The reference's hollow words are a *real face* with a stroke; ours is a drawing of one.
2. **It only covered ≤ 12 words.** Everything else on the site stayed Unbounded, so the "game" face never
   persisted — Projects reads Unbounded (`PROJECTS. BUILT`), Home reads drawn-alphabet. Two systems, one page.
3. **Unbounded is the wrong species.** It is a rounded *geometric* — circular bowls, no chamfers, no squared
   counters. The reference is a *squared, chamfered, extended monoline*. No amount of weight fixes that.
4. **The body dek is still Space Grotesk / JetBrains in places** — the reference's body is a wide technical
   mono in caps, which is half of the "ops" feel.

## 2. The faces — already downloaded, tested and committed to the repo. Use these. Do not go shopping.

Cowork match-tested 50 free families (107 renders) against the DEMON crop and picked these. They are in
**`apps/web/src/fonts/<family>/*.woff2`** with their `LICENSE` files, and `apps/web/src/fonts/FONTS.md`
documents the choice. Evidence sheets are in **`~/Desktop/jjay_css_refs/run10/`**:
`demon_compare.png` (10 faces overlaid against the reference DEMON), `spec_sheet.png` (24 display faces
setting the real hero copy), `mono_sheet.png` (12 monos setting the real dek), and **`mock_turret.png`
— the approved target: the Home hero + CYBER/HOUNDS + fin + brandmark in the new faces.** Open
`mock_turret.png` first; that image is the acceptance target for §4.

```
--font-display:      "Turret Road"   200 300 400 500 700 800   ← every headline ≥ 28px, poster words,
                                                                 buttons, KPI numerals, nav logotype
--font-display-wide: "Michroma"      400                       ← fin lines, footer brandmark, single-word rails
--font-mono-display: "Martian Mono"  400 500 600 700           ← deks, protocol lines, ticker, readouts,
                                                                 labels ≥ 12px, OS tile labels
--font-mono:         "JetBrains Mono"                          ← labels < 12px, code, tables, form inputs
--font-body:         "Space Grotesk"                           ← long paragraphs only (news body, about copy)
--font-os-display:   "Silkscreen" 700 | "VT323"                ← OS page titles + login headline (§3.4)
--font-legacy:       "VT323"                                   ← binary rings, ticker digits
```

**Turret Road is the face.** It is the only free family with the DEMON skeleton — extended, monoline,
**45° chamfered corners**, squared counters, shallow-V `M` — *and* a real weight range, which is what makes
solid + hollow pairs work. Michroma is wider but single-weight, so it is display-only. Martian Mono is the
wide technical mono that produces the reference's body register.

**Delete:** `apps/web/src/type/glyphs/` (the drawn alphabet) and every `<S01Word>` usage; the Unbounded
package and every reference to it; any `Familjen Grotesk`. `grep -ri "unbounded\|S01Word\|type/glyphs"
apps/web/src` must return 0. Orbitron 700–900 is committed as a **reserve only** — if a specific poster
band reads too light in Turret Road 800, that one band may use Orbitron 900, logged, never two faces on
one page; if you do not use it, leave the files (FONTS.md explains them).

## 3. Apply it — every surface, no exceptions

### 3.1 Loading
`apps/web/src/fonts/fonts.css`: one `@font-face` per file, `font-display: swap`, `unicode-range` latin,
`src: url("./turret-road/turret-road-latin-800-normal.woff2") format("woff2")`. Imported once from
`main.tsx`. No `@fontsource` imports, no CDN, no Google Fonts link anywhere (grep `fonts.googleapis` → 0).
Preload the two faces used above the fold (`turret-road 800`, `martian-mono 500`) in `index.html`.

### 3.2 Scale and treatments (`type.css` — tune, do not redesign)
Turret Road is wider than Unbounded at the same size, so re-fit:
```
--type-hero    clamp(52px, 8.8vw, 148px)   weight 800  leading .92  tracking -.03em
--type-poster  clamp(76px, 14vw, 240px)    weight 800  leading .88  tracking -.04em  (always EdgeCrop)
--type-h1      clamp(40px, 6vw, 96px)      weight 800  leading .94  tracking -.025em
--type-h2      clamp(28px, 3.6vw, 48px)    weight 700  leading .98  tracking -.02em
--type-h3      clamp(19px, 2vw, 26px)      weight 700 (display) or 600 (mono-display)
--type-stat    clamp(44px, 5.6vw, 88px)    weight 800  tabular-nums slashed-zero
--type-dek     17px/1.6  mono-display 500  tracking .03em  UPPERCASE  max 62ch
--type-body    16px/1.65 Space Grotesk     sentence case (paragraphs > 3 lines only)
--type-label   11px      mono-display 500  tracking .14em uppercase
--type-micro    9px      JetBrains Mono    tracking .12em uppercase
```
Keep every run-3 treatment, re-tuned for the new face: `Outline` stroke **3 px** dark / **3.5 px** paper
(the mock uses 3 px — thinner disappears against the chamfers); `Stencil` bars 4.5 % of cap height;
`SplitFill`, `EdgeCrop`, `Wireframe`, `Decode` unchanged in behaviour. The hollow/solid/two-colour
compositions Ryan likes stay exactly as they are — only the face changes underneath.

### 3.3 Every public surface (re-set, re-shoot, diff)
Home (hero, all 12 bands, ticker, fin, footer), Cyberhounds, Projects, Events, About, Resources, News
(list + article), Join, 404, `/styleguide`. Rules that must hold on every page after the swap:
- Nothing ≥ 28 px is in any face but Turret Road (or Michroma where §2 says).
- Every dek/protocol/ticker/readout is Martian Mono uppercase; long article body stays Space Grotesk.
- No headline gains a line (the face is wider — re-fit by size, never by switching face).
- No orphan words; no horizontal scroll at 390/768/1024/1440/1920.
- `scripts/font_audit.mjs` (per-realm sets from run 9) passes on all 13 routes with the new sets.

### 3.4 The OS realm
OS page titles and the login headline: render both Silkscreen 700 and VT323 at 72 px in the login/OS title
slot, look at both, keep the chunkier/cleaner one (the T03 reference is a chunky bitmap — Silkscreen 700 is
the expected winner), log the choice. Tile labels and KPI captions → Martian Mono 500. KPI numerals →
Turret Road 800 tabular. Rail tooltips, tables, form inputs → JetBrains Mono. The OS grid, tiles and ops
layer from run 9 do not move.

### 3.5 Gate for A
Side-by-side of `~/Desktop/jjay_css_refs/run10/mock_turret.png` and the rebuilt Home hero at 1440: the
same face, the same weight relationships, the same dek register. Plus: `grep` clean, font audit green,
every page re-shot, `ui-preservation` diff shows only glyph changes.

---

# WORKSTREAM B — THE OS ACTUALLY WORKS

## 4. The standard

**Every control a board member can see does something, and every entity can be created, read, updated,
archived and (where safe) deleted, from the UI, in Tier 1 and Tier 2, with the result visible on the
public site where it belongs.** No dead buttons. No read-only tables. No "coming soon". No control that
only works on the happy path. If a surface cannot support an action, the action is not rendered — and the
tile says why in its "what is not here" line.

## 5. Inventory first (≤ 20 min, do this before writing code)

Write `docs/archive/context/42_OS_MATRIX.md`: a row per **entity** × column per **action**
(`list, view, create, edit, publish/unpublish, archive, delete, reorder, bulk, export, undo`) with one of
`✅ works · ⚠️ partial (what's missing) · ❌ absent · n/a (why)`. Entities: post, project, event, workshop,
resource category, resource link, site link, member, officer/board seat, term, inheritance record,
handoff, site setting, feature flag, ticker item, ownership row, audit record, inbox item, upload.
Derive the truth by **clicking every control in the running app**, not by reading code. Every `⚠️`/`❌`
becomes a task in this run. This matrix is also the answer to "you can't edit this, that".

## 6. Fill the gaps — the rules that apply to every entity

1. **Full CRUD.** List → detail → edit → save, plus create and archive. Delete only where losing the row is
   safe (resource link, ticker item, draft post, unsubmitted upload); everything else archives with a
   visible `ARCHIVED` state and an `UNARCHIVE` action. Archive/delete always asks with a typed confirm
   (`type DELETE to confirm`) and always writes an audit record.
2. **Inline edit where a board member expects it**: any field shown in a `SpecSheet` row is click-to-edit
   (Enter saves, Esc cancels, the row shows `SAVING…` then `SAVED ✓` for 1.2 s). Tables get a row action
   menu (`EDIT · DUPLICATE · ARCHIVE`).
3. **Validation is server-side first** (pydantic) and mirrored client-side. Every field states its rule in a
   micro line *before* the user trips it (`slug: lowercase, digits, dashes — must be unique`).
   Errors appear next to the field in `--color-red`, plus a summary chip at the top of the form.
4. **Optimistic UI is banned.** Buttons enter a `disabled + SAVING…` state on submit, are idempotent
   (client-generated `client_id`), and never double-post on double-click or Enter-spam.
5. **Empty states are real**: a `SlotCard` with what it is, why it's empty, and the action that fills it.
   Zero rows never renders a blank panel or a bare "0".
6. **Every write mirrors to the public site** (Tier 2) or the committed JSON via snapshot (Tier 1), and the
   OS shows where it landed: `→ /news/welcome-back` as a link after publish.
7. **Undo where cheap**: after publish/archive/delete a toast holds `UNDO` for 8 s (re-POSTs the inverse,
   audited as `undo`).
8. **Keyboard**: every form submits with ⌘/Ctrl+Enter, closes with Esc; the launcher is ⌘K; tables are
   arrow-navigable; focus is trapped in modals and returned on close; every interactive element has a
   visible focus ring (`make a11y` stays 0/0).
9. **Permissions are enforced server-side**: `officer` cannot change roles, run rollover, edit settings/
   ownership, or delete; the UI hides those controls *and* the API refuses them (test both).
10. **Concurrency**: every update sends `If-Unmodified-Since`/`updated_at`; a stale write returns 409 and
    the UI shows `CHANGED_ELSEWHERE — reload or overwrite`, never a silent clobber.

## 7. Entity-by-entity gaps to close (minimum; the matrix may add more)

- **Posts**: cover upload + remove + replace; slug edit with uniqueness check; unpublish; archive; delete
  draft; duplicate; preview link; word count; "published to" link; markdown toolbar (bold/italic/link/
  heading/list/code) that inserts at the cursor.
- **Projects**: the review loop end to end — `submitted → in_review → changes_requested → (resubmit) →
  approved → published → archived`, each with a required note on rejection, all audited; screenshots
  add/remove/reorder; `featured` toggle with a max of 3 enforced; `display_order` drag-free reorder
  (`▲▼` buttons); edit any field of a published project; add on behalf of a student.
- **Events**: create/edit/publish/archive; flyer upload/replace/remove; date+time with a timezone note;
  location; RSVP link; link a recap post; duplicate-for-next-term; past/upcoming derived from date, not a
  manual flag; **workshops** (a separate entity today) get the same full CRUD and a `series` field, and the
  Events page groups them — Ryan named workshops explicitly, so they must be first-class, not JSON-only.
- **Resources**: add/edit/delete link, add/rename/reorder/delete category, move a link between categories,
  bulk paste (one URL per line → parsed rows to confirm), re-check a single link, check all, dead-link
  filter; site links (Discord invite, form, Linktree…) editable with a "used on" list showing where each
  appears on the public site.
- **Members**: add/edit/archive; CSV import with dry-run → commit → undo-last-import; export; bulk status
  transition with the allowed-transition map enforced; merge duplicates (pick survivor, audited); notes;
  tags add/remove.
- **Board / terms**: add/edit/remove an officer; change a seat's role; set `os_role`; upload a photo;
  reorder seats; create a term; edit term dates; **rollover wizard** must be reversible before confirm and
  audited after; the public About page reflects it immediately.
- **Inheritance**: create/edit/delete a record in every one of the 8 types; template loads; frontmatter form
  + markdown body; owners multi-select from the roster; links add/remove; `supersedes` picker; validator
  runs on save and blocks with a readable message; export zip; **and the record list must be filterable by
  type and term**.
- **Site settings**: every key editable with the right control (string, list, boolean, JSON object);
  ticker items add/remove/reorder; maintenance banner toggle + text with a live preview of the public
  banner; feature flags with a one-line "what this turns off".
- **Audit**: filter by actor/table/date/action; open a record → before/after diff; export CSV; inbox
  replay per item and all, with a result summary.
- **System**: every check runnable on demand with a spinner and a real result; snapshot run button;
  keepalive status; ownership rows editable; each red state links to its runbook section.

## 8. The semester simulation — `scripts/board_sim.mjs` (this is the proof)

A single Playwright script that plays a **whole semester as the board**, in Tier 1, from an empty local
store, asserting the public site after each step. It is the run's headline artifact and runs in CI.

```
ACT 1 — TAKING OVER
 1  sign in (LOCAL_DEV admin)                        → /os renders, ticker shows TERM F26
 2  create term F26 (dates), set current             → About shows F26
 3  add 6 officers (2 with photos, 1 with os_role=admin, 1 typo'd then corrected)
 4  fill the ownership sheet (9 rows)                → /os/system ownership no longer red
 5  officer #6 signs in as OFFICER                   → admin-only controls absent; API refuses them (assert 403)
ACT 2 — THE SEMESTER RUNS
 6  publish post "WELCOME BACK"                      → /news lists it, /news/<slug> renders
 7  create event "FIRST GENERAL MEETING" + flyer     → /events upcoming + Home band show it
 8  create workshop series "INTRO TO GIT" (3 sessions)→ /events workshops section shows the series
 9  change the Discord invite link                   → public footer + Join page show the new URL
10  add 2 resource links, rename a category, reorder → /resources reflects all three
11  import 40 members from CSV (dry-run → commit)    → /os/members count = 40; undo-last-import restores 0; re-import
12  transition 6 members interested → member         → status meters update; audit has 6 rows
ACT 3 — A STUDENT SHIPS SOMETHING
13  submit a project from the PUBLIC form            → appears in /os/projects queue as submitted
14  request changes with a note                      → status changes_requested; note visible
15  resubmit (public form, same slug)                → back to submitted, history kept
16  approve → publish → feature                      → /projects Featured shows it; featuring a 4th is refused
ACT 4 — THINGS GO WRONG
17  run link check with one deliberately dead URL    → dead-link chip on /os/resources; fix it; re-check clears
18  edit a published post, unpublish, re-publish     → /news removes then restores it
19  archive an event, unarchive it                   → /events hides then restores it
20  two tabs edit the same post; second save         → 409 CHANGED_ELSEWHERE, no silent clobber
ACT 5 — HANDOVER
21  write a decision record + minutes                → /os/inheritance lists both; files exist; validator passes
22  each of the 6 officers files a handoff           → Today's "handoffs filed" reaches 6/6
23  export the spine zip                             → zip contains every record
24  rollover F26 → S27                               → S27 roster exists, handoff stubs created, About updated
25  sign out                                         → /os redirects with NOT_SIGNED_IN
```
Every step screenshots into `qa/loops/run10/sim/NN-*.png` and asserts a public-side consequence where the
table above names one. The script must pass **9/9 acts, 25/25 steps**. Any step that cannot be performed
through the UI is a bug fixed in §6/§7 — never a step deleted from the script.

## 9. The adversarial pass — `scripts/board_break.mjs` (be a hostile board member)

Each of these must produce a clear, styled, recoverable outcome — never a blank page, a raw stack trace,
a silent no-op, a duplicate row, or a lost draft:

1. Submit every create form **empty** → per-field errors, nothing written.
2. Paste 50 000 characters into a title and a body → length caps enforced with a counter, server rejects too.
3. Slug collisions: create two posts named "Welcome Back" → second gets `welcome-back-2` or a clear error.
4. Unicode, emoji, RTL, `<script>alert(1)</script>`, `"; DROP TABLE posts;--`, and a 4-byte emoji in every
   text field → stored and rendered escaped; the public page shows the literal text.
5. Upload: a 20 MB PNG, a `.exe` renamed `.png`, a 1×1 px image, a corrupt file → each refused with the
   reason; valid uploads resized to 1600 px.
6. Double-click every submit button; hammer Enter 10× in a form → exactly one row.
7. Kill the API mid-write (`make dev` API stopped) → the write lands in the inbox, the UI says
   `SAVED_LOCALLY · WILL_SYNC`, and `/os/audit` replay pushes it when the API returns.
8. Refresh mid-edit; navigate away mid-edit → unsaved-changes guard, draft restored from local storage.
9. Browser back/forward through 10 OS pages, then submit a stale form → 409 or a fresh re-render, no ghost.
10. Expire/clear the session, then click Save → redirect to `/os/login?next=…` with `SESSION_EXPIRED`, the
    form's content preserved and restored after sign-in.
11. Call every write endpoint with `curl` and no token / an officer token / a tampered token → 401/403,
    never 500; assert in pytest.
12. Delete the term that is current; delete an officer who filed a handoff; delete a category that has
    links → each refused with a reason, or cascaded with an explicit warning in the confirm.
13. Set a maintenance banner → public site shows it; clear it → gone.
14. Turn off every feature flag → public pages degrade with a labelled state, nothing 500s.
15. Resize the OS to 390 px and repeat acts 2 and 3 → everything reachable (tables scroll, modals fit).
16. Keyboard only, no mouse, through acts 2 and 3 → completable; axe/pa11y still 0.

`board_break.mjs` reports a table of 16 rows with pass/fail and a screenshot each.

## 10. Backend hardening to match

- Every router gets pytest coverage for: happy path, validation failure, 401, 403, 404, 409 conflict,
  idempotent replay. Target ≥ 90 tests total (44 today).
- Uniform error envelope `{error:{code,message,field?}}`; the UI renders `message` and highlights `field`.
- Rate-limit public writes (project submit, suggestions) to 5/min/IP in-process, with a friendly message.
- Structured logs for every write (actor, entity, action, ms); `/api/health` reports counts + last write.
- Tier-1 store: atomic write (temp file + rename), a `.bak` per file, and a `make restore` that rolls back.

## 11. Gate

1. `42_OS_MATRIX.md` has **zero ❌ and zero ⚠️** (n/a rows carry a one-line reason).
2. `board_sim.mjs` 25/25 in CI; `board_break.mjs` 16/16; existing `make smoke` 9/9 + 12/12 still green.
3. Fonts: grep clean (no Unbounded, no drawn glyphs, no Google CDN), font audit green on 13 routes, the
   Home hero matches `mock_turret.png` in face and weight relationships.
4. `make check` + `make a11y` (0/0) + Lighthouse desktop ≥ 85 on `/` and `/projects`.
5. Tracked repo ≤ 16 MB; newcomer test still ≤ 10 min.
6. Public site unchanged except typography (ui-preservation diff).

## 12. Don'ts

No new fonts beyond `apps/web/src/fonts/` (they are chosen and licensed — do not re-run a search, do not
download more). No Google Fonts CDN. No drawn-glyph alphabet. No LLM, no Discord bot, no second Vercel
function, no keys. No deleting a step from the simulation to make it pass. No optimistic UI. No push.
No questions.

## 13. End of run

Commit per workstream (`feat(type): v5 …`, `feat(os): full CRUD …`, `test(os): semester simulation`,
`test(os): adversarial pass`); write `qa/REPORT_RUN10.md` (the matrix summary before/after, the 25-step
sim table with screenshots, the 16-row break table, font evidence, a11y/Lighthouse numbers),
`docs/archive/context/41_RUN10_LOG.md`, and update `DESIGN.md` (type v5), `CONTRIBUTING.md` (how to add an
entity so it gets full CRUD by default) and `docs/HANDOFF.md` (what the board can now do, in a list).
Print: the gate table, the matrix's before/after counts, and `make dev`.
