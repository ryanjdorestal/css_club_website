# LATER.md — deferred on purpose (needs an account, a key, or a decision)

Each line: what · why not now · what it would take.

- **Discord sync** (member list, announcement feed) · needs a bot token = a key
  the club must own and rotate · a Discord app under the club account, a
  `DISCORD_BOT_TOKEN` env in Vercel, a `/api/os/members/sync` endpoint. The
  skipped skills (`discord/interaction-handler`, `slash-commands`, `webhook-relay`)
  would also need `DISCORD_PUBLIC_KEY` and `DISCORD_WEBHOOK_URL` — see
  `docs/SKILLS_ADOPTED.md`.
- **Analytics on Today** (page views) · every provider needs an account; the
  numbers here are the club's own data · Vercel Analytics toggle (no code) or a
  self-hosted counter.
- **Email from the OS** (to members, to submitters) · needs a mail provider key
  · Resend/Postmark under the club Gmail, one `send()` in `_core`.
- **Rich screenshots / gallery on Projects** · uploads exist (≤ 2 MB, resized);
  a gallery needs a cropper and an ordering UI · extend `Upload` + `screenshots[]`.
- **Prerender for mobile Lighthouse** · measured 2026-09-21: desktop 97, mobile 60
  (LCP 5.5 s, TBT 480 ms, 450 KB JS on slow 4G) — a CSR SPA pays its JS up front ·
  a `vite-plugin-prerender` pass for the 8 public routes, or split R3F (cube, bust)
  behind `IntersectionObserver` so the hero paints before three.js loads.
- **Vercel build dry-run in CI** · needs `VERCEL_TOKEN` · set the secret +
  `VERCEL_DRY_RUN=true` (already wired in `ci.yml`).
- **Cube head-turn on scroll for the Cyberhound** · nice-to-have · share the
  rail's scroll progress with `CyberhoundSpot`.
- **Link-rot service** · "Check all links" is a manual HEAD/GET · a scheduled
  workflow that calls it with a service token.
- **Clickable fin lines** · the `> next:` line is decorative · make the fin a
  `Link` with the same typing on hover.
- **Bust v7** · the pitbull reads a touch bear-cub from the front · split skull
  and cheek masses; see `assets/hound3d/README.md`.
- **TODO markers in code** · none allowed; anything deferred goes on this list.
- **History rewrite before the transfer** · the working tree is 13.6 MB tracked but
  `.git` is ~330 MB from the reference screenshots that lived in `assets/refs/` and
  `qa/loops/` until run 8 · `git filter-repo --path assets/refs --path qa/loops --invert-paths`
  on a fresh clone, then push to the new `jjcss` repo — a one-way step, Ryan's call.
