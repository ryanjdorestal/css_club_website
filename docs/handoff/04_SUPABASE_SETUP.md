# 04 — Supabase setup (your own dev project, or the club's production project)

**Rule one: never develop against the club's project.** Supabase Free gives every organisation two projects;
the club's organisation keeps its second slot empty so a maintainer can create a dev project there when needed,
or — better — you create one under your own free account. Migrations are files; running them twice on two
projects is the point.

Rule two: values go into `.env` (gitignored) locally and into Vercel/GitHub settings in production. Never into
a file that is committed, a doc, a chat or a handoff record. `docs/ENVIRONMENT.md` names every variable.

## The free tier you are inside (docs/HOSTING_LIMITS.md has the guards)

| Limit        | Free                     | Note                                                                       |
| ------------ | ------------------------ | -------------------------------------------------------------------------- |
| Database     | 500 MB                   | the club uses a few MB; `scripts/db_budget.py` alarms at 70 %              |
| File storage | 1 GB                     | uploads are ≤ 2 MB, resized to 1600 px                                     |
| Egress       | 5 GB / month             | the public site reads bundled JSON, not the database                       |
| MAU          | 50,000                   | only the board logs in                                                     |
| Projects     | 2 per organisation       | production + one empty slot                                                |
| Backups      | none                     | the nightly snapshot into the repo is the backup                           |
| Inactivity   | pauses after 7 idle days | the keepalive writes every 3 days; a paused project is restored by a click |

## 1. Create the project (5 min)

1. supabase.com → New project. For **the club**: sign in as computersocjjay@gmail.com, organisation
   "John Jay CSS", project name `jjay-css-prod`, region **East US (North Virginia)** = `us-east-1`, a strong
   database password saved in the club password manager (you will not need it day to day). For **your dev
   project**: your own account, any name.
2. Wait for "Project is ready" (about two minutes).

## 2. Run the migrations, in order (5 min)

SQL Editor → New query → paste the whole file → Run, for each of:

1. `supabase/migrations/0001_init.sql` — tables, row-level security, the public-read policies
2. `0002_os.sql` — the OS columns, the `public-media` storage bucket
3. `0003_inheritance.sql` — the spine
4. `0004_workshops.sql`
5. `0005_hosting.sql` — the `hosting_usage()` budget function and the keepalive row

Each ends with "Success. No rows returned". Never edit a shipped migration; add `0006_*.sql` instead
(`scripts/check_migrations.py` enforces the numbering and refuses an unguarded `drop`).

## 3. Turn on email-code login (3 min)

Authentication → Providers → **Email**: enabled, **Confirm email** off, "Enable Email OTP" / magic link on,
no password sign-ups. Authentication → URL Configuration: Site URL = your Vercel URL (or
`http://localhost:5173` for dev); Redirect URLs: add `<site url>/os`.

## 4. Copy the five values (2 min)

Settings → API: **Project URL**, **anon public** key, **service_role** key (click to reveal; server only),
**JWT Secret**. Put them where `docs/ENVIRONMENT.md` says: locally in `.env` as `SUPABASE_URL`,
`SUPABASE_SERVICE_KEY`, `SUPABASE_JWT_SECRET`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`; in production in
Vercel → Environment Variables. All five or none — `scripts/env_validate.py` refuses a half set.

## 5. Seed from the committed files (2 min)

```bash
set -a; source .env; set +a          # load the five variables into this shell
.venv/bin/python scripts/snapshot.py --restore
```

Expected: one line per table with the row count pushed, then `validate_data: 11/11 schemas pass`. The database
now holds exactly what the site shows today.

## 6. Bootstrap yourself as admin (1 min)

```bash
.venv/bin/python scripts/bootstrap_admin.py --email you@jjay.cuny.edu --name "Your Name" --role "Webmaster"
```

Expected: `admin row created on term F26` (or the current term). This is the only manual role assignment ever
needed; every later officer is added on `/os/board`.

## 7. Verify with one real write (3 min)

`make dev` (the API prints `env: Tier 2 — Supabase server + browser variables present`), open `/os/login`,
enter your email, paste the 6-digit code, land on `/os` as **admin**. Publish a post on `/os/posts`. Then in
Supabase → Table Editor → `posts`, the row is there, and `records` has a `create` and a `publish` line with your
email. `/os/system` shows `SUPABASE · reachable` and the HOSTING panel shows the database percentage from
`hosting_usage()`.

If the chip says `unreachable — paused or wrong keys`: the project is paused (dashboard → Restore) or a value
was pasted with a trailing space.

## 8. Only for the club's project

- GitHub → Settings → Secrets and variables → Actions: secrets `SUPABASE_URL`, `SUPABASE_SERVICE_KEY` (the
  nightly snapshot and the keepalive use them); variable `SITE_URL` = the Vercel URL.
- Run the keepalive once by hand (Actions → keepalive → Run workflow): green means the write + read-back works
  and the budget is under 70 %.
- Record the owner and the second owner on `/os/system` → Ownership and in `docs/OWNERSHIP.md`.

## Restore from nothing

New project → the five migrations → `scripts/snapshot.py --restore` → `bootstrap_admin.py` → set the env vars →
redeploy. The public site kept serving the whole time (Tier 1); the OS inbox holds any writes made meanwhile
(`/os/audit` → Replay to DB).
