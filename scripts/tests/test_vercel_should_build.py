"""scripts/vercel_should_build.sh — table test: which diffs earn a Vercel build (docs/HOSTING_LIMITS.md §3.1)."""

from __future__ import annotations

import subprocess
from pathlib import Path

import pytest

SCRIPT = Path(__file__).resolve().parents[1] / "vercel_should_build.sh"

CASES: list[tuple[list[str], bool]] = [
    (["apps/web/src/pages/Home.tsx"], True),
    (["api/_core/routers/posts.py"], True),
    (["data/posts.json"], True),
    (["content/news/2026-09-21-welcome.md"], True),
    (["brand/brand.config.ts"], True),
    (["supabase/migrations/0005_hosting.sql"], True),
    (["vercel.json"], True),
    (["apps/web/package-lock.json"], True),
    (["docs/handoff/00_START_HERE.md"], False),
    (["qa/REPORT_RUN11.md", "qa/keepalive.json"], False),
    (["docs/archive/context/44_RUN11_LOG.md", "README.md"], False),
    ([".github/workflows/ci.yml", "scripts/db_budget.py", "Makefile"], False),
    (["docs/RUNBOOK.md", "api/_core/store.py"], True),
]


def git(repo: Path, *args: str) -> str:
    return subprocess.run(["git", *args], cwd=repo, check=True, capture_output=True, text=True).stdout.strip()


def commit_files(repo: Path, files: list[str], message: str) -> str:
    for f in files:
        p = repo / f
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_text(f"{message}\n")
        git(repo, "add", f)
    git(repo, "-c", "user.name=t", "-c", "user.email=t@t", "commit", "-q", "-m", message)
    return git(repo, "rev-parse", "HEAD")


@pytest.fixture
def repo(tmp_path: Path) -> Path:
    git(tmp_path, "init", "-q")
    commit_files(tmp_path, ["README.md"], "base")
    return tmp_path


def run(repo: Path, previous: str) -> subprocess.CompletedProcess[str]:
    return subprocess.run(["bash", str(SCRIPT)], cwd=repo, env={"PATH": "/usr/bin:/bin:/usr/local/bin:/opt/homebrew/bin", "VERCEL_GIT_PREVIOUS_SHA": previous}, capture_output=True, text=True)


@pytest.mark.parametrize(("files", "builds"), CASES, ids=[" + ".join(c[0]) for c in CASES])
def test_diff_decides_the_build(repo: Path, files: list[str], builds: bool) -> None:
    base = git(repo, "rev-parse", "HEAD")
    commit_files(repo, files, "change")
    result = run(repo, base)
    assert (result.returncode == 0) is builds, result.stdout
    assert result.stdout.startswith("build:" if builds else "skip:")


def test_first_deploy_without_a_previous_sha_builds(repo: Path) -> None:
    result = run(repo, "")
    assert result.returncode == 0
    assert "no previous commit" in result.stdout


def test_unknown_previous_sha_falls_back_to_the_parent_commit(repo: Path) -> None:
    commit_files(repo, ["docs/x.md"], "docs only")
    result = run(repo, "0000000000000000000000000000000000000000")
    assert result.returncode == 1
    assert result.stdout.startswith("skip:")
