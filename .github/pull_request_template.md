## What changed

<!-- One to three sentences. -->

## Why

<!-- The problem or the issue: "Closes #12". -->

## How I verified it

- [ ] `make check` green (lint · types · tests · guards · validators · migrations · assets · duplication)
- [ ] UI change: `make a11y` unchanged or better, and screenshots below (before / after, desktop + 390 px)
- [ ] OS or API write change: `make smoke` (12/12 + 9/9) and `make sim` (25/25)
- [ ] Something that could be broken on purpose: a case in `scripts/board_break.mjs`
- [ ] No secrets in the diff (`gitleaks protect --staged`; CI scans the history too)

## Which gate covers it

<!-- The test, sim step, break case or audit that would fail if this change regressed. "None yet" is an honest answer that starts a conversation. -->

## Docs updated?

- [ ] Yes: <!-- which file --> · [ ] Not needed, because <!-- why -->

## Screenshots (UI changes)

<!-- before / after -->
