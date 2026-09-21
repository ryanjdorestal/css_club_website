# SETUP.md — accounts and env vars (the human steps)

Everything below is optional for development: `make dev` works with zero
accounts (Tier 1). These 8 steps put the site on the internet and turn on the
database + the board login. **Use the club account (computersocjjay@gmail.com)
for every service** and keep two owners on each (docs/HANDOFF.md).

Secrets are named here and set only in the hosts' settings — never in the repo.

| # | Where | What |
|---|---|---|
| 1 | GitHub | Push the repo (Ryan's account for now; transfer to the `jjcss` org when the board takes over) |
| 2 | Vercel | Import the repo. Root `.`, Build `npm run build --prefix apps/web`, Output `apps/web/dist`, Install `npm install --prefix apps/web`, Framework: Other. `vercel.json` routes `/api/*` to the one Python function. Deploy → `/api/health` must say `{"ok":true}` |
| 3 | Supabase | New project (free tier). SQL Editor → run `supabase/migrations/0001_init.sql`, then `0002_os.sql` |
| 4 | Supabase → Authentication → Providers | Enable **Email** with "Email OTP / magic link" (no password). Set the site URL to the Vercel URL and add `https://<project>.vercel.app/os` to the redirect allow-list |
| 5 | Vercel → Settings → Environment Variables (Production) | `SUPABASE_URL` · `SUPABASE_SERVICE_KEY` (service_role — server only) · `SUPABASE_JWT_SECRET` (Settings → API → JWT Secret) · `VITE_SUPABASE_URL` · `VITE_SUPABASE_ANON_KEY` (the anon key; this one is public by design). Redeploy → `/api/health` reports `"db":"ok"` |
| 6 | Terminal (once) | Seed the database from the committed JSON: `SUPABASE_URL=… SUPABASE_SERVICE_KEY=… .venv/bin/python scripts/snapshot.py --restore`, then add the first admin: `… scripts/bootstrap_admin.py --email you@jjay.cuny.edu --name "Your Name"` |
| 7 | GitHub → Settings → Secrets and variables → Actions | Variable `SITE_URL` = the Vercel URL (keepalive + post-deploy smoke). Secrets `SUPABASE_URL` + `SUPABASE_SERVICE_KEY` (nightly snapshot that keeps `data/` current). Optional: `VERCEL_DRY_RUN=true` + `VERCEL_TOKEN` for the build dry-run in CI |
| 8 | Browser | `/os/login` → your email → the 6-digit code → you are `admin`. Add the other officers on `/os/board` (their login email + ACTIVE on). Fill the ownership sheet on `/os/inheritance` |

The storage bucket `public-media` is created by `0002_os.sql` (public read,
API-only write). Uploads from the OS land there; in Tier 1 they land in
`.cache/uploads/`.

## Workflows already committed
- `ci.yml` — guards + tests + build on every push/PR (api count, schemas, ruff/mypy, pytest, vitest, Playwright smoke)
- `keepalive.yml` — pings `/api/health` every 3 days so the free Supabase project never pauses; records `qa/keepalive.json`
- `snapshot.yml` — nightly `scripts/snapshot.py`; commits `chore(snapshot): …` when `data/` or `content/` changed
- `post-deploy-smoke.yml` — fails loudly if a deploy went stale (live SHA ≠ pushed SHA)

## Local development (no accounts)
```bash
make dev        # web :5173 (proxies /api) + api :8000 — see README.md
make check      # lint + types + tests + guards
```
Regenerate migrated content: `python scripts/extract_old_site.py && python
scripts/images.py && python scripts/build_kb.py && python scripts/validate_data.py`
(needs `.cache/CSS_Website` — `git clone https://github.com/jjcss/CSS_Website .cache/CSS_Website`).

## When the board takes over
See docs/HANDOFF.md: transfer the repo to `jjcss` (≥ 2 org owners), move the
Vercel + Supabase projects to the club account, point the domain, click-test
every link on `/os/resources`, replace the three EXAMPLE projects.
