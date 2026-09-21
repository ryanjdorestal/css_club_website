# REPORT_RUN8 — OS entrance · inheritance spine · skills-driven verification · slim repo

2026-09-21, 00:49 → see the log for the close. Brief: `docs/archive/context/35_RUN8_PROMPT.md`.
Log with every decision: `docs/archive/context/36_RUN8_LOG.md`.

## What changed
1. **The OS has a front door.** `[ CSS_OS · BOARD ]` in the public nav (RHEC-style ghost button),
   `/09 CSS_OS · BOARD LOGIN` in the mobile overlay and the footer. `/os/login` is a real gate page:
   the bracketed email form, a reason chip when you were bounced (`not_signed_in`, `not_on_roster`,
   `expired`), the LOCAL_DEV role picker only in dev builds. Signed in, the button says your name.
   Denied logins are audited (`login_denied`) without ever revealing who is on the roster.
2. **Inheritance is the spine.** `content/inheritance/<TERM>/{roster.md, handoffs/, decisions/,
   vendors/, events/, finances/, contacts/, misc/}` — markdown records with a small frontmatter,
   readable with no software, exportable as a zip, validated by one implementation
   (`api/_core/spine.py` ↔ `scripts/validate_inheritance.py`). Attachments are links only.
   `/os/inheritance` is the file cabinet; `/os/system` took over platform health.
3. **Skills-driven verification.** Every skill in `~/Desktop/skills/` has a row in
   `docs/SKILLS_ADOPTED.md`. Adopted/adapted: prettier, stylelint, markdownlint, html-validate,
   pa11y, axe, Lighthouse budget, lychee, gitleaks, commitlint, CODEOWNERS, PR/issue templates,
   route validator, broken-image scan, tokens gate, repo audit, env validate, generated API docs,
   RELEASE.md, supabase-schema checklist, architecture boundaries, ui-preservation. Skipped with
   reasons: discord/*, notion, QUAY/Sator product skills, tribunal.
4. **`scripts/functional_smoke.mjs`** — a board member's day, 9 steps, against the dev server:
   login → post → project (publish + feature) → event → resource + Discord invite → officer →
   handoff + decision records (files on disk, validator passes) → sign out → export zip. Each
   step asserts the *public* site changed. CI runs it (`functional` job) with the OS gate (12).
5. **Slim repo** — see the table below.

## Findings before → after (the tools, first run on adoption)
| Gate | Before | After |
|---|---|---|
| pa11y (10 URLs, WCAG2AA) | 79 | 0 |
| axe (10 URLs + OS as admin) | 233 | 0 |
| stylelint | 2 (+1 `clip` on the new `.sr-only`) | 0 |
| markdownlint | 20 | 0 |
| tokens gate (no literal hex / club names) | 21 | 0 |
| repo audit | 6 | 0 |
| route validator · broken images | 0 · 0 | 0 · 0 |
| html-validate | 0 | 0 |
| gitleaks, 38 commits | 0 | 0 |
| lychee, 86 links | 1 dead (seed record → non-existent SETUP.md) | 0 |
| functional smoke | 8/9 — sign-out button covered by the status bar (real bug) | 9/9 |
| OS gate | 12/12 | 12/12 |
| Lighthouse desktop / mobile | 97 / 60 | recorded; prerender is in `docs/LATER.md` with the numbers |
| pytest · vitest | 49 · green | 49 · green |

The a11y fixes were all token-level: per-accent `--accent-paper` for text on light tones, opacity
floors for labels (0.72 dark / 0.85 light), `.sr-only` text instead of `aria-label` on spans,
red on dark-3 = `--color-red-hi`. No layout changed.

## ui-preservation (public site unchanged except the nav button)
Same viewport (1440), same scroll warm-up, run-7 baseline vs now, after resetting local tables:
| Page | Height | Differing pixels | Where |
|---|---|---|---|
| Home | 9943 → 9943 | 1.70 % | hero cube frame (spins), Cyberhound marquee (moves), nav button, label contrast |
| Projects | 5356 → 5356 | 0.33 % | nav button, label contrast |
| News | 2535 → 2535 | 0.26 % | nav button, label contrast |
| About | 6392 → 6392 | 0.58 % | nav button, label contrast |
Shots: `qa/loops/run8/pub-*-1440.png` (untracked after §5; regenerate with `make shots`).

## Gate
| Gate | Result |
|---|---|
| `make check` (lint · format · css · md · types · tests · audit · guards · validators · dead code) | green |
| `make a11y` | pa11y 0 · axe 0 |
| `make smoke` | OS gate 12/12 · functional 9/9 |
| `make links` | 86 links, 0 dead |
| ui-preservation | only the nav button + animations + contrast tokens differ |
| newcomer test (`make install` → `make dev` → a page) | see log |
| tracked size | see the slim-repo table |

## Slim repo
(filled in §5 — see the log)

## Left for Ryan
- Mobile Lighthouse 60: prerender or lazy R3F (`docs/LATER.md`).
- `.git` history still carries the old refs/shots; a `git filter-repo` before the transfer is his
  call (the working tree is ≤ 15 MB tracked; clones pay for history once).
- CODEOWNERS points at `@ryanjdorestal` until the transfer to `jjcss`.
