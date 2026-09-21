# 03 — Local setup (macOS · Linux · Windows with WSL)

You need **Node 22+** and **Python 3.12+**. Nothing else — no accounts, no keys, no Docker.

- macOS: `brew install node python@3.12` (or use `nvm` + `pyenv`; `.nvmrc` and `.python-version` name the versions).
- Linux: your package manager, or `nvm` + `pyenv`.
- Windows: install **WSL 2** (Ubuntu), then follow the Linux line inside it. The Makefile, the scripts and the
  Playwright runs assume a POSIX shell; native PowerShell is not supported.

## The commands

```bash
git clone https://github.com/ryanjdorestal/css_club_website.git jjay_css
cd jjay_css
make install
```

Expected: npm prints its install summary for `apps/web`; a `.venv/` appears; pip installs FastAPI, httpx,
Pillow, ruff, mypy, pytest, sqlparse. Two to four minutes on a normal connection.

```bash
make dev
```

Expected — two coloured prefixes, `web` and `api`:

```
[web]  VITE v8  ready in ~600 ms  ➜  Local: http://localhost:5173/
[api]  INFO: Uvicorn running on http://127.0.0.1:8000
[api]  env: Tier 1 — no Supabase variables set; local JSON + inbox (fine for dev)
```

Open http://localhost:5173 — the site. http://localhost:5173/os — the OS; under the login form, the LOCAL_DEV
strip lets you pick **admin** or **officer** (this strip does not exist on Vercel).

```bash
make check
```

Expected: ruff `All checks passed!`, oxlint warnings only (no errors), prettier `All matched files use Prettier
code style!`, mypy `Success`, pytest `146 passed`, vitest `19 passed`, the audits `0 finding(s)` /
`0 unresolved` / `0 stray`, `OK — one function`, `11/11 schemas pass`, `2 record(s) … 0 error(s)`,
`5 migration(s), 0 error(s)`, `check-assets: 0 finding(s)`, ts-prune silent, `No depcheck issue`. About 90 s.

Optional, with `make dev` running in another terminal: `make a11y` (0/0), `make smoke` (12/12 + 9/9),
`make sim` (25/25, ~3 min), `make break` (16/16, ~3 min). Run those **one at a time** — each resets the Tier-1
store, so two in parallel wipe each other's rows.

## The three things that usually go wrong

1. **`python3: command not found` or Python 3.9.** `make install` needs 3.12+. `python3 --version`; on macOS
   `brew install python@3.12` and make sure it is first on your PATH (`which python3`). Delete `.venv/` and run
   `make install` again.
2. **Port 5173 or 8000 is taken.** Something else (another Vite, another uvicorn) is running. `lsof -i :5173`
   (`ss -ltnp` on Linux), stop it, or run the two halves yourself:
   `npm run dev --prefix apps/web -- --port 5174` and `.venv/bin/uvicorn api.index:app --port 8001` (then set
   the Vite proxy target in `apps/web/vite.config.ts` for that session).
3. **Playwright says the browser is missing** (`make a11y` / `make smoke`). Run
   `npx --prefix apps/web playwright install --with-deps chromium` once.

Also seen: `make check` red on `docs/API.md changed — commit it` means you added or changed an endpoint —
`make api-docs` regenerates the file; commit it with your change. `git status` showing `data/*.local.json` is
normal; those are your Tier-1 tables and are gitignored. `make restore-empty` clears them.

## Where things are

`README.md` § "The map". Short version: `apps/web/src/pages` (public pages), `apps/web/src/os` (the OS),
`api/_core` (the API), `data/` + `content/` (what the site shows), `supabase/migrations` (the schema),
`scripts/` (every tool has `--help` or a header comment).
