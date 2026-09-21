/** OS page furniture: header (kicker · title · actions), the status/source
    readout, filter chips, key/value sheets, the "What is not here, and why"
    block every OS page ends with. Used by every os/Os*.tsx page. */
import type { ReactNode } from "react";
import { MonoLabel } from "@/components/MonoLabel";
import { StatusChip } from "@/components/cards/StatusChip";

export function OsPage({
  kicker,
  title,
  actions,
  source,
  children,
  notHere,
}: {
  kicker: string;
  title: string;
  actions?: ReactNode;
  source?: string;
  children: ReactNode;
  notHere: string[];
}) {
  return (
    <div className="max-w-[1180px]">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-7">
        <div>
          <MonoLabel accent>
            {"//"} {kicker}
          </MonoLabel>
          <h1 className="font-display font-black uppercase text-[26px] md:text-[32px] leading-none mt-1">{title}</h1>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {source && (
            <StatusChip
              state={source === "db" ? "live" : source === "local" ? "idle" : "offline"}
              label={source === "db" ? "SUPABASE" : source === "local" ? "LOCAL_TABLE" : "STATIC"}
            />
          )}
          {actions}
        </div>
      </div>
      {children}
      <NotHere items={notHere} />
    </div>
  );
}

/** RHEC pattern: name the actual boundary and the actual reason, no hedging. */
function NotHere({ items }: { items: string[] }) {
  return (
    <section className="mt-12 border-t border-line pt-5 max-w-[760px]">
      <MonoLabel>What is not here, and why</MonoLabel>
      <ul className="mt-2 space-y-1.5 text-[13px] text-muted leading-relaxed">
        {items.map((t) => (
          <li key={t} className="flex gap-2">
            <span className="text-teal/60 shrink-0">—</span>
            <span>{t}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function Chips<T extends string>({
  options,
  value,
  onChange,
  counts,
}: {
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
  counts?: Partial<Record<T, number>>;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => (
        <button
          key={o}
          onClick={() => onChange(o)}
          className={`t-micro raise px-2.5 py-1.5 border transition-colors cursor-pointer ${value === o ? "border-teal text-teal bg-teal/10" : "border-line text-muted hover:text-ink"}`}
        >
          {o.replace(/_/g, " ")}
          {counts && counts[o] !== undefined && <span className="ml-1.5 opacity-60 tnum">{counts[o]}</span>}
        </button>
      ))}
    </div>
  );
}

export function KeyVal({ rows, className = "" }: { rows: { k: string; v: ReactNode }[]; className?: string }) {
  return (
    <dl className={`divide-y divide-line border border-line ${className}`}>
      {rows.map((r) => (
        <div key={r.k} className="grid grid-cols-[150px_1fr] gap-3 px-3 py-2 text-[13px]">
          <dt className="mono-label text-muted pt-0.5">{r.k}</dt>
          <dd className="text-ink min-w-0 break-words">{r.v ?? <span className="text-muted/50">—</span>}</dd>
        </div>
      ))}
    </dl>
  );
}

export function Panel({ title, onClose, children, wide = false }: { title: string; onClose: () => void; children: ReactNode; wide?: boolean }) {
  return (
    <aside
      className={`fixed inset-y-0 right-0 z-40 ${wide ? "w-[min(100vw,760px)]" : "w-[min(100vw,520px)]"} bg-navy-900 border-l border-line overflow-y-auto p-5 md:p-6 shadow-[-24px_0_48px_-24px_rgba(0,0,0,.6)]`}
    >
      <div className="flex items-center justify-between mb-5">
        <MonoLabel accent>{title}</MonoLabel>
        <button onClick={onClose} className="mono-label text-muted hover:text-ink cursor-pointer">
          close ×
        </button>
      </div>
      {children}
    </aside>
  );
}

export function Notice({ kind = "info", children }: { kind?: "info" | "ok" | "err"; children: ReactNode }) {
  const c = kind === "err" ? "border-red/60 text-(--color-red-hi)" : kind === "ok" ? "border-green/60 text-green" : "border-teal/40 text-teal";
  return <p className={`t-micro border px-3 py-2 mt-3 ${c}`}>{children}</p>;
}

export function Empty({ children }: { children: ReactNode }) {
  return <div className="border border-dashed border-line px-5 py-8 text-[13px] text-muted leading-relaxed">{children}</div>;
}
