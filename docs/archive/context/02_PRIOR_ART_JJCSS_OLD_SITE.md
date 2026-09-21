# 02 — Prior art: the old John Jay CSS site

Source: https://github.com/jjcss/CSS_Website — cloned and analyzed read-only.
Analyzed at commit **`a8fca55`** (2025-04-22, last commit on `main`).
Live: https://jjaycss.tech/ (still up as of 2026-09-19).

## The org

- GitHub org **`jjcss`** — 31 repositories, 38 followers.
  - `CSS_Website` (HTML) — the site. Last push Apr 22, 2025.
  - `jjcss.github.io` (HTML) — "CompTIA Security+ Bootcamp" page, Jan 2024. **This is
    the org's root GitHub Pages slot** — worth reclaiming.
  - `.github` — org profile README (events list dated May 2023).
  - `AWS_Part_2_Fall_2024` (JS), and ~27 workshop repos 2021–2023: Ethical Hacking,
    Security Engineering (x2), Python x Cybersecurity, React Fullstack, Networking
    Basics, Git/GitHub, iOS, JavaScript, HTML/CSS, Tech Prep, Career Prep, Technical
    Interview Prep series, Python workshops, First General Meeting Fall 2023.
- Org profile: "Computer Science Society Club at John Jay College", email
  computersocjjay@gmail.com, site https://jjaycss.tech/.
- Languages across org: JavaScript, HTML, Python, Swift.

## Why the site froze (the actual failure mode)

- `jjaycss.tech` resolves to **104.247.81.99** — a shared-hosting IP, not GitHub Pages
  (185.199.x.x), not Netlify, not Vercel.
- There is **no `CNAME` file** in the repo and the entire site lives under a `files/`
  subfolder. That's the tell: someone was uploading `files/` to a paid host by hand (FTP).
- So the repo and the live site were **never connected**. When the person with the
  hosting login graduated, updates stopped. The code is all there; nobody can deploy it.
- Last merges were all by one president (Leandro Gamarra). CODEOWNERS = one person
  (`@r0m3c`). Single point of failure, matches the timeline exactly.
- The `.tech` domain is the one recurring cost (GitHub Student Pack gives .tech free
  for a year, then it's paid). Somebody is still paying for shared hosting.

**Lesson applied:** deploy from `main` via CI, org-owned, no human-held deploy key.

## Repo structure

```
.github/CODEOWNERS                 * @r0m3c
.github/pull_request_template.md   9-section PR template (type, description, issues,
                                   screenshots, tests?, remarks, docs?, post-deploy, gif)
.github/workflows/
  assign-users-pr-target.yml       auto-assign PR author
  stale-branches.yml               weekly; stale at 62 days, delete at 93
LICENSE                            MIT © 2022 Computer Science Society Club at John Jay College
README.md                          fork → clone → branch → PR walkthrough, with screenshots,
                                   written for people who've never used Git. Socials list.
files/                             ← the deployed site root
  index.html about.html events.html previous_events.html resources.html
  collaborate.html blog.html cyberhounds.html graduate-events.html
  newPageTemplate.html testArticle.html
  js/  about blog collaborate events index newPageTemplate resources testArticle .js
  styles/  one CSS file per page (about.css is 1,117 lines; index.css 746; events 608)
  images/  85 files, 35 MB
test/  css/about2.css test.css  html/about2.html test.html
```

Totals: 125 files, ~10,052 lines of HTML/CSS/JS, of which ~8,000 is CSS.

## What made it hard to maintain

- 11 HTML pages, each with a **full copy of the navbar**. One nav change = 11 edits.
- **Per-page CSS**, 600–1,100 lines each, heavily duplicated.
- Adding an event = editing a hand-built **radio-button carousel** in `events.html`,
  dropping a flyer PNG with spaces in the filename into `images/`, and manually updating
  a "Previous Semesters" dropdown. `previous_events.html` is a copy of `events.html`.
- Board members/dates **hardcoded in `about.html`** going back to Fall 2020 (1,314 lines).
- Dependencies from CDNs: **jQuery 3.6.0**, **FontAwesome kit** (`c8e4d183c2` — tied to
  someone's personal account), **Iconify 2.1.1**.
- No build, no tests, no link checks.

## What they did well (keep)

- The README's contributor walkthrough. Genuinely beginner-friendly.
- The PR template.
- Stale-branch cleanup workflow.
- `newPageTemplate.html` as a starter.
- Discussions enabled for ideas/bugs.

## Content inventory (numbers)

| Page | Headings / content | Copy |
|---|---|---|
| index | hero, What the Club is About, Events, Resources, Collaborate | ~390 words |
| about | "Let's grow together!", Who We Are, What We Do During The Semester, Discussion With Your Peers, then board by semester Fall 2020 → Spring 2025 (photo + role + name + bio) | ~1,864 words (mostly bios) |
| events | Spring 2025: First General Meeting, Career Workshop, Alumni Panel, Cybersecurity Essentials, Final General Meeting, Python Workshop & Final General Meeting, Previous Workshops | flyers |
| previous_events | Fall 2024: First General Meeting, Intro to AI (ChatGPT) Pt 1, Movie Day – Halloween, Hands-on AI Pt 2, Intro to AWS Pt 1, Hands-on AWS Pt 2, Final General Meeting, Python Workshop | flyers |
| resources | 27 external links (Join form, Git/GitHub docs, WayUp internships, Levels.fyi, Repl.it, Glitch, John Jay Tech Talent Pipeline, CUNY Tech Prep, MSRC, CodePath Cybersecurity, Codecademy, Full-Stack roadmap repo, …) | list |
| collaborate | Join The Team; Executive Openings (Fall 2025 – Spring 2026); Executive Assistant; Web Application Committee; Analytics Committee; Public Relations Committee; Share Your Project Ideas; Club Suggestions | ~190 words |
| blog | "CSS Club Blog" — **0 posts**, placeholder | — |
| cyberhounds | What is CTF?, How It Works, Competitions, Spring 2023, Join Us!, Join The Discord Channel! (CTF sub-club with its own header art) | ~179 words |
| graduate-events | one article: "3 Most Important Things to Consider Before Signing Up to Any Graduate School Event" (Programs, Colleges, Locations) | ~673 words |

Board roles present: President, Vice-President, Secretary, Treasurer, Assistant
Secretary (+ assistants). Named contributors in README: Leandro Gamarra (President),
Annie H. (Treasurer), Wing K., Luis B. (Previous VP), Yannelly M.

## Images

- **85 files, 35 MB.** 60 referenced (31.1 MB), **25 orphaned** (4.4 MB, referenced by nothing).
- **8 filenames contain spaces** (e.g. `First General Meeting - Spring 2025.png`).
- Categories: brand (`cssclub.png`, `csslogo.png`, `clublogo.png`, `whitecss.png`,
  `favicon.png/.ico`, `jjay.png`, `jj_logo_white.png`), board headshots (~25 first-name
  PNGs), event flyers (~20), club photos (`club2.jpg`, group pics), icons/illustrations.
- Orphans: AI Part 1-1.png, AI Part 2-1.png, Cybersecurity - Spring 2025 (1).png,
  PicoCTF.png, clublogo.png, collab.png, earth.png, event.jpeg, favicon.ico, jennifer.png,
  jj_logo_white.png, jjay.png, languages.png, olive.png, puzzle.png, rachel2–5.png,
  resource.png, resources.png, samira.png, teamwork4.webp, whitecss.png, workshops.png.

## Commit history

- 82 commits. Authors: Leandro Gamarra 28, lu.yao001@stu.bmcc.cuny.edu 20, ik-izz 14,
  Izz 13, jguadarr974 4, lucasstranger1 1, Jennifer Guadarrama 1, Finneytony 1.
- All 2024–2025 work = Leandro + lu.yao001 (BMCC email) + Izz. **This is the board, not
  the student body.** 282 PRs merged (PR numbers reach #282), almost all from one branch
  (`Lucas2`) by one person.

## Links found in the site + the Discord pin (Sept 24, 2021, Leandro G.)

- Website https://jjaycss.tech/
- Discord https://discord.gg/fJZKErEnPa (site also has https://discord.gg/EMFTqSUYNu)
- GitHub https://github.com/jjcss
- Email computersocjjay@gmail.com
- YouTube https://www.youtube.com/@computersocjjay (49 subs, 11 videos)
- Instagram https://www.instagram.com/jjccomputerscience/
- LinkedIn https://www.linkedin.com/company/jjcss
- Facebook https://www.facebook.com/CSSJohnJay
- Email-updates form https://docs.google.com/forms/d/e/1FAIpQLScs_GAVci5aZwhLT01kAN2lI1JE4aVnjQ3Y2FCLbHs5yEjaew/viewform
- (README variant) https://docs.google.com/forms/d/e/1FAIpQLSefHY3t8HakF0VvY5jLKppv0XIaU7a0ZdfbTkSHzs1ObCSgsA/viewform
- Linktree linktr.ee/jjaycss
- MSRC tutoring "Fall 2022" https://linktr.ee/jsuite ; PRISM https://www.jjay.cuny.edu/prism
- Discord server card: "Computer Science Society @ JJAY", 661 members, est. Feb 2021.

**All of these need a click-test before reuse; the pin is from 2021.**

## Things to fix during migration (caught in review)

- Footer address says **"524 W 59th St, New York, NY 11109"** — John Jay's ZIP is **10019**.
- "Executive Openings (Fall 2025 – Spring 2026)" is stale.
- Events page shows Spring 2025 as current.
- Blog has zero posts; fold into News.
- FontAwesome kit is on someone's account; drop it.

## License

MIT, © 2022 Computer Science Society Club at John Jay College. Reuse is fine; **carry
the copyright notice forward** and cite the source commit `jjcss/CSS_Website@a8fca55`.
John Jay College logos are the college's trademark (follow college brand rules; fine for
a recognized club, but not covered by the MIT license).
