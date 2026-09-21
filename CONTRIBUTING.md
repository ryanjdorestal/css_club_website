# CONTRIBUTING.md — how to change things (one worked example each)

`make dev` first. `make check` before a commit. Never commit secrets or
`data/*.local.json`. One accent per section (DESIGN.md).

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

## 5. Write an inheritance record (board knowledge, not code)
CSS OS → Inheritance → pick a type → the template loads → fill the header
(title, date, owners = names or roles, status, visibility) → write → save.
The file lands in `content/inheritance/<term>/…` and `scripts/validate_inheritance.py`
(the same rules the OS applies) runs in `make check`. Attach docs as links; never
paste a credential. `content/inheritance/HOW-TO.md` has the five steps.

## Style
- Files ≤ 400 lines, components ≤ 200, functions ≤ 60 (Python). Pages compose;
  logic lives in `lib/`, `_core/`.
- A 1–3 line header comment on every file: what it is, where it's used.
- No `any` without a comment. No run numbers or `_v2` names outside `docs/archive`.
- Tokens only: `var(--accent)`, `brand.*` — never literal club names or hex.

## Before you push — the gates
1. `make check` — what CI runs: ruff, prettier, stylelint, markdownlint, oxlint, mypy
   --strict, tsc, pytest, vitest, the one-function guard, `validate_data`,
   `validate_inheritance`, routes/images/tokens/repo audits, env names, `docs/API.md`
   current, ts-prune, depcheck.
2. `make a11y` — pa11y + axe over every route and the OS. Must stay at 0.
3. `make smoke` — the OS gate (12) + the functional smoke (9): a board member's day
   against your dev server. CI runs it too (`functional` job).
4. Commit message in conventional form (`feat:`, `fix:`, `content:`, `inheritance:`,
   `chore:`, `docs:`) — commitlint checks the pushed range.
5. Nothing secret in the diff — `gitleaks protect --staged`; CI scans history weekly.
6. New UI? Tick the manual keyboard/screen-reader list in `docs/SKILLS_ADOPTED.md`
   in the PR template.
Each tool's origin and what it found on adoption: `docs/SKILLS_ADOPTED.md`.
