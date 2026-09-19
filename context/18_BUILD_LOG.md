# 18 — Build log (autonomous run, 2026-09-19)

Decisions made without asking, per the 120-minute rule. One line of reason each.

| # | Phase | Decision | Reason |
|---|---|---|---|
| 1 | 0 | Vite `react-ts` template, cleaned of boilerplate (no App.css/index.css) | Plan names Vite+React+TS; tokens.css is the only stylesheet entry. |
| 2 | 0 | Vite aliases `@brand`/`@data`/`@content` point at repo-root folders; `server.fs.allow` widened to repo root | Keeps brand config + committed JSON as single sources of truth without copying into src/. |
| 3 | 0 | Dev proxy `/api` → `127.0.0.1:8000` (uvicorn) | Mirrors the Vercel rewrite so Tier-1 dev matches prod paths. |
| 4 | 0 | Accent applied via `[data-accent]` CSS vars + `--accent-tint` (color-mix) | DESIGN.md: components use `var(--accent)`, never pick a color; tint mirrors the old site's 12–15% section tints. |
| 5 | 0 | Python venv at repo root `.venv` (git-ignored) for api + scripts | Python 3.14 system install; keeps host clean. |
