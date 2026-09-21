# CONTRIBUTING.md — how to change things

Everything here assumes `make dev` is running and `make check` is green before you start (README.md § "Run it
in 10 minutes"). Never commit secrets or `data/*.local.json`. One accent per section (DESIGN.md).

## The loop

| Step   | Command / rule                                                                                                                                                                                                                 |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Branch | `git checkout -b <type>/<short-name>` — `feat/`, `fix/`, `docs/`, `content/`, `refactor/`, `chore/`                                                                                                                            |
| Commit | Conventional Commits, linted by commitlint on the PR: `feat(os): …`, `fix(api): …`, `docs: …`, `content: …`, `inheritance: …`, `refactor(web): …`, `chore: …`. One change per commit; the subject says what the code does now. |
| Check  | `make check` before every push. UI change: also `make a11y`. OS or API write change: also `make smoke` and `make sim`.                                                                                                         |
| PR     | the template: what · why · how verified · which gate covers it · docs updated? Screenshots for UI.                                                                                                                             |
| Review | see "The review process" below                                                                                                                                                                                                 |

## What `make check` runs, and how to read each failure

| Tool (in order)                         | It failed — what it means                                                                                                             | Fix                                                                      |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `ruff check api scripts`                | Python lint: unused import, line > 200, function too complex (C901), too many parameters (PLR0913)                                    | `ruff check --fix` for the mechanical ones; split the function otherwise |
| `oxlint` (apps/web)                     | TS/React lint: `max-lines-per-function` 40, `max-params` 3, `complexity` 10, `max-lines` 300, TODO without an issue link, unused vars | split the function or the file; open an issue for the TODO               |
| `prettier --check`                      | formatting                                                                                                                            | `make format`                                                            |
| `stylelint`                             | CSS: a literal colour or font, a bad property                                                                                         | use a token from `tokens.css`                                            |
| `markdownlint`                          | a doc: list style, heading level, trailing space                                                                                      | the rule id is in the message; `.markdownlint.json` lists what is off    |
| `mypy --strict`                         | a Python type hole (`Any` leak, missing return type)                                                                                  | annotate; never `# type: ignore` without a reason                        |
| `tsc --noEmit`                          | a TypeScript error                                                                                                                    | read the first error; the rest usually follow from it                    |
| `pytest`                                | an API test (146): the message names the request and the assertion                                                                    | run one file: `.venv/bin/python -m pytest api/_core/tests/test_x.py -q`  |
| `vitest run`                            | a web unit test (19)                                                                                                                  | `npx vitest run --reporter verbose` in `apps/web`                        |
| `audit:routes / images / tokens / repo` | a dead internal link, a missing image, a literal club name / hex / font in code, a stray file                                         | the report names the file:line                                           |
| `env_validate.py`                       | Tier 2 half-configured in your shell                                                                                                  | set all five Supabase variables or none                                  |
| `gen_api_docs.py` + `git diff`          | "docs/API.md changed — commit it"                                                                                                     | you changed an endpoint: `make api-docs`, commit the file                |
| `check_api_count.py`                    | a second file under `api/`                                                                                                            | move it into `api/_core/`                                                |
| `validate_data.py`                      | a `data/*.json` file breaks its schema                                                                                                | the message names the key                                                |
| `validate_inheritance.py`               | a record under `content/inheritance/` breaks the frontmatter contract                                                                 | `docs/handoff/07_INHERITANCE.md`                                         |
| `check_migrations.py`                   | a migration is misnumbered, empty, or drops without a `-- guard:`                                                                     | `docs/HOSTING_LIMITS.md` § 3                                             |
| `check_assets.mjs`                      | a non-WebP/SVG or > 400 KB under `public/img`, an unreferenced file, an `<img>` without width/height/loading/decoding                 | `docs/HOSTING_LIMITS.md` § 2                                             |
| `jscpd`                                 | duplicated code above 1.5 %                                                                                                           | extract to `os/ui/*`, `lib/*` or `_core/*` — never copy a block          |
| `banned_names.mjs`                      | a name from the banned list (`data`, `info`, `temp`, `handleStuff`, `kb`…)                                                            | `docs/CODE_STANDARDS.md` § Naming                                        |
| `ts-prune` / `depcheck`                 | an exported symbol nobody imports / a dependency nobody uses                                                                          | un-export it or delete it                                                |

## 1. Add a public page

Example: `/workshops`.

1. `apps/web/src/pages/Workshops.tsx` — export default a component built from
   `PageHero` + `Band`s + cards. Copy `pages/Resources.tsx` as the pattern.
2. `App.tsx`: `const Workshops = lazy(() => import("@/pages/Workshops"));` and
   `<Route path="workshops" element={<Workshops />} />`; add its accent to
   `ACCENT_BY_PATH`.
3. Nav: add `{ to: "/workshops", label: "WORKSHOPS" }` in `components/Nav.tsx`
   and `NavOverlay.tsx`; footer list in `components/Footer.tsx`.
4. Data: `import workshops from "@data/workshops.json"` and read it through
   `useApi("/api/workshops", workshops)` if the OS will edit it (see §3).
5. `qa/loops/parity.md`: one row if it replaces something from the old site.

## 2. Add a data field

Example: `events.rsvp_url` (already there — follow the same trail).

1. `data/events.json` (+ `events.schema.json` if required) — the Tier-1 shape.
2. `api/_core/models.py` → `EventIn.rsvp_url: str | None` — the validator.
3. `api/_core/seeds.py::events()` — map the JSON field onto the row.
4. `api/_core/routers/public.py::events()` — put it in the public shape.
5. `supabase/migrations/000N_*.sql` — `alter table … add column`.
6. OS form: add the field to `FIELDS` in `os/OsEvents.tsx`.
7. Page: use it in `pages/Events.tsx`. `make check` (schemas + types).

## 3. Add an API endpoint

Example: `GET /api/os/events/upcoming`.

1. In `api/_core/routers/events.py`:
   ```python
   @r.get("/upcoming")
   def upcoming(actor: Actor = Depends(require_role("officer"))) -> dict[str, Any]:
       rows = [e for e in C.events.list(status="published") if e.get("when") == "upcoming"]
       return {"ok": True, "rows": rows}
   ```
   Reads use `C.<collection>.list/get`; writes use `.create/.patch/.delete`
   (they audit and fall back to Tier 1 by themselves). Public endpoints go in
   `routers/public.py` and take no `actor`.
2. A test in `api/_core/tests/test_os.py`: happy path + one auth failure.
3. Never add a file to `api/` top level — CI fails (that would be a second
   Vercel function).

## 4. Add an OS module

Example: `/os/sponsors`.

1. Table: `supabase/migrations/000N_sponsors.sql`; Tier-1 seed in
   `api/_core/seeds.py` (return `[]` or map a `data/sponsors.json`);
   register `sponsors = Collection("sponsors", seeds.sponsors)` in
   `api/_core/collections.py`.
2. Model `SponsorIn` in `models.py`; router `routers/sponsors.py`:
   `r = make_router("/os/sponsors", C.sponsors, SponsorIn)` + any actions;
   include it in `api/index.py`.
3. Page `apps/web/src/os/OsSponsors.tsx`: `OsPage` + `useOsList("/api/os/sponsors")`
   - `OsTable` + `Panel` with `OsForm` — copy `os/OsResources.tsx`. End with the
     "What is not here, and why" list (required).
4. Route in `App.tsx` under `os/`; nav entry in `os/OsLayout.tsx::OS_MODULES`.
5. Tests (§3) and shots (`node qa-scripts/shoot_os.mjs`).

## 4b. Add an entity (so it inherits every run-10 §6 behaviour automatically)

Example: `/os/workshops` (added in run 10 exactly this way).

1. **Model** — `api/_core/models.py`: `class WorkshopIn(WriteMeta)` — subclassing `WriteMeta` gives the
   row `client_id` (idempotent creates) and `expected_updated_at` (409 on stale saves). Put the field
   rules in the model (`Field(min_length, max_length, ge/le)`, `Literal[...]`); the error envelope names
   the field for the UI.
2. **Seed + collection** — `seeds.py::workshops()` maps `data/workshops.json`; `collections.py`
   registers `workshops = Collection("workshops", seeds.workshops)` and adds it to `ALL`.
3. **Router** — `routers/workshops.py`: `r = make_router("/os/workshops", C.workshops, WorkshopIn,
transitions="workshops")` — list/get/create/patch/delete/transition/**archive/unarchive/duplicate**
   arrive for free; add only the entity's own actions (`publish`). Lifecycle in `lifecycle.py`.
   Include the router in `api/index.py`. Public read in `routers/public.py`.
4. **Migration** — `supabase/migrations/000N_<entity>.sql` (+ `client_id`, `archived_from`, `updated_at`).
5. **Page** — `apps/web/src/os/OsWorkshops.tsx`: `useOsList` + `useEntity(base, {name, reload, publicHref,
deletable})` gives save (409-aware), publish/unpublish, archive/unarchive with typed confirms, duplicate,
   delete, toasts with UNDO. Render `ListTools` (search · sort · count · CSV), `OsTable` with
   `actions={E.actions(open, extra)}` and an `Empty` state, `OsForm` with `max`/`pattern`/`required`
   rules and `draftKey` (⌘↵ submit, unsaved guard, draft restore) inside a `Panel` (focus-trapped, Esc).
   Add the module to `OS_MODULES` + `SIGIL` in `OsLayout.tsx`, a route in `App.tsx`, a spec in
   `ui/specs.ts` for the dashboard face.
6. **Tests** — add the entity to `ENTITIES` in `api/_core/tests/test_hardening.py` (roundtrip · 422 ·
   401 · 404 · 409 · client_id · archive/duplicate come parametrised) and a step to `scripts/board_sim.mjs`.

## 5. Write an inheritance record (board knowledge, not code)

CSS OS → Inheritance → pick a type → the template loads → fill the header
(title, date, owners = names or roles, status, visibility) → write → save.
The file lands in `content/inheritance/<term>/…` and `scripts/validate_inheritance.py`
(the same rules the OS applies) runs in `make check`. Attach docs as links; never
paste a credential. `content/inheritance/HOW-TO.md` has the five steps.

## Style — what a PR is reviewed against

- **`docs/CODE_STANDARDS.md`** — naming, function size (≤ 40 lines), file size (≤ 300; components ≤ 200),
  no duplication, comments only for _why_, errors raised with context, tests that read as sentences. Most of
  it is enforced by `make check`; the rest is the PR checklist.
- **`DESIGN.md`** — the look. Palette, type, one accent per section, no radius > 4 px, tokens only. A PR that
  adds a hex colour, a font name or a club name literal fails `audit:tokens`.
- A 1–3 line header comment on every file: what it is, where it is used. No run numbers or `_v2` names outside
  `docs/archive`. No `any` without a comment.

## Tests — what is expected

- An API endpoint: a happy path and one auth failure in `api/_core/tests/` (the `client` fixture gives a fresh
  Tier-1 store per test; `OFFICER` / `ADMIN` headers). A new entity goes into `ENTITIES` in
  `test_hardening.py` and gets the seven generic tests for free.
- A helper in `apps/web/src/lib`: a vitest next to it.
- A change to an OS flow: a step in `scripts/board_sim.mjs` if a board member would do it every term; a case in
  `scripts/board_break.mjs` if it is a way to break things.
- Test names read as sentences: `test_stale_write_is_409_never_a_clobber`, not `test_patch2`.

## The review process

- **Who:** the maintainer listed in `.github/CODEOWNERS` (Ryan today; the board's webmaster after the transfer).
  Anyone may review; a CODEOWNER approves. A one-person board may merge its own PR after CI is green — the
  ruleset asks for a PR and a green `check`, not a second human.
- **What gets asked:** does `make check` pass (CI shows it); did you run the gate you named; does the change
  keep a Tier-1 fallback; does the UI follow DESIGN.md (screenshot); is there a test; did a doc change with it;
  is the commit message honest.
- **How long:** first response within a week during the semester. Ping in the club Discord after a week.
  A PR with no reply for a month is closed with a note; reopen any time.
- **Board members** who cannot review code: open a Content or Board-task issue instead of a PR; the maintainer
  turns it into the change.
