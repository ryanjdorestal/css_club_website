# TERM_CHECKLIST.md — what the board does at the start and end of every term

Tick it in a `minutes` record on `/os/inheritance` so the next board can see it was done.

## Start of term (week 1)

- [ ] `/os/board`: the new officers added (name, role, login email, ACTIVE on; `admin` for president +
      webmaster); the graduated ones ACTIVE off; the term's dates set; the term set **current**.
- [ ] `/os/system` → Ownership: every account has an owner and a second owner who are current officers; set
      `last_verified` to today. Red rows are owners who are no longer officers — fix them now, not in May.
- [ ] Every officer can sign in at `/os/login` (their John Jay email, the 6-digit code) and sees their role.
- [ ] `/os/system`: every chip green, or its runbook line followed (`docs/RUNBOOK.md`). The HOSTING panel under
      70 %.
- [ ] `/os/resources`: **Check all links**; fix or delete the dead ones; the Discord invite still works.
- [ ] `/os/events`: the semester's known events published; `/os/site`: taglines and banner current.
- [ ] `/os/members`: import the Discord export (dry run → commit).
- [ ] Actions tab on GitHub: `keepalive`, `snapshot`, `link-check` green in the last two weeks.
- [ ] Read last term's handoffs on `/os/inheritance` (filter: handoff, previous term). All of them.

## During the term

- [ ] Weekly: Today. Submissions reviewed within two weeks, with a note.
- [ ] A post when something happens; an `event` record after an event worth remembering (what worked, count).
- [ ] A `decision` record the day a non-trivial decision is made, not at term end.
- [ ] Monthly: the manual database dump into the club Drive (`docs/HOSTING_LIMITS.md` § 3 — once Supabase is on).

## End of term (last 4 weeks)

- [ ] Every officer files a `handoff` (where things are, what is unfinished, who to call, advice) and sets it
      `final`. Today counts the missing ones.
- [ ] `contact` records for every sponsor / faculty / department relationship (public email only).
- [ ] `/os/audit`: prune records older than 12 months (once a year, admin).
- [ ] Admin runs **Term rollover** on `/os/board`: next term created, continuing officers cloned as inactive
      (confirm each), handoff stubs filed, `roster.md` written.
- [ ] `/os/inheritance` → EXPORT_SPINE.zip → the club Drive folder for the term.
- [ ] Ownership: accounts held by graduating officers transferred (`docs/OWNERSHIP.md` says how), the sheet
      updated, `last_verified` set.
- [ ] The password manager: graduating officers removed; recovery codes with the new second owners.
