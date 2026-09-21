# 07 — Content migration (copy, images, sections from the old site)

Stack-agnostic: nothing here is about HTML. The output of migration is **data files +
a media folder**, which the React site and the OS both read.

## Legal

- Source repo is **MIT, © 2022 Computer Science Society Club at John Jay College**.
  The club owns its copy and code; Ryan builds for the club; everything is reusable.
- MIT's one condition: keep the copyright notice. Keep `LICENSE`, and cite the source
  commit `jjcss/CSS_Website@a8fca55` (April 22, 2025) in the README / a `SOURCES.md`.
- John Jay College logos/seal are the college's mark, not the club's — fine for a
  recognized club under the college's brand rules; not covered by MIT.
- Board bios/photos are already public; carry forward into an alumni/board history.
  If anyone asks to be removed, remove.

## Method: extract, don't port

One script (Python + BeautifulSoup, run against the clone) pulls every piece into data
files. Ryan reviews the diff; the board reviews copy for staleness; the site renders
from data. Same source-of-truth model rhecwb already uses, so every piece lands where
the platform already expects it.

| What | Volume | Destination | Notes |
|---|---|---|---|
| Home/about copy | ~390 + ~1,860 words | `content/` (md/json) | 1,860 is mostly board bios |
| Board, 10 semesters (Fall 2020 → Spring 2025) | photos + role + bio | `data/board.json` with `term` → rhecwb's `inheritance/` spine + `board-profiles` | **This is the alumni network, already written.** |
| Events Spring 2025 (6) + Fall 2024 (8) | names + flyers | `data/events.json` | Earlier semesters exist only as the org's 27 workshop repos → link them as "Previous Workshops"; dead history becomes live content |
| Resources | 27 links | `data/resources.json` | Link-check first; some are years old |
| Socials/footer/Discord pin | ~10 links | `data/links.json` → `site_settings` | Click-test the form + invite (pin is 2021) |
| Collaborate ("Join the Team", openings) | ~190 words | **replaced by** rhecwb `onboarding` | Openings text says Fall 2025 — stale |
| Cyberhounds (CTF sub-club) | ~180 words + header art | own section/page; or a rhecwb project record | Real differentiator; keep its identity; red accent |
| Graduate-school article | ~670 words | one News post | |
| Blog | 0 posts | fold into News | placeholder |
| Discord server info | 661 members, est. Feb 2021 | `site_settings` | verify |

## Images: 85 files / 35 MB → ~5 MB

- Drop the **25 orphans** (4.4 MB; listed in 02).
- Rename the **8 with spaces**; everything kebab-case.
- Sort: `img/brand/`, `img/board/<term>/first-last.webp`, `img/events/<semester>-<slug>.webp`,
  `img/photos/`.
- Flyers → WebP, max 1600 px. Board headshots → WebP, max 800 px.
- `cssclub.png` / `csslogo.png` / `whitecss.png` retire → `assets/brand/cs_logo_sharp.svg`.
- Keep the binary-ring header art and the circular stamp as brand elements (recreate the
  rings procedurally; keep the stamp as SVG if it can be traced, else PNG).
- Originals archived **once, outside the site repo** (not vendored; 35 MB).

## Sections: old nav → new

```
old:  About · Events · Resources · Collaborate · Blog · Cyberhounds · Join (form)
new:  Home · Events · Apps · About (who we are + board + alumni board) · Resources
      · Cyberhounds · News · Join (→ onboarding)
```
Collaborate merges into Join. Blog + the grad article become News. **Apps is new.**

## Review checklist (what the board must catch before anything ships)

- [ ] Footer ZIP: **10019**, not 11109.
- [ ] Remove "Executive Openings (Fall 2025 – Spring 2026)" or make it a live record.
- [ ] Current semester on Events.
- [ ] Every link in `links.json` and `resources.json` clicked in the last 30 days.
- [ ] Discord invite is a **non-expiring** invite owned by the club account.
- [ ] Google Form is owned by the club Google account, not a graduate's.
- [ ] Board bios: anyone who wants out is out.
- [ ] MIT notice present; `SOURCES.md` cites `a8fca55`.

## Provenance

Don't vendor the old repo. `SOURCES.md` lists: repo URL, commit, date, license, and
which data file each page's content went into. The cloud clone used for analysis is
`/home/claude/jjcss/CSS_Website` (session-only; re-clone from GitHub).
