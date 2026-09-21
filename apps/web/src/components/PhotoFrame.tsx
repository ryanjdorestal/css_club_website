import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";
import { Brackets } from "./frame";

/** Bracketed photo frame with registration ticks, optional tracking box
    (SUBJ_01 · 0.92 — hero/spread photos only), //IMG_00N caption rail. */
export function PhotoFrame({
  src,
  alt,
  caption,
  meta,
  tag,
  track,
  className = "",
}: {
  src: string;
  alt: string;
  caption?: string;
  meta?: string;
  tag?: string;
  track?: { x: string; y: string; w: string; h: string; label: string };
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);
  return (
    <figure ref={ref} className={`group relative border border-(--tone-line) bg-white/[0.02] p-2 ${className}`}>
      <Brackets size={12} inset={-1} />
      <div className="flex items-center justify-between px-1 pb-1.5">
        <span className="t-micro opacity-55">{tag ?? "//IMG_001"}</span>
        <span className="t-micro opacity-55 tnum">{meta ?? "FRAME · 001"}</span>
      </div>
      <div className="relative overflow-hidden">
        <motion.img src={src} alt={alt} loading="lazy" style={{ y: reduced ? 0 : y, scale: 1.12 }} className="w-full object-cover" />
        {track && (
          <span
            aria-hidden
            className="absolute border border-(--accent) pointer-events-none"
            style={{ left: track.x, top: track.y, width: track.w, height: track.h }}
          >
            <span className="absolute -top-4 left-0 t-micro raise text-(--accent) whitespace-nowrap">{track.label}</span>
          </span>
        )}
      </div>
      {caption && <figcaption className="t-micro opacity-55 px-1 pt-2">{caption}</figcaption>}
    </figure>
  );
}
