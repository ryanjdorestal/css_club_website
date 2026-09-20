import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "motion/react";

/** jj_09: renders an SVG silhouette as a dot grid, dots animate in by row.
    Used for the Cyberhounds Bloodhound. Sampling happens once via canvas. */
export function DotMatrix({
  src,
  size = 48,
  dot = 5,
  color = "var(--color-red)",
  className = "",
}: {
  src: string;         // an image/svg URL to sample
  size?: number;       // grid resolution
  dot?: number;        // dot cell px in the output viewBox
  color?: string;
  className?: string;
}) {
  const [cells, setCells] = useState<{ x: number; y: number; a: number }[]>([]);
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const reduced = useReducedMotion();

  useEffect(() => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = size;
      c.height = size;
      const ctx = c.getContext("2d", { willReadFrequently: true })!;
      ctx.drawImage(img, 0, 0, size, size);
      const data = ctx.getImageData(0, 0, size, size).data;
      const out: { x: number; y: number; a: number }[] = [];
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          const i = (y * size + x) * 4;
          const alpha = data[i + 3] / 255;
          const lum = (data[i] + data[i + 1] + data[i + 2]) / 765;
          if (alpha > 0.4 && lum < 0.92) out.push({ x, y, a: alpha });
        }
      }
      setCells(out);
    };
  }, [src, size]);

  const vb = size * dot;
  return (
    <svg ref={ref} viewBox={`0 0 ${vb} ${vb}`} className={className} aria-hidden>
      {cells.map((c, i) => (
        <circle
          key={i}
          cx={c.x * dot + dot / 2}
          cy={c.y * dot + dot / 2}
          r={dot * 0.36}
          fill={color}
          style={{
            opacity: inView ? c.a : 0,
            transition: reduced ? "none" : `opacity 0.5s ease ${(c.y * 18)}ms`,
          }}
        />
      ))}
    </svg>
  );
}
