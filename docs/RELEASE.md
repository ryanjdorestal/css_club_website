# RELEASE.md — the push checklist (adapted from quay/deploy-push-checklist)

Vercel deploys every push to `main`. There is no release branch and no version
number to bump; a release is a push that passed this list.

## Before you push
1. `make check` green (lint · types · tests · guards · validators). CI runs the
   same thing; don't push to find out.
2. `make a11y` unchanged or improved (pa11y + axe). New UI: run the manual
   checklist in `docs/SKILLS_ADOPTED.md` (keyboard-only, screen-reader names).
3. `node scripts/functional_smoke.mjs` if the OS or the public data path
   changed — a board member's day, end to end, must still work.
4. No secrets in the diff (`gitleaks protect --staged`; CI runs it on history).
5. Commit message in conventional form (`feat: …`, `fix: …`, `content: …`,
   `inheritance: …`) — CI lints it.

## After the deploy
1. The `post-deploy-smoke` workflow must be green: the live `/api/health` reports
   the pushed SHA. If it's red, production is stale — see docs/RUNBOOK.md →
   "Deploy stale".
2. Open `/` and `/os/login` on the live URL once. Look, don't assume.
3. If data shapes changed: run `scripts/snapshot.py --check` against production
   env vars to confirm the nightly snapshot will not rewrite `data/` unexpectedly.

## Rollback
Vercel → Deployments → previous → "Promote to Production". Then fix forward on
`main`. The committed `data/` is never rolled back by a deploy — it is the
snapshot's job to keep it current.
