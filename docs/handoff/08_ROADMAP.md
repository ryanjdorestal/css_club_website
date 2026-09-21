# 08 — Roadmap

Three tiers. Each item: what · why · rough effort · where to start. Effort: **S** = an afternoon, **M** = a
weekend, **L** = a few weeks of evenings. Nothing here needs a paid service; the items that need an account or a
key say so and stay in (c) until the club decides.

## (a) Before launch — Ryan's list, then the first real write

| #   | What                                                                                          | Effort | Where to start                         |
| --- | --------------------------------------------------------------------------------------------- | ------ | -------------------------------------- |
| 1   | Create the Supabase project `jjay-css-prod` under the club Gmail; run migrations 0001–0005    | S      | `04_SUPABASE_SETUP.md` § 1–2           |
| 2   | Create the Vercel project from the repo; five env vars; Ignored Build Step                    | S      | `05_VERCEL_SETUP.md`                   |
| 3   | Seed (`snapshot.py --restore`), bootstrap the first admin, one real write, `records` shows it | S      | `04_SUPABASE_SETUP.md` § 5–7           |
| 4   | GitHub secrets + `SITE_URL`; run keepalive and snapshot once by hand; both green              | S      | `04` § 8, `docs/HOSTING_LIMITS.md` § 1 |
| 5   | Point `jjaycss.tech` at Vercel; update Supabase's site URL; repo homepage                     | S      | `05_VERCEL_SETUP.md` § 5               |
| 6   | Transfer the repo to the `jjcss` org, reconnect Vercel, re-enter the secrets, flip CODEOWNERS | S      | `docs/HANDOFF.md` § "Transferring"     |
| 7   | Replace the three EXAMPLE projects; click-test every link on `/os/resources`                  | S      | `/os/projects`, `/os/resources`        |

## (b) This semester — from `docs/LATER.md` and the five ⚠️ in the OS matrix

| What                                                  | Why                                                                                                      | Effort | Where to start                                                                                                                                                             |
| ----------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Prerender the 8 public routes for mobile Lighthouse   | mobile scores 60: a CSR SPA pays 450 KB of JS before the hero paints                                     | M      | `apps/web/vite.config.ts`; a prerender plugin, or lazy-load R3F (`cube/`, `mascot/`) behind `IntersectionObserver`                                                         |
| Discord webhook relay (a post → `#announcements`)     | the one automation the board asks for; a webhook is not a bot token but it is a secret the club must own | M      | a `DISCORD_WEBHOOK_URL` env in Vercel only, one `send()` in `api/_core`, called from `posts.publish`; `docs/LATER.md`                                                      |
| Audit filters by actor and date range                 | the log grows; "what did X change in October" is a real question                                         | S ★    | `api/_core/audit.py::list_records` already takes `actor`; add `since`/`until`, then two inputs on `os/OsAudit.tsx`                                                         |
| Ticker items reorderable with ▲▼                      | today it is a JSON list                                                                                  | S ★    | `os/OsSite.tsx` — copy the ▲▼ pattern from `os/OsBoard.tsx::moveSeat`                                                                                                      |
| Per-item inbox replay                                 | replay-all is idempotent, but one bad line blocks nothing and shows nothing                              | S ★    | `POST /api/os/inbox/replay` already accepts `client_ids`; add a row action on the inbox table                                                                              |
| RUN SNAPSHOT button on `/os/system`                   | the snapshot is a workflow; a board member cannot trigger it                                             | S      | `gh workflow run` needs a token → instead link to the Actions page with the run button; or dispatch through the API with a repo-scoped token stored in Vercel (a decision) |
| Supersedes picker on inheritance records              | a text field that must match an id                                                                       | S ★    | `os/OsInheritance.tsx` — a `<select>` from the records list filtered by type                                                                                               |
| Typed site-setting controls (string lists add/remove) | the JSON control refuses typos but does not help                                                         | M      | `os/OsSite.tsx`; `KeyVal` inline edit already exists in `os/ui/OsPage.tsx`                                                                                                 |
| Delete an inheritance record from the UI              | files are the history; deleting is a git operation                                                       | S      | decide first (issue); then a `DELETE` in `routers/spine.py` that unlinks the file + records it                                                                             |
| Three OS tiles that render `—` say `NO_DATA_YET`      | consistency with the rest of the dashboard                                                               | S ★    | `os/ui/specs.ts`                                                                                                                                                           |

★ = seeded as a **good first issue** on the repo, with the file, the definition of done and the proving command.

## (c) Someday — needs a decision, an account, or a semester

| What                                       | Why it waits                                                                                | Effort | Where to start                                                                              |
| ------------------------------------------ | ------------------------------------------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------- |
| Alumni network                             | needs a members' login and a privacy decision (who sees what)                               | L      | rhecwb's alumni-network design as a reference for shape only; a `members` role in `auth.py` |
| Study vault (notes, past exams)            | copyright and moderation questions before code                                              | L      | a `resources` category with uploads is the minimal version                                  |
| Member-facing OS                           | members do not log in today by design; changing that changes RLS on every table             | L      | `supabase/migrations/0001_init.sql` policies                                                |
| Discord sync (member list, feed)           | a bot token = a key the club must own and rotate                                            | M      | `docs/LATER.md` first entry                                                                 |
| Email from the OS                          | a mail provider key                                                                         | S      | one `send()` in `_core`, Resend/Postmark under the club Gmail                               |
| Analytics on Today                         | every provider needs an account; the numbers are the club's own data                        | S      | Vercel Analytics toggle (no code)                                                           |
| A third tenant (another club)              | the brand is a config file (`brand/brand.config.ts`) but the content pipeline is John Jay's | L      | a second `brand.config`, a `data/` per tenant                                               |
| Cube head-turn for the Cyberhound, bust v7 | nice-to-have                                                                                | M      | `assets/hound3d/README.md`                                                                  |
