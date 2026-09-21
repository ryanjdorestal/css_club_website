# HANDOFF.md — the board's side (no code)

You own a website, a board platform, and five accounts. This page is what to do
each term, who holds what, and how to hand it on. The platform survives you if
you follow it.

## The OS, in two paragraphs

Every page of CSS OS opens on the same dashboard: nine tiles in a fixed grid (the top-left pair and
the tall tile beside them are folder-tab cards with the module's counts; the wide one is a histogram
with a `7D 30D 3M 12M` range; the accent tile with the pager explains the module's rules; the ring
is one rate; the paper tile bottom-right is the module's main action). Every number comes from the
module's own rows — a tile that says `—` and `NO_DATA_YET` has nothing to count, not a bug. Above
the grid: the launcher glyph (also `⌘K`), a seven-cell ticker (term · officers · pending · posts ·
projects · DB · time) and your chip. Down the left: the icon rail — Today at the top, Audit at the
bottom, the red edge marks where you are.

Below the grid, under the hairline, is the work: the same tables, editors, queues and forms as before,
restyled — filter tabs are the red segmented strip, people are dossier cards, records and resource
categories are folders, `/os/system` and `/os/audit` carry a subject sheet on the right (`[ REFRESH ]`)
and activity traces drawn from real per-day counts. The login (`/os/login`) is the only place the 3D
cube appears in the OS: the field on the left, the black panel with `BOARD / ACCESS` and `01 / 05` on
the right, the `LOCAL_DEV` strip under it in dev builds.

## What the board can do in the OS (run 10 — everything you touch works)

- **Posts** — write in markdown with a toolbar and a live preview, upload / replace / remove a cover,
  save a draft, send to review, publish, unpublish, archive and bring back, duplicate, delete a draft,
  preview the public page. Same title twice → `welcome-back-2`. Two people editing the same post → the
  second sees CHANGED_ELSEWHERE with both versions and chooses.
- **Projects** — the review loop: submitted → in review → changes requested (with a note the student
  reads when they resubmit) → approved → published → featured (three at most; the fourth is refused
  naming the three) → unpublished or archived. Edit every field of a published project. Add one on a
  student's behalf. Reorder with ▲▼.
- **Events** — date + time (Eastern), location, RSVP link, flyer upload / replace / remove, publish /
  unpublish / archive / unarchive, duplicate for next term. Upcoming vs past follows the date.
- **Workshops** — series (INTRO TO GIT) with numbered sessions, materials as links, a recording link;
  publish needs a date; /events groups them by series.
- **Resources** — add / edit / delete a link, rename / reorder / delete a category (refused while it
  has links unless you confirm the cascade), paste a list of URLs (preview → confirm), check every
  link or one, filter to dead ones; the Discord invite and forms edit in place and change the site.
- **Members** — add / edit, import a CSV (dry run → commit → undo the last import), export a CSV, tick
  rows and move them together (the allowed moves only), merge two duplicates.
- **Board / terms** — add / edit / reorder / remove officers (a photo upload each; someone who filed
  a handoff is archived, not deleted), create a term, edit its dates, set it current, delete an empty
  past term, the rollover wizard (step back before the final confirm).
- **Inheritance** — the 8 record types with templates, a form for the front matter, markdown with a
  preview, the validator that refuses a bad record and says which field, filter by term / type, search,
  export the zip.
- **Site** — taglines, blurbs, the maintenance banner (it really shows on the public site now), the
  feature flags (they really turn things off now), the ticker items.
- **Audit / System** — every write with its before / after, the browser outbox when the API was down
  (WILL_SYNC, replays itself), health checks on demand, ownership rows inline.
- **Everywhere** — search / sort / count / EXPORT CSV on every list, rules printed under every field
  before you break them, errors beside the field and as a jump list, ⌘/Ctrl+Enter saves, Esc closes,
  a refresh mid-edit restores your draft, a lost session sends you to login and keeps your draft,
  double-clicks make one row, archive / delete ask you to type the word, and an UNDO waits 8 s.

## Accounts (keep two owners on each — /os/inheritance → Ownership)

| Account                                           | Owner                   | Second owner | What it holds                                                                                                                                              |
| ------------------------------------------------- | ----------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| GitHub `jjcss` org · this repo                    | webmaster               | president    | the code, the committed data, the workflows                                                                                                                |
| Vercel project                                    | webmaster               | president    | hosting; the env vars (secrets by name only: `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `SUPABASE_JWT_SECRET`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) |
| Supabase project                                  | webmaster               | president    | the database, logins, uploads                                                                                                                              |
| Domain / DNS                                      | president               | webmaster    | jjaycss.tech → Vercel                                                                                                                                      |
| Club Gmail (computersocjjay@)                     | president               | secretary    | the identity every service is registered to                                                                                                                |
| Google Form · Discord server · Linktree · YouTube | see the ownership sheet |              | links the site points at (/os/resources → site links)                                                                                                      |

Use the club Gmail for every service. Never put a password or key in the repo,
a Discord message, or a handoff — write _where_ it is (the club password
manager, Vercel settings), not _what_ it is.

## Each term

- **Week 1** — /os/board: add the new officers (their email + ACTIVE on); set
  the term dates. /os/system → Ownership: update owners, set
  `last_verified`. /os/events: publish the semester's events as they are set.
- **Ongoing** — /os/projects: review submissions within two weeks (write the
  note). /os/posts: a bulletin when something happens. /os/members: import the
  Discord export once a semester. /os/resources: "Check all links" once a
  semester and fix the dead ones.
- **Green means green** — glance at /os/system monthly. A red chip has a
  one-line fix next to it and a runbook entry (docs/RUNBOOK.md).
- **Last 4 weeks** — every officer files a handoff on /os/inheritance → New record →
  handoff (what I ran, where things are, what's unfinished, who to call, advice).
  Set `status: final` when it's good enough to hand over; Today nags until then.
- **Term end** — an admin runs **Term rollover** on /os/board: closes the
  term, opens the next, clones who continues (as inactive — confirm each),
  files handoff stubs. Remove graduated officers' ACTIVE flag. Update the
  ownership sheet.

## Where the spine lives, and how to take it with you

Everything the board writes on /os/inheritance is a markdown file in the repo under
`content/inheritance/<term>/` (roster, handoffs, decisions, projects, events,
contacts, lessons, minutes). It reads without any software. `EXPORT_SPINE.zip` on
that page downloads the whole folder; the nightly snapshot keeps the repo copy
current when Supabase is on. Attach documents as links (Drive, the club Gmail,
GitHub) — the platform never stores your files. Never put a password or key in a
record; the validator refuses secret-shaped text and public records with emails
or phone numbers.

## Adding / removing an officer

/os/board → Add officer (name, role, login email, OS role: `officer`, or
`admin` for president + webmaster) → ACTIVE on. To remove: ACTIVE off (they
become a guest immediately). No passwords exist; sign-in is an emailed code.

## Going live for the first time

SETUP.md — 8 steps, ~30 minutes, all under the club Gmail. Then
`scripts/bootstrap_admin.py` (or ask the developer) creates the first admin row.

## Transferring the repo to `jjcss`

1. GitHub → repo → Settings → Transfer → `jjcss` org. Keep ≥ 2 org owners.
2. Vercel → project → Settings → Git → reconnect to the moved repo.
3. GitHub → Settings → Actions secrets/variables: re-enter `SITE_URL`,
   `SUPABASE_URL`, `SUPABASE_SERVICE_KEY` (they do not transfer).
4. Point the domain at Vercel (Vercel → Domains gives the records).
5. /os/inheritance → Ownership: record the new owners and today's date.

## If everything is lost

The repo is the backup: `data/` and `content/` are refreshed from the database
nightly. A new Supabase project + `scripts/snapshot.py --restore` brings the
data back; the public site kept working the whole time (Tier 1).

## Who to ask

The developer who built this (Ryan Dorestal, ryanjdorestal@gmail.com) will
answer questions for the first year. After that: README.md → CONTRIBUTING.md
→ docs/RUNBOOK.md, in that order — and any CS student who can read Python.

## What "green" means (for the board, no code)

Every change to the site goes through the checks in GitHub (the `CI`, `a11y` and
`functional` badges on a pull request). Green = the site renders on every page, a board
member can still publish a post, a project, an event and a record end to end, and no
secret was committed. If a check is red, the change waits — ask in Discord before merging.
