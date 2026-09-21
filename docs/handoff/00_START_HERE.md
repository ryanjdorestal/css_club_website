# 00 — Start here

You are the next maintainer of the John Jay Computer Science Society's website and board platform. You may be
the webmaster, a board member who can read code, or a student who volunteered. This folder is written for you,
assuming you have written one React component and one Python function and never seen this repo.

## What you are inheriting

- A **public site** (`/`) — home, about, events (+ workshops), projects, news, resources, join, cyberhounds —
  that renders from JSON and markdown committed in this repo. It needs no accounts to run.
- **CSS OS** (`/os`) — the board's platform: posts, projects review, events, workshops, resources, members,
  board/terms, inheritance (the board's memory), audit, system. Every write is logged; every list exports.
- A **two-tier model**: Tier 1 runs from the committed files with zero accounts; Tier 2 adds one Supabase
  project (database + login) and one Vercel project (hosting). Tier 2 going down never takes the site down.
- The **checks** that prove all of it: `make check` (lint, types, 146 API tests, 19 web tests, guards),
  `make a11y` (0 findings), `make smoke` (a board member's day, 9 steps), `make sim` (a whole semester, 25
  steps), `make break` (16 ways to break it that do not work).

## The 20-minute path to a running site

```bash
git clone https://github.com/ryanjdorestal/css_club_website.git jjay_css && cd jjay_css
make install        # node deps + a Python venv                      (~3 min)
make dev            # http://localhost:5173 (site) · :5173/os (OS) · :8000 (API)
make check          # should be green; if it is not, 03_LOCAL_SETUP.md § "what usually goes wrong"
```

Open `/os/login`, pick **admin** in the LOCAL_DEV strip, publish a post on `/os/posts`, see it on `/news`.
That is the whole loop. No account, no key, no config.

## Read in this order

| #   | File                                          | Why                                                              | Minutes |
| --- | --------------------------------------------- | ---------------------------------------------------------------- | ------- |
| 1   | `01_WHAT_THIS_IS.md`                          | purpose, users, why two tiers, the failure it was built against  | 5       |
| 2   | `02_REALITY_MAP.md`                           | every feature × live / Tier-1 / not built, with the proving gate | 10      |
| 3   | `03_LOCAL_SETUP.md`                           | the commands, the expected output, the three usual problems      | 10      |
| 4   | `06_HOW_THE_BOARD_USES_IT.md`                 | the OS module by module, in board language                       | 10      |
| 5   | `07_INHERITANCE.md`                           | the spine: record types, files, validator, term-end checklist    | 10      |
| 6   | `FIRST_WEEK.md`                               | five days, one goal each, ending with a merged PR                | 5       |
| —   | `04_SUPABASE_SETUP.md` · `05_VERCEL_SETUP.md` | only when you go live or want your own dev project               | 30 each |
| —   | `08_ROADMAP.md` · `09_RISKS_AND_TRAPS.md`     | before you plan work, and before you touch infra                 | 10 each |

Code-level docs sit at the repo root: `README.md` (map), `ARCHITECTURE.md` (one page), `CONTRIBUTING.md`
(worked examples), `DESIGN.md` (the look — non-negotiable), `docs/CODE_STANDARDS.md` (what a review checks).

## The three things to burn into memory

1. **Tier 1 always works.** Never remove a JSON fallback or an inbox write "because Supabase is on now".
2. **`api/` holds exactly `index.py` + `requirements.txt` + `_core/`.** A second file there is a second Vercel
   function and a silent stale deploy. CI fails on it (`scripts/check_api_count.py`).
3. **No credential ever enters the repo, a doc, a Discord message or a handoff.** Names of variables, yes.
   Values, never. `gitleaks` runs on every push.

## Who to ask

Ryan Dorestal (ryanjdorestal@gmail.com) answers questions for the first year. The club: computersocjjay@gmail.com.
Open an issue on the repo for anything that should be remembered.
