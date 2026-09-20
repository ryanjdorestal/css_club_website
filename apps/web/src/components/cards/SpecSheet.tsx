import type { ReactNode } from "react";
import { Counter } from "@/motion/Counter";

/** jj_11 spec sheet: mono label column / bold value column, hairlines,
    optional BigStat + sparkline. For spotlights, resources, OS tiles. */
export function SpecSheet({
  tag,
  title,
  children,
  rows = [],
  className = "",
}: {
  tag?: string;
  title?: string;
  rows?: { k: string; v: ReactNode }[];
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`border border-(--tone-line) ${className}`}>
      {(tag || title) && (
        <div className="flex items-center justify-between border-b border-(--tone-line) px-5 py-3">
          {title && (
            <h3 className="font-display font-bold uppercase text-base" style={{ fontStretch: "110%" }}>
              {title}
            </h3>
          )}
          {tag && (
            <span className="mono-label bg-(--accent) text-(--accent-contrast) px-2 py-1">{tag}</span>
          )}
        </div>
      )}
      {rows.length > 0 && (
        <dl>
          {rows.map((r, i) => (
            <div
              key={i}
              className="grid grid-cols-[minmax(90px,30%)_1fr] gap-4 px-5 py-3 border-b border-(--tone-line) last:border-0"
            >
              <dt className="mono-label opacity-60 self-center">{r.k}</dt>
              <dd className="text-sm font-semibold">{r.v}</dd>
            </div>
          ))}
        </dl>
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
      <span className="font-display font-black text-[clamp(48px,6vw,96px)] leading-none text-(--accent-ink)" style={{ fontStretch: "115%" }}>
        <Counter value={value} suffix={suffix} />
      </span>
      <p className="mono-label opacity-60 mt-1.5">{label}</p>
    </div>
  );
}

export function MiniChart({ points, className = "" }: { points: number[]; className?: string }) {
  const max = Math.max(...points, 1);
  const step = 100 / (points.length - 1 || 1);
  const d = points.map((p, i) => `${i === 0 ? "M" : "L"}${i * step},${30 - (p / max) * 28}`).join(" ");
  return (
    <svg viewBox="0 0 100 32" className={className} aria-hidden preserveAspectRatio="none" style={{ width: "100%", height: 40 }}>
      <path d={d} fill="none" stroke="var(--accent)" strokeWidth="1.5" />
      {points.map((p, i) => (
        <circle key={i} cx={i * step} cy={30 - (p / max) * 28} r="1.6" fill="var(--accent)" />
      ))}
    </svg>
  );
}
