/** SubjectSheet (run 9 §6.6, R9_04's right column): a stacked panel — header row (title +
    [ REFRESH ] [ CHANGE_STATUS ] bracket buttons), a key/value sheet, a radial dial (Ring) for
    one metric, a small waveform (TraceStrip). Used on /os/system and /os/audit. */
import type { ReactNode } from "react";
import { Ring } from "./Bento";
import { TraceStrip } from "./TraceStrip";
import type { Row } from "./OsTable";

export function SubjectSheet({
  title,
  rows,
  ring,
  wave,
  onRefresh,
  onStatus,
  children,
}: {
  title: string;
  rows: { k: string; v: ReactNode }[];
  ring?: { value: number | null; label: string };
  wave?: { rows: Row[]; field: string };
  onRefresh?: () => void;
  onStatus?: () => void;
  children?: ReactNode;
}) {
  return (
    <aside className="border border-line bg-navy-900/60 divide-y divide-line" data-testid="subject-sheet">
      <div className="flex items-center justify-between gap-3 px-3 py-2">
        <span className="t-label raise text-teal">{title}</span>
        <span className="flex gap-2">
          {onRefresh && (
            <button onClick={onRefresh} className="t-micro raise border border-line px-2 py-1 hover:border-teal cursor-pointer">
              [ REFRESH ]
            </button>
          )}
          {onStatus && (
            <button onClick={onStatus} className="t-micro raise border border-line px-2 py-1 hover:border-teal cursor-pointer">
              [ CHANGE_STATUS ]
            </button>
          )}
        </span>
      </div>
      <dl className="px-3 py-2 grid grid-cols-[90px_1fr] gap-x-3 gap-y-1.5">
        {rows.map((r) => (
          <div key={r.k} className="contents">
            <dt className="t-micro opacity-50 pt-0.5">{r.k}</dt>
            <dd className="t-micro raise text-ink tnum truncate">{r.v ?? "—"}</dd>
          </div>
        ))}
      </dl>
      {ring && (
        <div className="px-3 py-3 h-[150px]">
          <Ring value={ring.value} label={ring.label} />
        </div>
      )}
      {wave && (
        <div className="px-3 py-2">
          <TraceStrip rows={wave.rows} field={wave.field} channels={1} labels={["WAVE"]} height={44} className="!pointer-events-none" />
        </div>
      )}
      {children}
    </aside>
  );
}
