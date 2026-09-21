# scripts

| script | does |
|---|---|
| `snapshot.py` | Supabase → data/ + content/ (`--check`, `--restore`) |
| `bootstrap_admin.py` | first active admin on the current term |
| `check_api_count.py` | the one-function guard (CI) |
| `validate_data.py` | data/*.json vs schemas (CI) |
| `gen_types.py` | pydantic models → `apps/web/src/lib/api.types.ts` |
| `newcomer_test.sh` | fresh-clone 10-minute test, README steps only |
| `extract_old_site.py` · `images.py` · `build_kb.py` | one-time migration from the old site + the chatbot KB |
| `hound_alpha.py` | the footer mascot matte (superseded by the Cowork matte; kept for provenance) |

Every script has a docstring and `--help`.
