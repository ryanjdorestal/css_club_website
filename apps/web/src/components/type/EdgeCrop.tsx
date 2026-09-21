import type { ReactNode } from "react";

/** Poster word cropped by the container edge (T02, rhecwb brandmark). */
export function EdgeCrop({ children, side = "right", className = "" }: { children: ReactNode; side?: "left" | "right" | "both"; className?: string }) {
  const m = side === "both" ? { marginInline: "-0.06em" } : side === "left" ? { marginInlineStart: "-0.06em" } : { marginInlineEnd: "-0.06em" };
  return (
    <span className={`block overflow-hidden ${className}`}>
      <span className="block whitespace-nowrap" style={m}>
        {children}
      </span>
    </span>
  );
}
