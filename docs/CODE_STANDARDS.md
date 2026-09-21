# CODE_STANDARDS.md — what a review checks (and what `make check` checks for it)

Adapted from the clean-code rules (Robert Martin's, as summarised in the clean-code skill Ryan pointed at) to
what this repo needs. Priority order. **Enforced** = `make check` fails; **checklist** = the reviewer asks.
Every example below is real: the "before" was in this repo until run 11, the "after" is what is there now.

## 1. Naming — enforced by `scripts/banned_names.mjs`

Intention-revealing, pronounceable, searchable. Types are nouns, functions are verbs, one word per concept
(`fetch` or `get`, not both), length matches scope. No abbreviation a first-year would not know; no `data`,
`info`, `temp`, `obj`, `val`, `stuff`, `helper`, `manager`. A declared identifier from the banned list fails CI.

| Before (`apps/web/src/pages/Join.tsx`, run 10)                       | After                                                                         |
| -------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `const data = Object.fromEntries(new FormData(e.currentTarget));`    | `const fields = Object.fromEntries(new FormData(e.currentTarget));`           |
| `import kb from "@data/kb.json"; … kb.entries` (`mascot/kbMatch.ts`) | `import knowledgeBase from "@data/kb.json"` in `mascot/knowledgeBaseMatch.ts` |
| `const kb = statSync(f).size / 1024` (`scripts/repo_audit.mjs`)      | `const kilobytes = …`                                                         |

## 2. Functions — enforced (oxlint `max-lines-per-function`, `max-params`, `complexity`; ruff `C901`, `PLR0913`; `scripts/check_function_length.py`)

Small, then smaller. One thing, one level of abstraction. No boolean flag parameter (split the function), no
output parameters, command / query separation.

| Rule                  | TypeScript (`.ts`)    | React components (`.tsx`)                                                                                                       | Python                                                                                 |
| --------------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Lines per function    | **40**                | **200** (the component rule; JSX is markup, and a 40-line cap on markup makes fragment soup) — target 40, reviewer asks past 80 | **40** (`check_function_length.py`)                                                    |
| Parameters            | **3** (object beyond) | **3**                                                                                                                           | **5** (path + body + actor + two options is the FastAPI shape; beyond that, an object) |
| Cyclomatic complexity | **10**                | **25** (oxlint counts every `??`, `?.`, `&&` in JSX)                                                                            | **10** (`C901`)                                                                        |

Carve-outs, named in `apps/web/.oxlintrc.json` so they cannot spread: the dashboard spec builders
(`os/ui/specs/*.ts`, one object literal per module: 60 lines / 4 params / complexity 20); the Playwright
audit scripts (`qa-scripts/**`, a `page.evaluate` walker is one function by necessity: complexity 20 / 80
lines); and four components still over the complexity line — `OsToday`, `OsInheritance`, `OsSystem`,
`FolderCard` — listed as debt in issue #13 and capped at 80 so they cannot grow. The one-off extraction
scripts (`scripts/extract_old_site.py`, `build_kb.py`, `images.py`) are exempt in `pyproject.toml`; they ran
once against the old site and are kept for provenance.

Before (`api/_core/crud.py`, run 10): one 108-line `make_router(prefix, col, model_in, *, read_role, write_role,
delete_role, filters, transitions, order_by, prepare)` — 10 parameters, complexity 27, every route in one closure.

After: a `RouterSpec` dataclass carries the configuration; `make_router(spec)` is four lines; `add_reads`,
`add_writes`, `add_lifecycle` register one concern each; `found(row)` replaces six copies of "404 if missing".

```python
r = make_router(RouterSpec("/os/workshops", C.workshops, WorkshopIn, filters=("status", "series", "level"), transitions="workshops", order_by="date"))
```

Before (`api/_core/spine.py`): `validate(meta, body, roster_names, others)` — 57 lines, complexity 26, eleven
rules in one function. After: `check_header` · `check_owners` · `check_references` · `check_privacy`, each
named for the question it answers, driven by two tables (`ENUMS`, `SHAPES`) so the rule text and the check
cannot disagree.

Before (`apps/web/src/os/OsBoard.tsx`): a 356-line component, complexity 48, five async handlers inline.
After: the page is 166 lines; the handlers are module-level functions in `os/board/useBoardWrites.ts` with an
explicit context object; the wizard is `os/board/RolloverWizard.tsx` (three step components); the term editor
and the two read-only views are their own files.

## 3. Files and modules — enforced (oxlint `max-lines` 300; components ≤ 200 by the function rule)

One exported concept per file; imports at the top, grouped (react → app → local). A file that renders,
fetches and validates gets split. Newspaper layout: the important thing first, helpers below — a reader
should be able to stop after the first screen and know what the file is for.

Before: `os/ui/specs.ts` (460 lines, eleven builders). After: `os/ui/specs/` — `shared.ts` (the five helpers),
`content.ts`, `people.ts`, `site.ts`, `platform.ts`, and an `index.ts` so pages still write
`import { postsSpec } from "./ui/specs"`.

Before: `os/ui/OsForm.tsx` (344 lines: the form, the validation table, nine input types, the markdown editor).
After: `OsForm.tsx` (185) · `formRules.ts` (the `Field` contract and the one table that prints the rule and
runs the check) · `FieldInput.tsx` (one small component per input type).

## 4. Duplication and the wrong abstraction level — enforced by `jscpd` (threshold 1.5 %)

The two most common smells. `jscpd` runs over `apps/web/src` and `api/_core` in `make check`; run 11 started at
0.55 % (11 clones) and ends at 0.14 % (4 clones: two shared import blocks, two 9-line JSX fragments). Extract
to the shared layer — `os/ui/*`, `lib/*`, `api/_core/crud.py` — never copy a block.

Before: `OsPosts`, `OsEvents`, `OsWorkshops` each carried the same 12-line CHANGED_ELSEWHERE block and the same
publish / unpublish buttons. After: `os/ui/EntityPanel.tsx` — `<EntityConflict …/>` and `<PublishButtons …/>`.

Before: `cube/CubeSpot.tsx` and `mascot/CyberhoundSpot.tsx` each had the same two effects (reduced-motion +
intersection observer). After: `lib/useLazy3d.ts` — `const { ref, ok, visible } = useLazy3d({ needsWebgl })`.

Before: `api/_core/tests/test_os.py` re-declared the fixture header that `conftest.py` already provides.
After: `from .conftest import ADMIN, OFFICER, ROOT`.

## 5. Comments — enforced by `scripts/no_dead_code.mjs` and `scripts/repo_audit.mjs`

A comment is a failure to express it in code, except: the 1–3 line file header (what this is, where it is
used — the repo convention), a _why_ for a non-obvious decision, and a link to the doc that explains a
contract. Three or more consecutive commented-out statements fail CI (git remembers); a deferred-work marker
fails CI (deferred work is an issue, and `docs/LATER.md`).

Good, from `os/ui/useOs.ts`: the doc comment on `stampExpectedVersion` — "expect: null = overwrite on purpose; a
number = that version; undefined = the row's own updated_at" — the why of a three-state parameter. Also good, kept:
the note beside the `.glb` size check in `scripts/repo_audit.mjs` saying 3D assets are budgeted by Lighthouse, not
the image rule. The `(run 9 §6.7)` markers in file headers stay only where they point at a decision in `docs/archive`.

## 6. Errors — checklist, and the envelope is asserted in tests

Raise with context, never return an error code; never return `null`/`None` to mean "it failed" (use a typed
result or raise); wrap third-party calls at the boundary so Supabase's shape does not leak into components
(`api/_core/db.py` is the only file that knows PostgREST; `os/ui/useOs.ts::act` is the only place the browser
parses an envelope). The run-10 envelope `{"error": {"code", "message", "field"?}}` is the contract —
`api/_core/errors.py`, asserted by `test_hardening.py`.

Before (`os/ui/useOs.ts`): `act()` — complexity 35, body preparation, outbox, auth bounce and envelope parsing
in one function. After: `prepareBody`, `stampExpectedVersion`, `bounceToLogin`, `failureOf`, `queueForReplay`
around a 10-line `act()`.

## 7. Tests — F.I.R.S.T., checklist

Fast, independent (the `client` fixture gives a fresh Tier-1 store per test), repeatable, self-validating,
timely. One concept per test. Names read as sentences: `test_stale_write_is_409_never_a_clobber`,
`test_prune_removes_only_records_older_than_the_window`. Test code is held to the same standard (the
parametrised tests take one argument per fixture — that is the one `PLR0913` exemption).

## 8. Structure — checklist

Single responsibility per module; depend on abstractions at the boundaries (`useApi` / `useOs` in the browser,
`store.Collection` on the server); keep the newspaper layout. `ARCHITECTURE.md` § Boundaries lists what may
import what, and the audits that check it.

## The PR checklist (what is not a linter)

- [ ] Every name says what it holds; no comment explains a name
- [ ] New component ≤ 40 lines of logic, ≤ 200 of markup; anything past 80 has a reason in the PR
- [ ] Nothing copied from another file — the shared thing was extracted
- [ ] Errors raised with context; the envelope's `field` set when a field is wrong
- [ ] A test whose name is a sentence
- [ ] The file header says what this is and where it is used
