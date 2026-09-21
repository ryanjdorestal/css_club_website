# ENVIRONMENT.md — every variable, in one table

Names only. Values live in the hosts' settings (Vercel → Environment Variables, GitHub → Actions secrets) and
never in the repo, a doc, a Discord message or a handoff. `.env.example` lists the same names for local use;
`scripts/env_validate.py` runs at API startup, in CI and in the Vercel build and fails with a readable line when
Tier 2 is half-configured (some Supabase variables set, others missing) — the state that produces confusing 500s.

Tier 1 (`make dev`, the default) needs **none** of these.

| Variable                 | Read by         | Who supplies it                                  | What breaks without it                                             | Secret?                                                                                                                                                       |
| ------------------------ | --------------- | ------------------------------------------------ | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `SUPABASE_URL`           | API (server)    | Supabase → Settings → API → Project URL          | Tier 1 only: reads from committed JSON, OS writes go to the inbox  | no (it is a hostname)                                                                                                                                         |
| `SUPABASE_SERVICE_KEY`   | API (server)    | Supabase → Settings → API → `service_role`       | same as above; the API cannot write to the database                | **yes** — bypasses RLS; Vercel env only; never in the browser bundle                                                                                          |
| `SUPABASE_JWT_SECRET`    | API (server)    | Supabase → Settings → API → JWT Secret           | the API cannot verify logins; every visitor is a guest             | **yes**                                                                                                                                                       |
| `VITE_SUPABASE_URL`      | browser (build) | same value as `SUPABASE_URL`                     | the login page cannot request an email code                        | no                                                                                                                                                            |
| `VITE_SUPABASE_ANON_KEY` | browser (build) | Supabase → Settings → API → `anon` / publishable | the login page cannot request an email code                        | no — **public by design**: it only unlocks what row-level security allows, and every table has RLS with public read on published rows and no anonymous writes |
| `SITE_URL`               | CI (variable)   | the Vercel production URL                        | the keepalive live check and the post-deploy smoke skip themselves | no                                                                                                                                                            |
| `VERCEL_DRY_RUN`         | CI (variable)   | `true` to enable the build dry-run job           | the optional job is skipped                                        | no                                                                                                                                                            |
| `VERCEL_TOKEN`           | CI (secret)     | Vercel → Account → Tokens                        | only the optional build dry-run                                    | **yes**                                                                                                                                                       |
| `LOCAL_DEV`              | API (server)    | nobody — set by `make dev`'s absence of Vercel   | n/a: the `X-Local-Role` header is honoured only off Vercel         | no                                                                                                                                                            |

Where each is set:

| Place                                                           | Variables                                                                                                |
| --------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Vercel → Settings → Environment Variables (Production, Preview) | `SUPABASE_URL` `SUPABASE_SERVICE_KEY` `SUPABASE_JWT_SECRET` `VITE_SUPABASE_URL` `VITE_SUPABASE_ANON_KEY` |
| GitHub → Settings → Secrets and variables → Actions → Secrets   | `SUPABASE_URL` `SUPABASE_SERVICE_KEY` (snapshot + keepalive), optional `VERCEL_TOKEN`                    |
| GitHub → … → Actions → Variables                                | `SITE_URL`, optional `VERCEL_DRY_RUN`                                                                    |
| A contributor's laptop (`.env`, gitignored)                     | their **own** dev project's values, or nothing (Tier 1)                                                  |

Why the anon key may sit in the browser: Supabase's anon key identifies the project, not a person. Every table
has row-level security (`supabase/migrations/0001_init.sql`, `0002_os.sql`): anonymous readers see published
rows, nobody writes without a verified session, and the OS writes go through the API with the service key on
the server. Rotating the anon key changes nothing about what the public can reach.
