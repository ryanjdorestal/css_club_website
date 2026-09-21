import type { CSSProperties } from "react";
import { CYBERHOUND_HEAD } from "./cyberhoundHeadPath";

/** The vector Cyberhounds pitbull head (assets/brand/cyberhound_head.svg).
    `size` is the HEIGHT in px (the head is 1709 × 2270); fill = section red. */
export function CyberhoundHead({
  size = 40,
  className = "",
  style,
  color = "var(--color-red)",
}: {
  size?: number;
  className?: string;
  style?: CSSProperties;
  color?: string;
}) {
  const w = Math.round((size * CYBERHOUND_HEAD.width) / CYBERHOUND_HEAD.height);
  return (
    <svg viewBox={CYBERHOUND_HEAD.viewBox} width={w} height={size} className={className} style={style} aria-hidden>
      <g transform={CYBERHOUND_HEAD.transform} fill={color} stroke="none">
        <path d={CYBERHOUND_HEAD.d} />
      </g>
    </svg>
  );
}
