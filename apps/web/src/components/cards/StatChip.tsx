import { Counter } from "@/motion/Counter";

/** jj_03 floating stat chip — absolutely positioned over art by the caller. */
export function StatChip({
  value,
  suffix = "",
  label,
  className = "",
  style,
}: {
  value: number;
  suffix?: string;
  label: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`rounded-(--radius-md) border border-ink/15 bg-navy-900/55 px-4 py-2.5 shadow-xl ${className}`}
      style={{ backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", ...style }}
    >
      <span className="font-display font-black text-2xl text-ink leading-none" style={{ fontStretch: "115%" }}>
        <Counter value={value} suffix={suffix} />
      </span>
      <p className="mono-label text-muted mt-0.5">{label}</p>
    </div>
  );
}
