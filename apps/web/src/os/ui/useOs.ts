/** OS data hooks (run 10 §6): one list hook (rows + source + reload), one write helper that
    reads the API's error envelope ({error:{code,message,field,current,attempted}}), stamps every
    create with a client-generated `client_id` (a double-click makes exactly one row) and passes the
    row's `updated_at` as `expected_updated_at` so a stale write comes back as a 409 instead of a
    clobber. Every OS page uses these; nothing else fetches. */
import { useCallback, useEffect, useState } from "react";
import { osFetch } from "../session";
import type { Row } from "./OsTable";

export type ApiError = { code: string; message: string; field?: string; current?: Row; attempted?: Row; [k: string]: unknown };

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

const newClientId = () => (typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`);

/** Run a write and get a one-line notice back — plus the parsed envelope on failure. */
export async function act<T = Record<string, unknown>>(
  path: string,
  init?: { method?: string; body?: unknown; form?: FormData; expect?: number | null; undo?: boolean },
): Promise<{ ok: boolean; status: number; msg: string; data: T; err?: ApiError }> {
  let body = init?.body;
  const method = init?.method ?? (body || init?.form ? "POST" : "GET");
  if (body && typeof body === "object" && !Array.isArray(body)) {
    const b = { ...(body as Record<string, unknown>) };
    if (method === "POST" && !("client_id" in b)) b.client_id = newClientId();
    if (method === "PATCH" && init?.expect !== null) {
      const exp = init?.expect ?? (typeof b.updated_at === "number" ? b.updated_at : undefined);
      if (exp !== undefined) b.expected_updated_at = exp;
    }
    for (const k of ["id", "created_at", "updated_at", "created_by", "archived_from", "history"]) delete b[k];
    body = b;
  }
  const r = await osFetch<T & { error?: ApiError }>(path, { method, body, form: init?.form });
  const err = !r.ok ? ((r.data as { error?: ApiError }).error ?? { code: `http_${r.status}`, message: r.error ?? `HTTP ${r.status}` }) : undefined;
  const msg = r.ok
    ? "SAVED ✓"
    : r.status === 0
      ? "SAVED_LOCALLY · WILL_SYNC — the API is unreachable; your change is queued in this browser"
      : `${err?.message ?? "failed"}`;
  return { ok: r.ok, status: r.status, msg, data: r.data, err };
}

export function useNotice() {
  const [notice, setNotice] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const say = (ok: boolean, text: string) => {
    setNotice({ kind: ok ? "ok" : "err", text });
    setTimeout(() => setNotice(null), ok ? 4000 : 9000);
  };
  return { notice, say };
}

/** Client-side CSV of the loaded rows (run 10 §6.12). */
export function downloadCsv(name: string, rows: Row[], cols?: string[]) {
  const keys = cols ?? [...new Set(rows.flatMap((r) => Object.keys(r)))].filter((k) => !["client_id", "archived_from", "history"].includes(k));
  const esc = (v: unknown) => {
    const s = v === null || v === undefined ? "" : typeof v === "object" ? JSON.stringify(v) : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = [keys.join(","), ...rows.map((r) => keys.map((k) => esc(r[k])).join(","))].join("\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  a.download = `${name}.csv`;
  a.click();
}
