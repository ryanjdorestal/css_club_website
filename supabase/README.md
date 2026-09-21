# supabase

Migrations in order: `0001_init.sql` (site tables + RLS), `0002_os.sql` (OS tables, projects←apps, RLS, the public-media bucket). Run in the Supabase SQL editor (SETUP.md), then `scripts/snapshot.py --restore` to seed from the committed JSON.
