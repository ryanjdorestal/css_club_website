# jjay_css — John Jay Computer Science Society

Public site + internal club platform ("OS") for the Computer Science Society at
John Jay College (CUNY). React + TS + Vite front end, one FastAPI function, new
Supabase project, Vercel hosting. See `DESIGN.md` before touching any UI.

## Run it (Tier 1 — zero accounts)

```bash
npm install --prefix apps/web
npm run dev --prefix apps/web          # site on :5173
pip install -r api/requirements.txt
uvicorn api.index:app --port 8000      # API on :8000
```

Everything renders from committed JSON in `data/` + markdown in `content/`.
No env vars needed; Supabase/Vercel config is read from the host when present.

## Contributor contract

- Add an **event**: one entry in `data/events.json` + a flyer in `apps/web/public/img/events/`. PR.
- Add an **app**: submit the form on `/apps` — no PR needed; board approves in the OS.
- Change **board/roster**: `data/board.json`. PR.
- Change **copy**: `content/*.md`. PR.
- Change the **look**: `apps/web/src/tokens.css` first, then components. Read `DESIGN.md`. PR + screenshot.
- Deploy = merge to `main`. Nobody deploys by hand.

## Layout

```
apps/web/     React + TS + Vite — public site and /os (one SPA)
api/          index.py (the one FastAPI app) + requirements.txt — <= 2 files, CI-enforced
brand/        brand.config.ts — the only place club identity lives
data/ content/ committed JSON + markdown the site renders from
supabase/     migrations for the John Jay Supabase project
scripts/      extraction, validation, guards
qa/           screenshots, test logs, REPORT.md
```

License: MIT (see `LICENSE`; content migrated from `jjcss/CSS_Website@a8fca55`).
