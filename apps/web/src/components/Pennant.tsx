import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { Brackets } from "./frame";
import { CYBERHOUND_HEAD } from "@/sigils/cyberhoundHeadPath";

/** The Cyberhounds pennant (assets/brand/cyberhounds_pennant.svg, inlined so
    the red is var(--color-red)): 600×780 field #0A0A0C, straight sides to
    y=600 then a point at (300,780), a 2px red inset hairline, the vector
    pitbull head centred, CYBERHOUNDS in mono under it.
    Motion (in view, once): drops 24px into place (0.6 s); the head's outline
    draws in on a 1px stroke copy (0.9 s) before the fill fades in (0.3 s).
    Hover: a 1.5° sway around the top edge (1.2 s). Reduced motion → static. */

const FIELD = "#0A0A0C";
const SHAPE = "M0 0H600V600L300 780L0 600Z";
const INSET = "M14 14H586V594L300 758L14 594Z";
const HEAD_PLACE = "translate(120,70.9) scale(0.21065)";
const EASE = [0.22, 1, 0.36, 1] as const;

function PennantMark({ className = "" }: { className?: string }) {
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const reduced = useReducedMotion();
  const go = inView || !!reduced;
  return (
    <svg ref={ref} viewBox="0 0 600 780" role="img" aria-label="Cyberhounds pennant" className={`block w-full h-auto pennant-sway ${className}`}>
      <defs>
        <clipPath id="pennant-clip">
          <path d={SHAPE} />
        </clipPath>
      </defs>
      <path d={SHAPE} fill={FIELD} />
      <path d={INSET} fill="none" stroke="var(--color-red)" strokeOpacity="0.55" strokeWidth="2" />
      <g clipPath="url(#pennant-clip)">
        <g transform={HEAD_PLACE}>
          <g transform={CYBERHOUND_HEAD.transform}>
            {/* fill — fades in after the outline has drawn */}
            <motion.path
              d={CYBERHOUND_HEAD.d}
              fill="var(--color-red)"
              initial={reduced ? false : { opacity: 0 }}
              animate={go ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.3, delay: reduced ? 0 : 0.9, ease: "linear" }}
            />
            {/* outline — 1px stroke copy, draws in */}
            {!reduced && (
              <motion.path
                d={CYBERHOUND_HEAD.d}
                fill="none"
                stroke="var(--color-red-hi)"
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
                initial={{ pathLength: 0, opacity: 1 }}
                animate={go ? { pathLength: 1, opacity: 0 } : { pathLength: 0, opacity: 1 }}
                transition={{ pathLength: { duration: 0.9, ease: "easeInOut" }, opacity: { duration: 0.4, delay: 1.1 } }}
              />
            )}
          </g>
        </g>
      </g>
      <text x="300" y="628" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="13" letterSpacing="3" fill="var(--color-red)" fillOpacity="0.85">
        CYBERHOUNDS
      </text>
    </svg>
  );
}

/** The pennant inside the run-3 frame furniture: brackets, VISUAL/FRAME rail,
    caption. The frame's corners stay square; the pennant's point hangs 24px
    below the frame's bottom hairline, which is drawn behind it. */
export function Pennant({
  tag = "VISUAL · 01",
  meta = "FRAME · 001",
  caption = "CYBERHOUNDS · PENNANT · VECTOR",
  className = "",
}: {
  tag?: string;
  meta?: string;
  caption?: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const reduced = useReducedMotion();
  return (
    <figure ref={ref} className={`group relative max-w-[560px] ${className}`}>
      <div className="relative bg-white/[0.02] px-2 pt-2">
        {/* the frame — a separate layer so the pennant's point can cover its bottom rule */}
        <span aria-hidden className="absolute inset-0 border border-(--tone-line) pointer-events-none" />
        <Brackets size={12} inset={-1} />
        <div className="relative flex items-center justify-between px-1 pb-1.5">
          <span className="t-micro opacity-55">{tag}</span>
          <span className="t-micro opacity-55 tnum">{meta}</span>
        </div>
        <motion.div
          className="relative z-10 w-full max-w-[520px] mx-auto -mb-6"
          initial={reduced ? false : { y: -24, opacity: 0 }}
          animate={inView || reduced ? { y: 0, opacity: 1 } : { y: -24, opacity: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
        >
          <PennantMark />
        </motion.div>
      </div>
      <figcaption className="t-micro opacity-55 px-3 pt-9">{caption}</figcaption>
    </figure>
  );
}
