---
title: Runbook — what to do when a chip is red
---

## Supabase paused

The free tier pauses a project after 7 idle days; DNS then stops resolving and the OS says OFFLINE / DB ERROR. Open supabase.com → the club project → Restore. The keepalive workflow (GitHub Actions, every 3 days) exists to prevent this — check that the repo variable SITE_URL is set. Nothing is lost: the public site kept serving the committed JSON, and any OS writes made meanwhile sit in the inbox (/os/audit → Replay to DB).

## Deploy stale

/os/inheritance shows DEPLOY with a repo SHA that is not the deployed SHA. Vercel → Deployments → check the last build log; the usual cause is a failed build (a type error) or the function limit (api/ must hold exactly index.py — scripts/check_api_count.py). Fix, push, and the post-deploy-smoke workflow confirms /api/health reports the new SHA.

## Someone graduated with a login

/os/board → open the officer → ACTIVE off (or delete the row). Login is roster-gated: with no active row on the current term the email becomes a guest immediately, even with a valid session. Then update the ownership sheet on /os/inheritance if they held an account.

## Rotate the Vercel or Supabase keys

Supabase → Settings → API → rotate service_role; paste the new value into Vercel → Settings → Environment Variables → SUPABASE_SERVICE_KEY, and SUPABASE_JWT_SECRET if it changed; redeploy. The browser never holds these keys, so nothing in the repo changes.

## Restore from snapshot

The committed data/*.json and content/news/*.md ARE the backup (scripts/snapshot.py writes them nightly from Supabase). To rebuild a lost database: create a new project, run supabase/migrations/0001 and 0002, then python scripts/snapshot.py --restore to push the committed JSON back. Set the env vars, redeploy, verify /api/health says db ok.

## The inbox has unsynced writes

Writes made while Supabase was unreachable are queued in .cache/inbox on the server (Tier 1). Once DB is green, an admin clicks Replay to DB on /os/audit. Replay upserts by row id, so running it twice is safe.

## Link check shows dead links

/os/resources → the dead list. Fix the URL inline or delete the row. A 403/429 from a site that blocks bots is not dead — click it yourself before deleting.
