# 40 — RUN 10: TYPE v5 (the real game face, everywhere) · THE OS ACTUALLY WORKS (board-behaviour hardening)

Paste everything below into Claude Code (**Opus, xhigh**) opened in `~/Desktop/jjay_css`.
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

Cowork did the font shopping already (§2) and Ryan **approved the result** — the target image is
`~/Desktop/jjay_css_refs/run10/mock_turret.png` ("it's the vibe"). Nothing about the face is open.

Two workstreams, in this order. B is the bigger half; do not let A eat its budget.

| # | Workstream | Deliverable | Time box |
|---|---|---|---|
| **A** | **TYPE v5** | Turret Road / Michroma / Martian Mono on every surface, public + OS; Unbounded and the drawn alphabet deleted | 70 min |
| **B** | **OS HARDENING** | Every entity fully editable, every control alive, every failure handled — proven by a 25-step semester simulation and a 16-case adversarial pass, both in CI | 140 min |

**Budget 220 min** (+10 for the report). Checkpoints every 30 min into
`docs/archive/context/41_RUN10_LOG.md` with: minutes used, what shipped, what you decided without asking.
No questions. Ambiguity → the option a board member with no dev background would expect; log it.
`make check` green at every commit; commit at every phase boundary.

**Hard rules, unchanged:** one Vercel function (`api/index.py` + `api/_core/`, guarded by
`scripts/check_api_count.py`), no API keys, no LLM, no Discord bot, Tier 1 always works (`make dev` with
zero accounts), John Jay palette only, no cream, no `border-radius > 4px`, never push, never write outside
this folder.

**Read before touching anything (≤ 10 min):** `README.md`, `ARCHITECTURE.md`, `CONTRIBUTING.md`,
`DESIGN.md`, **`apps/web/src/fonts/FONTS.md`** (new — the faces and the reasoning),
`docs/archive/context/37_RUN9_PROMPT.md` §2–§6, `qa/REPORT_RUN9.md`, `docs/SKILLS_ADOPTED.md`,
`docs/LATER.md`, `docs/RUNBOOK.md`. Then run `make dev` and `make check` once so you know the baseline is
green before you change it.

---
---

# WORKSTREAM A — TYPE v5

## 1. Why run 9's typography failed (verify each; one line per item in the log)

1. **The drawn SVG alphabet reads as wireframe tubing, not a typeface.** Open
   `qa/loops/run9/home-hero-a.png`: "YOUR MIND," is a double-stroked skeleton — a CAD path, not hollow
   type. `apps/web/src/type/glyphs/` is the culprit.
2. **It only covered ≤ 12 words.** Everything else stayed Unbounded, so the face never persisted: Home
   reads drawn-alphabet, `/projects` reads Unbounded (`PROJECTS. BUILT`). Two systems, one site — exactly
   the "never persisted across the entire site" complaint.
3. **Unbounded is the wrong species.** Rounded geometric: circular bowls, no chamfers, no squared counters.
   The reference is a squared, chamfered, extended monoline. Weight does not fix species.
4. **`tokens.css:31–38` still points `--font-display`, `--font-wide` and `--font-pixel` all at Unbounded**,
   and `--font-mono-display` at Space Mono. Four roles, one wrong face, one wrong mono.

## 2. The faces — downloaded, match-tested, committed, approved. Do not go shopping again.

Cowork match-tested 50 free families (107 weight renders) against the DEMON crop, then judged the
shortlist by eye setting the real hero copy. Files are in **`apps/web/src/fonts/<family>/*.woff2`** with
their SIL OFL `LICENSE` beside them; **`apps/web/src/fonts/FONTS.md`** records the choice and the reasons.
Evidence in **`~/Desktop/jjay_css_refs/run10/`**:

- `mock_turret.png` — **the acceptance target.** Home hero + CYBER/HOUNDS + fin + brandmark in the new
  faces. Ryan approved this image. Open it first; §3.6 gates against it.
- `demon_compare.png` — the reference DEMON overlaid against the 10 closest free faces.
- `spec_sheet.png` — 24 display faces setting the real hero copy.
- `mono_sheet.png` — 12 monos setting the real dek.

```
--font-display:      "Turret Road"    200 300 400 500 700 800
--font-display-wide: "Michroma"       400
--font-mono-display: "Martian Mono"   400 500 600 700
--font-mono:         "JetBrains Mono" (unchanged)
--font-body:         "Space Grotesk"  (unchanged)
--font-os-display:   "Silkscreen" 700 | "VT323"   → decide in §3.5
--font-legacy:       "VT323"          (binary rings, ticker digits only)
```

**Turret Road is the face.** The only free family with the DEMON skeleton — extended, monoline,
**45° chamfered corners**, squared counters, shallow-V `M` — *and* a real weight range, which is what makes
solid + hollow pairs work. Michroma is wider but single-weight → display-only. Martian Mono is the wide
technical mono that produces the reference's body register.

**Delete, this run:**
- `apps/web/src/type/glyphs/` (whole folder) and every `<S01Word>` / glyph-path import.
- The Unbounded font package, its `@font-face` rules, and every token/class pointing at it.
- Any `Familjen Grotesk`, `Chakra Petch`, `Space Mono` leftovers.
- Gate: `grep -riE "unbounded|S01Word|type/glyphs|familjen|chakra|space mono|fontsource|fonts\.googleapis" apps/web src index.html` → **0 hits**.

Orbitron 700–900 ships as a **reserve**: if exactly one poster band reads too light in Turret Road 800,
that band may use Orbitron 900 — logged in `41_RUN10_LOG.md`, never two display faces on one page. If
unused, leave the files; FONTS.md explains why they are there.

## 3. Apply it

### 3.1 Loading (`apps/web/src/fonts/fonts.css`, new)
One `@font-face` per file: `font-family`, `font-style: normal`, `font-weight: <n>`, `font-display: swap`,
`src: url("./turret-road/turret-road-latin-800-normal.woff2") format("woff2")`, and the latin
`unicode-range`. Imported once from `main.tsx` **before** `tokens.css`. No `@fontsource` imports, no CDN
link, no `<link rel=preconnect>` to Google. Preload the two above-the-fold faces in `index.html`:
`turret-road-latin-800`, `martian-mono-latin-500` (`<link rel=preload as=font type=font/woff2 crossorigin>`).
Self-host check: `npm run build && grep -r "googleapis" apps/web/dist` → 0.

### 3.2 Tokens (`apps/web/src/tokens.css:31–38` — replace the block)
```css
--font-display:      "Turret Road", system-ui, sans-serif;
--font-display-wide: "Michroma", "Turret Road", sans-serif;
--font-mono-display: "Martian Mono", "JetBrains Mono", ui-monospace, monospace;
--font-mono:         "JetBrains Mono", ui-monospace, monospace;
--font-body:         "Space Grotesk", system-ui, sans-serif;
--font-os-display:   /* §3.5 */;
--font-legacy:       "VT323", monospace;
```
Delete `--font-wide` and `--font-pixel` (dead aliases); update every consumer. Keep `.font-display` etc.
utility classes but repoint them.

### 3.3 Scale (`apps/web/src/type.css`) — Turret Road is ~8 % wider than Unbounded at the same px, so re-fit
```
--type-hero    clamp(52px, 8.8vw, 148px)  w800  lh .92  ls -.03em   uppercase
--type-poster  clamp(76px, 14vw, 240px)   w800  lh .88  ls -.04em   uppercase, always EdgeCrop
--type-h1      clamp(40px, 6vw, 96px)     w800  lh .94  ls -.025em  uppercase
--type-h2      clamp(28px, 3.6vw, 48px)   w700  lh .98  ls -.02em
--type-h3      clamp(19px, 2vw, 26px)     w700 display | w600 mono-display
--type-stat    clamp(44px, 5.6vw, 88px)   w800  tabular-nums slashed-zero
--type-dek     17px/1.6   mono-display 500  ls .03em  UPPERCASE  max 62ch
--type-body    16px/1.65  Space Grotesk     sentence case — paragraphs > 3 lines only
--type-label   11px       mono-display 500  ls .14em  uppercase
--type-micro    9px       JetBrains Mono    ls .12em  uppercase
```
`font-feature-settings: "tnum","zero"` on every numeral context; `text-rendering: geometricPrecision` on
display.

### 3.4 Treatments (`apps/web/src/components/type/*` — behaviour unchanged, values re-tuned for the face)
- `Outline.tsx`: stroke **3px** on dark, **3.5px** on paper (the approved mock uses 3px — thinner vanishes
  against the chamfers). Ghost copies offset 6px.
- `Stencil.tsx`: bars at **4.5 %** of cap height, at 38 % and 64 % of cap height.
- `SplitFill.tsx`, `EdgeCrop.tsx`, `Wireframe.tsx`, `Decode.tsx`, `Label.tsx`: unchanged logic; verify each
  still renders correctly with the new metrics (Decode's char cycling must still land on
  `data-decode-done` within 600 ms after `document.fonts.ready`).
- The hollow/solid/two-colour compositions Ryan likes stay **exactly as composed**. Only the face changes.

### 3.5 The OS realm face
Render `BOARD ACCESS` and `INHERITANCE` at 72 px in both **Silkscreen 700** and **VT323**, screenshot both
into `qa/loops/run10/os_face.png`, look at them, keep the one that reads chunkier and cleaner against the
T03 reference (`~/Desktop/jjay_css_refs/run9/R9_02_permitify_T03_login_layout.png`). Silkscreen 700 is the
expected winner. Log the choice with the reason. Then: OS page titles + login headline →
`--font-os-display`; tile labels/captions → Martian Mono 500; KPI numerals → Turret Road 800 tabular;
tables, rail tooltips, form inputs → JetBrains Mono.

### 3.6 Every surface, no exceptions
Re-set and re-shoot: `/`, `/projects`, `/events`, `/cyberhounds`, `/about`, `/resources`, `/news`,
`/news/:slug`, `/join`, `/404`, `/styleguide`, `/os/login`, and all 11 OS routes.
Component sweep — every one of these must be checked and corrected by hand, not assumed:
`Nav`, `NavOverlay`, `Footer`, `PageHero`, `DossierHero`, `Band`, `SectionIndex`, `PosterBand`, `FinLine`,
`Marquee`, `MonoLabel`, `Pullquote`, `PhotoFrame`, `Pennant`, `MapCard`, `BarcodeStrip`, `BinaryRings`,
`Button`, and every card in `components/cards/` (`FolderCard`, `IndexList`, `Meter`, `PosterCard`,
`SlotCard`, `SpecSheet`, `StatChip`, `StatusChip`, `Tag`, `TicketCard`), plus `os/ui/*`
(`Bento`, `Dashboard`, `DossierCard`, `OsForm`, `OsPage`, `OsTable`, `SpineRecord`, `SubjectSheet`,
`TopStrip`, `TraceStrip`, `Upload`).

Rules that must hold everywhere after the swap:
- Nothing ≥ 28 px is in any face but Turret Road (or Michroma where §2 assigns it).
- Every dek / protocol line / ticker / readout / OS label is Martian Mono uppercase; only long article body
  and About prose stay Space Grotesk sentence-case.
- No headline gains a line vs run 9 — re-fit by size, never by switching face.
- No orphan words in any headline; no horizontal scroll at 390 / 768 / 1024 / 1440 / 1920.
- `node scripts/font_audit.mjs` passes on all 13+ routes with the per-realm sets from run 9, updated to
  the new families.

### 3.7 Gate for A
1. Side-by-side of `mock_turret.png` and the rebuilt Home hero at 1440 → same face, same weight
   relationships, same dek register (put the pair in `qa/loops/run10/type_target.png`).
2. `grep` gate from §2 → 0 hits. Build gate from §3.1 → 0 hits.
3. `font_audit` green; `ui-preservation` diff vs run 9 shows glyph changes only (no layout moves beyond
   line-break shifts).
4. `/styleguide` gains a **TYPE v5** specimen: every role at its size, the six treatments, the label
   grammar, and a link line to the four evidence images.

---
---

# WORKSTREAM B — THE OS ACTUALLY WORKS

## 4. The standard (this is the bar; everything below serves it)

**Every control a board member can see does something, and every entity can be created, read, updated,
archived and — where safe — deleted, from the UI, in Tier 1 and Tier 2, with the consequence visible on
the public site where one belongs.**

- No dead buttons. No read-only table that should be editable. No "coming soon".
- No control that only works on the happy path.
- If a surface genuinely cannot support an action, the control is **not rendered**, and the page's
  "what is not here, and why" block says so in one line.

## 5. Inventory first — `docs/archive/context/42_OS_MATRIX.md` (≤ 20 min, before any code)

A row per **entity** × a column per **action**:
`list · view · create · edit · publish/unpublish · archive · delete · reorder · bulk · export · undo`
Each cell: `✅ works` / `⚠️ partial — what's missing` / `❌ absent` / `n/a — why`.

Entities (19): post, project, event, **workshop**, resource category, resource link, site link, member,
officer/board seat, term, inheritance record, handoff, site setting, feature flag, ticker item, ownership
row, audit record, inbox item, upload.

**Derive the truth by clicking every control in the running app**, not by reading code. Known starting
facts, to save you time — verify and extend them:
- `data/workshops.json` and `data/workshops.schema.json` exist, but there is **no** `api/_core/routers/
  workshops.py` and **no** `OsWorkshops` surface. Workshops are currently read-only JSON. Ryan named
  workshops explicitly. They become a first-class entity this run.
- `data/terms.json` + `terms.local.json` exist; terms are handled inside `board.py` — confirm every term
  action (create, edit dates, set current, rollover, undo-before-confirm) actually exists.
- Routers present: `audit, board, events, inheritance, members, posts, projects, public, resources,
  settings, spine, uploads`. Anything an entity needs that no router provides is a gap.

Every `⚠️` and `❌` becomes a task in §6/§7. This matrix is the literal answer to "you can't edit this, that".

## 6. Cross-cutting rules — apply to every entity, implement once in shared code

Put these in `os/ui/OsForm.tsx`, `os/ui/OsTable.tsx`, `os/ui/useOs.ts`, and `api/_core/crud.py` so a new
entity inherits them (and document that in `CONTRIBUTING.md` per §13).

1. **Full CRUD.** List → detail → edit → save, plus create and archive. **Delete** only where losing the
   row is safe: resource link, site link, ticker item, draft post, unsubmitted upload, inheritance draft.
   Everything else **archives** — a visible `ARCHIVED` chip, hidden from public reads, with `UNARCHIVE`.
   Archive and delete both use a typed confirm (`type DELETE to confirm`) and both write an audit record.
2. **Inline edit where a board member expects it.** Any field rendered in a `SpecSheet` row is
   click-to-edit: Enter saves, Esc cancels, the row shows `SAVING…` then `SAVED ✓` for 1.2 s, then the new
   value. Tables get a row action menu: `EDIT · DUPLICATE · ARCHIVE` (+ `DELETE` where allowed).
3. **Validation server-side first** (pydantic), mirrored client-side so the user sees it before submit.
   Every field prints its rule as a micro line *before* it is broken:
   `slug — lowercase, digits, dashes; must be unique`. Errors render beside the field in
   `--color-red` **and** as a summary chip at the top of the form listing each bad field as a jump link.
4. **Optimistic UI is banned.** On submit the button becomes `disabled` + `SAVING…`; requests carry a
   client-generated `client_id` so replays are idempotent; double-click and Enter-spam produce exactly one
   row. The UI only shows the new state after the server confirms it.
5. **Empty states are real.** Zero rows renders a `SlotCard` saying what this is, why it's empty, and the
   action that fills it — never a blank panel, never a bare `0` with no context.
6. **Every write mirrors outward.** Tier 2 → the DB; Tier 1 → `data/*.local.json` + `.cache/inbox/`. After
   any publish the OS shows where it landed as a real link: `→ /news/welcome-back ↗`.
7. **Undo where cheap.** After publish / unpublish / archive / delete, a toast holds `UNDO` for 8 s and
   POSTs the inverse, audited as `undo`.
8. **Keyboard.** ⌘/Ctrl+Enter submits any form; Esc closes modals and cancels inline edits; ⌘K opens the
   launcher; tables are arrow-navigable with Enter to open; focus is trapped in modals and returned to the
   trigger on close; every interactive element has a visible focus ring. `make a11y` stays 0/0.
9. **Permissions enforced twice.** `officer` may not: change roles, run rollover, edit site settings or
   ownership, delete anything, or replay the inbox. The UI hides those controls **and** the API returns 403.
   Both are tested.
10. **Concurrency.** Every update sends the row's `updated_at`; a stale write returns **409** with
    `{error:{code:"conflict"}}`, and the UI shows `CHANGED_ELSEWHERE — reload · overwrite` with a diff of
    the two versions. Never a silent clobber.
11. **Uploads** (`os/ui/Upload.tsx`, `routers/uploads.py`): accept jpg/png/webp ≤ 2 MB, resize longest edge
    to 1600 px server-side (Pillow), strip EXIF, reject anything else by sniffing magic bytes (not the
    extension), show a progress state, and support **replace** and **remove** on every image field.
12. **Every list gets**: text search, the entity's status filter chips, a sort control, a result count, and
    `EXPORT CSV` (client-side from the loaded rows).

## 7. Per-entity work (minimum — the matrix may add more)

**Posts** (`OsPosts.tsx`, `routers/posts.py`) — cover image upload/replace/remove; slug edit with a live
uniqueness check; unpublish; archive/unarchive; delete draft; duplicate; `PREVIEW ↗` opening the public
article layout; word count + reading time; markdown toolbar (bold, italic, link, H2, list, code) inserting
at the cursor with selection preserved; scheduled-at is **not** built (say so in "what is not here").

**Projects** (`OsProjects.tsx`, `routers/projects.py`) — the full review loop:
`submitted → in_review → changes_requested → (resubmit) → approved → published → archived`, every
transition audited, a **required** note on `changes_requested`, the note shown to the next reviewer and
returned by the public submission API so the student sees it on resubmit; screenshots add/remove/reorder;
`featured` toggle with a hard max of 3 (the 4th attempt is refused with a message naming the three);
`display_order` via `▲▼`; every field of a published project editable; "add on behalf of a student".

**Events** (`OsEvents.tsx`, `routers/events.py`) — create/edit/publish/archive/duplicate-for-next-term;
flyer upload/replace/remove; date **and** time with an explicit `America/New_York` note; location; optional
RSVP link; link a recap post; `upcoming` vs `past` derived from the date, never a manual flag; the public
`/events` and Home band both update.

**Workshops** — **new first-class entity this run.** Add `api/_core/routers/workshops.py`, a
`workshops` table in `supabase/migrations/0003_workshops.sql`, `data/workshops.local.json` for Tier 1, and
an `OsWorkshops` surface (or a clearly-labelled second tab inside `OsEvents` — your call, logged). Fields:
`title, series, session_no, date, time, location, level (intro|intermediate), description_md, materials[]
{label,url}, recording_url?, status`. Public: the Events page grows a **Workshops** section grouped by
series, and the Resources page's "starter kits" can link to a series. Full CRUD per §6.

**Resources** (`OsResources.tsx`, `routers/resources.py`) — add/edit/delete a link; add/rename/reorder/
delete a category; move a link between categories; **bulk paste** (one URL per line → parsed preview rows
→ confirm); re-check one link; check all with a progress `Meter`; dead-only filter; the site links
(Discord invite, Google Form, Linktree, MSRC, PRISM, YouTube) editable in place with a **"used on"** list
showing every public surface that renders each one.

**Members** (`OsMembers.tsx`, `routers/members.py`) — add/edit/archive; CSV import with dry-run diff →
commit → **undo-last-import**; CSV export; bulk status transition honouring the allowed-transition map
(and refusing the rest with the reason); merge duplicates (choose the survivor, audited, keeps both
handles); free-text notes; tags add/remove with autocomplete over existing tags.

**Board / terms** (`OsBoard.tsx`, `routers/board.py`) — add/edit/remove an officer; change a seat's role;
set `os_role`; photo upload; reorder seats; create a term; edit term dates; set current term; the
**rollover wizard** must be fully reversible before the final confirm (step back re-renders prior choices)
and fully audited after; the public About page and the term history accordion reflect every change
immediately.

**Inheritance** (`OsInheritance.tsx`, `routers/inheritance.py` + `spine.py`) — create/edit/delete in all 8
record types; template loads on type select; frontmatter form + markdown body with live preview; owners
multi-select from the current roster; links add/remove; `supersedes` picker listing existing records;
`scripts/validate_inheritance.py` runs on save and **blocks** with a readable message naming the field;
export zip; the list is filterable by **type** and **term** and searchable by title.

**Site settings** (`OsSite.tsx`, `routers/settings.py`) — every key editable with the right control:
string, string-list (add/remove/reorder), boolean, small JSON object; ticker items editor; maintenance
banner toggle + text with a **live preview of the public banner**; feature flags each with a one-line
"what this turns off"; changing any key is audited with before/after.

**Audit** (`OsAudit.tsx`, `routers/audit.py`) — filter by actor, table, action and date range; open a row
→ before/after JSON diff side by side with changed keys highlighted; export CSV; inbox replay per item and
"replay all" with a result summary (`12 replayed · 1 failed — see reason`).

**System** (`OsSystem.tsx`) — every health check runnable on demand with a spinner and a real result;
`RUN SNAPSHOT` button; keepalive status; ownership rows editable inline; every red state links to its
`docs/RUNBOOK.md` section anchor.

## 8. `scripts/board_sim.mjs` — the semester simulation (the run's headline artifact)

One Playwright script, Tier 1, from an **empty local store** (`make restore-empty` or equivalent fixture),
playing a whole semester as the board and asserting the **public** consequence at each step. Runs in CI
(`make sim`). Screenshots to `qa/loops/run10/sim/NN-*.png`.

```
ACT 1 — TAKING OVER
 01 sign in (LOCAL_DEV admin)                          → /os renders; ticker shows TERM F26
 02 create term F26 with dates, set current            → /about shows F26
 03 add 6 officers (2 with photos, 1 admin, 1 typo'd then corrected inline)
 04 fill the 9-row ownership sheet                     → /os/system ownership no longer red
 05 sign in as OFFICER (seat 6)                        → admin controls absent AND API 403 on each
ACT 2 — THE SEMESTER RUNS
 06 publish post "WELCOME BACK"                        → /news lists it; /news/<slug> renders
 07 create event "FIRST GENERAL MEETING" + flyer       → /events upcoming + Home events band show it
 08 create workshop series "INTRO TO GIT", 3 sessions  → /events workshops section groups all three
 09 change the Discord invite link                     → public footer AND /join show the new URL
 10 add 2 resource links, rename a category, reorder   → /resources reflects all three changes
 11 import 40 members (dry-run → commit)               → count 40; undo-last-import → 0; re-import → 40
 12 transition 6 members interested → member           → status meters update; 6 audit rows exist
ACT 3 — A STUDENT SHIPS SOMETHING
 13 submit a project from the PUBLIC form              → appears in /os/projects as submitted
 14 request changes with a note                        → status changes_requested; note visible
 15 resubmit from the public form, same slug           → back to submitted; history preserved
 16 approve → publish → feature                        → /projects Featured shows it; a 4th feature refused
ACT 4 — THINGS GO WRONG
 17 link-check with one dead URL                       → dead chip on /os/resources; fix; re-check clears
 18 edit a published post → unpublish → re-publish     → /news removes then restores it
 19 archive an event → unarchive                       → /events hides then restores it
 20 two tabs edit the same post; second saves          → 409 CHANGED_ELSEWHERE; no clobber
ACT 5 — HANDOVER
 21 write a decision record + meeting minutes          → both list on /os/inheritance; files exist;
                                                          validate_inheritance passes
 22 all 6 officers file a handoff                      → Today shows handoffs 6/6
 23 export the spine zip                               → zip contains every record written this run
 24 rollover F26 → S27                                 → S27 roster exists; handoff stubs created;
                                                          /about shows S27 as current, F26 in history
 25 sign out                                           → /os redirects to login with NOT_SIGNED_IN
```
**25/25 must pass.** A step that cannot be performed through the UI is a bug to fix in §6/§7 — never a
step to delete. If a step needs seed data, the script creates it through the UI like a human would.

## 9. `scripts/board_break.mjs` — the adversarial pass (be a hostile board member)

16 cases; each must end in a clear, styled, recoverable outcome — never a blank page, a raw stack trace, a
silent no-op, a duplicate row, or a lost draft. Report a 16-row table with pass/fail + a screenshot each.

```
 01 submit every create form empty                → per-field errors; nothing written
 02 50,000 chars into a title and a body          → counter + cap client-side; server rejects too
 03 two posts named "Welcome Back"                → welcome-back-2 or a clear, actionable error
 04 unicode, emoji, RTL, <script>alert(1)</script>,
    "; DROP TABLE posts;--  in every text field   → stored; rendered escaped; public shows literal text
 05 upload 20 MB png / .exe renamed .png /
    1×1 px / truncated file                       → each refused with the specific reason
 06 double-click every submit; Enter ×10          → exactly one row each time
 07 stop the API mid-write                        → SAVED_LOCALLY · WILL_SYNC; /os/audit replay pushes it
                                                     when the API returns; no duplicate after replay
 08 refresh and navigate away mid-edit            → unsaved-changes guard; draft restored
 09 back/forward through 10 OS pages, submit a
    stale form                                    → 409 or fresh re-render; no ghost row
 10 clear the session then Save                   → /os/login?next=… with SESSION_EXPIRED; the form's
                                                     content is preserved and restored after sign-in
 11 curl every write endpoint: no token, officer
    token, tampered token                         → 401/403, never 500 (assert in pytest too)
 12 delete the current term; delete an officer who
    filed a handoff; delete a category with links → refused with a reason, or cascaded with an explicit
                                                     warning naming what else will go
 13 set a maintenance banner, then clear it       → public site shows it, then doesn't
 14 turn off every feature flag                   → public pages degrade with labelled states; no 500s
 15 OS at 390 px: repeat acts 2 and 3             → everything reachable; tables scroll; modals fit
 16 keyboard only, no mouse: acts 2 and 3         → completable; axe/pa11y still 0
```

## 10. Backend hardening (`api/_core/`)

- **Tests**: every router covered for happy path, validation failure, 401, 403, 404, 409 conflict, and
  idempotent replay. **≥ 90 tests total** (44 today). Keep them in `api/_core/tests/`, runnable by `pytest`.
- **Uniform error envelope** `{"error":{"code","message","field"?}}` from every endpoint; the UI renders
  `message` and highlights `field`. No bare strings, no HTML error pages.
- **Rate limit** public writes (project submit, suggestion, chat) to 5/min/IP in-process, returning 429
  with a friendly message; the public form shows it inline.
- **Structured logs** for every write: actor, entity, action, ms, tier. `/api/health` reports row counts
  per table, last write time, tier, and the build SHA.
- **Tier-1 store durability** (`api/_core/store.py`): write to a temp file then `os.replace` (atomic),
  keep one `.bak` per file, and add `make restore` to roll back the last write plus `make restore-empty`
  for the sim's clean fixture.
- **`scripts/validate_data.py`** extended: every referenced project/event/post/member/term id resolves;
  no dangling image paths; every public JSON validates against its schema. Wired into `make check`.

## 11. Gate (all must be true before the report)

1. `42_OS_MATRIX.md` has **zero ❌ and zero ⚠️**; every `n/a` carries a one-line reason.
2. `board_sim.mjs` **25/25** and `board_break.mjs` **16/16**, both in CI; existing `make smoke`
   (functional 9/9, OS gate 12/12) still green.
3. Fonts: §2 grep gate 0 hits, §3.1 build gate 0 hits, `font_audit` green on every route, and
   `qa/loops/run10/type_target.png` shows the hero matching `mock_turret.png`.
4. `make check` green; `make a11y` 0/0; Lighthouse desktop ≥ 85 on `/` and `/projects`.
5. Tracked repo ≤ 16 MB; `scripts/newcomer_test.sh` still ≤ 10 min.
6. Public site unchanged except typography (`ui-preservation` diff).
7. ≥ 90 pytest + ≥ 25 vitest passing.

## 12. Don'ts

No new fonts beyond `apps/web/src/fonts/` — they are chosen, licensed and approved; do not re-run a search
or download more. No Google Fonts CDN. No drawn-glyph alphabet. No LLM, no Discord bot, no OAuth app, no
second Vercel function, no service key in the browser, no keys of any kind. No optimistic UI. No deleting
a simulation step to make it pass. No moving the R9_06 bento tiles. No `border-radius > 4px`. No push.
No questions.

## 13. End of run

Commit per phase: `feat(type): v5 — Turret Road/Michroma/Martian Mono everywhere`,
`feat(os): full CRUD across all entities`, `feat(os): workshops as a first-class entity`,
`test(os): semester simulation 25/25`, `test(os): adversarial pass 16/16`, `chore: report`.

Write:
- `qa/REPORT_RUN10.md` — the matrix before/after counts, the 25-step sim table with screenshot paths, the
  16-row break table, the font evidence (target vs result), a11y/Lighthouse/test numbers, what was cut.
- `docs/archive/context/41_RUN10_LOG.md` — every decision made without asking, one line each.
- `docs/archive/context/42_OS_MATRIX.md` — final state.
- Update `DESIGN.md` (type v5 section, replacing v4), `CONTRIBUTING.md` (**"adding an entity"** — the
  checklist that makes a new entity inherit §6 automatically), `docs/HANDOFF.md` (what the board can now
  do, as a plain list a non-developer can read), `apps/web/src/fonts/FONTS.md` (mark the OS face decision).

Print at the end: the gate table, the matrix before/after counts, the sim and break results, and
`make dev`.
