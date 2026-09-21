# 43 — RUN 11: SHIP IT — repo connection · Vercel/Supabase centralisation that can never hit a limit · the handoff package · a codebase a beginner can contribute to

Paste everything below into Claude Code (**Opus, xhigh**) in `~/Desktop/jjay_css`.
Read anything on this Mac. Write only inside this folder. **This run may push** — see §2, which is the
only place a push is allowed, and only after its gates pass.

---

## 0. What Ryan asked for (verbatim) → the five workstreams

> "Connect the project to the repo and start the functionality db, Vercel centralisation to make sure
> updates don't reach hosting limits ever; setup for the person I'm giving the repo to, to set up Supabase
> and Vercel connection, and purpose of site and details of internal platform goals and features like
> inheritance and roadmap if they need it (look at rhecwb structure/info to see what I mean since it's
> functional — the prompt should also check); and make sure the GitHub repo itself is as detailed or more
> detailed than the old jjay repo so that a contributor can actually contribute — which on that note the
> code should look clean too."
> Repo: `https://github.com/ryanjdorestal/css_club_website.git`
> Clean-code reference: `https://github.com/nghorbani/clean-code-skill/blob/main/CLAUDE.md`

| # | Workstream | Time box |
|---|---|---|
| **A** | **REPO** — history slimmed, `master` → `main`, remote wired, first push, repo settings, branch protection | 35 min |
| **B** | **CENTRALISATION** — one Vercel project, one Supabase project, and hard guards so neither can ever trip a free-tier limit | 45 min |
| **C** | **HANDOFF PACKAGE** — the numbered doc set the next maintainer reads, modelled on rhecwb's but sized for John Jay: purpose, platform map, Supabase + Vercel setup, inheritance, roadmap | 50 min |
| **D** | **CONTRIBUTOR-GRADE REPO** — README, CONTRIBUTING, templates, labels, good-first-issues; strictly better than `jjcss/CSS_Website` | 40 min |
| **E** | **CLEAN CODE** — a real pass against the rules in §6, enforced by lint, not vibes | 60 min |

**Budget 240 min** (+10 report). Checkpoints every 30 min in `docs/archive/context/44_RUN11_LOG.md`.
No questions — except the one hard stop in §2.4 if GitHub auth is missing. `make check` green at every
commit. Everything else from runs 1–10 stays: one Vercel function, no API keys for features, Tier 1
always works, John Jay palette, type v5.

**Read first (≤ 10 min):** `README.md`, `ARCHITECTURE.md`, `CONTRIBUTING.md`, `SETUP.md`,
`docs/HANDOFF.md`, `docs/RUNBOOK.md`, `docs/LATER.md`, `qa/REPORT_RUN10.md`,
`docs/archive/context/42_OS_MATRIX.md`, and `apps/web/src/fonts/FONTS.md`.

**Read for shape (read-only, another project):** `~/Desktop/LAGCC/rhec_web/rhecwb/` —
`docs/contributor-handoff/` (21 numbered files: `00_START_HERE`, `01_PROJECT_OVERVIEW`,
`02_PLATFORM_REALITY_MAP`, `03_REMAINING_WORK`, `04_LOCAL_SETUP`, `05_SUPABASE_DEV_SETUP`,
`06_AUTH_AND_TEST_USERS`, `07_ENVIRONMENT_VARIABLES`, `10_FEATURE_WORKFLOWS`, `11_DATABASE_SCHEMA_MAP`,
`12_API_MAP`, `13_UI_APP_MAP`, `14_TESTING_AND_QA`, `15_PRODUCTION_HANDOFF`, `16_DEFINITION_OF_DONE`,
`17_FIRST_WEEK_PLAN`, `18_GLOSSARY`, `19_KNOWN_RISKS_AND_TRAPS`, `CURRENT_STATE.md`), plus
`docs/vercel-deployment.md`, `docs/vercel-env-vars.md`, `project-rules/09-inheritance-spine.md`,
`README.md`, `CONTRIBUTOR_START_HERE.md`. **That is the model Ryan means by "functional".** Copy the
*shape and the honesty* (a reality map that says what is live vs fallback; "who supplies this value"
tables; a first-week plan). Copy no text. Ours is ~10 files, not 21 — John Jay's platform is smaller and
a 21-file wall is its own kind of failure.

**Read for the bar to beat:** `https://github.com/jjcss/CSS_Website` — the old repo. It has a README with
fork/clone/branch/PR steps and screenshots, an MIT license, and nothing else: no CONTRIBUTING, no issue
or PR templates, no architecture, no local setup, no deployment docs. **Ours must keep everything theirs
did well (the beginner-level Git walkthrough, in our own words) and add everything it lacked.**

---

# WORKSTREAM A — REPO

## 1. Pre-flight (do all of it before touching the remote)

Current state, verified: no `origin`, branch is **`master`**, working tree clean,
**532 tracked files / 14.6 MB**, but **`.git` is 331 MB** because runs 2–8 committed ~90 MB of
screenshots and reference PNGs that later commits deleted. `gh` is **not installed**.

1. **Secret sweep, twice.** `gitleaks detect --no-banner --redact` over the **full history**, plus
   `git log -p | grep -nEi "(SUPABASE_SERVICE|service_role|eyJhbGciOi|sk_live|BEGIN .*PRIVATE KEY|password\s*=)"`.
   Any hit stops the run — report it, do not push, do not "fix it in the next commit".
2. **`.gitignore` audit**: `.env*` (except `.env.example`), `data/*.local.json`, `data/*.local.json.bak`,
   `.cache/`, `qa/loops/**/*.{png,webm,zip}`, `qa/_review/`, `node_modules`, `__pycache__`, `.venv`,
   `.DS_Store`, `content/inheritance/**` untracked working files. Verify `git status --ignored` is quiet.
3. **Root clutter.** Eleven `KICKOFF_PROMPT_*.md` files sit at the repo root; a contributor opening the
   repo sees them before the README. Move all of them to `docs/archive/prompts/` (keep the history —
   `git mv`), leave `README.md`, `ARCHITECTURE.md`, `CONTRIBUTING.md`, `SETUP.md`, `DESIGN.md`,
   `SOURCES.md`, `LICENSE`, `CLAUDE.md`, `Makefile`, config files. `CLAUDE.md` stays at root (it is the
   agent's entry point) but gains a first line saying so.

## 2. History rewrite, rename, remote, push

### 2.1 Slim the history (on a copy first)
```
git clone --no-local . /tmp/jjcss-slim && cd /tmp/jjcss-slim
pip install --user git-filter-repo   # or brew install git-filter-repo
git filter-repo --invert-paths \
  --path-glob 'qa/loops/*' --path-glob 'qa/shots/*' --path-glob 'qa/_review/*' \
  --path-glob 'assets/refs/*' --path-glob 'qa/archive/*' \
  --path-glob 'apps/web/src/assets/hero.png'
git reflog expire --expire=now --all && git gc --prune=now --aggressive
```
Verify on the copy: `git count-objects -vH` (**target ≤ 25 MB pack**), `git ls-files | wc -l`,
`make install && make check` green, `npm run build` green, the site renders. **Only then** apply the same
rewrite to the real repo (or replace it with the verified copy, keeping `.git/config`). Record the before
/after numbers. If `git-filter-repo` cannot be installed, fall back to
`git checkout --orphan main && git add -A && git commit` (a clean single-commit history) and say so
plainly in the log — a 331 MB clone is not acceptable to hand to a student.

### 2.2 `master` → `main`
`git branch -m master main`. Update every doc, workflow (`on: push: branches: [main]`), badge and CI
reference. `grep -rn "master" .github docs *.md Makefile scripts` → only false positives remain.

### 2.3 Remote
`git remote add origin https://github.com/ryanjdorestal/css_club_website.git`.
(The repo currently 404s to an anonymous fetch, so it is private or empty — both fine.)

### 2.4 Auth, then push
`gh` is not installed. Try, in order: (a) `brew install gh && gh auth status`; (b) an existing git
credential helper (`git config --get credential.helper`, then a dry `git ls-remote origin`); (c) if
neither authenticates, **stop and print exactly this** — it is the single allowed question:
```
GitHub auth is not available in this shell. Run ONE of these, then tell me to continue:
  brew install gh && gh auth login          # then I can push and configure the repo
  git push -u origin main                   # if your keychain already has credentials
Everything else in run 11 is done; the repo is ready to push (N files, M MB).
```
With auth: `git push -u origin main`. Then verify: clone fresh into `/tmp`, `make install`, `make check`
green, `make dev` boots. A clone that does not run is a failed push.

### 2.5 Repo settings (via `gh` if present, else write `docs/REPO_SETTINGS.md` with click-by-click steps)
- **Description:** "Public website + board platform (CSS OS) for the Computer Science Society at John Jay
  College, CUNY. React + TypeScript + Python, runs with no accounts in Tier 1."
- **Topics:** `john-jay`, `cuny`, `student-club`, `react`, `typescript`, `vite`, `fastapi`, `supabase`,
  `vercel`, `computer-science-society`, `student-project`, `good-first-issue`.
- **Homepage:** the Vercel URL once §4 exists.
- Enable Issues and Discussions; disable the Wiki (docs live in the repo).
- **Branch protection on `main`:** require a PR, require the `ci` check, require a linear history,
  no force-push, no deletion. Ryan stays an admin who can bypass in an emergency — document that.
- `CODEOWNERS`: `* @ryanjdorestal` today, with a commented `@jjcss/board` line and one sentence on how to
  switch it at handoff.
- Add the repo's own `LICENSE` (MIT, already present) and confirm the old site's MIT notice is preserved
  in `SOURCES.md`.

---

# WORKSTREAM B — CENTRALISATION: ONE PROJECT EACH, AND NEVER A LIMIT

## 3. The numbers to design against (verified 2026-09-21 — put this table in `docs/HOSTING_LIMITS.md`)

**Vercel Hobby** (free, *non-commercial personal use only* — a student club site qualifies; note it):

| Limit | Hobby | Our expected use | Guard |
|---|---|---|---|
| **Deployments per day** | **100** | ~5 | §3.1 ignored-build-step + concurrency |
| Function invocations / mo | 1,000,000 | < 20,000 | one function, JSON fallbacks |
| Active CPU | 4 CPU-hrs | minutes | no heavy work in the request path |
| Provisioned memory | 360 GB-hrs | small | default memory |
| Fast Data Transfer | 100 GB | < 5 GB | static assets, WebP, cache headers |
| Fast Origin Transfer | 10 GB | < 1 GB | everything static is cached |
| Edge requests | 1,000,000 | low | — |
| Image Transformations | 5,000 | **0** | §3.2 — we never use Vercel image optimisation |
| Function max duration | 300 s | < 5 s | link-check runs in CI, not in a request |
| Projects | 200 | 1 | — |
| Domains / project | 50 | 2 | — |

Exceeding a Hobby limit **pauses the feature for 30 days** — that is the failure mode to engineer away.

**Supabase Free:** 500 MB database · 1 GB file storage · 5 GB egress · 50,000 MAU · **2 free projects per
organisation** · shared CPU / 500 MB RAM · no automatic backups · **projects pause after 1 week of
inactivity**.

## 3.1 Deployment centralisation (the "updates never hit limits" work)

1. **One project, one production branch.** Vercel project `jjay-css` ← GitHub `css_club_website`,
   production branch `main`. Preview deploys stay on for PRs (that is how a contributor sees their work)
   but are **capped**: `vercel.json` sets `"git": { "deploymentEnabled": { "main": true } }` and §3.1.2
   skips everything that cannot change the site.
2. **Ignored Build Step.** Add `scripts/vercel_should_build.sh` and point Vercel's
   *Settings → Git → Ignored Build Step* at `bash scripts/vercel_should_build.sh`. It exits 0 (build) only
   when the diff touches `apps/web/**`, `api/**`, `brand/**`, `data/**`, `content/**`, `public/**`,
   `package*.json`, `vercel.json`, or `supabase/**`. Docs-only, `qa/**`-only, and `docs/archive/**`-only
   commits exit 1 (skip). Print the reason so the Vercel log explains itself. Unit-test the script with a
   table of 12 example diffs.
3. **CI concurrency.** Every workflow gets
   `concurrency: { group: "${{ github.workflow }}-${{ github.ref }}", cancel-in-progress: true }` so a
   rapid push sequence collapses to one run. The snapshot workflow additionally uses
   `[skip ci]`-style commit messages and `paths-ignore` so it can never trigger a deploy loop —
   **this is the classic way a free tier dies: a bot commits, which triggers a build, which commits.**
   Assert in the workflow that `github.actor != 'github-actions[bot]'` before it can commit.
4. **Cron budget.** Keepalive every 3 days (already), snapshot nightly, link-check weekly,
   lighthouse on PRs only. Nothing runs on a 5-minute schedule. Put the schedule table in the doc.
5. **A usage page in the OS.** `/os/system` grows a **HOSTING** panel reading the numbers a board member
   can act on: deployments today (from the GitHub API, unauthenticated read of the last 100 workflow runs
   — no token needed, and if it fails it says `UNKNOWN`), days since the last Supabase write, snapshot
   age, and the static table from §3 with a "what happens if we exceed it" line each. No fake numbers.

## 3.2 Asset and image policy (protects the 5,000 image-transformation limit and the transfer budget)
We never use Vercel's image optimiser. Every image is pre-sized WebP committed under
`apps/web/public/img/` (or uploaded to Supabase Storage at ≤ 1600 px by the API, per run 10). Add
`scripts/check_assets.mjs` to `make check`: every file in `public/img` is `.webp`/`.svg`, ≤ 400 KB, and
referenced somewhere; `<img>` tags carry `width`, `height`, `loading="lazy"`, `decoding="async"`.
`vercel.json` sets `Cache-Control: public, max-age=31536000, immutable` on `/assets/*` and
`/img/*`, and `no-store` on `/api/*`.

## 3.3 Supabase centralisation
1. **One project**, owned by the club Google account, region `us-east-1`, named `jjay-css-prod`. The
   second free slot stays empty for a future maintainer's dev project — say so, so nobody burns it.
2. **Migrations are the only way the schema changes.** `supabase/migrations/000N_*.sql`, applied in order,
   never edited after they ship. Add `scripts/check_migrations.py` to `make check`: filenames are
   sequential, every one is valid SQL (parse with `sqlparse`), and none contains `DROP TABLE` without a
   guard comment.
3. **Size guard.** `scripts/db_budget.py` (run by the keepalive workflow) queries row counts and the
   database size and fails loudly at **70 % of 500 MB**; the OS HOSTING panel shows the percentage. Note
   in the doc that uploads go to Storage (1 GB), not the database, and that audit records are the only
   table that grows unbounded — add a documented 12-month prune the board can run from `/os/audit`.
4. **Pause protection.** The keepalive workflow already writes every 3 days; make it *assert* it wrote
   (read-back) and fail the workflow if it did not, so a silent break is visible in the Actions tab.
5. **Backups.** Free tier has none. `scripts/snapshot.py` already pulls published rows into committed
   JSON nightly — document that this **is** the backup, plus `pg_dump` instructions for a monthly manual
   dump the board stores in the club Drive.

## 3.4 Environment variables, in one table (`docs/ENVIRONMENT.md`, and `.env.example` committed)
For each: name · where it is read (browser / API / CI) · who supplies it · what breaks without it ·
whether it is a secret. At minimum: `SUPABASE_URL`, `SUPABASE_SERVICE_KEY` (secret, API only, never
bundled), `SUPABASE_JWT_SECRET` (secret), `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (public by
design — explain why that is safe with RLS), `SITE_URL`, and the CI secrets for snapshot + keepalive.
`scripts/env_validate.py` already exists — wire it into `vercel build` so a missing var fails the build
with a readable message instead of shipping a broken site.

---

# WORKSTREAM C — THE HANDOFF PACKAGE

## 4. `docs/handoff/` — ten numbered files, written for a student who has never seen this repo

Model: rhecwb's `docs/contributor-handoff/`. Rule for all ten: **honest status, no aspiration stated as
fact.** Every claim of "works" must be backed by a gate in `make check`, `make sim` or `make break`.

```
00_START_HERE.md        Who you are, what you're inheriting, the 20-minute path to a running site,
                        and the reading order. One page.
01_WHAT_THIS_IS.md      Purpose of the public site and of CSS OS; who the users are (board, students,
                        prospective members); the two-tier model (Tier 1 survival / Tier 2 live) and why
                        it exists — the old site froze in April 2025 because one person held the FTP
                        login and the repo was never connected to deployment. That failure is the
                        design brief.
02_REALITY_MAP.md       Every feature × status (live / Tier-1 only / not built) with the gate that
                        proves it. Derived from docs/archive/context/42_OS_MATRIX.md and qa/REPORT_RUN10.md.
03_LOCAL_SETUP.md       Clone → make install → make dev → make check, on macOS/Linux/Windows(WSL),
                        with the exact expected output and the three things that usually go wrong.
04_SUPABASE_SETUP.md    Create your OWN free project (never the club's), run the migrations, seed,
                        enable Email OTP, bootstrap yourself as admin, verify with one real write.
                        Screenshot-free but click-by-click. Includes the free-tier table from §3.
05_VERCEL_SETUP.md      Import the repo, framework preset, build + output settings, the five env vars,
                        the Ignored Build Step, the domain, and how to read a failed deploy.
06_HOW_THE_BOARD_USES_IT.md   The OS, module by module, in a board member's language: post, event,
                        workshop, project review, resources, members, board/terms, inheritance, audit,
                        system. What each screen is for and the one thing that trips people up.
07_INHERITANCE.md       The spine: why continuity is the point, the 8 record types, the file layout
                        under content/inheritance/, the frontmatter contract, the validator, the export,
                        and the term-end checklist. Cross-link the runbook.
08_ROADMAP.md           What's next, in three tiers: (a) before launch — the eight SETUP steps and the
                        first real write against a live DB; (b) this semester — the items in
                        docs/LATER.md with a size estimate each (prerender for mobile Lighthouse,
                        Discord webhook relay, audit filters, per-item inbox replay, RUN SNAPSHOT
                        button, supersedes picker, typed site-setting controls, record delete from the
                        UI, ticker reorder); (c) someday — alumni network, study vault, member-facing
                        OS, a third tenant. Each item: what, why, rough effort, where to start.
09_RISKS_AND_TRAPS.md   The things that will bite: Supabase 7-day pause, Vercel 100 deploys/day, the
                        one-function rule, the service key never reaching the browser, RLS on every
                        table, the snapshot-commit loop, case-insensitive macOS filenames (run 6 hit
                        this), the 409 concurrency contract, and "never remove a Tier-1 fallback".
```
Plus `docs/handoff/FIRST_WEEK.md`: five days, one goal per day, ending with the contributor having
merged one real PR.

## 5. Governance docs (short, and linked from the README)
- `docs/OWNERSHIP.md` — the account table (Vercel, Supabase, GitHub, domain, Google Form, Discord,
  Linktree, YouTube, club Gmail): who owns it, who the second owner is, how to transfer it. **Names and
  roles only — never credentials.** Mirror it into `/os/system`'s ownership sheet so the board maintains
  one list, not two.
- `docs/TERM_CHECKLIST.md` — what the board does at the start and end of every term (rollover, handoffs,
  ownership verification, link check, snapshot, roster).
- Update `docs/HANDOFF.md` to point at the new package instead of duplicating it.

---

# WORKSTREAM D — A REPO A CONTRIBUTOR CAN ACTUALLY CONTRIBUTE TO

## 6. README (the single most important file — it is what "more detailed than the old repo" means)

Structure, in this order, ≤ 2 screens before the first code block:
1. **Title + one-sentence purpose + three badges** (CI, a11y 0/0, "Tier 1: runs with no accounts").
2. **A screenshot** of the home page and one of `/os` (commit two ≤ 200 KB WebPs under `docs/img/`).
3. **What this is** — public site + board platform, in four sentences.
4. **Run it in 10 minutes** — the exact commands, the two URLs, and "you need no accounts for this".
5. **Repo map** — the annotated tree already in the README, kept current.
6. **How to contribute** — the beginner Git walkthrough the old repo did well, **in our own words**:
   fork → clone → branch → change → `make check` → push → PR, with the actual commands and what each
   one does. Then: "your first contribution" pointing at the `good first issue` label.
7. **Where the docs are** — a table linking `docs/handoff/00_START_HERE.md`, `ARCHITECTURE.md`,
   `CONTRIBUTING.md`, `SETUP.md`, `docs/RUNBOOK.md`, `DESIGN.md`.
8. **Who to ask** — club email, Discord, issues.
9. **License + attribution** — MIT, plus the old site's MIT notice and `jjcss/CSS_Website@a8fca55`.

## 7. `CONTRIBUTING.md` (rewrite around tasks, not prose)
Keep the run-10 "adding an entity" checklist. Add: the branch/commit convention (Conventional Commits,
already linted), what `make check` runs and how to read each failure, how to add a page / a data field /
an API endpoint / an OS module (one worked example each, with the real file paths), the design rules a PR
will be reviewed against (one link to `DESIGN.md`), the test expectations, and the review process
(who reviews, what gets asked, how long).

## 8. `.github/`
- **Issue templates** (YAML forms, not markdown): `bug.yml` (what you did / expected / actual / route /
  browser / `make check` output), `content.yml` (for board members: what to change, where it appears,
  who approves), `feature.yml`, `inheritance.yml` (a record that needs writing), `good_first_issue.yml`.
- **PR template**: what changed · why · how verified (`make check`, screenshots for UI) · which gate
  covers it · docs updated?
- **Labels** (create with `gh label create`, or list them in `docs/REPO_SETTINGS.md`):
  `good first issue`, `help wanted`, `board-task`, `content`, `bug`, `a11y`, `docs`, `os`, `public-site`,
  `infra`, `blocked`, `needs-design`.
- **Seed 12 real issues** from `docs/LATER.md` and the five remaining `⚠️` in the OS matrix. Five of them
  must be genuinely beginner-sized, labelled `good first issue`, each with: the file to open, what "done"
  looks like, and the command that proves it. (Examples: "ticker items should be reorderable in
  `/os/site`", "audit list needs an actor filter", "add `width`/`height` to the three `<img>` tags
  missing them", "the Events empty state should link to `+ NEW EVENT`", "add a `no data yet` line to the
  three OS tiles that render `—`".)
- `.github/SECURITY.md`: how to report a problem (club email), and the promise that no credential ever
  lives in the repo.

---

# WORKSTREAM E — CLEAN CODE

## 9. The standard (adapted from the clean-code skill Ryan linked, plus what this repo needs)

Rules, in priority order. Each one gets an automated check where an automated check is possible;
the rest go on the PR checklist.

**Naming** — intention-revealing, pronounceable, searchable; classes/types are nouns, functions are
verbs; one word per concept (pick `fetch` or `get`, not both); name length matches scope. **No**
abbreviations a first-year wouldn't know (`kb` → `knowledgeBase`), no Hungarian, no `data`/`info`/`temp`
/`handleStuff`. Enforce: a `grep` gate in `make check` for a banned-name list.

**Functions** — small, then smaller: **≤ 40 lines** (hard fail in lint), one thing at one level of
abstraction, **≤ 3 parameters** (object beyond that), no boolean flag parameters (split the function), no
output parameters, command/query separation. Enforce: `eslint` `max-lines-per-function`, `max-params`,
`complexity: 10`; `ruff` `PLR0913`, `C901`.

**Files/modules** — **≤ 300 lines** (components ≤ 200), one exported concept per file, imports sorted
and grouped. Enforce: `eslint max-lines`, `import/order`, `ruff` line count check.

**Duplication (G5) and wrong abstraction level (G6)** — the two most common smells; hunt them
explicitly. Run `jscpd` over `apps/web/src` and `api/_core` with a 1.5 % threshold and fix what it finds;
after runs 2–10 there will be real duplication (repeated fetch+fallback blocks, repeated tile specs,
repeated form scaffolding, two decode implementations, near-identical OS modules). Extract to the shared
layer that run 10 created (`os/ui/*`, `api/_core/crud.py`) rather than copying.

**Comments** — a comment is a failure to express in code, *except*: the 1–3 line file header saying what
this is and where it is used (already the convention), a `why` comment for a non-obvious decision, and a
link to the doc that explains a contract. **Delete every commented-out block**, every journal comment,
every restatement of the code. Enforce: `eslint no-warning-comments` for `TODO`/`FIXME` without an issue
link; a `grep` gate for commented-out code blocks (three or more consecutive `//`-prefixed lines
containing `(`/`;`/`=`).

**Error handling** — throw/raise with context, never return error codes; never return `null`/`None` to
signal an error (use a typed result or raise); wrap third-party calls at the boundary so Supabase's shape
does not leak into components. The run-10 error envelope is the contract; assert it in tests.

**Tests (F.I.R.S.T.)** — fast, independent, repeatable, self-validating, timely; one concept per test;
test names read as sentences (`rejects a duplicate slug`); test code held to the same standard as
production code. Current: 125 pytest + 19 vitest + sim + break — keep them green and rename any test whose
name does not say what it asserts.

**Structure** — SRP per module (a file that renders *and* fetches *and* validates gets split),
depend on abstractions at boundaries (the API client, the store), keep the newspaper layout (the
important thing first, helpers below).

## 10. The pass itself (do not just add linters — actually fix the code)
1. Turn on the rules above in `eslint.config.js`, `.stylelintrc`, `pyproject.toml` (`ruff`), and add
   `jscpd` to `make check`. Run them. Expect hundreds of findings.
2. Fix them, module by module, **committing per area** (`refactor(os): …`, `refactor(api): …`,
   `refactor(web): …`), re-running `make check` + `make smoke` + `make sim` + `make break` after each.
   **No behaviour changes.** If a fix would change behaviour, it becomes an issue, not a commit.
3. Write `docs/CODE_STANDARDS.md`: the rules above in one page, with a *good/bad* example from **this
   repo** for each — a real before/after, not invented code.
4. Record before/after in the report: file count, largest file, average function length, jscpd duplication
   %, eslint/ruff findings, and the three worst offenders you fixed.
5. **A readability check that is not a linter:** pick the three files a new contributor is most likely to
   open first (`apps/web/src/pages/Home.tsx`, `apps/web/src/os/OsPosts.tsx`, `api/_core/routers/posts.py`)
   and rewrite their top 30 lines so that someone who has written one React component and one Python
   function can follow them. That is the actual bar: "elementary understanding".

---

## 11. Gate

1. **Repo**: `.git` ≤ 25 MB (or the orphan-history fallback, logged); branch `main`; `origin` set; pushed
   (or the §2.4 message printed); a fresh clone runs `make install && make check && make dev` green.
2. **No secret in any commit, ever** — gitleaks over full history clean, twice.
3. **Centralisation**: `vercel.json` + `scripts/vercel_should_build.sh` (12 unit-tested cases) + workflow
   concurrency + bot-commit guard; `docs/HOSTING_LIMITS.md` with the §3 tables; `/os/system` HOSTING panel
   reading real numbers; `scripts/check_assets.mjs`, `scripts/check_migrations.py`, `scripts/db_budget.py`
   all wired into `make check` or a workflow.
4. **Handoff**: `docs/handoff/` 00–09 + `FIRST_WEEK.md`, every status claim backed by a named gate;
   `docs/OWNERSHIP.md`, `docs/TERM_CHECKLIST.md`, `docs/ENVIRONMENT.md`, `.env.example`.
5. **Contributor**: README with screenshots and the 10-minute start; CONTRIBUTING with four worked
   examples; five issue templates + PR template; 12 labels; 12 seeded issues of which 5 are
   `good first issue` with a file, a definition of done and a proving command.
6. **Clean code**: every rule in §9 either enforced or on the PR checklist; jscpd < 1.5 %; no file > 300
   lines; no function > 40 lines; zero commented-out blocks; `docs/CODE_STANDARDS.md` with real
   before/after examples; the three entry files rewritten for legibility.
7. **Nothing regressed**: `make check`, `make a11y` 0/0, `make smoke` 9/9 + 12/12, `make sim` 25/25,
   `make break` 16/16, Lighthouse desktop ≥ 85, type v5 audit green.

## 12. Don'ts

Do not push anything that fails §11.1–2. Do not put a credential, a token, or a `.env` in the repo or in
any doc — names and owners only. Do not create the club's Vercel or Supabase accounts (Ryan does that
under the club Gmail; you write the instructions). Do not delete a Tier-1 fallback. Do not change
behaviour during the clean-code pass. Do not add a dependency to satisfy a lint rule. Do not reintroduce
the KICKOFF prompts to the root. No LLM, no keys, no second Vercel function, no questions except §2.4.

## 13. End of run

Commits: `chore(repo): slim history, main, remote`, `feat(infra): deployment + database budget guards`,
`docs(handoff): the maintainer package`, `docs(repo): contributor-grade README, templates, issues`,
`refactor(*): clean-code pass`, `chore: report`.

Write `qa/REPORT_RUN11.md` (before/after: repo size, file/function metrics, duplication %, the limits
table with our measured usage, what was seeded, what is still Ryan's to do), and
`docs/archive/context/44_RUN11_LOG.md`.

Print at the end: the gate table; the repo URL and clone size; **the exact numbered list of what Ryan
must still do himself** (create the club Vercel + Supabase projects under `computersocjjay@gmail.com`,
the five env vars by name, run the migrations, seed, bootstrap admin, do one real write, point the
domain, transfer the repo to `jjcss` and flip CODEOWNERS); and `make dev`.
