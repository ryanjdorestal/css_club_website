# 15 — Execution plan: the 2-hour autonomous build

**Contract with Ryan (T18):** "make the execution plan such that this shit should run for
2 hours before asking me any more info or finishing." So: **no questions for 120 minutes.**
When something is ambiguous, pick the option most consistent with `DESIGN.md`, the
`jj_inspo` refs, and rhecwb's structure; write the choice to `context/18_BUILD_LOG.md`
(create it) with a one-line reason; keep going. Stop only at 120 minutes, or earlier if
every phase below is green.

Everything runs in **Tier 1** (committed JSON, no accounts needed). Supabase and Vercel
env vars are read if present and ignored if not — the site and OS must fully work on
`npm run dev` with zero external services, and the Python API must run locally with
`uvicorn` and answer from JSON. Account setup is a 10-minute human step at the end
(`SETUP.md`), not a prerequisite.

## Ground rules for the run

1. Read in this order before writing code: `CLAUDE.md`, `DESIGN.md`, `context/05`, `context/08`,
   `context/17`, `context/16`, then skim `context/03` and the rhecwb folders it names.
2. Commit at the end of every phase (`git init` in phase 0; conventional commits; no pushes).
3. Every phase ends with a verification step that produces a file in `qa/` — a screenshot,
   a test log, or a check output. No "it should work."
4. `tokens.css` and `brand.config.ts` exist before any component. Components use
   `var(--accent)` and brand config; never a literal club name or hex.
5. Nothing from rhecwb is copied verbatim except SQL shapes and endpoint contracts. Never write into rhecwb.
6. No secrets, no `.env` committed, no LLM providers, no MCPs, no component registries.
7. Keep `api/` to ≤ 2 files. The CI check for this is written in phase 1 and run every phase.
8. Time-box: if a phase overruns its box by 50%, cut scope to its "minimum" line, log it, move on.
9. Work in the Desktop `jjay_css` folder. Use `~/Desktop/skills/*` where the plan says.

## Phase 0 — Scaffold (0:00–0:15)

- `git init`; `.gitignore` (node, python, `.env*`, `.cache/`, `qa/shots/*.png` kept? — keep shots, they're small; ignore `node_modules`, `.venv`, `dist`).
- `apps/web`: Vite + React + TS. Tailwind v4 (`@tailwindcss/vite`). react-router. motion. `@react-three/fiber`, `@react-three/drei`, `@react-three/postprocessing`, `three`. `lucide-react`. Playwright (`@playwright/test`) for screenshots. Prettier + stylelint from `~/Desktop/skills/ui/`.
- `api/index.py` FastAPI + `api/requirements.txt` (fastapi, uvicorn, httpx, pydantic). `vercel.json`: `{"rewrites":[{"source":"/api/(.*)","destination":"/api/index"},{"source":"/((?!api/).*)","destination":"/index.html"}]}`. Vercel project settings: root = repo, build = `npm run build --workspace apps/web`, output = `apps/web/dist`. Write these into `SETUP.md`.
- `brand/brand.config.ts` (John Jay values from `context/02`, `05`, `14`).
- `apps/web/src/tokens.css` exactly as `context/05` "Tokens (final)". Google Fonts link for Archivo, Poppins, JetBrains Mono, VT323.
- Copy `assets/brand/cs_logo_sharp.svg` → `apps/web/public/img/brand/`, `assets/cube/cs_cube.glb` → `apps/web/public/cube/`.
- `scripts/check_api_count.py` (fail if >2 files in `api/`). `README.md` stub, `LICENSE` (MIT, carry the club's 2022 notice + this project), `SOURCES.md`.
- Verify: `npm run dev` serves a page with the tokens applied; `uvicorn api.index:app` answers `/api/health` with `{ok:true, sha:"dev"}`. Screenshot → `qa/shots/00-scaffold.png`.
- Minimum: Vite app + tokens + FastAPI health.

## Phase 1 — Content extraction (0:15–0:35)

- `git clone --depth 1 https://github.com/jjcss/CSS_Website .cache/CSS_Website` (checkout `a8fca55` if reachable).
- `scripts/extract_old_site.py` (BeautifulSoup): → `data/board.json` (10 terms, name/role/bio/photo), `data/events.json` (Spring 2025 + Fall 2024, flyer paths), `data/resources.json` (27 links, grouped), `data/links.json` (socials + forms + Discord from `context/02`), `content/about.md`, `content/home.md`, `content/cyberhounds.md`, `content/news/grad-school-events.md`, `data/workshops.json` (the org's workshop repos as "Previous Workshops").
- Image pipeline (`scripts/images.py`, Pillow): copy only referenced images, kebab-case, WebP, flyers ≤1600px, headshots ≤800px → `apps/web/public/img/{board,events,photos}/`. Log the 25 orphans skipped.
- Apply the review fixes from `context/07` automatically where mechanical: ZIP → 10019; drop "Executive Openings (Fall 2025–Spring 2026)"; mark Blog as empty.
- `data/kb.json` via `scripts/build_kb.py` from the content above (public-safe only).
- `data/apps.json` — **three placeholder entries clearly marked `status:"example"`** so the section renders; never show fake stats.
- Verify: JSON schemas in `data/*.schema.json` (borrow `~/Desktop/skills/static-cms/frontmatter-schema` approach); a `scripts/validate_data.py` pass logged to `qa/data-validate.txt`.
- Minimum: board, events, resources, links, kb.

## Phase 2 — Design system + shell (0:35–0:55)

- Global layout: `Nav` (one component; brand name from config; section accent set per route via `data-accent`), `Footer` (stamp lockup as SVG, links from `data/links.json`, MIT/source notice), `BinaryRings` background (VT323 digits on circular SVG paths, faint, slow rotation, respects reduced-motion), `Ticker` (tagline 2), `SectionHeader` (numbered + mono kicker), `SpecCard`, `StatTile`, `CornerBrackets`, `PixelDivider`, `MonoLabel`, `Button` (primary = section accent, ghost = teal outline).
- Match `assets/refs/jj_inspo/`: jj_06 for type scale, jj_11 for spec cards/stat tiles, jj_03 for chips/ticker, jj_04 for numbered index and ↗ arrows. Write `apps/web/src/components/README.md` mapping each component to its ref image.
- Verify: a `/styleguide` route rendering every component in every accent; Playwright screenshots at 1440 and 390 → `qa/shots/02-styleguide-*.png`. Contrast check (borrow rhecwb `os-contrast-rendered.mjs` idea; WCAG AA on ink/muted vs navy).
- Minimum: Nav, Footer, SectionHeader, SpecCard, Button, tokens applied.

## Phase 3 — Public pages (0:55–1:25)

- `/` Home: cube hero (phase 4 drops it in; use `hero_transparent.png` as the placeholder), taglines, status strip (reads `data/events.json` next event, `data/board.json` count, `data/apps.json` live count — show nothing if zero), three teaser bands (red/green/blue), ticker.
- `/events` (red): manifest by semester, event cards, "Previous Workshops" from `data/workshops.json`.
- `/apps` (green): spec-card grid with platform filter; "Submit your app" → form (posts to `/api/apps/submit`; on failure stores locally and shows the sleeping mascot).
- `/cyberhounds` (red): from `content/cyberhounds.md`.
- `/about` (blue): copy + roster (current term) + alumni board (all terms, collapsible).
- `/resources` (blue): grouped links.
- `/news` (light surface, blue tint): list + the grad-school article.
- `/join` (blue): onboarding form (same fields as rhecwb's onboarding) → `/api/onboarding/submit`; Discord + email-updates links.
- `404` in VT323.
- Verify: Playwright full-page screenshots of every route at 1440/1024/768/390 → `qa/shots/03-*.png`; route validator (every internal link resolves — `~/Desktop/skills/auditing/route-validator`); `html-validate`/axe pass logged.
- Minimum: Home, Events, Apps, About, Join.

## Phase 4 — Cube + mascot (1:25–1:45)

- `apps/web/src/cube/CubeHero.tsx`: R3F, `useGLTF('/cube/cs_cube.glb')`, material recipe from `context/06`, idle rotation + mouse parallax, per-face hover (named meshes `red_C`/`green_S`/`blue_S`) → label + click → route. Lazy `React.lazy` + Suspense with the PNG fallback; `IntersectionObserver` pause; DPR cap 1.5; reduced-motion → SVG. Bloom via postprocessing, teal-tinted, subtle.
- `apps/web/src/mascot/Bloodhound.tsx` per `context/17`: six emotes, traced from the banner. Chat widget `HoundChat.tsx` using `/api/chat` with the bundled-KB offline fallback.
- Verify: screenshots of the hero at 1440/390 and each mascot emote at 128px → `qa/shots/04-*.png`; confirm Three is code-split (check `dist/assets` sizes; Three chunk not in the main bundle).
- Minimum: cube renders with idle rotation + PNG fallback; mascot `idle` + `sleeping`; chat widget answering from bundled KB.

## Phase 5 — Python API + Supabase shapes (1:45–2:00)

- `api/index.py` routes: `GET /api/health` (sha from `VERCEL_GIT_COMMIT_SHA`, db:"skipped"|"ok"), `GET|POST /api/chat`, `POST /api/onboarding/submit`, `POST /api/apps/submit`, `GET /api/apps`, `GET /api/events`, `GET /api/board`, `GET /api/site-settings`. Every read falls back to the committed JSON; every write, when `SUPABASE_URL`+`SUPABASE_SERVICE_KEY` are absent, appends to `.cache/inbox/*.jsonl` locally and returns `{ok:true, stored:"local"}`. In-memory IP rate limit.
- `supabase/migrations/0001_init.sql` adapted from rhecwb's shapes (members, onboarding_requests, apps, events, board_profiles, site_settings, records) for the NEW project; `supabase/README.md` on applying it.
- `.github/workflows/ci.yml`: install, `check_api_count`, `validate_data`, `npm run build`, Playwright smoke, `vercel build` dry-run (skip gracefully if no token). `keepalive.yml`: every 3 days `curl $SITE_URL/api/health`. `post-deploy-smoke.yml`: compare `/api/health`.sha to `GITHUB_SHA`; fail loudly on mismatch.
- `SETUP.md`: the human steps — create Vercel project (settings above), create Supabase project + run migration, set env vars, add `SITE_URL` repo secret, transfer repo to `jjcss` org later.
- Verify: `pytest` for the KB matcher and the local-inbox fallback → `qa/pytest.txt`; `python scripts/check_api_count.py` → pass.
- Minimum: health, chat, both submit endpoints with local fallback, ci.yml.

## Phase 6 — OS shell (only if time remains before 2:00; otherwise it's the first follow-up)

- `/os` route group in the same SPA: login screen (Supabase Auth when configured; a clearly-labeled **local dev role picker** when not), Today, Onboarding queue (reads local inbox / API), Apps approval queue, Members, Events ops, Settings (edits `site_settings` shape). Same route list as RHEC OS, John Jay tokens, denser layout.
- Minimum: `/os/login`, `/os` Today, `/os/queue` listing submissions.

## At 2:00 — stop and report

Write `context/18_BUILD_LOG.md` (decisions made without asking, with reasons), a
`qa/REPORT.md` (what's green, what's cut, screenshot index), and end with the exact list
of things Ryan must do or decide next. Do not push. Do not ask anything before this point.
