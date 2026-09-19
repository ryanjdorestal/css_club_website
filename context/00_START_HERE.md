# 00 — Start here

> Written 2026-09-19 from a single long planning session between Ryan and Claude (Cowork).
> Everything below was decided, measured, or discovered in that session. Where something
> is still open it says so and points to `11_OPEN_QUESTIONS.md`.

## One-paragraph summary

John Jay's Computer Science Society had a website (jjaycss.tech, repo `jjcss/CSS_Website`)
that froze in April 2025 — not because hosting died, but because the person with the
FTP login graduated and the repo was never connected to deployment. Ryan already built
a full club platform for LaGuardia (`rhecweb`: public site + "RHEC OS" internal platform
on Netlify + Vercel + Supabase). The plan is to make John Jay the second tenant of that
platform: pull the core out of `rhecweb` behind a brand config, then build John Jay a new
public surface — dark, industrial-editorial, built around a 3D version of the club's
red/green/blue "CSS" cube logo — plus an **Apps** section where John Jay students publish
the apps they've built. Stack: React + TypeScript + Vite + Tailwind v4 (tokens first), Motion, React Three Fiber for
the cube; **one Python/FastAPI function on Vercel**; a **new** Supabase project shaped like
rhecwb's; John Jay's own palette. **Build authorized** (T18) — see 15.

## The files in this folder

| # | File | What's in it |
|---|---|---|
| 01 | PROJECT_VISION | Why this exists, goals, non-goals, who the real users are |
| 02 | PRIOR_ART_JJCSS_OLD_SITE | Full analysis of the old John Jay site: repo, why it froze, structure, images, sections, contributors, license |
| 03 | PRIOR_ART_RHECWB_LAGCC | Full analysis of Ryan's LaGCC platform: what it is, tiers, what to reuse, what it costs to rebrand, its lessons |
| 04 | STACK | The layered stack + every debate that led to it (keys, Vercel, Supabase pause, SQLite vs Postgres, Python, C++/WASM, React vs vanilla) |
| 05 | DESIGN_SYSTEM | Refs by filename, the two taste poles, palette, type, tokens, motion, the cube-as-nav idea, the AI-look ban |
| 06 | CUBE_ASSET | How the 3D cube was made (procedural CSG, not AI), parameters, face map, material recipe, how to use it in R3F |
| 07 | CONTENT_MIGRATION | Inventory of the old site's copy/images/sections with numbers, the extraction plan, legal, review catches |
| 08 | SITE_STRUCTURE | Public pages + OS, per-section spec, Apps data model, contributor contract, repo layout |
| 09 | JJ_CURRICULUM_AND_AUDIENCE | What John Jay CS students actually learn (C++, security), and what that implies |
| 10 | TOOLING_CLAUDE_CODE_MCP | Claude Code setup, MCP install commands, Cowork-vs-Claude-Code split, libraries, fonts |
| 11 | OPEN_QUESTIONS | What must be decided before building. **Read this.** |
| 12 | DECISION_LOG | Chronological list of every decision made in the session |
| 13 | CHAT_TRANSCRIPT_CONDENSED | The whole conversation, turn by turn, condensed but complete |
| 14 | LINKS_AND_SOURCES | Every URL, path, commit hash, and file referenced |
| 15 | EXECUTION_PLAN | The phased 2-hour autonomous build with verification per phase |
| 16 | RESOURCES_ON_LAPTOP | What on Ryan's Mac the build may read (rhecwb, skills, inspo, portfolio) |
| 17 | MASCOT_AND_CHATBOT | The Bloodhound mascot spec + the keyless Python chatbot |
| 18 | BUILD_LOG | (created by the build) decisions made without asking |

## Assets in `../assets/`

```
brand/    cs_logo_sharp.svg (vector, use this), cs_logo_3000.png, cs_logo_1024.png
source/   pre_upscale_cs_jj.png (Ryan's original 494x418 cutout), the Pixlr screenshot
cube/     cs_cube.glb, build_cube.py, viewer.html, package.json, README.md, renders/
refs/     old-site/ (rendered screenshots of jjaycss.tech pages)
          jj_inspo/ (the 12 John Jay design refs, downscaled)
          supavoxel/ (the AI-generated 3D attempt, for comparison)
          club/ (YouTube banner, GitHub org, Discord pin screenshots)
```

The full UI/UX reference library (~540 images, 836 MB) stays at
`~/Desktop/UI:UX INSPO/` and is referenced by filename in `05_DESIGN_SYSTEM.md`.
Contact sheets of the whole library are at `~/Desktop/UI:UX INSPO/_contact_sheets/`.

## Status at time of writing (updated after T18)

- Logo: vectorized, done.
- 3D cube: built, six faces correct, ~7k tris, done (tunable).
- Old site: cloned, analyzed, inventoried.
- rhecwb: analyzed (read-only), reuse plan drafted.
- Design direction: decided (pole A, industrial-editorial, one accent per section).
- Stack: decided in layers; see 04.
- Site structure: drafted; see 08.
- **Ryan's answers received (T18):** standalone repo, new Supabase, Vercel + one Python function, JJ's own palette (no cream), no MCPs, Bloodhound mascot, 2-hour autonomous build.
- **Build authorized:** follow `15_EXECUTION_PLAN.md`; start with `../KICKOFF_PROMPT.md`.
- New files: `15_EXECUTION_PLAN.md`, `16_RESOURCES_ON_LAPTOP.md`, `17_MASCOT_AND_CHATBOT.md`; `18_BUILD_LOG.md` is created by the build.
