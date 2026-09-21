# 08 — Site structure, sections, data model, contributor contract

Aligned with rhecwb's spine; new on the surface.

## Public site

| Route | Section accent | What's on it |
|---|---|---|
| `/` Home | cube (all three) | R3F cube hero (cube-as-nav: red→Events, green→Apps, blue→Join). Binary-ring background. Taglines. **Status strip**: next event · members · apps shipped (real numbers or none). Ticker: *Algorithm Thinking \| Dev Journeys \| Tech Motivation*. Three teaser bands (one per accent). Footer with stamp. |
| `/events` | red | Numbered manifest, semester as a "release" (`// FALL 2026 · 06 EVENTS`). Event cards = Sator "moment" cards: date (mono), title, room, flyer, RSVP. Past semesters collapse by term. "Previous Workshops" links the org's workshop repos. |
| `/apps` | green | **New.** Grid of spec cards for student-built apps: title, screenshot, mono label row (platform · stack · author · status · term), links (store / web / repo). Filter by platform. "Submit your app" → onboarding-style form. |
| `/cyberhounds` | red (sub-identity) | The CTF sub-club: what CTF is, how it works, competitions (PicoCTF, angstromCTF, sdCTF from the old images), join Discord channel. Own header art. |
| `/about` | blue | Who we are, what we do during the semester, discussion with peers (old copy, reviewed). **Roster** with term labels. **Alumni board** (Fall 2020 → today, from `inheritance/`). |
| `/resources` | blue | The 27 links (post link-check), grouped: learn · practice · internships · John Jay resources (Tech Talent Pipeline, MSRC, PRISM, CUNY Tech Prep). |
| `/news` | light surface (`--light`, blue tint) | Bulletins + articles (the grad-school piece is post #1). rhecwb's bulletin CMS feeds it. |
| `/join` | blue | Onboarding flow (same shape as rhecwb's, rebuilt in React). Also the email-updates form and Discord. |

Global: nav (one component, one place), footer (stamp, links from `site_settings`,
MIT/source notice), chat help widget (`/api/chat-assistant`, static KB, "offline" pill
when down), `prefers-reduced-motion` respected everywhere.

## Internal platform (structured on RHEC OS — Ryan: "rhec os internal platform is the jjay new internal platform ref")

`/os/` — login, Today, onboarding queue (**also the Apps approval queue**), member
directory + lifecycle, alumni, event ops, bulletin CMS, opportunities, projects/records,
handoffs, board notes, study vault, intelligence (search), **settings** (site_settings:
public links, taglines, status-strip sources). Same route list and data shapes as RHEC OS;
**rebuilt in the React app under `/os` with John Jay tokens** (one codebase, one deploy),
backed by the Python API and the new Supabase project. Nothing copied from rhecwb verbatim
except SQL schema shapes and endpoint contracts.

## Data model additions (beyond rhecwb)

**App record** (extends rhecwb's project record):
```json
{
  "id": "2026/apps/<slug>",
  "type": "app-record",
  "title": "",
  "summary": "",
  "author": { "name": "", "handle": "", "class_year": "" },
  "platform": ["web" | "ios" | "android" | "desktop" | "cli"],
  "stack": ["swift", "react", "python", "..."],
  "links": { "web": "", "store": "", "repo": "" },
  "screenshots": ["img/apps/<slug>-1.webp"],
  "benefits_jj": "one line: how it relates to / helps John Jay students (board reviews this)",
  "status": "submitted" | "approved" | "live" | "archived",
  "term": "Fall 2026",
  "visibility": "public",
  "last_updated": "YYYY-MM-DD"
}
```
Submission → onboarding-queue pattern → board approves in OS → record published →
public `/apps` reads the committed/served JSON.

**Board record**: rhecwb `board-profiles` + `term`. **Event record**: rhecwb events +
`semester`, `flyer`, `room`, `rsvp`. **Links**: `site_settings`.

## Contributor contract (short, in the README)

- Add an **event**: one JSON entry + one flyer in `img/events/`. PR.
- Add an **app**: submit the form on `/apps` (no PR needed); board approves in OS.
- Change **board/roster**: edit `data/board.json` (or the OS once live). PR.
- Change **copy**: `content/*.md`. PR.
- Change **look**: `tokens.css` first, then components. Read `DESIGN.md`. PR + screenshot.
- Deploy = merge to `main`. Nobody deploys by hand.

## Governance (from the failure analysis)

- Repo lives in the **`jjcss` org**, not a person's account.
- ≥ 2 org owners at all times; CODEOWNERS = a **team** (`@jjcss/board`), not a person.
- Hosting accounts (Vercel/Supabase), Google Form, Discord invite, and the domain
  are all on the **club** email account (computersocjjay@gmail.com), never a graduate's.
- A `HANDOFF.md` (one file, not 23) is updated every term-rollover; rhecwb's
  `inheritance/` spine holds the records.
- Board runbook includes: quarterly "poke the platforms" check, the Supabase cron,
  the domain renewal date.

## Planned repo layout (not created yet)

```
jjay_css/
├── CLAUDE.md  DESIGN.md  README.md  CONTRIBUTING.md  HANDOFF.md  LICENSE  SOURCES.md
├── context/                ← this package
├── assets/                 ← brand/cube/refs/source (canonical brand files)
├── apps/web/               React + TS + Vite — public site AND /os (one SPA)
│   ├── src/{pages,os,components,cube,mascot,data,content,styles}/
│   ├── public/{img,cube}/
│   └── src/tokens.css
├── api/
│   ├── index.py            THE FastAPI app (all endpoints). ≤ 2 files in api/ — CI enforced
│   └── requirements.txt
├── brand/brand.config.ts   name, campus, email, discord, logos, palette, taglines, KB path
├── supabase/migrations/    SQL, adapted from rhecwb's shapes for the NEW project
├── data/                   committed JSON the public site renders from (Tier 1)
├── content/                copy (md) migrated from the old site
├── scripts/                extract_old_site.py, check_api_count.py, link_check, image pipeline
├── .github/workflows/      ci.yml (build, tests, api-count, vercel build dry-run, secrets), keepalive.yml, post-deploy-smoke.yml
├── vercel.json             rewrites /api/(.*) → /api/index ; SPA fallback
└── package.json
```
Resolved (T18): **standalone repo.** rhecwb is a structural reference only; nothing is
imported or migrated from it; the LaGCC Supabase project is untouched.
