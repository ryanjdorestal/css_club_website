# 11 — Open questions

> **Update (T18, same day):** Ryan answered the blocking set. Resolutions first; the
> original list follows for history. Anything not marked resolved is still his call, but
> **none of it blocks the 2-hour build** — the plan (15) runs Tier-1 with no accounts.

## Resolved by Ryan (T18)

| # | Question | Answer |
|---|---|---|
| 1 | Repo topology | **Standalone repo.** rhecwb = structural reference only. RHEC OS = the reference for the John Jay internal platform. Nothing migrated. |
| 2 | Brand config | Built fresh: `brand/brand.config.ts`. |
| 3 | Hosting layout | **Vercel**, one project: React SPA + `api/index.py` (one FastAPI function). Function-count guard in CI so pushes never hit a silent limit. No Netlify. |
| 4 | Domain | Not Ryan's to decide — he's not an owner of anything John Jay; builds off a copy and hands to the board. Domain/registrar/DNS = board handoff item. |
| 5 | GitHub org access | Not an owner. Repo lives under `ryanjdorestal` until handoff, then transfers to `jjcss`. |
| 6 | Supabase | **New project for John Jay.** Take rhecwb's structure (SQL shapes), adapt, do not migrate data. |
| 7 | Display font | **Archivo** (display) + **Poppins** (body, the old site's) + **JetBrains Mono** (labels) + **VT323** (the old site's pixel font, ≥20px accents). |
| 8 | Hex values | Sampled from John Jay assets — see `DESIGN.md`. **No cream** ("stop with cream … jjay's own repo has their own colors"). |
| 9 | Cube behavior | Cube-as-nav yes; scroll-explode if time allows (phase 4 minimum = idle + fallback). |
| 10 | Cream sections | **Removed.** Light surfaces = `#F5F7FA` tinted like the old site's sections. |
| 11 | Cyberhounds | Own page, red accent. |
| 12 | Binary rings | Procedural SVG, VT323 digits. |
| 19 | Python at launch | **Yes** — the whole API is Python (FastAPI on Vercel). "python where you can but no api key shit." |
| 20 | LLM provider | **None, ever.** Static-KB chatbot, ported to Python. |
| — | MCPs | **Dropped** ("fuck the mcp shit"). Hand-match `jj_inspo` typography/components. |
| — | Mascot | **The John Jay Bloodhound**, with emotes, as the chatbot icon — Claude designs it from the banner (17). |
| — | Scope | Keep everything the old site had, revamped structurally/aesthetically/organizationally; add what rhecwb had that JJ didn't (internal platform, main-site sections). |
| — | Process | Claude Code, 2 hours autonomous, all laptop resources available (16), all context kept in the project folder. |

## Still Ryan's / the board's (not blocking the build)

- Who on the current board reviews migrated copy and bios (07 checklist).
- Names of students with shipped apps for the Apps section (need 3 before it goes public; build uses clearly-marked examples).
- Click-test results for the 2021 Discord pin links and the 27 resources (build ships a link-check workflow; someone runs it).
- Vercel + Supabase account creation and env vars (`SETUP.md` after the build; ~10 min).
- Handoff: transfer repo to `jjcss`, `@jjcss/board` CODEOWNERS, domain/DNS, club-account ownership of everything.
- Whether Discord integration is wired at launch.

---

## Original list (for history)


Ordered by how much they block. Each has the options that came up and, where Claude has
a recommendation, it's marked — but these are Ryan's calls.

## A. Blocking — must be answered before the first commit of code

1. **Repo topology: how does John Jay consume rhecwb?**
   - (a) Monorepo: extract rhecwb's platform core into `packages/platform` here; LaGCC
     later re-points to it. Cleanest end state; biggest first step.
   - (b) rhecwb *becomes* the platform repo (add the brand config there); `jjay_css` is
     a consumer/fork with only the public surface + brand config.
   - (c) Fork rhecwb wholesale, rebrand in place, diverge. Fastest; you'll do it again
     for club #3.
   - Recommendation: (b) if you're willing to touch rhecwb's structure soon; (a) if not.
     Avoid (c).

2. **Where does the brand config live and what's in it?** Name, short name, campus,
   email, Discord, logo paths, palette tokens, env-var prefix (`RHEC_` → `CLUB_`),
   chatbot KB. Decide the file (`brand.config.ts` vs JSON) and who edits it (OS Settings
   or repo).

3. **Hosting layout.** Public React site on Vercel (as rhecwb) or Netlify? OS on the
   same domain (`/os`) or a subdomain? Where do Netlify Functions live if the public site
   is on Vercel? (rhecwb already bridges this with `api/[...route].js` — keep that?)

4. **Domain.** Keep `jjaycss.tech` (who pays; who holds the registrar login; can DNS be
   re-pointed off the shared host?) or move to `jjcss.github.io` / a `.org`? Get the
   registrar + hosting logins from the current board **before** anything else.

5. **GitHub org access.** Are you an owner of `jjcss`? Who else is? Is the old
   `CSS_Website` repo archived or kept live until cutover?

6. **Supabase project.** New project for John Jay (per-tenant DB) or one shared project
   with a tenant column? Per-tenant is simpler and matches free-tier limits; shared is
   what "platform" implies. Decide; affects every migration.

## B. Design — must be answered before the first component

7. **Display font**: Archivo (expanded feel) vs Instrument Sans vs something else from
   the refs. Pick one and set it in `tokens.css`.
8. **Exact hex for base/navy, cream, and the three accents.** Draft values are in 05;
   confirm against the cube renders and the John Jay navy.
9. **Cube behavior on Home**: cube-as-nav (hover face → label → click) yes/no? Scroll
   "explode into three faces" yes/no for v1? Both are spec'd; both cost time.
10. **Cream sections**: which pages use pole B (News, OS docs, long reads)? Any on Home?
11. **Cyberhounds**: its own page with its own header art, or a section under Events?
12. **Binary rings**: procedural (Canvas/SVG, animated) or a static SVG texture for v1?

## C. Content — must be answered before migration runs

13. **Who reviews copy?** Which current board members, by when. The migration output is
    a diff they sign off on.
14. **Board history**: publish all 10 semesters of bios, or names+roles only for alumni?
15. **Which links are still real** (Discord invite, Google Form, Linktree, MSRC, PRISM,
    the 27 resources)? Needs a click-test with results recorded in `links.json`.
16. **Apps section launch content**: names of the 1–2 students with shipped apps; will
    they submit? Get 3 apps minimum before the section is public.
17. **Events source of truth**: JSON in repo (Tier 1) or rhecwb's events function
    (Tier 2) at launch?

## D. Platform — before the OS is enabled for John Jay

18. **Auth**: Supabase email/password + magic link as in rhecwb. Who bootstraps the
    first officer (`scripts/bootstrap-officer.mjs` pattern)?
19. **Python service at launch — yes or no?** Nothing in the launch scope strictly needs
    it (chat assistant is JS + static KB). If no, defer FastAPI to semester 2 and say so.
20. **LLM provider for the chatbot**: none at launch (static KB) is the recommendation;
    if yes, which provider, whose account (must be the club's), and cost cap.
21. **Discord integration** (rhecwb has `discord-post` + `discord-notify`): wire to the
    John Jay server or not at launch?
22. **Supabase keep-alive cron**: GitHub Actions weekly ping — who owns the repo secret?

## E. Governance — before public launch

23. **Club account for everything**: computersocjjay@gmail.com owns Vercel/Netlify/
    Supabase/domain/Form/Discord invite. Who has its password/2FA (≥2 officers)?
24. **CODEOWNERS team** `@jjcss/board` — create the team; list members.
25. **HANDOFF.md** owner each term; date of first term rollover.
26. **Old site cutover**: keep jjaycss.tech pointing at the old host until the new site
    passes the review checklist in 07; then re-point DNS; then archive `CSS_Website`.

## F. Nice-to-have decisions (can wait)

27. WASM/C++ workshop track — first demo (CSCI 360 cipher visualizer?).
28. Animated favicon; loading-state cube.
29. Whether Cyberhounds gets its own Discord channel link on the page.
30. Tenant #3 — is there a third club lined up? Changes how hard to push (a) vs (b) in Q1.
