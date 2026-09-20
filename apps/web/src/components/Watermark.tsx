import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";

/** Section-motif watermark: a big SVG/image bleeding off a section edge at
    6–8% opacity, parallaxing +12% over the section's scroll range. */
export function Watermark({
  src,
  side = "right",
  width = "42vw",
  opacity = 0.07,
  top = "10%",
}: {
  src: string;
  side?: "left" | "right";
  width?: string;
  opacity?: number;
  top?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-6%", "6%"]);
  return (
    <div ref={ref} aria-hidden className="absolute inset-0 pointer-events-none overflow-hidden">
      <motion.img
        src={src}
        alt=""
        style={{
          width,
          opacity,
          top,
          y: reduced ? 0 : y,
          [side]: `calc(-0.25 * ${width})`,
        }}
        className="absolute max-w-none select-none"
      />
    </div>
  );
}
