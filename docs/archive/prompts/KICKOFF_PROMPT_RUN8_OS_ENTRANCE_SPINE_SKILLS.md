# 35 — RUN 8: OS ENTRANCE · INHERITANCE = THE SPINE · SKILLS-DRIVEN FUNCTIONAL VERIFICATION · SLIM REPO

Paste everything below the line into Claude Code (Fable, xhigh) in `~/Desktop/jjay_css`. Read anything on
this Mac; write only inside this folder; never push; never touch rhecwb or its Supabase.

---

## 0. Ryan's review of run 7 (verbatim → do)

1. "For some reason I can't see the OS on localhost myself — make the button visible, like RHEC OS has a
   **login** in the nav, but only the board can access it." → §2.
2. "Inheritance should strictly be **board member info** — an actual inheritance file / organization of
   files — and how they can make their own, add or attach a doc or whatever they want (not attach it to the
   platform), with a blurb about the purpose of continuity." The platform-health stuff moves out. → §3.
3. "Use all my skills in my skills folder (`~/Desktop/skills/`) to make sure this is actually a functional
   site and internal platform." → §4. Not "install everything": read the inventory, adopt what applies to
   this stack, run it, fix what it finds, wire the keepers into `make check` and CI.
4. From Cowork's pre-push review: the repo is ~104 MB tracked (51 MB `assets/refs`, 39 MB `qa/loops`);
   git objects have bridge garbage. → §5.

Budget **150 min**: §2 ≤ 20 · §3 ≤ 40 · §4 ≤ 70 · §5 ≤ 15 · report 5. Checkpoints every 30 min in
`docs/archive/context/36_RUN8_LOG.md` (the log lives with the archived history now). No questions;
ambiguity → the option a board member with no dev background would understand; log it.

## 1. Read first (≤ 10 min)

`README.md`, `docs/HANDOFF.md`, `apps/web/src/os/{session,ui}/*`, `apps/web/src/os/OsLogin.tsx`,
`apps/web/src/components/{Nav,Footer}.tsx`, `apps/web/src/os/Inheritance*.tsx` (whatever run 7 named it),
`api/_core/routers/{inheritance,board,settings}.py`, `~/Desktop/skills/INVENTORY.md` + `docs/{tier-guide,
do-not-pull,integration-notes}.md`, and RHEC's `rhecwb/project-rules/09-inheritance-spine.md` +
`rhecwb/inheritance/HOW-TO.md` + `rhecwb/inheritance/_template/*` + `rhecwb/os/apps/inheritance.html`
(read-only; the *spine* idea is what Ryan means by "an actual inheritance file/organization").

## 2. The OS entrance — visible, gated, obvious

Why Ryan couldn't find it: the only link is a 10 px `OS_LOGIN →` at 50 % opacity in the footer META
column, and `/os` with no session bounces silently. Fix all of it:

1. **Nav (public, every page):** right cluster becomes `SYS.TIME` · `● LIVE` · `[ CSS_OS ]` (Bracket
   variant, mono, page accent) · `JOIN ↗` (Block). `CSS_OS` links to `/os/login`. On ≥1280 it reads
   `CSS_OS · BOARD`; on mobile it's in the overlay menu as `/09 CSS_OS · BOARD LOGIN`. RHEC's `RHEC OS ·
   BETA` ghost button is the model; ours says what it is.
2. **Footer:** META column row `OS_LOGIN →` → `CSS_OS · BOARD LOGIN →` at full label opacity.
3. **`/os/login` page** (currently a bare picker): a real gate in the design system —
   - left: `//CSS_OS` kicker, `BOARD` / `ACCESS.` H1 (Stencil + Outline), one paragraph: who this is for
     (current board only), what it does (posts, projects, events, resources, members, board, inheritance),
     and that access is granted by the roster — "if you're on the board and can't get in, the president or
     webmaster adds your email on `/os/board`".
   - right, in `Brackets`: the email field (`_school_email`), `[ >_SEND_LOGIN_LINK ]`; after submit: `>
     LINK_SENT · CHECK_YOUR_INBOX` with a 60 s resend cooldown; on a non-roster email the message is the
     same (never reveal roster membership) but the API logs an audit `login_denied` row.
   - Tier 1 (no Supabase, dev build only): a clearly labelled `LOCAL_DEV` panel *below* the real form with
     the role picker — hidden entirely in `import.meta.env.PROD`. Never the first thing on the page.
   - status bar shows `NODE: JJ_CSS_OS`.
4. **Unauthenticated `/os/*`** → redirect to `/os/login?next=…` with a visible reason chip (`○ NOT_SIGNED_IN`
   / `○ NOT_ON_ROSTER` / `○ SESSION_EXPIRED`), never a blank page. **Signed-in but `guest`** (email not on
   the current roster) → the login page with `○ NOT_ON_ROSTER` and the "ask the president" line.
5. **Signed-in on the public site:** the nav's `[ CSS_OS ]` becomes `[ CSS_OS · {first name} ]` linking to
   `/os`. (Public pages read the session but never depend on it.)
6. Verify: Playwright test — anonymous `/os` → login with reason chip; LOCAL_DEV admin → `/os` renders;
   `guest` → `NOT_ON_ROSTER`. Shoot `/os/login` at 1440 + 390 and Home nav with the button.

## 3. Inheritance = the spine (board knowledge), not platform health

### 3.1 Move platform health out
The "Is the platform working?" checks + docs index + runbook become **`/os/system`** (nav `/10 SYSTEM`,
admin + officer read; the ownership sheet moves here too since it's accounts, not knowledge). Today's status
readouts keep linking there. Audit stays `/11`.

### 3.2 What `/os/inheritance` is now
Purpose blurb at the top (write it; ≤ 90 words, plain, in the site's voice, not corporate): student clubs
lose everything every 2–4 semesters — logins, contacts, why decisions were made, what a project was for.
Inheritance is where each board writes down what the next board needs, in files that outlive the platform.
The platform just organizes them.

**It is a file system, not a form-filling app.** Records are **markdown files with YAML frontmatter**,
organized by term, in `content/inheritance/` in the repo (the Tier-1 truth), mirrored to the DB table
`inheritance_records` (Tier 2) and back by the snapshot. Attachments are **links** (Google Drive, the club
Gmail, GitHub, a PDF URL) — never uploaded into the platform ("not to the platform" — Ryan). The board can
also **export the whole spine as a zip of markdown** at any time and it is still readable with no software.

Record types (adopt RHEC's spine vocabulary, sized for JJ; templates in `content/inheritance/_template/`):

| Type | When | File |
|---|---|---|
| `roster` | once per term | `<term>/roster.md` |
| `handoff` | one per outgoing officer per term | `<term>/handoffs/<role>.md` |
| `decision` | per non-trivial board decision | `<term>/decisions/<YYYY-MM-DD>-<slug>.md` |
| `project` | per project/app worth continuing (links to the Projects record) | `<term>/projects/<slug>.md` |
| `event` | per event worth remembering (attendance, what worked) | `<term>/events/<slug>.md` |
| `contact` | per sponsor/faculty/department relationship — pointer only, no personal data beyond name/role/public email | `<term>/contacts/<slug>.md` |
| `lesson` | when a pattern is worth capturing | `<term>/lessons/<slug>.md` |
| `minutes` | per board meeting | `<term>/meetings/<YYYY-MM-DD>.md` |

Frontmatter (adopt `~/Desktop/skills/static-cms/frontmatter-schema/inheritance.schema.json` as the base;
copy it to `data/schemas/inheritance.schema.json` and trim): required `type, title, term, date, status
(draft|final|superseded), owners[] (names/roles, not emails), visibility (board|public)`; optional `tags,
summary, links[] {label,url}, supersedes, succeeded_by, related[] (other record slugs)`. **No secrets, no
credentials, no personal data** — a validator rule, not a suggestion (§3.4).

### 3.3 The page
- Header: blurb (above) + `Readout` row: records this term · handoffs filed / officers · last record date ·
  `[ EXPORT_SPINE.zip ]` · `[ HOW_TO_WRITE_ONE ]` (opens `content/inheritance/HOW-TO.md` rendered).
- **Browser**: left rail = terms (current first, `F26`, `S26`…); main = an `IndexList` grouped by type
  with `/01 HANDOFFS`, `/02 DECISIONS`… each row: title · owners · date · status chip · visibility chip →
  opens the record rendered (markdown, the public article layout at reduced width) with its frontmatter as a
  `SpecSheet` and its links as Bracket buttons.
- **New record**: pick type → the template loads in the markdown editor (same editor as Posts: textarea
  + live preview) with the frontmatter as a small form above (title, date, owners multi-select from the
  roster, status, visibility, links list with `+ add link`, tags). Save = write the file (Tier 1: to
  `content/inheritance/<term>/…`; Tier 2: the DB row, and the snapshot writes the file). "Attach" = add a
  link; the UI says so: `Attach a doc: paste a Drive/GitHub/PDF link. Files stay where you keep them.`
- **Handoff nudge**: in the last 4 weeks of a term, each officer's Today shows `handoff not filed` →
  new record, type handoff, role prefilled.
- **Term rollover** (`/os/board`) creates `<next term>/roster.md` from the confirmed officers and a draft
  handoff stub per outgoing officer.
- Every record page ends with "What is not here, and why": no secrets (pointer records only), no uploads
  (links), no per-member data (that's `/os/members`).
- Seed: `content/inheritance/F26/roster.md` from the current board data, `HOW-TO.md` (adapt RHEC's, JJ
  paths), the 8 templates, one example `decision` record documenting *this* platform's adoption (date,
  owners: the board, links: repo + SETUP.md) — a real record, not lorem.

### 3.4 The validator (this is where the skills folder starts earning its keep)
Adapt `~/Desktop/skills/static-cms/inheritance-validator/validate.mjs` → `scripts/validate_inheritance.mjs`:
walks `content/inheritance/`, validates frontmatter against the schema, checks `supersedes/succeeded_by`
form a DAG, `related` slugs resolve, owners are on that term's roster, `visibility: public` records contain
no email addresses or phone numbers (regex), and **no record anywhere contains a secret-shaped string**
(reuse gitleaks patterns from `automation/secret-scan`). Runs in `make check` and CI as a required check;
the OS refuses to save a record that fails the same rules (the API calls the same validator via a Python
port or by shelling to node in dev — pick one, log it).

## 4. Skills-driven functional verification (`~/Desktop/skills/`)

Read `INVENTORY.md` and `docs/tier-guide.md` + `docs/do-not-pull.md` first. The inventory was written for
RHEC's static HTML/Netlify stack; **translate, don't transplant**. For each skill decide `adopt` / `adapt`
/ `skip (reason)` and write the decision table to `docs/SKILLS_ADOPTED.md`. Then run everything adopted
against the real site and the real OS, fix what it finds, and keep it running. Minimum decisions:

| Skill | Decision | How it applies here |
|---|---|---|
| `ui/design-tokens` | adopt (audit) | Confirm `tokens.css` is the only place hex/font names appear in `src/` (grep gate in `make check`); fix strays. |
| `ui/modern-reset` | adapt | Confirm Tailwind preflight + our base cover the same defaults incl. `prefers-reduced-motion` (we already gate motion — verify every animation, list exceptions). |
| `ui/prettier` + `ui/stylelint-static` | adopt | Prettier repo-wide; stylelint on `tokens.css`, `type.css`, any plain CSS. Wire to `make check`. |
| `ui/lighthouse-budget` | adopt | `lighthouserc` with budgets: Home desktop perf ≥ 85, LCP ≤ 2.5 s, JS ≤ 900 KB gz, and a **mobile** budget that is honest (record the number; if < 60 add prerender to `docs/LATER.md` with the measured gap). CI job on the prod build. |
| `accessibility/html-validate` | adopt | On the built HTML of every public route + `/os/login` + `/os` (LOCAL_DEV). |
| `accessibility/pa11y` | adopt | WCAG 2 AA on every public route + every OS route in LOCAL_DEV admin, both tones. Fix everything it reports (expect: label-less inputs in OS forms, contrast on 55 % labels, focus order in the nav overlay, canvas without a name). |
| `accessibility/axe-runner` | adopt | Playwright + axe on the same routes; keep both since they catch different things. |
| `accessibility/a11y-checklist.md` | adopt (manual) | Do the human checks yourself: keyboard-only through the nav overlay, the login form, one OS editor, the chat widget; screen-reader names for cube/bust/pennant/hound. Record in the report. |
| `auditing/link-check` (lychee) | adopt | Weekly cron + on demand; against built site + `data/resources.json` + `data/links.json` + `content/**/*.md`. Feed results into `/os/resources` dead-link status (it already has `last_status`). |
| `auditing/route-validator` | adopt | Every internal `href`/`to` resolves to a route or file; run on the built site. |
| `auditing/broken-image-scan` | adopt | Every `<img src>` and CSS `url()` exists in `public/` or the build. |
| `auditing/repo-audit` | adopt | Orphans, oversize images (> 400 KB in `public/`), stale TODOs; run and fix. |
| `static-cms/markdownlint` | adopt | On `content/**`, `docs/**`, READMEs. |
| `static-cms/frontmatter-schema` + `inheritance-validator` | adopt (§3.4) | The spine gate; also apply `news.schema.json` (adapted) to `content/news/*.md` and `project.schema.json` to project records. |
| `static-cms/content-indexer` | adapt | We have `data/*.json` + the API; instead of a new index, add `scripts/validate_data.py` cross-checks: every project/event/post referenced anywhere exists; no dangling image paths. |
| `static-cms/notion-fetch` | skip | Third-party account. |
| `workflows/github-actions/*` | adapt | Fold `ci.yml`, `inheritance-validate.yml`, `pa11y.yml`, `link-check.yml`, `lighthouse.yml` into our `.github/workflows/` (keep keepalive, snapshot, post-deploy-smoke). Required checks documented in `CONTRIBUTING.md`. `stale.yml` skip. |
| `workflows/pr-templates` + `issue-templates` | adopt | One PR template (what changed / how verified / screenshots / `make check` green) and four issue templates (bug, content, inheritance, feature) in `.github/`. |
| `workflows/codeowners` | adopt | `CODEOWNERS` → `@jjcss/board` placeholder + Ryan until transfer; documented in HANDOFF. |
| `workflows/conventional-commits` | adopt (lint only) | commitlint in CI, no hook (the team hasn't bought in — matches the inventory's note). |
| `automation/env-validate` | adopt | `scripts/env_validate.py` runs at API startup + in `vercel build`: names of required env vars per tier, clear message, never values. |
| `automation/secret-scan` | adopt | gitleaks pre-commit + CI, with our allowlist (the Supabase anon key *name* is fine; a value is not). Run it on the **whole history** once and report. |
| `automation/deploy-preview` | adapt | Vercel already does previews; add the sticky PR comment with preview URL + Lighthouse + pa11y summary. |
| `automation/netlify-functions` | skip | We're Vercel + one Python function. |
| `discord/*` | skip (`docs/LATER.md`) | All three need a bot token/app = key. Note exactly what they'd add and the one env var each would need, so a future board can flip it on. |
| `quay/*` (internal-dashboard, supabase-schema, safe-refactor, ui-preservation, architecture-review, deploy-push-checklist, activity-feed-model, mentor-crm-model) | adapt selectively | Read each README. **Adopt:** `supabase-schema` review checklist against `0001`+`0002` (RLS on every table, no service key in client, indexes on FKs); `safe-refactor` + `ui-preservation` as the rule for §3's restructure (screenshot before/after, diff only where intended); `architecture-review` as a one-page pass on `ARCHITECTURE.md`; `deploy-push-checklist` → `docs/RELEASE.md`. **Skip:** n8n, client-portal, mentor-crm, genius-team, ai-feature-implementation (needs LLM), vercel-nextjs-execution (we're Vite). |
| `sator/*` | mostly skip | It's IoT/research tooling. **Adopt:** `test-scaffold` pattern for any new API router; `readme-api-docs` → generate `docs/API.md` from the FastAPI OpenAPI schema (`scripts/gen_api_docs.py`); `repo-audit` if it adds checks `auditing/repo-audit` lacks. Skip the rest with one line each. |
| `tribunal` | skip | Research-artifact review; not applicable. |

**Functional test pass (after the tooling is in):** write `scripts/functional_smoke.mjs` (Playwright,
Tier 1) that does what a board member does, end to end, and asserts the public site changed:
1. login (LOCAL_DEV admin) → 2. create a post, publish → appears on `/news` → 3. add a project on behalf
of a student, publish, feature → appears on `/projects` Featured → 4. create an event, publish → appears on
`/events` + Home → 5. add a resource, change the Discord invite link → both appear on the public site →
6. add an officer → About shows them → 7. file a handoff and a decision record → they list on
`/os/inheritance`, the files exist under `content/inheritance/`, `validate_inheritance` passes → 8. sign
out → `/os` redirects with the reason chip → 9. export spine zip has the files. Every step screenshots.
This runs in CI on every PR. If a step can't be done through the UI, that's a bug to fix, not a step to skip.

## 5. Slim the repo before push (≤ 15 min)

1. `git rm -r --cached qa/loops` except `parity.md`; ignore `qa/loops/**/*.{png,webm}`; `qa/README.md`
   says shots are regenerated by `scripts/shoot.mjs`. Keep `qa/REPORT_*.md` and the `.txt` logs.
2. Move `assets/refs/` (51 MB) to `~/Desktop/jjay_css_refs/` (outside the repo); leave
   `assets/refs/README.md` listing what was there + the path; fix links in `DESIGN.md`, `docs/archive/**`.
   Keep `assets/brand`, `cube`, `hound3d`, `source`.
3. Untrack any `__pycache__`; confirm `.gitignore`.
4. `git gc --prune=now && git fsck` — clean (the bridge left `tmp_obj_*` garbage in `.git/objects`).
5. Tracked total ≤ 15 MB (`git ls-files -z | xargs -0 du -ck | tail -1`); print before/after.
   Commit `chore: slim repo for clone`.

## 6. Gate

1. `/os` is reachable from every public page in ≤ 2 clicks, gated, with visible reasons; Playwright proves
   anonymous / guest / admin behaviour.
2. `/os/inheritance` is the spine (files + templates + validator + export), `/os/system` holds health.
3. `docs/SKILLS_ADOPTED.md` has a decision for **every** skill in the inventory; every `adopt`/`adapt` is
   wired into `make check` and/or CI and its first run's findings are fixed (list counts before/after:
   pa11y, axe, html-validate, lychee, route-validator, broken-image, repo-audit, markdownlint, gitleaks).
4. `scripts/functional_smoke.mjs` passes all 9 steps in CI.
5. Public site visually unchanged except the nav button (`ui-preservation`: before/after shots diffed).
6. Newcomer test still ≤ 10 min; `make check` green; tracked repo ≤ 15 MB; `git fsck` clean.

## 7. Don'ts

No Discord bot, no LLM, no uploads into the platform for inheritance (links only), no secrets in any
record, no new fonts, no cube in the OS, no second Vercel function, no push, no questions.

## 8. End

Commit per section (`feat(os): login entrance`, `feat(os): inheritance spine`, `chore(skills): …`,
`chore: slim repo`); `qa/REPORT_RUN8.md` (the skills decision table summary, findings fixed counts, smoke
screenshots, sizes, a11y/lighthouse numbers); update `README.md` / `CONTRIBUTING.md` / `docs/HANDOFF.md`
(how to file a handoff; where the spine lives; how to export it). Print the gate table and `make dev`.
