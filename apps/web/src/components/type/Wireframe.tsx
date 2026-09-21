import type { ReactNode } from "react";

/** A 1px accent cube wireframe drawn through display text (T02's vehicle).
    Isometric cube edges as SVG, positioned by the caller. */
export function CubeWireSvg({ className = "", stroke = "var(--accent)" }: { className?: string; stroke?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden fill="none" style={{ overflow: "visible" }}>
      <g stroke={stroke} strokeWidth="1" vectorEffect="non-scaling-stroke">
        {/* outer hexagon of an isometric cube */}
        <path d="M50 4 L91 27 L91 73 L50 96 L9 73 L9 27 Z" />
        {/* inner Y edges */}
        <path d="M50 4 L50 50 M50 50 L91 27 M50 50 L9 27 M50 50 L50 96" opacity="0.7" />
        {/* face notches — the C and S cuts, abstracted */}
        <path d="M22 38 h18 M22 58 h12 M64 40 h16 M68 60 h12" opacity="0.5" />
        {/* vertex dots (T06 radar) */}
        {[
          [50, 4],
          [91, 27],
          [91, 73],
          [50, 96],
          [9, 73],
          [9, 27],
          [50, 50],
        ].map(([x, y], i) => (
          <rect key={i} x={x - 1.4} y={y - 1.4} width="2.8" height="2.8" fill={stroke} stroke="none" />
        ))}
      </g>
    </svg>
  );
}

/** Wrap a headline; the wireframe crosses through the letters. */
export function Wireframe({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <span className={`relative inline-block ${className}`}>
      {children}
      <CubeWireSvg className="absolute -right-[0.5em] top-[-30%] h-[160%] w-auto opacity-70 pointer-events-none" />
    </span>
  );
}
