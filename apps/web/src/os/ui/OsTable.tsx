/** Dense table for OS lists: mono headers, hairlines, row click → panel.
    Columns declare a key or a render; nothing else. Used by every list page. */
import type { ReactNode } from "react";

type Col<T> = { key: string; label: string; render?: (row: T) => ReactNode; width?: string; mono?: boolean };
export type Row = Record<string, unknown>;

export function OsTable<T extends Row>({
  cols,
  rows,
  onRow,
  rowKey = "id",
  empty = "Nothing here yet.",
  selected,
}: {
  cols: Col<T>[];
  rows: T[];
  onRow?: (row: T) => void;
  rowKey?: string;
  empty?: ReactNode;
  selected?: string | null;
}) {
  if (!rows.length) return <div className="border border-dashed border-line px-5 py-8 text-[13px] text-muted">{empty}</div>;
  return (
    <div className="border border-line overflow-x-auto">
      <table className="w-full text-[13px] border-collapse">
        <thead>
          <tr className="border-b border-line">
            {cols.map((c) => (
              <th key={c.key} className="text-left mono-label text-muted font-normal px-3 py-2 whitespace-nowrap" style={{ width: c.width }}>
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const id = String(row[rowKey] ?? "");
            return (
              <tr
                key={id}
                onClick={onRow ? () => onRow(row) : undefined}
                className={`border-b border-line/60 last:border-0 ${onRow ? "cursor-pointer hover:bg-navy-800" : ""} ${selected === id ? "bg-navy-800" : ""}`}
              >
                {cols.map((c) => (
                  <td key={c.key} className={`px-3 py-2 align-top ${c.mono ? "font-mono text-[12px] text-muted" : ""}`}>
                    {c.render ? c.render(row) : fmt(row[c.key])}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function fmt(v: unknown): ReactNode {
  if (v === null || v === undefined || v === "") return <span className="text-muted/40">—</span>;
  if (Array.isArray(v)) return v.join(" · ");
  if (typeof v === "boolean") return v ? "yes" : "no";
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}

/** Status word as a chip with the section's palette. */
export function StatusWord({ s }: { s: unknown }) {
  const v = String(s ?? "");
  const tone =
    v === "published" || v === "active" || v === "approved" || v === "acknowledged" || v === "filed"
      ? "border-green/60 text-green"
      : v === "archived" || v === "left" || v === "alumni"
        ? "border-line text-muted"
        : v === "changes_requested" || v === "dead"
          ? "border-red/60 text-(--color-red-hi)"
          : "border-teal/50 text-teal";
  return <span className={`t-micro raise border px-1.5 py-0.5 whitespace-nowrap ${tone}`}>{v.replace(/_/g, " ") || "—"}</span>;
}

export function ago(ts: unknown): string {
  const n = typeof ts === "number" ? ts : typeof ts === "string" && /^\d{4}-/.test(ts) ? Date.parse(ts) / 1000 : Number(ts);
  if (!n || Number.isNaN(n)) return "—";
  const d = Math.round((Date.now() / 1000 - n) / 86400);
  return d <= 0 ? "today" : d === 1 ? "1 d ago" : `${d} d ago`;
}
