# 03 — Prior art: `rhecweb` (LaGuardia RHEC site + RHEC OS)

Location: `~/Desktop/LAGCC/rhec_web/rhecwb` (local), remote `github.com/ryanjdorestal/rhecweb`
(**private**). Branch analyzed: `rebuild/internal-os`, 158 commits, last commit 2026-09-19
("Gallery page + homepage band; board-editable public links (site_settings,
/api/site-settings, Settings editor)").

**Rule: read-only from this project. It is live and edited in other sessions.**

## What it is (its own words)

> "This repo is the club's public site **and** RHEC OS — the club's internal operating
> system. It runs on a two-tier model: Tier 1 / Survival Mode (committed JSON + Google
> Forms/Sheets/Drive + copy-paste, works with no backend at all) is always the fallback,
> and Tier 2 / Live is now active for the membership spine."

Six layers (from `project-rules/00-project-vision.md`): Public Site, Member OS, Board OS,
Inheritance Spine, Opportunity Layer, Workflow Layer. Three budget tiers; every layer
must work at every tier.

## Size and shape

- 1,806 files (incl. `node_modules`, a local `.netlify/db` Postgres data dir). Tracked:
  docs 107, scripts 63, os 55, skills 51, assets ~79, supabase 39, img 37, netlify 31,
  inheritance 23, data 16, project-rules 11, projects 10, js 5, workflows 4, legacy 4.
- By extension: 188 md, 64 mjs, 54 js, 51 sql, 44 html, 19 json, 12 css.
- Public pages: index, leadership, projects, resources, blog, join, gallery, archive,
  onboarding (`.html`, vanilla). One stylesheet `css/style.css` = **4,544 lines**,
  **31 CSS custom-property tokens** (`--accent --accent-hover --bg --border --font-body
  --font-display --font-mono --gold --hero-ink --muted --nav-height --nav-pill-* --radius-*
  --rhec-mark-url --ease-rhec …`).
- `js/main.js` 419 lines (nav, active link, help widget → calls `/api/chat-assistant`),
  `js/config.js` (runtime config loaded by every page: BLOG_SOURCE, SUPABASE_URL/anon,
  ONBOARDING_ENDPOINT, GOOGLE_SURVIVAL_MODE links), `js/supabase-client.js`.
- `os/` — 22 internal routes: `index.html` (Today), `login.html` (real Supabase Auth,
  role via `/api/whoami`; `@rhec.local` demo path gated by `RHEC_ALLOW_DEMO_AUTH`),
  `alumni.html`, `apps/` (event-ops, bulletin, onboarding-queue, study-vault, alumni,
  settings, projects, archive, opportunities, intelligence, …), `design/` (OS design
  system, separate from public CSS), `js/`, `vendor/`.
- `netlify/functions/` — auth-stub, whoami, bootstrap-profile, onboarding-submit/
  queue/decide, members-gated, member-import, lifecycle-transition, alumni, alumni-posts,
  image-assets, discord-post, blog, records-db, backend-status, site-settings, handoffs,
  opportunities, projects, events, board-profiles, bulletin, study-vault, board-notes,
  intelligence, **chat-assistant**; `lib/` auth-helpers, discord-notify, **llm-provider**.
- `api/[...route].js` — the ONE Vercel function → routes to the Netlify handlers.
- `netlify.toml` — `/api/*` redirects to functions; 27 redirects.
- `supabase/` — migrations as committed SQL (rule: "no database-only changes").
- `data/` — board-profiles.json, bulletin.json, gallery.json, intelligence-index.json,
  opportunities.json, records.{all,board,member,public}.json, study-vault-index.json,
  members.schema.json + `.sample.json` fixtures.
- `inheritance/` — institutional-memory spine (markdown records per term).
- `project-rules/` — 00 vision, 01 design rules, 02 codegen, 03 architecture, 04 content,
  05 future systems, 06 inspiration patterns, 07 do-not-do, 08 build priorities,
  09 inheritance spine, 10 legacy record protocol.
- `docs/contributor-handoff/` — 21 numbered files (START_HERE … CHANGELOG_CONTEXT) +
  CURRENT_STATE.md. `CONTRIBUTOR_START_HERE.md` + `CONTRIBUTING.md` at root.
- `package.json` — ~60 scripts: `qa:full` (14 checks), `check:vercel` (deployability),
  `check:secrets`, `check:leaks`, `check:supabase`, `check:google`, `os:shots`,
  `os:contrast`, `reliability:*` suite, `db:reset`, `dev`, `dev:vercel`, …
- `.github/workflows/ci.yml` — static checks + `check:vercel` + bootstrap tests +
  `check:secrets`. Its header comment records the lesson (below).

## The chat assistant (this settled a debate)

`netlify/functions/chat-assistant.js` is **provider-optional**:
- GET returns `{configured, provider}` so the UI can show a status pill without spending tokens.
- POST answers from a **local keyword knowledge base (`KB`)** when no provider is set
  (`source: "static"`); with a provider it grounds the LLM on the same KB
  (`source: "llm"`), and falls back to static on error (`source: "fallback"`).
- `lib/llm-provider.js`: `RHEC_LLM_PROVIDER = "none"` (default) | anthropic | openai |
  gemini | watson. Keys are server-only env vars. Zero dependencies (native fetch).
- **So: the chatbot needs no key.** The LLM is purely additive. Claude's earlier claim
  that a chatbot "needs a key" was wrong and was retracted.

## What its README says about its own state (2026-08-22 audit banner)

> "the August code on `rebuild/internal-os` is not deployed, the production Supabase
> project does not resolve, and the July handoff docs are stale."

And the CI file:

> "for months, every Vercel production deploy failed the build (too many Serverless
> Functions for the Hobby plan) while Vercel kept serving the last good deployment. The
> site looked alive. Nothing said otherwise."

Ryan's position: keep Vercel + Supabase; "someone needs to play around with it every
once in a while just like all the other platforms." Mitigations are recorded in 04.

**Likely cause of "Supabase does not resolve":** Supabase free-tier projects are
**paused after 7 days of inactivity** (and flagged for deletion after 90 days paused).
A club goes quiet over a break → DB pauses. Fix in 04 (a keep-alive cron).

## Public pages are no longer fully static (note for reuse)

`leadership.html` used to read `data/board-profiles.json`; it now fetches
`/api/board-profiles`. `main.js` calls `/api/chat-assistant` on every page. When
extracting the public surface for John Jay, keep the Tier-1 rule: public pages render
with no backend, and every fetch degrades visibly.

## How LaGCC-specific it is (measured)

- **4,195 occurrences** of `rhec|laguardia|lagcc|red hawk` across **109 non-doc files**
  (excluding docs/, inheritance/, legacy/, skills/, scripts/, images, .md, .sql).
- Baked into: the KB answers in the chatbot, env var names (`RHEC_LLM_PROVIDER`,
  `RHEC_ALLOW_DEMO_AUTH`), CSS (`--ease-rhec`, `--rhec-mark-url`), the club email
  (`rhec.lagcc@gmail.com`) and Discord invite in the chatbot LINKS map, page copy, OS shell.
- Already centralized: `site_settings` (public links, board-editable via
  `os/apps/settings.html` + `/api/site-settings`), `js/config.js`, the 31 CSS tokens.

**Conclusion:** theme is cheap (31 tokens); naming is not. First engineering task for
tenant #2 is a `brand` config (name, short name, campus, email, Discord, logo paths,
palette, env prefix) that all 4,195 spots read from. Then rhecwb is a platform.

## What to reuse from rhecwb (decided)

Reuse as the platform core, parameterized by brand config:
- OS shell + login + role resolution (`/api/whoami`)
- Onboarding submit → queue → decide (this becomes the **Apps submission** flow too)
- Members / lifecycle / alumni / member-import
- Records/inheritance spine + handoffs
- Events, bulletins, opportunities, projects, study vault, board notes
- `site_settings` + Settings editor
- Chat assistant (static KB per tenant; provider optional)
- QA scripts: `check:secrets`, `check:leaks`, `check:vercel`, `check:json`, `check:routes`
- CI shape; the "no database-only changes" rule; the "no secrets" rule

Do **not** reuse for John Jay's public surface: the vanilla HTML pages and the 4,544-line
stylesheet. John Jay's public site is rebuilt in React (see 04) with its own tokens.
The OS stays vanilla (it doesn't need React) and gets John Jay tokens.

## Its context/handoff structure (used as the model for this folder)

`project-rules/` = timeless rules (vision, design, codegen, architecture, content,
do-not-do). `docs/contributor-handoff/` = numbered onboarding docs with a one-page
`CURRENT_STATE.md`. This `context/` folder follows the same idea: numbered, one topic
per file, a START_HERE, an open-questions file, and a decision log.

Note: rhecwb has a `.claude/settings.local.json` (permission allowlist) but **no
`CLAUDE.md`** — this project adds one.

## The one-line lesson from rhecwb

Every service can die. Free Supabase pauses; Vercel Hobby silently keeps serving a
stale build; docs go stale in a month. Build so the *public site* never notices, and put
a loud CI check on anything that can fail quietly.
