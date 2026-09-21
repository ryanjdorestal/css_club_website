/** OS tables (run 10 §6): rows are keyboard-navigable (↑↓ moves, Enter opens), an optional
    row-action menu (EDIT · DUPLICATE · ARCHIVE · DELETE — the page decides which apply), and
    `ListTools` above every list: text search, sort, a result count and EXPORT CSV (client-side).
    Zero rows renders the page's empty state (`empty`), never a blank panel. */
import { useMemo, useState, type ReactNode } from "react";
import { downloadCsv } from "./useOs";

export type Row = Record<string, unknown>;
type Col<T extends Row = Row> = { key: string; label: string; render?: (r: T) => ReactNode; mono?: boolean; width?: string };
export type RowAction<T extends Row = Row> = { label: string; onClick: (r: T) => void; danger?: boolean; hidden?: (r: T) => boolean };

export function OsTable<T extends Row>({
  cols,
  rows,
  onRow,
  rowKey = "id",
  empty = "Nothing here yet.",
  selected,
  actions,
}: {
  cols: Col<T>[];
  rows: T[];
  onRow?: (row: T) => void;
  rowKey?: string;
  empty?: ReactNode;
  selected?: string | null;
  actions?: RowAction<T>[];
}) {
  const [menu, setMenu] = useState<string | null>(null);
  if (!rows.length)
    return (
      <div className="border border-dashed border-line px-5 py-8 text-[13px] text-muted" data-testid="empty">
        {empty}
      </div>
    );
  const move = (e: React.KeyboardEvent<HTMLTableRowElement>, row: T) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const tr = e.currentTarget;
      const next = (e.key === "ArrowDown" ? tr.nextElementSibling : tr.previousElementSibling) as HTMLElement | null;
      next?.focus();
    } else if (e.key === "Enter" && onRow) onRow(row);
  };
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
            {actions && <th className="w-10" aria-label="actions" />}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const id = String(row[rowKey] ?? "");
            const acts = (actions ?? []).filter((a) => !a.hidden?.(row));
            return (
              <tr
                key={id}
                tabIndex={onRow ? 0 : undefined}
                onKeyDown={(e) => move(e, row)}
                onClick={onRow ? () => onRow(row) : undefined}
                className={`border-b border-line/60 last:border-0 outline-none focus-visible:bg-navy-800 focus-visible:ring-1 focus-visible:ring-teal ${onRow ? "cursor-pointer hover:bg-navy-800" : ""} ${selected === id ? "bg-navy-800" : ""}`}
                data-row={id}
              >
                {cols.map((c) => (
                  <td key={c.key} className={`px-3 py-2 align-top ${c.mono ? "font-mono text-[12px] text-muted" : ""}`}>
                    {c.render ? c.render(row) : fmt(row[c.key])}
                  </td>
                ))}
                {actions && (
                  <td className="px-1 py-1 align-top relative" onClick={(e) => e.stopPropagation()}>
                    {acts.length > 0 && (
                      <button
                        aria-label={`Actions for ${id}`}
                        aria-expanded={menu === id}
                        onClick={() => setMenu(menu === id ? null : id)}
                        onKeyDown={(e) => e.key === "Escape" && setMenu(null)}
                        className="w-7 h-7 t-label opacity-60 hover:opacity-100 cursor-pointer"
                        data-testid="row-menu"
                      >
                        ⋮
                      </button>
                    )}
                    {menu === id && (
                      <div
                        role="menu"
                        className="absolute right-1 top-8 z-20 min-w-[150px] bg-navy-900 border border-line shadow-[0_16px_32px_-16px_rgba(0,0,0,.8)]"
                      >
                        {acts.map((a) => (
                          <button
                            key={a.label}
                            role="menuitem"
                            onClick={() => {
                              setMenu(null);
                              a.onClick(row);
                            }}
                            className={`block w-full text-left t-micro raise px-3 py-2 hover:bg-navy-800 cursor-pointer ${a.danger ? "text-(--color-red-hi)" : "text-ink"}`}
                          >
                            {a.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/** Search · status filter (rendered by the page as Chips) · sort · count · EXPORT CSV. */
export function useListTools<T extends Row>(rows: T[], searchKeys: string[], defaultSort = "updated_at") {
  const [q, setQ] = useState("");
  const [sort, setSort] = useState(defaultSort);
  const [dir, setDir] = useState<"asc" | "desc">("desc");
  const shown = useMemo(() => {
    const ql = q.trim().toLowerCase();
    const filtered = ql
      ? rows.filter((r) =>
          searchKeys.some((k) =>
            String(r[k] ?? "")
              .toLowerCase()
              .includes(ql),
          ),
        )
      : rows;
    return [...filtered].sort((a, b) => {
      const x = a[sort],
        y = b[sort];
      const c = typeof x === "number" && typeof y === "number" ? x - y : String(x ?? "").localeCompare(String(y ?? ""));
      return dir === "asc" ? c : -c;
    });
  }, [rows, q, sort, dir, searchKeys]);
  return { q, setQ, sort, setSort, dir, setDir, shown };
}

export function ListTools({
  tools,
  name,
  sortKeys,
  total,
  children,
}: {
  tools: ReturnType<typeof useListTools>;
  name: string;
  sortKeys: string[];
  total: number;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3 mt-5" data-testid="list-tools">
      {children}
      <input
        value={tools.q}
        onChange={(e) => tools.setQ(e.target.value)}
        placeholder="search"
        aria-label="Search"
        className="bg-transparent border-b border-line px-1 py-1 font-mono text-[12px] text-ink focus:border-teal outline-none w-36"
      />
      <label className="t-micro opacity-60 flex items-center gap-1">
        SORT
        <select
          value={tools.sort}
          onChange={(e) => tools.setSort(e.target.value)}
          className="bg-navy-900 border-b border-line font-mono text-[11px] text-ink outline-none"
          aria-label="Sort by"
        >
          {sortKeys.map((k) => (
            <option key={k} value={k}>
              {k}
            </option>
          ))}
        </select>
        <button onClick={() => tools.setDir(tools.dir === "asc" ? "desc" : "asc")} className="cursor-pointer" aria-label="Toggle sort direction">
          {tools.dir === "asc" ? "↑" : "↓"}
        </button>
      </label>
      <span className="t-micro opacity-60 tnum" data-testid="count">
        {tools.shown.length} / {total}
      </span>
      <button
        onClick={() => downloadCsv(name, tools.shown)}
        className="t-micro raise border border-line px-2 py-1 text-muted hover:text-ink cursor-pointer"
        data-testid="export-csv"
      >
        EXPORT CSV
      </button>
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
