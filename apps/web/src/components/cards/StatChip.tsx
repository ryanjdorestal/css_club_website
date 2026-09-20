import type { CSSProperties } from "react";
import { Counter } from "@/motion/Counter";
import { Brackets } from "../frame";
import { Meter } from "./Meter";

/** Readout — HUD box (T06): 1px border, brackets, micro label, display value. */
export function Readout({
  value,
  suffix = "",
  label,
  meter,
  className = "",
  style,
}: {
  value: number;
  suffix?: string;
  label: string;
  meter?: number;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      className={`group relative border border-ink/20 bg-navy-900/55 px-4 py-2.5 ${className}`}
      style={{ backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", ...style }}
    >
      <Brackets size={8} inset={-1} />
      <span className="t-stat !text-[26px] text-ink block">
        <Counter value={value} />
        {suffix && <span className="unit">{suffix}</span>}
      </span>
      <p className="t-micro text-muted mt-1">_{label.toLowerCase().replace(/\s+/g, "_")}</p>
      {meter !== undefined && <Meter label="" value={meter} className="mt-1.5 w-[120px]" />}
    </div>
  );
}

/** Back-compat alias (Home uses StatChip). */
export const StatChip = Readout;
