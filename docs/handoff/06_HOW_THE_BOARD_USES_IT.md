# 06 — How the board uses CSS OS (module by module, no code)

Sign in at `/os/login` with your John Jay email; a 6-digit code arrives; you land on **Today**. Your role comes
from the roster: an active officer on the current term is an **officer**; the president and webmaster are
**admin** (they also see roles, terms, rollover, replay, prune, ownership). Nobody has a password.

Everywhere: search / sort / count / **EXPORT CSV** on every list; the rules under each field before you break
them; errors beside the field and as a jump list; **⌘/Ctrl+Enter** saves, **Esc** closes, **⌘K** opens the
launcher; a refresh mid-edit restores your draft; archive and delete ask you to type the word; an **UNDO** waits
8 seconds after most actions. Every page ends with "What is not here, and why" — read it before asking.

| Module          | What the screen is for                                                                                                                                                                                           | The one thing that trips people up                                                                                                                                                                             |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Today**       | What needs a human: submissions to review, join requests, dead links, events without a flyer, stale drafts, unfiled handoffs (last 4 weeks), unsynced writes.                                                    | Numbers come from real rows. A tile showing `—` and `NO_DATA_YET` has nothing to count — it is not broken.                                                                                                     |
| **Posts**       | News. Write in markdown with the toolbar and the live preview; save a draft; send to review; publish. Cover image optional (≤ 2 MB).                                                                             | Publishing needs a title and a body; the same title twice becomes `welcome-back-2`. If someone else saved the same post since you opened it you see CHANGED_ELSEWHERE — pick theirs or yours, nothing is lost. |
| **Projects**    | Student submissions from `/projects` → review → **changes requested** (write the note; the student reads it when they resubmit) → approved → published → featured (three at most).                               | The fourth FEATURE is refused and names the three. Reviewed rows are history; archive, do not delete.                                                                                                          |
| **Events**      | Date + time (Eastern), location, RSVP link, flyer. Publish / unpublish / archive. **Duplicate → next term** copies an event with the date cleared.                                                               | The public page splits upcoming/past by the date, not by a flag. An event without a date cannot be published.                                                                                                  |
| **Workshops**   | Series (e.g. INTRO TO GIT) with numbered sessions, materials as links, a recording link. `/events` groups them by series.                                                                                        | Session numbers are per series; publish needs a date.                                                                                                                                                          |
| **Resources**   | The links page: categories (rename, reorder, delete), links, **paste a list of URLs** (preview → confirm), **Check all links**, filter to dead ones. Site links (Discord invite, the Google Form) edit in place. | A 403/429 from a site that blocks bots is not dead — click it yourself before deleting. Deleting a category with links asks you to confirm the cascade.                                                        |
| **Members**     | The member list. Add / edit; **import a CSV** (dry run → commit → undo the last import); tick rows and move them together (only the allowed moves); merge two duplicates; export.                                | Import matches by email. "interested → member" is allowed; "member → interested" is not (the map is printed on the page).                                                                                      |
| **Board**       | Officers of each term (photo, role, login email, ACTIVE), ▲▼ order, terms (create, dates, set current), the **rollover wizard** at term end.                                                                     | ACTIVE off makes someone a guest immediately, even mid-session. An officer who filed a handoff is archived, not deleted — the history is the point.                                                            |
| **Inheritance** | The board's memory: 8 record types with templates, a form for the header, markdown with preview, the validator, filter by term/type, search, **EXPORT_SPINE.zip**.                                               | Owners must be names on the roster or roles. Never paste a credential or a private phone/email — the validator refuses it. Set `status: final` or Today keeps nagging. See `07_INHERITANCE.md`.                |
| **Site**        | Taglines, blurbs, the **maintenance banner** (it really shows on the public site), feature flags (they really turn things off), the ticker items.                                                                | The flags and ticker are one JSON control; a typo in the JSON is refused, not saved.                                                                                                                           |
| **Audit**       | Every write with before / after; the Tier-1 inbox (writes made while the database was unreachable) with **Replay to DB**; **prune > 12 months** once a year.                                                     | Replay is safe to run twice (upsert by id). Prune removes only what the nightly snapshot already copied into the repo.                                                                                         |
| **System**      | Is the platform working (live checks, a runbook line per red chip), the **Ownership** sheet (who holds each account — emails, never passwords), docs, runbook, **HOSTING** (free-tier budget).                   | A red chip is information; follow its runbook line (`docs/RUNBOOK.md`). Update the ownership sheet every term — an owner who is not a current officer is flagged in red.                                       |

## A term, in the OS

- **Week 1** — Board: add the new officers (email + ACTIVE), set the term dates, set current. System →
  Ownership: verify owners, set `last_verified`. Events: publish what is scheduled.
- **Every week** — Today. Review submissions within two weeks. A post when something happens.
- **Once a semester** — Members: import the Discord export. Resources: Check all links, fix the dead ones.
- **Last 4 weeks** — Inheritance: every officer files a handoff (what I ran, where things are, what is
  unfinished, who to call, advice) and sets it `final`.
- **Term end** — Board → **Term rollover** (admin): closes the term, opens the next, clones who continues (as
  inactive — confirm each), files handoff stubs. Ownership sheet updated. `docs/TERM_CHECKLIST.md` is the list.

## What the OS will not do

Send email or Discord messages (no bot, no mail key — `08_ROADMAP.md`), store your documents (link them), show
analytics, let members log in, or transfer an account to a new owner (that is a human step in
`docs/OWNERSHIP.md`).
