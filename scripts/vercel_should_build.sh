#!/usr/bin/env bash
# Vercel "Ignored Build Step" (Settings → Git → Ignored Build Step → `bash scripts/vercel_should_build.sh`).
# Exit 0 = build, exit 1 = skip. Only a diff that can change the deployed site earns a build; docs-only,
# qa-only and workflow-only commits are skipped so the 100-deploys/day Hobby cap is never in play
# (docs/HOSTING_LIMITS.md). Tested by scripts/tests/test_vercel_should_build.py.
set -u

BUILD_PATHS='^(apps/web/|api/|brand/|data/|content/|public/|supabase/|package\.json|package-lock\.json|vercel\.json)'

previous="${VERCEL_GIT_PREVIOUS_SHA:-}"
if [ -z "$previous" ] || ! git cat-file -e "$previous^{commit}" 2>/dev/null; then
  previous="HEAD^"
fi
if ! git rev-parse -q --verify "$previous" >/dev/null 2>&1; then
  echo "build: no previous commit to compare against (first deploy or shallow clone)"
  exit 0
fi

changed=$(git diff --name-only "$previous" HEAD)
if [ -z "$changed" ]; then
  echo "skip: no files changed between $previous and HEAD"
  exit 1
fi

hits=$(printf '%s\n' "$changed" | grep -E "$BUILD_PATHS" || true)
if [ -n "$hits" ]; then
  echo "build: site-affecting paths changed:"
  printf '%s\n' "$hits" | head -20 | sed 's/^/  /'
  exit 0
fi

echo "skip: only non-site paths changed (docs, qa, workflows, scripts):"
printf '%s\n' "$changed" | head -20 | sed 's/^/  /'
exit 1
