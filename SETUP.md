# SETUP.md — the ~10-minute human steps

Everything below is optional for development: `npm run dev` + `uvicorn` work with
zero accounts (Tier 1). These steps put the site on the internet and turn on the
database. **Use the club account (computersocjjay@gmail.com) for every service.**

## 1. Vercel project (~4 min)

1. Push this repo to GitHub (Ryan's account for now; transfer to the `jjcss` org
   once the board takes over).
2. vercel.com → Add New Project → import the repo. Settings:
   - **Root Directory**: repo root (leave as `.`)
   - **Build Command**: `npm run build --prefix apps/web`
   - **Output Directory**: `apps/web/dist`
   - **Install Command**: `npm install --prefix apps/web`
   - Framework preset: Other (Vite works fine under "Other" with the commands above)
3. `vercel.json` already routes `/api/(.*)` → the one Python function and
   everything else → the SPA. Python needs no extra config (Vercel detects
   `api/index.py` + `api/requirements.txt`).
4. Deploy. Check `https://<project>.vercel.app/api/health` → `{"ok":true,...}`.

## 2. Supabase project (~4 min) — optional until the OS is used

1. supabase.com → New project (club account, free tier).
2. SQL Editor → paste `supabase/migrations/0001_init.sql` → Run.
3. Vercel → Project → Settings → Environment Variables:
   - `SUPABASE_URL` = the project URL
   - `SUPABASE_SERVICE_KEY` = the service_role key (Production only; never in the repo)
4. Redeploy. `/api/health` now reports `"db":"ok"`.

## 3. GitHub repo settings (~2 min)

1. Repo → Settings → Secrets and variables → Actions:
   - **Variable** `SITE_URL` = `https://<project>.vercel.app` (keepalive + smoke).
   - (Optional) **Variable** `VERCEL_DRY_RUN` = `true` + **Secret** `VERCEL_TOKEN`
     to enable the deploy dry-run in CI.
2. Workflows already committed: `ci.yml` (build+tests+guards on every push/PR),
   `keepalive.yml` (pings the API every 3 days so Supabase never pauses),
   `post-deploy-smoke.yml` (fails loudly if a deploy went stale).

## 4. When the board takes over (later)

- Transfer the GitHub repo to the `jjcss` org; keep ≥ 2 org owners.
- Move the Vercel + Supabase projects to the club account if they aren't already.
- Click-test every link in `data/links.json` + `data/resources.json`
  (the Discord invite is from 2021!) and set `"verified": true`.
- Replace the three example entries in `data/apps.json` with real submissions.
- Add the Fall 2026 events to `data/events.json` (or via the OS once it ships).

## Local development (no accounts)

```bash
npm install --prefix apps/web && npm run dev --prefix apps/web   # :5173
python3 -m venv .venv && .venv/bin/pip install -r api/requirements.txt
.venv/bin/uvicorn api.index:app --port 8000                      # :8000 (proxied)
```

Regenerate migrated content: `python scripts/extract_old_site.py && python
scripts/images.py && python scripts/build_kb.py && python scripts/validate_data.py`
(needs `.cache/CSS_Website` — `git clone https://github.com/jjcss/CSS_Website .cache/CSS_Website`).
