import type { MotionValue } from "motion/react";
import { motion, useTransform, useReducedMotion } from "motion/react";

/** The footer's giant faded element (run 4): the Bloodhound as a cascading
    fade glaze — silhouette ~70vw, lower quarter cropped, ink glaze warmed
    with John Jay red on the lower half, interior strokes cut in band color,
    three echo outlines sinking above. Simplified from mascot/Bloodhound.tsx. */

const SIL = [
  // ears
  "M28 40 C 16 46, 12 62, 14 78 C 15 90, 22 96, 28 92 C 34 88, 34 76, 33 64 C 32.5 55, 32 46, 33 41 Z",
  "M92 40 C 104 46, 108 62, 106 78 C 105 90, 98 96, 92 92 C 86 88, 86 76, 87 64 C 87.5 55, 88 46, 87 41 Z",
  // head + jowls
  "M32 44 C 28 52, 28 62, 32 72 C 36 84, 46 92, 60 92 C 74 92, 84 84, 88 72 C 92 62, 92 52, 88 44 C 82 38, 72 36, 60 36 C 48 36, 38 38, 32 44 Z",
  // beanie + slouch
  "M34 38 C 32 22, 44 12, 60 12 C 74 12, 86 20, 87 32 C 88 38, 87 40, 86 41 L 34 41 Z",
  "M84 20 C 92 18, 97 24, 94 31 C 92 36, 87 37, 85 35 Z",
];
// three interior strokes: band, muzzle, jowl lines (cut in the band color)
const DETAIL = [
  "M33 41 H 88",
  "M52 62 C 52 58, 68 58, 68 62 C 68 67, 64 70, 60 70 C 56 70, 52 67, 52 62 Z",
  "M45 66 C 41 74, 43 84, 50 86 M75 66 C 79 74, 77 84, 70 86",
  "M44 52 a 3.4 3.4 0 1 0 6.8 0 a 3.4 3.4 0 1 0 -6.8 0",
  "M69 52 a 3.4 3.4 0 1 0 6.8 0 a 3.4 3.4 0 1 0 -6.8 0",
];

export function HoundGlaze({ progress }: { progress: MotionValue<number> }) {
  const reduced = useReducedMotion();
  const y = useTransform(progress, [0, 1], [70, 0]);
  return (
    <div aria-hidden className="relative overflow-hidden select-none pointer-events-auto group" style={{ height: "30vw", minHeight: 280 }}>
      <motion.div
        style={reduced ? {} : { y }}
        className="absolute left-1/2 -translate-x-1/2 bottom-[-14%] w-[70vw] max-w-[1100px] transition-opacity duration-500 opacity-[0.09] group-hover:opacity-[0.12]"
      >
        <svg viewBox="0 -8 120 116" className="w-full h-auto" style={{ overflow: "visible" }}>
          <defs>
            <linearGradient id="hound-glaze" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-ink)" />
              <stop offset="48%" stopColor="var(--color-ink)" />
              <stop offset="72%" stopColor="color-mix(in srgb, var(--color-red) 50%, var(--color-ink))" />
              <stop offset="96%" stopColor="var(--color-red)" stopOpacity="0.15" /><stop offset="100%" stopColor="var(--color-red)" stopOpacity="0" />
            </linearGradient>
          </defs>
          {/* sinking echo outlines (cascade) */}
          {[3, 2, 1].map((i) => (
            <g key={i} transform={`translate(0 ${-i * 2.6})`} opacity={0.5 - i * 0.13} fill="none" stroke="var(--color-ink)" strokeWidth="0.5">
              {SIL.map((d, j) => (
                <path key={j} d={d} />
              ))}
            </g>
          ))}
          {/* the glazed silhouette */}
          <g fill="url(#hound-glaze)">
            {SIL.map((d, j) => (
              <path key={j} d={d} />
            ))}
          </g>
          {/* interior detail cut in the band color */}
          <g fill="none" stroke="var(--color-navy-900)" strokeWidth="1.6" opacity="0.85">
            {DETAIL.map((d, j) => (
              <path key={j} d={d} />
            ))}
          </g>
        </svg>
      </motion.div>
    </div>
  );
}
