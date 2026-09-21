# 05 — Vercel setup (the one project that hosts everything)

One Vercel project, on the **Hobby** plan (free, non-commercial — a student club qualifies), owned by the club
Google account, connected to the GitHub repo. A merge to `main` is a deploy. Nothing else deploys.

## 1. Import the repo (5 min)

vercel.com → sign in with GitHub as the club account (or your own for a test project) → Add New → Project →
Import `css_club_website`. Vercel reads `vercel.json`, which already sets:

| Setting           | Value (from `vercel.json`)                                                 |
| ----------------- | -------------------------------------------------------------------------- |
| Framework preset  | Other (`"framework": null`)                                                |
| Install command   | `npm install --prefix apps/web`                                            |
| Build command     | `python3 scripts/env_validate.py && npm run build --prefix apps/web`       |
| Output directory  | `apps/web/dist`                                                            |
| Root directory    | `.` (leave blank)                                                          |
| Functions         | `api/index.py` with `api/_core/**` included — the ONE function             |
| Rewrites          | `/api/*` → the function; everything else → `index.html`                    |
| Headers           | `/assets`, `/img`, `/cube`, `/hound` immutable for a year; `/api` no-store |
| Production branch | `main` (`git.deploymentEnabled`)                                           |

Do not change these in the dashboard; change the file and merge it. Node version: 22 (Settings → General →
Node.js Version, match `.nvmrc`). Python: Vercel picks 3.12 for `api/index.py` from `.python-version`.

## 2. The five environment variables (3 min)

Settings → Environment Variables → add for **Production** and **Preview**: `SUPABASE_URL`,
`SUPABASE_SERVICE_KEY`, `SUPABASE_JWT_SECRET`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` — values from
`04_SUPABASE_SETUP.md` § 4. Leave all five empty for a Tier-1-only deploy; set none or all (the build runs
`scripts/env_validate.py` and fails with a readable line on a half set).

## 3. The Ignored Build Step (1 min — this is what keeps the deploy count low)

Settings → Git → Ignored Build Step → **Custom** → `bash scripts/vercel_should_build.sh`. From then on a commit
that touches only docs, `qa/`, workflows or scripts is skipped with a one-line reason in the build log
("skip: only non-site paths changed"). `docs/HOSTING_LIMITS.md` § 1 explains the budget.

## 4. Deploy and verify (3 min)

Deploy. When it is green: `https://<project>.vercel.app/api/health` must answer `{"ok":true,"sha":"<the commit>",
"db":"ok"|"skipped",…}`. `db: ok` = Supabase configured and reachable; `skipped` = Tier 1 (fine). Open `/` and
`/os/login` once — look, do not assume.

Then GitHub → Settings → Actions → Variables → `SITE_URL` = that URL, so the keepalive live check and the
`post-deploy-smoke` workflow can compare the live SHA with the pushed one.

## 5. The domain (5 min, club project only)

Settings → Domains → add `jjaycss.tech` (and `www.`). Vercel shows the A / CNAME records; set them at the
registrar (the ownership sheet says who holds it). Update Supabase → Authentication → URL Configuration to the
domain. Add the domain as the repo's homepage (`gh repo edit --homepage`).

## How to read a failed deploy

Deployments → the red one → Build Logs.

| You see                                             | It means                                         | Do                                                        |
| --------------------------------------------------- | ------------------------------------------------ | --------------------------------------------------------- |
| `env: Tier 2 is half-configured — missing …`        | some of the five variables are set, not all      | add the missing ones (or remove all), redeploy            |
| `error TS…` / `tsc` output                          | a type error that `make check` would have caught | run `make check` locally; CI should have been red too     |
| `Error: No Output Directory named "apps/web/dist"`  | the build command changed or failed silently     | keep `vercel.json` as is; check the install step above it |
| two `.func` entries under Functions                 | a second file appeared under `api/`              | remove it; `scripts/check_api_count.py` fails CI for this |
| deploy green but `/api/health` reports an old `sha` | a stale deploy (function not rebuilt)            | docs/RUNBOOK.md → "Deploy stale": Redeploy without cache  |
| `skip: only non-site paths changed`                 | not a failure — the Ignored Build Step worked    | nothing                                                   |

Rollback: Deployments → the previous green one → Promote to Production. Fix forward on `main`.
