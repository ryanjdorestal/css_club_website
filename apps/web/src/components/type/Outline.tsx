import type { ReactNode } from "react";

/** Outline text — the second word of a solid+outline pair (T01), or a ghost
    layer offset behind a solid copy (T09). */
export function Outline({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <span className={`t-outline ${className}`}>{children}</span>;
}

/** Solid word with an outline ghost copy offset behind it. */
export function Ghost({ children, dx = 6, dy = 6, className = "" }: { children: string; dx?: number; dy?: number; className?: string }) {
  return (
    <span className={`relative inline-block ${className}`}>
      <span aria-hidden className="t-outline absolute opacity-60" style={{ left: dx, top: dy }}>
        {children}
      </span>
      <span className="relative">{children}</span>
    </span>
  );
}
