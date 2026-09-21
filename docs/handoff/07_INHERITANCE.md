# 07 — Inheritance: the spine

## Why continuity is the point

A student club replaces its entire board every two to four semesters. Logins, sponsor contacts, why a decision
was made, what a project was for — gone with the graduates. The previous site froze for exactly this reason
(`01_WHAT_THIS_IS.md`). So the board's knowledge lives in **plain markdown files in the repo**, written during the
term, validated by the same rules in the OS and in CI, exportable as a zip, readable without any software. The
platform organises the files; the files outlive the platform.

## The 8 record types

| Type       | When                                            | File                                      |
| ---------- | ----------------------------------------------- | ----------------------------------------- |
| `roster`   | once per term — the rollover writes it          | `<term>/roster.md`                        |
| `handoff`  | one per outgoing officer, last 4 weeks          | `<term>/handoffs/<role>.md`               |
| `decision` | any non-trivial board decision, when it is made | `<term>/decisions/<YYYY-MM-DD>-<slug>.md` |
| `project`  | a project or app worth continuing               | `<term>/projects/<slug>.md`               |
| `event`    | an event worth remembering (what worked, count) | `<term>/events/<slug>.md`                 |
| `contact`  | a sponsor, faculty or department relationship   | `<term>/contacts/<slug>.md`               |
| `lesson`   | a pattern worth capturing                       | `<term>/lessons/<slug>.md`                |
| `minutes`  | a board meeting                                 | `<term>/meetings/<YYYY-MM-DD>.md`         |

Templates for each: `content/inheritance/_template/<type>.md`. A real example:
`content/inheritance/F26/decisions/2026-09-21-platform-adoption.md`.

## The file layout

```
content/inheritance/
  HOW-TO.md              the five steps, for the board
  _template/             one template per type (the OS loads these)
  F26/                   one folder per term: F26, S27, F24-S25
    roster.md
    handoffs/  decisions/  projects/  events/  contacts/  lessons/  meetings/
```

## The frontmatter contract

Every file starts with a YAML header, then prose. Required: `type`, `title`, `term`, `date`, `status`, `owners`,
`visibility`. Optional: `role` (handoffs), `links` (label + http(s) url), `related`, `supersedes`, `tags`.

```yaml
---
type: handoff
title: Handoff — Treasurer, Fall 2026
term: F26
date: 2026-12-10
status: final # draft | final | superseded
owners: [Treasurer] # names on the roster, or roles — never emails
visibility: board # board | public
role: Treasurer
links:
  - { label: "Budget sheet (club Drive)", url: "https://drive.google.com/…" }
---
```

## The validator (one implementation, three places)

`api/_core/spine.py` runs in the OS on save, as `scripts/validate_inheritance.py` on your laptop, and in
`make check` / CI. It refuses: a missing required field; an unknown type/status/visibility; a term that is not
`F26`-shaped; a date that is not `YYYY-MM-DD`; empty owners; an owner who is not on that term's roster (roles
are always fine); a link without a label or an http(s) url; a `related`/`supersedes` that does not resolve, or a
supersedes cycle; **any secret-shaped string** (tokens, keys, `password: …`); and, in a `public` record, any
email address or phone number. The error names the field. Nothing is saved until it passes.

## Export and backup

`/os/inheritance` → **EXPORT_SPINE.zip** downloads the whole folder. With Supabase on, the `records` table mirrors
every file and the nightly snapshot writes the files back into the repo, so the repo copy is never more than a
day old. The repo is the backup; the zip is the copy you take with you.

## The term-end checklist (the inheritance half — the full list is `docs/TERM_CHECKLIST.md`)

1. Four weeks before the end, Today starts counting "Handoffs not filed". Each officer files one and sets it
   `final` — the three things the next person asks first: **where things are, what is unfinished, who to call**.
2. Decisions made this term that were never written down: write them now, dated when they happened.
3. Contacts: every sponsor / faculty relationship as a `contact` record — name, role, **public** email only.
4. Admin runs **Term rollover** on `/os/board`: it writes next term's `roster.md`, clones continuing officers as
   inactive, and files handoff stubs. Confirm each officer; step back before the final confirm if unsure.
5. Export the zip; put it in the club Drive folder for the term.
6. Verify the ownership sheet (`/os/system`) — every account has an owner who is still a current officer.

Cross-links: `docs/RUNBOOK.md` (red chips), `docs/HANDOFF.md` (the board's page), `CONTRIBUTING.md` § 5.
