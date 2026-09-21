# 04 — Stack (decisions + the debates behind them)

This file records not just the answers but the arguments, because several answers
flipped during the session and the reasons matter more than the labels.

## The governing rule

**The site must survive every service dying.** Public pages render with zero backend.
Every dynamic feature (chatbot, apps feed, member counts) shows an honest "offline"
state when its service is down — never a broken page. This is rhecwb's Tier-1 /
Survival-Mode rule, kept as a hard constraint.

## Layer 1 — Public site (cannot die)

| Choice | Decision | Why / the debate |
|---|---|---|
| Framework | **React + TypeScript + Vite** | Ryan wants a résumé-relevant stack ("FAANG/MAANG worthy": Python, SQL, JS/TS, React). TypeScript over JS: earlier Claude suggested plain JS to lower the barrier; overruled once the real users turned out to be the board and the goal is résumé value. Every big-tech front-end role is TS. |
| Why React at all | **React Three Fiber for the cube** | Vanilla Three.js means hand-writing scene/loop/resize/dispose. R3F + drei gives `<RoundedBox>`, `<Float>`, `<Environment>`, `<Text3D>`, scroll controls, the render loop. If the cube is the centerpiece, React wins. This settled the vanilla-vs-React question that was open for the public pages. |
| Styling | **Tailwind v4 with a `@theme` tokens file, written before any component** | Claude first said "no Tailwind, plain CSS" for simplicity, then reversed: Ryan wants to lean on AI tools, and every one (v0, Bolt, Lovable, Cursor defaults, 21st.dev) emits Tailwind + shadcn. Fighting the tools loses. Tokens-first is what stops the generic look. |
| Components | **Hand-written to match `../jjay_css_refs/jj_inspo/`** (spec cards, stat tiles, ticker, numbered headers, corner brackets). shadcn/ui primitives allowed only for OS forms/tables/dialogs, restyled with the tokens. No component registries, no MCPs. | Ryan (T18): "get as close as you can to the typography and components of the jjay inspo folder." |
| Animation | **Motion** (framer-motion) | Scroll-driven sections, hover, page transitions. |
| 3D | **React Three Fiber + drei**; asset is `assets/cube/cs_cube.glb` | See 06. Lazy-load Three only on the home hero (~600 KB). Static SVG everywhere else. |
| Routing | react-router | Real routes if hosting supports SPA fallback (Vercel/Netlify do). Hash routes only if it ends up on GitHub Pages. |
| Data for public pages | Committed JSON (events, board, links, resources, apps snapshot) + optional live fetch that degrades | Tier-1 rule. |
| Deploy | **Vercel**, one project, public site + API together; GitHub Actions builds/tests on every PR; **function-count guard** (see Layer 2) | Ryan: "hosting will be on vercel … make like rhecwb's efficiency with functions so that I can push as many times as I want without triggering some silent functionality limit." |
| Fonts | **Archivo** (display) · **Poppins** (body — the old site's font) · **JetBrains Mono** (labels) · **VT323** (the old site's pixel font, ≥20px accents only). **Not Inter.** | See 05. |
| Icons | Lucide (ships with shadcn) or Phosphor | |

## Layer 2 — Platform / backend (allowed to be down; must fail visibly)

| Choice | Decision | Why / the debate |
|---|---|---|
| Core | **Vercel Functions + Supabase (new project)**, structured like rhecwb but not migrated from it | Ryan (T18): "the supabase backend will be a new project do not migrate the rhecwb but we will take from its structure and adapt it." Schema = rhecwb's migrations, re-cut for John Jay, committed as SQL. No Netlify. |
| Brand config | `brand/brand.config.ts` from day one (name, short name, campus, email, Discord, logo paths, palette, taglines, KB path). Nothing club-specific is hardcoded anywhere else. | Lesson from rhecwb's 4,195 hardcoded LaGCC strings (03). Built fresh here, not extracted. |
| Backend language | **Python (FastAPI) on Vercel's Python runtime** — `api/index.py` is ONE FastAPI app; `vercel.json` rewrites `/api/(.*)` → `/api/index`. Optionally one JS function if something truly needs Node. **Hard cap: ≤ 2 files under `api/`**, enforced by CI. | Ryan (T18): "python where you can but no api key shit." Vercel Hobby caps serverless functions per deployment (12) and **fails the build silently while serving the stale deploy** — that is exactly what bit rhecwb. One app = one function = the limit can never be hit no matter how many endpoints or pushes. No Hugging Face Spaces needed. |
| Chatbot | **Port rhecwb's `chat-assistant` to Python** inside the FastAPI app: static keyword KB (`kb.json`, John Jay content), suggestions, citations, status endpoint; **no LLM provider at all** (not even optional) | Ryan (T18): no API keys. The mascot/UI is the Bloodhound (17). |
| SQL | **Supabase Postgres, new project for John Jay.** Server-side access from Python via PostgREST (httpx) or `supabase-py` with the service key in Vercel env vars (that's infrastructure config, not an "API key" in Ryan's sense). Public site reads only committed JSON + public anon endpoints. | |
| Supabase pausing | **GitHub Actions cron pings the Python `/api/health` (which touches the DB) every 3 days** so the free project never hits the 7-day inactivity pause | Automated "poke." ~10 lines. |
| Vercel silent failure | CI: (1) count files under `api/` ≤ 2, fail otherwise; (2) `vercel build` dry-run on every PR; (3) post-deploy smoke: fetch `/api/health` and the home page, compare the deployed commit SHA the API reports to `GITHUB_SHA` — **a stale deploy fails loudly** | The stale-deploy check is the one rhecwb didn't have. |
| Secrets | Host env vars only. `check:secrets` + `check:leaks` in CI. | |

## Layer 3 — Not infrastructure: C++, workshops, résumé projects

- **There are no performance "pockets" in a club website's request path.** A site with
  a few hundred hits a week is idle 99.99% of the time; nothing is CPU-bound. C++ in the
  request path would be résumé theater, and a reviewer would clock it.
- The legitimate C++ pocket is **WebAssembly**: compile C++ to WASM and run it in the
  browser. Real, modern, big-tech-relevant (Figma, Photoshop-web, Google Earth). Uses the
  language John Jay students actually learn (CSCI 271). Ideal workshop: "your C++ from
  class, running on the club site" — a visualizer, a cipher demo tied to CSCI 360.
- rhecwb's Netlify Functions are the *reference* for endpoint shapes; they are re-implemented in Python here, not copied.
- Where WASM would genuinely earn its place later: client-side image resizing before an
  app-screenshot upload; search over the records index. Both small, both real.
- Java/C++/Python workshop material lives in **separate repos under the `jjcss` org**
  (the old org already did this — 27 workshop repos). Not in the site.

## Ops model (Ryan's call)

"Free to run" ≠ "zero services." It means: free tiers, plus someone on the board pokes
the platforms occasionally, plus automation for the two known silent failures (Supabase
pause → cron ping; Vercel silent stale build → CI deployability check). Documented in
the board runbook so it's a role, not a memory.

## Contribution on-ramps (what a student actually touches)

- **Front end:** TypeScript/React. Edit a component, a token, a JSON data file.
- **Back end:** Python (the FastAPI app in `api/index.py`).
- **Content:** a JSON entry + an image. (Events, apps, resources.)
- **3D:** the cube GLB (`assets/cube/build_cube.py` regenerates it from ~20 numbers).
- **C++:** the WASM workshop track.
Two languages on the main path (TS, Python). Every extra language shrinks the pool.

## Things Claude got wrong during the session (recorded so nobody repeats them)

1. "A chatbot needs an LLM key." Wrong — rhecwb's works keyless. Retracted.
2. "Switch off Vercel/Supabase to something that can't fail." Overruled; Ryan keeps them
   and accepts the ops model. The mitigations above are the compromise.
3. "Plain JS not TS, plain CSS not Tailwind, freshman-friendly barebones." All reversed
   once the contributor data showed the real users are the board and the goal is résumé
   value + AI-tool compatibility.
4. "Use SQLite." Withdrawn; Postgres already exists in the platform.
5. Talked about HTML files after the React decision was made — the content-migration
   plan is stack-agnostic (extract to data), but it was framed badly. See 07.

## What "FAANG-worthy" actually means for the repo (agreed)

Not the language count. Real users, CI on every PR, a test suite, clean commit history,
a README a stranger can follow, two on-ramps. A React site + one Python service with
tests and 40 student contributors beats a five-language site nobody else touched.
