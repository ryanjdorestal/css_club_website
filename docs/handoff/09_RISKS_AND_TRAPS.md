# 09 — Risks and traps

The things that will bite. Each: what happens, how you notice, what to do.

## Hosting

- **Supabase pauses after 7 idle days (free tier).** The OS says `SUPABASE unreachable`; the public site is
  unaffected (Tier 1). The keepalive writes every 3 days — if the `keepalive` workflow is red in the Actions
  tab, the project is already paused or the key rotated. Restore: supabase.com → project → Restore. Prevent:
  never delete the keepalive workflow or its secrets.
- **Vercel Hobby caps at 100 deployments a day and pauses the feature for the rest of the period past a
  limit.** The Ignored Build Step (`scripts/vercel_should_build.sh`) and workflow concurrency exist for this.
  Do not point a second project at the repo; do not add a workflow that commits to `main` on a schedule.
- **The snapshot-commit loop.** A bot that commits, which triggers a build, which commits… is how free tiers
  die. The snapshot opens a PR instead of pushing, its job refuses to run for `github-actions[bot]`, and the
  keepalive commits nothing. Keep it that way.
- **Hobby is non-commercial.** The moment the site sells anything, move to a paid plan first.

## The one-function rule

`api/` must hold exactly `index.py`, `requirements.txt` and `_core/`. Any other `.py` at that level becomes a
second Vercel function, the routing silently splits, and the deploy looks green while `/api/health` reports an
old SHA. `scripts/check_api_count.py` fails CI; the `post-deploy-smoke` workflow catches the stale SHA.

## Secrets

- **The service key never reaches the browser.** It is read only by `api/_core/config.py`; anything under
  `apps/web/` sees only `VITE_*` variables at build time. Never add `VITE_SUPABASE_SERVICE_KEY`.
- **RLS on every table.** The anon key is public by design because row-level security decides what it can
  reach. A new table without `enable row level security` + policies is readable by anyone with the anon key.
  Copy the pattern from `0001_init.sql`.
- **No credential in a record, a doc, a message.** The inheritance validator refuses secret-shaped text;
  gitleaks runs on every push; the ownership sheet holds emails, never passwords.

## Development

- **Never remove a Tier-1 fallback.** Every read has a JSON fallback and every write has an inbox line — that
  is what makes `make dev` work with no accounts and what keeps the public site up when the database is not.
  "Supabase is configured now" is not a reason to delete one.
- **`make smoke`, `make sim`, `make break` reset the Tier-1 store.** Run them one at a time; two in parallel
  wipe each other's rows and fail with confusing "row vanished" errors (run 10 lost an hour to this).
- **The 409 contract.** A PATCH carries `expected_updated_at`; the server answers `409 CHANGED_ELSEWHERE` with
  both versions when the row changed. Do not "fix" a 409 by dropping the field — that is the clobber it prevents.
- **`client_id` on every create.** Double-clicks and retries make one row because the create is idempotent by
  `client_id`. A new form must send one (`os/ui/OsForm.tsx` does it for you).
- **Case-insensitive filenames on macOS.** `Foo.tsx` and `foo.tsx` are the same file on a Mac and two files
  in CI on Linux (run 6 hit this). Keep imports exactly matching the file's case.
- **Store timestamps are epoch seconds**, not milliseconds and not ISO strings. `updated_at` comparisons and
  the `ago()` helpers assume seconds.
- **`docs/API.md` is generated.** `make check` fails with "docs/API.md changed — commit it" after you add an
  endpoint; run `make api-docs` and commit the file with your change.
- **Playwright role in tests is per tab** (`sessionStorage`). A second tab in a script must set the LOCAL_DEV
  role again.
- **The bento grid is fixed.** Every OS page opens on the same nine-tile layout; the specs in
  `os/ui/specs.ts` fill it. Do not move tiles per page — `qa-scripts/bento_overlay.mjs` measures the drift.

## Process

- **Branch protection is real.** `main` requires a PR and a green `check`; admins can bypass and should not
  except to unblock a broken CI. Force-push and delete are refused.
- **The old repo's content is MIT** and cited in `SOURCES.md` (`jjcss/CSS_Website@a8fca55`). Keep the notice.
- **Do not paste content into components.** Content lives in `data/` and `content/`, extracted by script;
  `qa-scripts/tokens_gate.mjs` fails on literal club names, hex colours and font names in code.
