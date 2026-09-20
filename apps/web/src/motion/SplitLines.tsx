import { motion, useReducedMotion } from "motion/react";

const EASE = [0.22, 1, 0.36, 1] as const;

/** Headline that reveals per line with a clip-path wipe from the bottom.
    Pass lines as an array so line breaks are deliberate (no orphans). */
export function SplitLines({
  lines,
  className = "",
  lineClass = "",
  as: Tag = "h2",
}: {
  lines: (string | { text: string; className?: string })[];
  className?: string;
  lineClass?: string;
  as?: "h1" | "h2" | "p";
}) {
  const reduced = useReducedMotion();
  return (
    <Tag className={className}>
      {lines.map((l, i) => {
        const text = typeof l === "string" ? l : l.text;
        const extra = typeof l === "string" ? "" : (l.className ?? "");
        return (
          <span key={i} className="block overflow-hidden">
            <motion.span
              className={`block ${lineClass} ${extra}`}
              initial={reduced ? { opacity: 0 } : { y: "110%" }}
              whileInView={reduced ? { opacity: 1 } : { y: 0 }}
              viewport={{ once: true, margin: "-8% 0px" }}
              transition={{ duration: 0.8, ease: EASE, delay: 0.08 * i }}
            >
              {text}
            </motion.span>
          </span>
        );
      })}
    </Tag>
  );
}
