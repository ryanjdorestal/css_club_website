import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";

/** Segmented meter (T04/T06): 6px on / 2px off; dim beyond value; mono readout. */
export function Meter({
  label,
  value,
  max = 100,
  className = "",
}: {
  label: string;
  value: number;
  max?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-5% 0px" });
  const reduced = useReducedMotion();
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div ref={ref} className={className}>
      <div className="flex items-baseline justify-between mb-1.5">
        <span className="t-micro opacity-55">_{label.toLowerCase().replace(/\s+/g, "_")}</span>
        <span className="t-micro raise tnum">{max === 100 ? `${Math.round(pct)}%` : `${value} / ${max}`}</span>
      </div>
      <div className="relative h-[8px] border border-(--tone-line)">
        <div
          className="absolute inset-[1px] opacity-20"
          style={{ backgroundImage: "repeating-linear-gradient(90deg, currentColor 0 6px, transparent 6px 8px)" }}
        />
        <motion.div
          className="absolute inset-[1px] origin-left"
          initial={{ scaleX: reduced ? pct / 100 : 0 }}
          animate={inView ? { scaleX: pct / 100 } : undefined}
          transition={{ duration: 0.9, ease: "easeOut" }}
          style={{ backgroundImage: "repeating-linear-gradient(90deg, var(--accent) 0 6px, transparent 6px 8px)" }}
        />
      </div>
    </div>
  );
}
