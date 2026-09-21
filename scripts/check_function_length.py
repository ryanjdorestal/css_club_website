#!/usr/bin/env python3
"""check_function_length.py — no Python function longer than 40 lines (docs/CODE_STANDARDS.md § Functions).
Runs in `make check`. The three one-off extraction scripts are exempt (pyproject.toml says why).

    .venv/bin/python scripts/check_function_length.py
"""

from __future__ import annotations

import ast
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MAX_LINES = 40
EXEMPT = {"scripts/extract_old_site.py", "scripts/build_kb.py", "scripts/images.py"}


def long_functions(path: Path) -> list[str]:
    tree = ast.parse(path.read_text())
    found = []
    for node in ast.walk(tree):
        if isinstance(node, ast.FunctionDef | ast.AsyncFunctionDef):
            length = (node.end_lineno or node.lineno) - node.lineno + 1
            if length > MAX_LINES:
                found.append(f"{path.relative_to(ROOT)}:{node.lineno}: {node.name} is {length} lines (max {MAX_LINES})")
    return found


def main() -> int:
    files = [*ROOT.glob("api/**/*.py"), *ROOT.glob("scripts/*.py"), *ROOT.glob("scripts/tests/*.py")]
    findings = [f for p in files if str(p.relative_to(ROOT)) not in EXEMPT for f in long_functions(p)]
    for f in findings:
        print("FAIL", f)
    print(f"function-length: {len(findings)} function(s) over {MAX_LINES} lines")
    return 1 if findings else 0


if __name__ == "__main__":
    sys.exit(main())
