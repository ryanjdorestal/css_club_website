---
title: How to write an inheritance record
---

## Why this exists

Student clubs lose everything every two to four semesters: logins, contacts, why a decision was made, what a project was for. Inheritance is where each board writes down what the next board needs, in plain files that outlive the platform. The platform only organizes them. A new board that has never met the old one should be able to run the club after a week of reading this folder.

## The rule

One folder per term (`F26`, `S27`, `F24-S25`). One markdown file per record. Every file starts with a small header (the frontmatter) and then plain prose. Write in the past tense, be concrete, and write **during** the term, not the night before you graduate.

## Record types

| Type | When | Where |
|---|---|---|
| roster | once per term (rollover writes it) | `<term>/roster.md` |
| handoff | one per outgoing officer, last 4 weeks of the term | `<term>/handoffs/<role>.md` |
| decision | any non-trivial board decision | `<term>/decisions/<YYYY-MM-DD>-<slug>.md` |
| project | a project or app worth continuing | `<term>/projects/<slug>.md` |
| event | an event worth remembering (what worked, attendance) | `<term>/events/<slug>.md` |
| contact | a sponsor, faculty or department relationship — name, role, public email only | `<term>/contacts/<slug>.md` |
| lesson | a pattern worth capturing | `<term>/lessons/<slug>.md` |
| minutes | a board meeting | `<term>/meetings/<YYYY-MM-DD>.md` |

## The five steps

1. In CSS OS → Inheritance → **New record**, pick the type. The template loads with the header pre-filled (or copy the file from `_template/` if you're working in the repo).
2. Fill the header: title, date, owners (names or roles, never emails), status (`draft` until it's good enough to hand to a successor, then `final`), visibility (`board` unless it's front-page safe).
3. Write the body under the template's headings. Delete headings you don't need; don't leave `[CONFIRM]` placeholders in a final record.
4. Attach a doc by pasting a link (Google Drive, the club Gmail, GitHub, a PDF URL). Files stay where you keep them — the platform never stores uploads for inheritance.
5. Save. The validator checks the header, the links, that owners are on the roster, and that nothing secret-shaped or personal slipped in. Fix what it says; save again.

## What never goes in a record

Passwords, tokens, keys, recovery codes. Contracts. Personal phone numbers or private emails. Anything about a member you wouldn't say to their face. Pointer records only: "the Drive folder is at …", "the Vercel login is the club Gmail", never the credential itself.

## Common mistakes

Writing only at term end. Writing marketing copy instead of what actually happened. Attaching files instead of links. Forgetting to set `status: final`. Filing a handoff without the three things the next person will ask first: where things are, what's unfinished, who to call.

## Where to look when stuck

`_template/` for the headings. `F26/decisions/2026-09-21-platform-adoption.md` for a real example. `docs/HANDOFF.md` for the board's yearly checklist.
