import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

/** Display text with stencil bars cutting through the letters (T01).
    Bars are band-background-colored rectangles at fractions of cap height
    that slide in from the left in view. Parent must set the text styles. */
export function Stencil({
  children,
  bars = [0.38, 0.62],
  barColor = "var(--stencil-bg, var(--color-navy-600))",
  className = "",
}: {
  children: ReactNode;
  bars?: number[];
  barColor?: string;
  className?: string;
}) {
  const reduced = useReducedMotion();
  return (
    <span className={`relative inline-block ${className}`}>
      {children}
      {bars.map((b, i) => (
        <motion.span
          key={i}
          aria-hidden
          initial={{ scaleX: reduced ? 1 : 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true, margin: "-8% 0px" }}
          transition={{ duration: 0.5, delay: 0.15 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
          className="absolute left-[-2%] right-[-2%] origin-left"
          style={{ top: `${b * 100}%`, height: "0.035em", background: barColor }}
        />
      ))}
    </span>
  );
}
