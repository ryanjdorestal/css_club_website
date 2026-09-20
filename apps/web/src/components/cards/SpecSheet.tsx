import type { ReactNode } from "react";
import { Counter } from "@/motion/Counter";
import { Registration } from "../frame";
import { CubeWireSvg } from "../type/Wireframe";
import { Meter } from "./Meter";

/** T12 + energrid: _key column (micro 55%) / value column; shared 1px rows;
    optional Meter row; wireframe sigil top-right at 8%. */
export function SpecSheet({
  tag,
  title,
  children,
  rows = [],
  meter,
  registration = false,
  className = "",
}: {
  tag?: string;
  title?: string;
  rows?: { k: string; v: ReactNode }[];
  meter?: { label: string; value: number; max?: number };
  children?: ReactNode;
  registration?: boolean;
  className?: string;
}) {
  return (
    <div className={`relative border border-(--tone-line) ${className}`}>
      {registration && <Registration inset={6} />}
      <CubeWireSvg className="absolute top-3 right-3 w-9 opacity-[0.08] pointer-events-none" stroke="currentColor" />
      {(tag || title) && (
        <div className="flex items-center justify-between gap-3 border-b border-(--tone-line) px-5 py-3">
          {title && <h3 className="t-h2 !text-[17px] uppercase">{title}</h3>}
          {tag && <span className="t-micro raise bg-(--accent) text-(--accent-contrast) px-2 py-1">{tag}</span>}
        </div>
      )}
      {rows.length > 0 && (
        <dl>
          {rows.map((r, i) => (
            <div key={i} className="grid grid-cols-[minmax(92px,30%)_1fr] gap-4 px-5 py-2.5 border-b border-(--tone-line) last:border-0">
              <dt className="t-micro self-center opacity-55">_{r.k.toLowerCase().replace(/\s+/g, "_")}</dt>
              <dd className="text-sm font-medium">{r.v}</dd>
            </div>
          ))}
        </dl>
      )}
      {meter && (
        <div className="px-5 py-3 border-t border-(--tone-line)">
          <Meter label={meter.label} value={meter.value} max={meter.max} />
        </div>
      )}
      {children}
    </div>
  );
}

export function BigStat({
  value,
  suffix = "",
  label,
  className = "",
}: {
  value: number;
  suffix?: string;
  label: string;
  className?: string;
}) {
  return (
    <div className={`px-5 py-4 ${className}`}>
      <span className="t-stat text-(--accent-ink)">
        <Counter value={value} />
        {suffix && <span className="unit">{suffix}</span>}
      </span>
      <p className="t-micro opacity-55 mt-1.5">_{label.toLowerCase().replace(/\s+/g, "_")}</p>
    </div>
  );
}

export function MiniChart({ points, className = "" }: { points: number[]; className?: string }) {
  const max = Math.max(...points, 1);
  const step = 100 / (points.length - 1 || 1);
  const d = points.map((p, i) => `${i === 0 ? "M" : "L"}${i * step},${30 - (p / max) * 28}`).join(" ");
  return (
    <svg viewBox="0 0 100 32" className={className} aria-hidden preserveAspectRatio="none" style={{ width: "100%", height: 40 }}>
      <path d={d} fill="none" stroke="var(--accent)" strokeWidth="1.25" />
      {points.map((p, i) => (
        <rect key={i} x={i * step - 1.2} y={30 - (p / max) * 28 - 1.2} width="2.4" height="2.4" fill="var(--accent)" />
      ))}
    </svg>
  );
}
