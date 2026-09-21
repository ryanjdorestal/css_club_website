# Security

## Reporting a problem

Email **computersocjjay@gmail.com** with "SECURITY" in the subject. Do not open a public issue for a
vulnerability. You will get a reply within a week during the semester; the fix ships as a normal pull request
once it is safe to describe.

Things worth reporting: a way to write to the API without being an officer, a way to read a member's email
through the public site, a credential anywhere in the repo or its history, a page that runs untrusted HTML.

## What we promise

- **No credential ever lives in this repo** — not in code, docs, workflows or inheritance records. Only the
  names of environment variables (`docs/ENVIRONMENT.md`). `gitleaks` scans every push and the full history
  weekly; the inheritance validator refuses secret-shaped text.
- The Supabase **service key exists only in Vercel's environment** and is read by one server-side module.
  The browser holds the anon key, which row-level security limits to published rows.
- **Every OS write is authenticated by the roster** (an active officer on the current term), logged with
  before/after in the audit table, rate-limited on the public endpoints, and validated server-side.
- Uploads are sniffed by magic bytes, capped at 2 MB, resized and stripped of EXIF.
- Dependencies are pinned by lockfiles; `depcheck` and the weekly secret scan run in CI.

## Scope

The public site, CSS OS, the API (`api/`), the workflows and the scripts in this repo. Supabase and Vercel
themselves are out of scope — report those to the vendors.
