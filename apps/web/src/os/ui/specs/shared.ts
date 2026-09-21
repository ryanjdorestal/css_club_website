/** Helpers every dashboard spec builder shares (run 9 §5.2): status, "ready or null", the last date,
    the thumbnail strip (id codes, never titles), a percentage. Used by the files next to this one. */
import type { Row } from "../OsTable";

export const st = (r: Row) => String(r.status ?? "");
export const n = (v: number, ready: boolean) => (ready ? v : null);
export const last = (rows: Row[], f: string) =>
  rows
    .map((r) => String(r[f] ?? ""))
    .filter(Boolean)
    .sort()
    .at(-1)
    ?.slice(0, 10) ?? "—";
// thumbnails are images; the text fallback is the row's id code (readout grammar), never its title
export const thumbs = (rows: Row[], text: string, href: string, src?: string) =>
  rows
    .slice(-6)
    .reverse()
    .map((r) => ({
      key: String(r.id ?? r.slug ?? Math.random()),
      text: `${text.slice(0, 3).toUpperCase()}-${String(r.id ?? r.slug ?? "")
        .slice(-6)
        .toUpperCase()}`,
      href,
      src: src && r[src] ? String(r[src]) : undefined,
    }));
export const pct = (a: number, b: number) => (b ? Math.round((a / b) * 100) : null);
