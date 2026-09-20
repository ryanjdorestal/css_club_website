# qa/REPORT.md — 2-hour autonomous build, 2026-09-19

## Verdict: phases 0–6 all green

| Phase | Status | Verification artifact |
|---|---|---|
| 0 Scaffold | ✅ | `shots/00-scaffold.png` — tokens + brand config render; `/api/health` answers |
| 1 Content extraction | ✅ | `data-validate.txt` — 7/7 schemas pass; 5 board terms / 34 members, 12 events + flyers, 24 resources, KB (11 entries), links, workshops, example apps |
| 2 Design system | ✅ | `shots/02-styleguide-{1440,390}.png`; `contrast.txt` — all WCAG pairs pass |
| 3 Public pages | ✅ | `shots/03-*` (10 routes × 4 widths); `route-validate.txt` — all internal links resolve; zero console errors |
| 4 Cube + mascot + chat | ✅ | `shots/04-cube-hero-1440.png` (live R3F, cube-as-nav), `04-mascot-emotes.png` (6 emotes + 32px launcher), `04-chat-widget.png` (offline KB answer with citation); Three.js fully code-split (280 KB gz lazy chunk; main bundle 84 KB gz) |
| 5 API + Supabase + CI | ✅ | `pytest.txt` — 11/11; `.cache/inbox/*.jsonl` fallback proven; `supabase/migrations/0001_init.sql`; ci/keepalive/post-deploy-smoke workflows |
| 6 OS shell | ✅ (minimum line) | `shots/06-os-{login,today,queue}-1440.png` — login role picker, Today dashboard, submissions queue |

## What was cut (and why)

- **Scroll-explode cube animation** (cube separates into faces on scroll) — time-box; idle rotation + parallax + per-face hover/click nav shipped. First follow-up.
- **OS beyond login/Today/Queue** — Members, Events ops, Bulletins, Records, Handoffs, Settings are listed as "Planned" in the OS sidebar; Supabase Auth gates them anyway.
- **News from OS bulletins** — News renders the migrated article; the bulletin CMS is an OS feature.
- **lychee link-check of the 24 external resource links** — needs network time + board judgment on replacements; `links.json.verified` stays `false` until click-tested.
- **3 resource links** (Codecademy, Swift tour, Hacking with Swift) live in old prose, not the grouped list — plan said 27, strict parse yields 24.

## Honesty notes

- `data/apps.json` holds 3 entries marked `status:"example"`; the UI labels them "EXAMPLE — not a real app". No fake stats anywhere; the Home status strip derives every number from committed data and shows TBA for next event.
- Red/blue primary-button text passes WCAG AA-large (4.16:1 / 3.62:1), not AA-normal — same contrast the old site's own CTAs had. Strict-AA option: tint the fills with `--accent-fg`. Ryan's call.
- `--muted` nudged #9DB0C4 → #A2B4C8 (the one palette deviation; +2% lightness for AA body text).
- Old repo bugs fixed in extraction: ZIP 10019, swapped Fall-2024 flyer filenames, duplicated About copy (deduped at display), Fall-2024 flyer carousel that was commented out.

## Screenshot index (qa/shots/, 49 files)

- `00-scaffold.png` — phase 0
- `02-styleguide-{1440,390}.png` — every component, every accent
- `03-{home,events,apps,cyberhounds,about,resources,news,news-article,join,404}-{1440,1024,768,390}.png`
- `04-cube-hero-1440.png` · `04-mascot-emotes.png` · `04-chat-widget.png`
- `06-os-{login,today,queue}-1440.png`

## Gates (all passing at HEAD)

`check_api_count` OK (2 files) · `validate_data` 7/7 · `pytest` 11/11 ·
`npm run build` clean · route validator 10/10 · contrast all-pass
