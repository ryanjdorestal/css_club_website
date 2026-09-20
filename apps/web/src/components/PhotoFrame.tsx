import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";

/** Image in a hairline frame with mono caption rails (rhecwb FRAME · 001).
    The image parallaxes −8% over the section scroll. */
export function PhotoFrame({
  src,
  alt,
  caption,
  meta,
  tag,
  className = "",
}: {
  src: string;
  alt: string;
  caption?: string;
  meta?: string;
  tag?: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);
  return (
    <figure ref={ref} className={`border border-(--tone-line) bg-white/[0.02] p-2.5 ${className}`}>
      <div className="flex items-center justify-between px-1 pb-2">
        <span className="mono-label opacity-60">{tag ?? "VISUAL"}</span>
        <span className="mono-label opacity-60">{meta ?? "FRAME · 001"}</span>
      </div>
      <div className="overflow-hidden">
        <motion.img
          src={src}
          alt={alt}
          loading="lazy"
          style={{ y: reduced ? 0 : y, scale: 1.12 }}
          className="w-full object-cover"
        />
      </div>
      {caption && (
        <figcaption className="mono-label opacity-60 px-1 pt-2.5">{caption}</figcaption>
      )}
    </figure>
  );
}
