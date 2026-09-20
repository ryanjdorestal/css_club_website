# Supabase — the NEW John Jay project

This is a fresh Supabase project for John Jay CSS. It is **not** connected to
rhecwb's LaGuardia project in any way; only the table shapes are adapted.

## Apply the migration

1. Create a project at supabase.com on the **club account** (computersocjjay@gmail.com).
2. SQL Editor → paste `migrations/0001_init.sql` → Run.
   (Or `supabase db push` with the CLI if you link the project.)
3. Copy Project URL + service_role key into Vercel env vars:
   `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`.

## Rules

- The **service key lives only in Vercel env vars** — never in the repo, never
  in the browser. The Python API is the only writer.
- Anon/public may only read public rows (RLS above).
- The site works fully without any of this (Tier 1: committed JSON + local inbox).
- Keepalive: `.github/workflows/keepalive.yml` pings `/api/health` (which
  touches `site_settings`) every 3 days so the free project never pauses.
