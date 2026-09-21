# HOSTING_LIMITS.md — one Vercel project, one Supabase project, and why neither can trip a free-tier limit

The club runs on two free tiers. Exceeding a Vercel Hobby limit **pauses that feature for the rest of the
billing period (up to 30 days)**; exceeding a Supabase Free limit sets the database read-only or pauses the
project. That is the failure mode this page engineers away. Numbers verified 2026-09-21; re-check them once a
year (both vendors publish them on their pricing pages).

Hobby is for **non-commercial personal use** — a student club site with no ads or sales qualifies. If the club
ever sells anything through the site, the project must move to a paid plan first.

## Vercel Hobby — limits, our use, the guard

| Limit                        | Hobby     | Our expected use | Guard                                                                                  |
| ---------------------------- | --------- | ---------------- | -------------------------------------------------------------------------------------- |
| Deployments per day          | 100       | ~5               | §1 ignored-build-step skips docs/qa/workflow commits; CI concurrency collapses bursts  |
| Function invocations / month | 1,000,000 | < 20,000         | one function; every public read has a bundled JSON fallback; `/api/*` is `no-store`    |
| Active CPU                   | 4 CPU-h   | minutes          | nothing heavy in the request path — link checks and snapshots run in GitHub Actions    |
| Provisioned memory           | 360 GB-h  | small            | default memory, one function                                                           |
| Fast data transfer / month   | 100 GB    | < 5 GB           | static assets cached `immutable` for a year; every image a pre-sized WebP ≤ 400 KB     |
| Fast origin transfer / month | 10 GB     | < 1 GB           | everything static is served from the edge cache after the first hit                    |
| Edge requests / month        | 1,000,000 | low              | —                                                                                      |
| Image transformations        | 5,000     | **0**            | §2 — the image optimiser is never used; `scripts/check_assets.mjs` enforces the policy |
| Function max duration        | 300 s     | < 5 s            | the API does reads, writes and one image resize; nothing waits on a third party        |
| Projects                     | 200       | 1                | —                                                                                      |
| Domains per project          | 50        | 2                | `jjaycss.tech` + the `*.vercel.app` URL                                                |

## Supabase Free — limits, our use, the guard

| Limit                | Free                     | Our expected use        | Guard                                                                                       |
| -------------------- | ------------------------ | ----------------------- | ------------------------------------------------------------------------------------------- |
| Database size        | 500 MB                   | a few MB                | `scripts/db_budget.py` fails the keepalive workflow at 70 %; audit prune                    |
| File storage         | 1 GB                     | < 100 MB                | uploads ≤ 2 MB, resized to 1600 px, EXIF stripped; the same 70 % check                      |
| Egress / month       | 5 GB                     | < 1 GB                  | the public site reads bundled JSON; the API caches nothing but sends little                 |
| Monthly active users | 50,000                   | < 20 (the board)        | only officers log in                                                                        |
| Projects             | 2 per organisation       | **1** (`jjay-css-prod`) | the second slot stays empty for a future maintainer's dev project — never burn it on a test |
| Compute              | shared CPU, 500 MB RAM   | small                   | —                                                                                           |
| Backups              | none                     | —                       | §3 — the nightly snapshot into the repo is the backup                                       |
| Inactivity           | pauses after 7 idle days | —                       | the keepalive writes every 3 days and fails loudly if the write is not read back            |

## 1. Deployment centralisation (updates can never hit a limit)

- **One project, one production branch.** Vercel project `jjay-css` ← GitHub `css_club_website`, production =
  `main`. `vercel.json` pins `git.deploymentEnabled.main`, the install/build/output commands and the cache
  headers, so the dashboard holds no configuration a contributor cannot read.
- **Ignored Build Step.** Vercel → Settings → Git → Ignored Build Step → `bash scripts/vercel_should_build.sh`.
  A commit earns a build only when it touches `apps/web/**`, `api/**`, `brand/**`, `data/**`, `content/**`,
  `public/**`, `supabase/**`, `package*.json` or `vercel.json`. Docs-only, `qa/**`-only and workflow-only commits
  are skipped, and the script prints the reason so the Vercel log explains itself. Thirteen example diffs are
  table-tested in `scripts/tests/test_vercel_should_build.py`.
- **CI concurrency.** Every workflow declares `concurrency: { group: workflow-ref, cancel-in-progress: true }`,
  so five pushes in a minute collapse to one run.
- **No bot loop.** The nightly snapshot never pushes to `main`. It commits to the `snapshot` branch, opens one
  pull request, dispatches CI on it and enables auto-merge — the PR lands by itself when `check` is green,
  once a day at most; its job is guarded with `github.actor != 'github-actions[bot]'` so a bot commit can never
  start a run that makes another bot commit. The keepalive commits nothing at all (it used to write
  `qa/keepalive.json`; the OS now reads the keepalive row from the database and the workflow's last run from
  the GitHub API).
- **Cron budget** — nothing runs more often than daily:

  | Workflow    | Schedule                     | What it does                                                                    |
  | ----------- | ---------------------------- | ------------------------------------------------------------------------------- |
  | keepalive   | every 3 days, 06:17          | write + read back `site_settings.keepalive`; `db_budget.py`; live `/api/health` |
  | snapshot    | nightly, 07:23               | DB → `data/*.json` + `content/**` on the `snapshot` branch → auto-merged PR     |
  | link-check  | weekly, Monday 08:00         | lychee over the built site, data and docs                                       |
  | lighthouse  | pull requests only           | desktop + mobile scores on the preview                                          |
  | a11y        | pushes and PRs               | pa11y + axe, must stay 0                                                        |
  | secret-scan | pushes and PRs               | gitleaks over the history                                                       |
  | CI          | pushes, PRs, and on dispatch | `make check` + build + render smoke; the functional job (smoke, sim, break)     |

- **A usage page in the OS.** `/os/system` → HOSTING shows deployments today (CI runs on `main` from the public
  GitHub API — no token; UNKNOWN when the repo is private or the API is unreachable), days since the last
  database write, the keepalive and snapshot ages, database and storage percentages from `hosting_usage()`
  (migration 0005), and this page's tables with a "what happens if we exceed it" line each. No fake numbers.

## 2. Asset and image policy (protects the 5,000 transformations and the transfer budget)

We never use Vercel's image optimiser (no `next/image`, no `/_vercel/image`). Every image is a pre-sized WebP
committed under `apps/web/public/img/` (photos ≤ 1600 px, ≤ 400 KB) or uploaded to Supabase Storage at ≤ 1600 px
by the API (run 10: magic-byte sniffing, EXIF stripped). `scripts/check_assets.mjs` runs in `make check`: every
file under `public/img` is `.webp` or `.svg`, ≤ 400 KB, and referenced somewhere; every `<img>` carries `width`,
`height`, `loading` and `decoding`. `vercel.json` sets `Cache-Control: public, max-age=31536000, immutable` on
`/assets/*`, `/img/*`, `/cube/*` and `/hound/*`, and `no-store` on `/api/*`.

## 3. Supabase centralisation

- **One project**, owned by the club Google account (computersocjjay@gmail.com), region `us-east-1`, named
  `jjay-css-prod`. The organisation's second free project stays **empty** so a future maintainer can create a
  dev project without paying (docs/handoff/04_SUPABASE_SETUP.md says: never develop against prod).
- **Migrations are the only way the schema changes.** `supabase/migrations/NNNN_*.sql`, applied in order in the
  SQL editor, never edited after they ship. `scripts/check_migrations.py` (in `make check`) refuses a gap or a
  duplicate number, a file with no real statement, and any `drop table` / `drop column` / `truncate` without a
  `-- guard:` comment on the line above.
- **Size guard.** `scripts/db_budget.py` (run by the keepalive workflow every 3 days, and `make budget` by hand)
  calls the service-role-only `hosting_usage()` function and fails at 70 % of 500 MB database or 1 GB storage;
  the OS HOSTING panel shows the same percentages. Uploads go to Storage (1 GB), not the database. The only table
  that grows without bound is `records` (the audit log): `/os/audit` has a **prune older than 12 months** action
  (admin, typed confirm) — run it once a year; the records it removes were already snapshotted into the repo.
- **Pause protection.** `scripts/keepalive.py` writes `site_settings.keepalive` and reads it back; a mismatch
  fails the workflow, so a paused project or a rotated key is red in the Actions tab within 3 days instead of
  being found when a login fails.
- **Backups.** The free tier has none. The nightly snapshot (`scripts/snapshot.py`) pulls every published row
  into committed JSON and markdown — that is the backup, and `scripts/snapshot.py --restore` is the restore
  path. Once a month, a board member also takes a manual dump for the club Drive: Supabase → Database →
  Backups is not on Free, so use `pg_dump` with the connection string from Settings → Database
  (`pg_dump "$DATABASE_URL" --no-owner --schema=public > jjcss-YYYY-MM.sql`), upload it to the club Drive, and
  delete the local copy. Never commit a dump — it holds member emails.

## 4. What Ryan (or the next maintainer) does once

Create the two projects under the club Gmail, paste the five env vars by name from `docs/ENVIRONMENT.md`, run the
migrations, seed, bootstrap the first admin, set the Ignored Build Step, point the domain. Step by step in
`docs/handoff/04_SUPABASE_SETUP.md` and `05_VERCEL_SETUP.md`.
