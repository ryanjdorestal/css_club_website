# 12 — Decision log (chronological, 2026-09-19)

Format: **Decision** — who — rationale. "Claude" = Cowork session; "Ryan" = owner.

1. **Vectorize the logo rather than upscale it** — Claude, accepted by Ryan — a screenshot
   has no detail to recover; the logo is flat facets, so a trace is sharp at any size.
2. **Work from Ryan's saved PNG, not the Pixlr screenshot** — Ryan — the first output
   from the screenshot "was crap"; the saved file has real alpha and real colors.
3. **Don't fork the current `rhecweb` as a template** — Claude, accepted — it's a
   1,806-file platform with an audit banner saying it isn't deployed; extract instead.
4. **Extract rhecwb's "Tier 1 / Survival Mode" rule as a hard constraint** — Claude,
   accepted — public pages render with no backend; everything degrades visibly.
5. **Deploy from `main` via CI, org-owned; no human-held deploy key** — Claude,
   accepted — the old site froze because deployment was manual FTP by one person.
6. **Old site stays live (jjaycss.tech is up); the problem is maintenance, not hosting**
   — measured — it resolves to a shared host, repo never connected.
7. **Barebones-freshman-template idea abandoned** — both — 48 of 82 commits were two
   board members; the real users are the board and app submitters.
8. **Modernize; don't keep HTML/CSS as the stack** — Ryan — "no one uses html css much
   … languages need to be stuff they learn in school … react and what not".
9. **John Jay teaches C++ (CSCI 271 "such as C++"), no web course** — checked — flip
   the constraint: the site teaches the web stack the major skips.
10. **React + TypeScript + Vite for the public site** — Ryan's direction, Claude's
    detail — TS over JS for résumé value.
11. **Build runs in GitHub Actions; contributors never build by hand** — Claude, accepted.
12. **Stack in three layers: site (cannot die) / backend (can be down, fails visibly) /
    workshops (not infra)** — Claude, accepted with edits below.
13. **Chatbot does not need a key** — Ryan, verified by reading `chat-assistant.js` —
    Claude's "needs a key" claim retracted.
14. **Keep Vercel + Supabase** — Ryan — "someone plays around with it every once in a
    while"; mitigations: CI `check:vercel` (exists) + Supabase weekly keep-alive cron.
15. **Supabase free-tier 7-day pause identified as the likely cause of "prod does not
    resolve"** — Claude — documented; cron fix.
16. **No C++ in the request path; C++ via WebAssembly workshops** — Claude, accepted —
    "no performance pockets in a club website."
17. **Python (FastAPI) allowed for new dynamic features; whether any launch feature needs
    it is open (Q19)** — both.
18. **SQLite suggestion withdrawn; Postgres (Supabase) stays** — Claude — it already exists.
19. **Adapt rhecwb (public + OS) for John Jay; reskin with JJ themes; add animations;
    add an Apps section for student projects** — Ryan.
20. **First engineering task: brand config so 4,195 LaGCC-specific strings read from
    one place; John Jay = tenant #2** — Claude, accepted.
21. **Apps = rhecwb project record + author/platform/stack/links/screenshots/benefits_jj;
    submission reuses the onboarding-queue pattern** — Claude, accepted.
22. **3D cube as the hero / identity object; Three.js** — Ryan ("I like the 3D cube idea
    now we got something we can use 3js stuff on").
23. **Cube as navigation: red C→Events, green S→Apps, blue S→Join; one accent per
    section** — Claude, accepted in principle (behavior details Q9).
24. **R3F + drei (React) for the cube; OS stays vanilla** — Claude, accepted — settles
    vanilla-vs-React for the public pages.
25. **Supavoxel AI model rejected as an asset; kept as proportion reference** — both —
    back faces garbage, bleeds, 1.5M tris.
26. **Cube rebuilt procedurally (manifold3d CSG), six faces correct, ~7k tris** — Claude,
    delivered to `Desktop/LAGCC/jjcss_cube/` and `assets/cube/`.
27. **Content migration = extract to data files via script; board reviews diff; keep MIT
    notice; cite `a8fca55`** — Claude, accepted.
28. **Images: drop 25 orphans, kebab-case, WebP, ~35 MB → ~5 MB; originals archived
    outside the repo** — Claude.
29. **Sections: Home · Events · Apps · About · Resources · Cyberhounds · News · Join;
    Collaborate→Join, Blog+grad article→News** — Claude, accepted.
30. **Design direction = pole A (dark industrial-editorial), one hot accent per section,
    binary rings as background, stamp in footer, taglines kept; CATCH poster is the key
    ref** — Claude from the full ref review, accepted.
31. **Base is near-black with navy cast (not RHEC's pure black); cube RGB as semantic
    accents; cream (pole B) for reading surfaces** — Claude.
32. **Fonts: Archivo or Instrument Sans + Geist/JetBrains Mono; never Inter** — Claude.
33. **Tailwind v4 + tokens-first + shadcn primitives + Magic UI / Aceternity + Motion**
    — Claude, reversing an earlier "no Tailwind"; rationale: AI tools emit it.
34. **`tokens.css` + `DESIGN.md` must exist before any component is generated** — Claude.
35. **Cowork for structure, Claude Code for the visual loop; MCPs (shadcn, 21st Magic,
    Playwright, Context7) via project `.mcp.json`** — both.
36. **Not building yet; this context package first** — Ryan.

### T18 (same day, after the context package was delivered)
37. **Standalone repo; rhecwb is structural reference only; RHEC OS is the reference for the JJ internal platform** — Ryan.
38. **Ryan is not an owner of any John Jay property; builds off a copy; hands to the board when functional** (as with rhecwb) — Ryan.
39. **New Supabase project; adapt rhecwb's structure; migrate nothing** — Ryan.
40. **Vercel hosting; replicate rhecwb's one-function efficiency so pushes never trip a silent function limit** — Ryan → implemented as one FastAPI app in `api/index.py`, ≤2 files in `api/`, CI guard + post-deploy SHA check — Claude.
41. **Theme is John Jay's own colors + inspo, not rhecwb's; no cream** — Ryan → palette sampled from old-site CSS (#CE4A4A/#40A33F/#1E80F0 trio, Poppins, VT323) and the banner (#1E4664 navy, #6ED2E6 teal) — Claude.
42. **Python wherever possible; no API keys** — Ryan → all backend in Python; chatbot ported to Python static-KB; no LLM ever — Claude.
43. **Mascot = John Jay Bloodhound with emotes; Claude designs the chatbot icon from the banner** — Ryan.
44. **Keep everything the old site had (revamped) + add what rhecwb had that JJ lacked** — Ryan.
45. **MCPs dropped** — Ryan. Hand-match `jj_inspo` typography and components.
46. **Build in Claude Code, 2 hours autonomous, no questions; all laptop resources usable; all context lives in the project folder** — Ryan → `15_EXECUTION_PLAN.md`, `16_RESOURCES_ON_LAPTOP.md`, `17_MASCOT_AND_CHATBOT.md`, `KICKOFF_PROMPT.md` — Claude.
