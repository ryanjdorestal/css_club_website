# 01 — What this is

## Purpose

**The public site** tells a John Jay student what the Computer Science Society is, when it meets, what it has
built, and how to join — and it keeps doing that with nobody maintaining it, because everything it shows is a
file in this repo.

**CSS OS** lets the board run the club without a developer: publish news and events, review student project
submissions, keep the resources page true, import the member list, add the new officers each term, and — the
part that matters most — write down what the next board needs to know before graduating (`07_INHERITANCE.md`).

## Who uses it

| User                          | Where                                  | What they need                                                        |
| ----------------------------- | -------------------------------------- | --------------------------------------------------------------------- |
| Prospective member            | `/`, `/join`                           | what the club is, the Discord invite, the next event, the Google Form |
| Current member                | `/events`, `/resources`, `/projects`   | dates, links that work, the projects they can join                    |
| Board member (officer)        | `/os/*`                                | publish, review, import, file records; an UNDO when they slip         |
| President / webmaster (admin) | `/os/board`, `/os/system`, `/os/audit` | terms, roles, rollover, ownership, replay, prune                      |
| Next maintainer               | this folder                            | how it works, what is live, what to do first                          |

## The two-tier model

- **Tier 1** — no accounts. The API serves `data/*.json` + `content/**/*.md`; OS writes land in
  `data/*.local.json` and an append-only inbox (`.cache/inbox/`) that can be replayed later. Everything in
  `make check`, `make sim` and `make break` runs in this tier. Development happens here.
- **Tier 2** — one free Supabase project (Postgres, email-code login, a public bucket for uploads) and one free
  Vercel project (the site + the one Python function). The browser holds only the anon key; the service key
  lives in Vercel's environment and never leaves the function.

Tier 2 is additive. When Supabase is paused or the key is wrong, the public site keeps rendering the committed
files, and the OS says so in a chip instead of dying. A nightly snapshot copies the database back into the repo
so the committed files are never more than a day behind — that snapshot is also the backup.

## Why it was built this way — the failure it answers

The previous site (`jjcss/CSS_Website`, 2022) stopped changing in **April 2025**. Not because nobody cared:
because one person held the FTP login, the repo was never connected to the hosting, and when that person
graduated the site became a photograph of the club as it was. The events page still announced a semester
nobody attended.

So the design brief for this platform was: the site must survive the loss of any one person, any one account,
and any one free tier.

- The **repo is the source of truth** and is connected to hosting: a merge to `main` is a deploy.
- **Two owners on every account**, recorded in the OS (`/os/system` → Ownership) and in `docs/OWNERSHIP.md`.
- **No paid service, no API key for a feature**, so nothing expires with a credit card.
- **Everything the board knows is written in files** (`content/inheritance/`), not in someone's head or DMs.
- **A board member can run it** without reading code; a first-year can contribute with the docs in this folder.

## What it is not

Not a member portal (members do not log in). Not a Discord bot (no bot token — see `08_ROADMAP.md`). Not a
CMS with a WYSIWYG editor (markdown with a toolbar and a preview). Not an analytics product (no tracking; the
only numbers shown are the club's own rows). Every OS page ends with "What is not here, and why".
