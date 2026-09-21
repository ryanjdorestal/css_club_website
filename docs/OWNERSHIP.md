# OWNERSHIP.md — who holds each account, and how it moves

Names and roles only — never a credential. The **live copy** of this table is the Ownership sheet on
`/os/system` (owner emails, second owner, `last_verified`); the nine rows there are the nine rows here, in the
same order (`data/site_settings.json` → `ownership.accounts`). The board edits the sheet; this page explains what
each account holds and how to transfer it. Keep both to nine rows: add an account here and on the sheet together.

Rule: **two owners on every account**, both current officers, both registered to the club Gmail where the
service allows a single identity. Verified at the start of every term (`docs/TERM_CHECKLIST.md`).

| Account          | Owner (role) | Second owner (role) | What it holds                                                                   | How to transfer it                                                                                                                                                 |
| ---------------- | ------------ | ------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Vercel project   | webmaster    | president           | hosting; the five env vars (names in `docs/ENVIRONMENT.md`); the domain binding | Vercel → project → Settings → General → Transfer, or add the new owner as a member of the club team first; re-check env vars after                                 |
| Supabase project | webmaster    | president           | the database, logins, uploads, the migrations applied                           | Supabase → Organisation → Members → invite the new owner as Owner, then remove the old one; the project never moves, people do                                     |
| GitHub repo      | webmaster    | president           | the code, committed data and content, workflows, secrets, the ruleset           | Today under `ryanjdorestal`; at handoff: Settings → Transfer → `jjcss` org (≥ 2 org owners), reconnect Vercel, re-enter Actions secrets, flip `.github/CODEOWNERS` |
| Domain / DNS     | president    | webmaster           | `jjaycss.tech` → Vercel                                                         | at the registrar: change the account email to the club Gmail and add the second owner; Vercel → Domains shows the records                                          |
| Google Form      | president    | secretary           | the join form the site links to (`/os/resources` → site links)                  | Google Forms → share → make the club Gmail the owner                                                                                                               |
| Discord server   | president    | vice-president      | the community; the invite link the site shows                                   | Server Settings → Members → transfer ownership to the new president's account; regenerate the invite if it was personal                                            |
| Linktree         | secretary    | president           | the link page                                                                   | change the account email to the club Gmail; add the second owner in the password manager                                                                           |
| YouTube          | secretary    | president           | recordings the workshops link to                                                | Brand account → managers → add the new owner, remove the old one                                                                                                   |
| Club Gmail       | president    | secretary           | the identity every service is registered to; recovery for all of the above      | change the recovery email/phone to the new president's; update the password in the club password manager; the second owner keeps a recovery code                   |

Where the passwords are: the club password manager (its own owner is the president; its second owner the
secretary). Not here, not in Discord, not in a handoff.

The developer (Ryan Dorestal) holds nothing after the transfer in `docs/handoff/08_ROADMAP.md` (a) is done.
