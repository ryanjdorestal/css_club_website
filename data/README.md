# data

The Tier-1 fallback contract: every `*.json` has a `*.schema.json` (`scripts/validate_data.py`). The API serves these when Supabase is absent; `scripts/snapshot.py` rewrites them from Supabase nightly. `*.local.json` are the OS's offline tables (gitignored).
