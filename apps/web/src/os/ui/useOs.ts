/** OS data hooks: one list hook (rows + source + reload) and one action
    helper (call → notice text). Every OS page uses these two; nothing else
    fetches. */
import { useCallback, useEffect, useState } from "react";
import { osFetch } from "../session";
import type { Row } from "./OsTable";

export function useOsList<T extends Row = Row>(path: string) {
  const [rows, setRows] = useState<T[]>([]);
  const [source, setSource] = useState<string>("loading");
  const [error, setError] = useState<string | null>(null);
  const reload = useCallback(async () => {
    const r = await osFetch<{ rows: T[]; source: string }>(path);
    if (r.ok) {
      setRows(r.data.rows ?? []);
      setSource(r.data.source ?? "db");
      setError(null);
    } else setError(r.error ?? "failed");
  }, [path]);
  useEffect(() => {
    void reload();
  }, [reload]);
  return { rows, source, error, reload, setRows };
}

/** Run a write and get a one-line notice back. */
export async function act<T = Record<string, unknown>>(path: string, init?: { method?: string; body?: unknown; form?: FormData }): Promise<{ ok: boolean; msg: string; data: T }> {
  const r = await osFetch<T>(path, init);
  return { ok: r.ok, msg: r.ok ? "Saved." : `Failed: ${r.error}`, data: r.data };
}

export function useNotice() {
  const [notice, setNotice] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const say = (ok: boolean, text: string) => {
    setNotice({ kind: ok ? "ok" : "err", text });
    setTimeout(() => setNotice(null), 4000);
  };
  return { notice, say };
}
