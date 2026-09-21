# supabase

Migrations in order: `0001_init.sql` (site tables + RLS), `0002_os.sql` (OS tables, projects←apps, RLS, the public-media bucket). Run in the Supabase SQL editor (SETUP.md), then `scripts/snapshot.py --restore` to seed from the committed JSON.

## Adding or changing a table (checklist — adapted from quay/supabase-schema)
1. Write the next `000N_<name>.sql`: table, `updated_at` trigger, RLS **enabled**,
   `anon` policy only for what the public site reads, writes only through the API
   (service role from Vercel env). Never edit an applied migration.
2. Register the collection in `api/_core/collections.py` (name = table name) and the
   Pydantic model in `models.py`; the router comes from `crud.make_router`.
3. Commit the Tier-1 fallback: `data/<table>.json` (+ `data/schemas/<table>.schema.json`)
   and the seed in `scripts/snapshot.py`. `scripts/validate_data.py` must pass.
4. `scripts/gen_types.py` → `apps/web/src/lib/api.types.ts` (CI diffs it).
5. Run the migration in the SQL editor, then `scripts/snapshot.py --check` against
   production env to confirm the nightly snapshot round-trips.
6. A row in `docs/DECISIONS.md` if the shape is a product decision, not a column.
