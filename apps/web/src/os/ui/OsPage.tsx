/** OS page furniture: the dashboard face (run 9 §5 — the R9_06 bento is the top of every
    module page; the working surface sits under a hairline), header (kicker · title · actions)
    in the OS face, the status/source readout, filter chips, key/value sheets, the
    "What is not here, and why" block every OS page ends with. Used by every os/Os*.tsx page. */
import { useEffect, useRef, useState, type ReactNode } from "react";
import { MonoLabel } from "@/components/MonoLabel";
import { StatusChip } from "@/components/cards/StatusChip";
import { Dashboard, type Spec } from "./Dashboard";

export function OsPage({
  kicker,
  title,
  actions,
  source,
  children,
  notHere,
  dash,
}: {
  kicker: string;
  title: string;
  actions?: ReactNode;
  source?: string;
  children: ReactNode;
  notHere: string[];
  dash?: Spec;
}) {
  return (
    <div className="max-w-[1320px]">
      {dash && (
        <>
          <Dashboard spec={dash} />
          <hr className="border-0 border-t border-line my-7" />
        </>
      )}
      <div className="flex flex-wrap items-end justify-between gap-4 mb-7">
        <div>
          <MonoLabel accent>
            {"//"} {kicker}
          </MonoLabel>
          <h1 className="t-os-display text-[30px] md:text-[38px] mt-1">{title}</h1>
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

/** Filter tabs as the R9_04 segmented strip (run 9 §6.5): 1 px dividers, the active cell red. */
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
    <div className="os-tabs max-w-full overflow-x-auto" role="group">
      {options.map((o) => (
        <button key={o} onClick={() => onChange(o)} aria-pressed={value === o} className="t-micro raise whitespace-nowrap">
          {o.replace(/_/g, " ")}
          {counts && counts[o] !== undefined && <span className="ml-1.5 opacity-70 tnum">{counts[o]}</span>}
        </button>
      ))}
    </div>
  );
}

/** Key/value sheet; rows with `edit` are click-to-edit (run 10 §6.2): Enter saves, Esc cancels,
    the row shows SAVING… then SAVED ✓ for 1.2 s, then the new value. */
export function KeyVal({
  rows,
  className = "",
  onSave,
}: {
  rows: { k: string; v: ReactNode; edit?: { key: string; value: string } }[];
  className?: string;
  onSave?: (key: string, value: string) => Promise<boolean>;
}) {
  return (
    <dl className={`divide-y divide-line border border-line ${className}`}>
      {rows.map((r) => (
        <div key={r.k} className="grid grid-cols-[150px_1fr] gap-3 px-3 py-2 text-[13px]">
          <dt className="mono-label text-muted pt-0.5">{r.k}</dt>
          <dd className="text-ink min-w-0 break-words">
            {r.edit && onSave ? (
              <InlineEdit value={r.edit.value} display={r.v} onSave={(v) => onSave(r.edit!.key, v)} />
            ) : (
              (r.v ?? <span className="text-muted/50">—</span>)
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function InlineEdit({ value, display, onSave }: { value: string; display: ReactNode; onSave: (v: string) => Promise<boolean> }) {
  const [editing, setEditing] = useState(false);
  const [v, setV] = useState(value);
  const [state, setState] = useState<"idle" | "saving" | "saved" | "failed">("idle");
  const commit = async () => {
    setState("saving");
    const ok = await onSave(v);
    setState(ok ? "saved" : "failed");
    setEditing(false);
    setTimeout(() => setState("idle"), 1200);
  };
  if (editing)
    return (
      <input
        autoFocus
        value={v}
        onChange={(e) => setV(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") void commit();
          if (e.key === "Escape") {
            setV(value);
            setEditing(false);
          }
        }}
        onBlur={() => void commit()}
        className="w-full bg-transparent border-b border-teal px-1 font-mono text-[13px] text-ink outline-none"
        aria-label="Edit value"
        data-testid="inline-input"
      />
    );
  return (
    <button
      type="button"
      onClick={() => {
        setV(value);
        setEditing(true);
      }}
      className="text-left w-full cursor-text hover:bg-navy-800/60 px-1 -mx-1"
      title="Click to edit · Enter saves · Esc cancels"
      data-testid="inline-edit"
    >
      {state === "saving" ? (
        <span className="t-micro text-teal">SAVING…</span>
      ) : state === "saved" ? (
        <span className="t-micro text-green">SAVED ✓</span>
      ) : state === "failed" ? (
        <span className="t-micro text-(--color-red-hi)">NOT SAVED</span>
      ) : (
        (display ?? <span className="text-muted/50">—</span>)
      )}
    </button>
  );
}

/** Side panel (run 10 §6.8): Esc closes, focus is trapped inside and returned to the trigger on close. */
export function Panel({ title, onClose, children, wide = false }: { title: string; onClose: () => void; children: ReactNode; wide?: boolean }) {
  const box = useRef<HTMLElement>(null);
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    // focus the first visible field (not the close button) on the next frame, so the key that opened the panel cannot act on it
    const raf = requestAnimationFrame(() => {
      const els = [...(box.current?.querySelectorAll<HTMLElement>("input,textarea,select,button") ?? [])].filter(
        (el) => el.offsetParent !== null && (el as HTMLInputElement).type !== "file",
      );
      (els.find((el) => el.tagName !== "BUTTON") ?? els[0])?.focus();
    });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab" && box.current) {
        const f = [...box.current.querySelectorAll<HTMLElement>("input,textarea,select,button,a[href]")].filter((el) => !el.hasAttribute("disabled"));
        if (!f.length) return;
        const a = f[0],
          z = f[f.length - 1];
        if (e.shiftKey && document.activeElement === a) {
          e.preventDefault();
          z.focus();
        } else if (!e.shiftKey && document.activeElement === z) {
          e.preventDefault();
          a.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", onKey);
      opener?.focus?.();
    };
  }, [onClose]);
  return (
    <aside
      ref={box}
      role="dialog"
      aria-modal="true"
      aria-label={title}
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

/** Empty state (run 10 §6.5): what this is, why it is empty, the action that fills it — never a bare 0. */
export function Empty({ children, action, n = "01" }: { children: ReactNode; action?: { label: string; onClick: () => void }; n?: string }) {
  return (
    <div className="relative border border-dashed border-line px-5 py-7 text-[13px] text-muted leading-relaxed" data-testid="empty">
      <span className="absolute top-2 left-3 t-micro opacity-50 tnum">SLOT_{n}</span>
      <div className="mt-3">{children}</div>
      {action && (
        <button onClick={action.onClick} className="mt-4 t-micro raise border border-teal text-teal px-3 py-1.5 cursor-pointer hover:bg-teal/10">
          [ {action.label} ]
        </button>
      )}
    </div>
  );
}

/** CHANGED_ELSEWHERE (run 10 §6.10): the server's row vs what you tried, changed keys only. */
export function ConflictBlock({
  err,
  onReload,
  onOverwrite,
}: {
  err: { current?: Record<string, unknown>; attempted?: Record<string, unknown> };
  onReload: () => void;
  onOverwrite: () => void;
}) {
  const keys = [...new Set([...Object.keys(err.current ?? {}), ...Object.keys(err.attempted ?? {})])].filter(
    (k) =>
      !["updated_at", "created_at", "expected_updated_at", "client_id"].includes(k) && JSON.stringify(err.current?.[k]) !== JSON.stringify(err.attempted?.[k]),
  );
  return (
    <div className="border border-(--color-red-hi) p-3 mb-4" data-testid="conflict">
      <p className="t-label raise text-(--color-red-hi)">CHANGED_ELSEWHERE — someone saved this row since you opened it</p>
      <div className="mt-2 border border-line divide-y divide-line text-[12px] font-mono">
        <div className="grid grid-cols-[120px_1fr_1fr] gap-3 px-2 py-1 t-micro opacity-60">
          <span>FIELD</span>
          <span>THEIRS (saved)</span>
          <span>YOURS (not saved)</span>
        </div>
        {keys.map((k) => (
          <div key={k} className="grid grid-cols-[120px_1fr_1fr] gap-3 px-2 py-1">
            <span className="text-muted">{k}</span>
            <span className="text-green break-all">{JSON.stringify(err.current?.[k]) ?? "∅"}</span>
            <span className="text-(--color-red-hi) break-all">{JSON.stringify(err.attempted?.[k]) ?? "∅"}</span>
          </div>
        ))}
      </div>
      <div className="flex gap-2 mt-3">
        <button onClick={onReload} className="t-micro raise border border-teal text-teal px-3 py-1.5 cursor-pointer" data-testid="conflict-reload">
          [ RELOAD THEIRS ]
        </button>
        <button
          onClick={onOverwrite}
          className="t-micro raise border border-(--color-red-hi) text-(--color-red-hi) px-3 py-1.5 cursor-pointer"
          data-testid="conflict-overwrite"
        >
          [ OVERWRITE WITH MINE ]
        </button>
      </div>
    </div>
  );
}
