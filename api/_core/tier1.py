"""Tier 1 — the no-accounts mode. Committed JSON reads, a gitignored local table
per collection (data/<table>.local.json) for OS writes, and the append-only
inbox (.cache/inbox/<table>.jsonl) that can be replayed into Supabase later.
Used by store.py, audit.py and the public read endpoints."""
from __future__ import annotations

import json
import time
import uuid
from pathlib import Path
from typing import Any

from . import config


def read_json(name: str, fallback: Any) -> Any:
    """A committed data/*.json file, or `fallback` when it is missing/invalid."""
    try:
        return json.loads((config.DATA / name).read_text())
    except Exception:
        return fallback


def _local_path(table: str) -> Path:
    return config.DATA / f"{table}.local.json"


def local_exists(table: str) -> bool:
    return _local_path(table).exists()


def local_read(table: str) -> list[dict[str, Any]] | None:
    try:
        rows = json.loads(_local_path(table).read_text())
        return rows if isinstance(rows, list) else None
    except Exception:
        return None


def local_write(table: str, rows: list[dict[str, Any]]) -> None:
    """Atomic: write a temp file, keep the previous version as one .bak, then os.replace."""
    import os

    config.DATA.mkdir(parents=True, exist_ok=True)
    p = _local_path(table)
    tmp = p.with_suffix(".json.tmp")
    tmp.write_text(json.dumps(rows, indent=2, ensure_ascii=False) + "\n")
    if p.exists():
        os.replace(p, p.with_suffix(".json.bak"))
    os.replace(tmp, p)


def local_restore(table: str) -> bool:
    """Roll back the last write of one table (from its .bak). `make restore`."""
    import os

    bak = _local_path(table).with_suffix(".json.bak")
    if not bak.exists():
        return False
    os.replace(bak, _local_path(table))
    return True


def local_reset(table: str) -> None:
    p = _local_path(table)
    if p.exists():
        p.unlink()


# ------------------------------------------------------------------- inbox
def inbox_append(table: str, action: str, payload: dict[str, Any], client_id: str | None = None) -> str:
    """Append one replayable line. Returns the client_id (idempotency key)."""
    cid = client_id or str(uuid.uuid4())
    config.INBOX.mkdir(parents=True, exist_ok=True)
    line = {"client_id": cid, "ts": int(time.time()), "table": table, "action": action, "payload": payload}
    with (config.INBOX / f"{table}.jsonl").open("a") as f:
        f.write(json.dumps(line, ensure_ascii=False) + "\n")
    return cid


def inbox_items() -> list[dict[str, Any]]:
    items: list[dict[str, Any]] = []
    if not config.INBOX.exists():
        return items
    for p in sorted(config.INBOX.glob("*.jsonl")):
        for raw in p.read_text().splitlines():
            try:
                items.append(json.loads(raw))
            except Exception:
                continue
    return items


def inbox_remove(client_id: str) -> bool:
    """Drop one line by client_id (after a successful replay)."""
    removed = False
    if not config.INBOX.exists():
        return False
    for p in config.INBOX.glob("*.jsonl"):
        lines = p.read_text().splitlines()
        keep = [ln for ln in lines if f'"client_id": "{client_id}"' not in ln]
        if len(keep) != len(lines):
            p.write_text("\n".join(keep) + ("\n" if keep else ""))
            removed = True
    return removed


def inbox_count() -> int:
    return len(inbox_items())
