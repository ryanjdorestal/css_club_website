/**
 * The sigil layer (context/23 §3): geometric marks on a 24-unit grid, square
 * caps, miter joins, stroke 1.25, currentColor. Bullets, section marks,
 * watermarks, hover states. No fills except where noted.
 */
import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement> & { size?: number };
const base = (p: P) => ({
  viewBox: "0 0 24 24",
  width: p.size ?? 24,
  height: p.size ?? 24,
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.25,
  strokeLinecap: "square" as const,
  strokeLinejoin: "miter" as const,
  "aria-hidden": true,
  ...p,
});

/** The cube's three faces as a square-grid mark; face="r|g|b" fills one. */
export function CubeSigil({ face, ...p }: P & { face?: "r" | "g" | "b" }) {
  return (
    <svg {...base(p)}>
      {/* top face (green), left face (red C), right face (blue S) — squared iso */}
      <path d="M12 2 L21 7 L12 12 L3 7 Z" fill={face === "g" ? "var(--color-cube-green)" : "none"} />
      <path d="M3 7 L12 12 L12 22 L3 17 Z" fill={face === "r" ? "var(--color-cube-red)" : "none"} />
      <path d="M21 7 L12 12 L12 22 L21 17 Z" fill={face === "b" ? "var(--color-cube-blue)" : "none"} />
      <path d="M6 11.5 l3 1.7 M15 13.2 l3 -1.7" opacity="0.6" />
    </svg>
  );
}

/** C-S-S in square-Kufic strokes (T10): right angles, uniform width, no curves.
    Grid comment (5×5 per letter, 1u gap):
      C = [ bracket        S = seven-segment maze S (rotational Z-form)
    Drawn as unit-cell rects, fill currentColor, shape-rendering crispEdges. */
export function CSSKufic({ size = 24, className = "", style }: { size?: number; className?: string; style?: React.CSSProperties }) {
  // cells [x,y] on a 17×5 grid
  const C: [number, number][] = [
    [0,0],[1,0],[2,0],[3,0],[4,0],
    [0,1],[0,2],[0,3],
    [0,4],[1,4],[2,4],[3,4],[4,4],
  ];
  const S: [number, number][] = [
    [0,0],[1,0],[2,0],[3,0],[4,0],
    [0,1],
    [0,2],[1,2],[2,2],[3,2],[4,2],
    [4,3],
    [0,4],[1,4],[2,4],[3,4],[4,4],
  ];
  const cells: [number, number][] = [
    ...C,
    ...S.map(([x, y]) => [x + 6, y] as [number, number]),
    ...S.map(([x, y]) => [x + 12, y] as [number, number]),
  ];
  return (
    <svg viewBox="0 0 17 5" width={size * (17 / 5)} height={size} className={className} style={style} aria-label="CSS" shapeRendering="crispEdges">
      {cells.map(([x, y], i) => (
        <rect key={i} x={x} y={y} width="1.02" height="1.02" fill="currentColor" />
      ))}
    </svg>
  );
}

/** Bloodhound head as a 16×16 pixel sigil (hand-set from the banner pose). */
const HOUND16 = [
  "....########....",
  "...##########...",
  "..############..",
  ".#..########..#.",
  ".#..########..#.",
  "##..########..##",
  "##.##########.##",
  "##.#.######.#.##",
  "##.##########.##",
  "##..########..##",
  ".#..##....##..#.",
  ".#...######...#.",
  ".....######.....",
  "......#..#......",
  "......####......",
  "................",
];
export function HoundPixel({ size = 24, className = "", color = "currentColor" }: { size?: number; className?: string; color?: string }) {
  const cells: [number, number][] = [];
  HOUND16.forEach((row, y) => row.split("").forEach((c, x) => c === "#" && cells.push([x, y])));
  return (
    <svg viewBox="0 0 16 16" width={size} height={size} className={className} aria-hidden shapeRendering="crispEdges">
      {cells.map(([x, y], i) => (
        <rect key={i} x={x} y={y} width="1.02" height="1.02" fill={color} />
      ))}
    </svg>
  );
}

export const Flag = (p: P) => (
  <svg {...base(p)}><path d="M6 21 V3 M6 4 H18 L15 8 L18 12 H6" /></svg>
);
export const Terminal = (p: P) => (
  <svg {...base(p)}><rect x="3" y="4" width="18" height="16" /><path d="M7 9 L11 12 L7 15 M13 16 H17" /></svg>
);
export const Node = (p: P) => (
  <svg {...base(p)}><rect x="9" y="9" width="6" height="6" /><path d="M12 3 V9 M12 15 V21 M3 12 H9 M15 12 H21" /><rect x="10.5" y="1.5" width="3" height="3" /><rect x="10.5" y="19.5" width="3" height="3" /><rect x="1.5" y="10.5" width="3" height="3" /><rect x="19.5" y="10.5" width="3" height="3" /></svg>
);
export const Shield = (p: P) => (
  <svg {...base(p)}><path d="M12 2 L21 6 V12 C21 17 17 20 12 22 C7 20 3 17 3 12 V6 Z" /><path d="M8 11 L11 14 L16 8" /></svg>
);
export const BracketSigil = (p: P) => (
  <svg {...base(p)}><path d="M9 3 H4 V21 H9 M15 3 H20 V21 H15" /></svg>
);
export const Crosshair = (p: P) => (
  <svg {...base(p)}><circle cx="12" cy="12" r="7" /><path d="M12 1 V6 M12 18 V23 M1 12 H6 M18 12 H23" /><rect x="11" y="11" width="2" height="2" fill="currentColor" stroke="none" /></svg>
);
export const Chevrons = (p: P) => (
  <svg {...base(p)}><path d="M4 6 L10 12 L4 18 M10 6 L16 12 L10 18 M16 6 L22 12 L16 18" /></svg>
);
export const Star4 = (p: P) => (
  <svg {...base(p)}><path d="M12 2 L14 10 L22 12 L14 14 L12 22 L10 14 L2 12 L10 10 Z" fill="currentColor" stroke="none" /></svg>
);
export const Lambda = (p: P) => (
  <svg {...base(p)}><path d="M6 21 L12 4 L18 21 M9.5 14 H14.5" /></svg>
);
/** Pixel eye (T03). */
export const Eye = (p: P) => (
  <svg {...base(p)} shapeRendering="crispEdges">
    <path d="M4 12 H2 M22 12 H20 M12 4 V2 M12 22 V20" />
    <path d="M6 10 H18 V14 H6 Z" />
    <rect x="10.5" y="10.5" width="3" height="3" fill="currentColor" stroke="none" />
    <path d="M4 6 L7 9 M20 6 L17 9 M4 18 L7 15 M20 18 L17 15" />
  </svg>
);
export const ArrowSq = (p: P) => (
  <svg {...base(p)}><rect x="3" y="3" width="18" height="18" /><path d="M9 15 L15 9 M10 9 H15 V14" /></svg>
);
export const PlusMark = (p: P) => (
  <svg {...base(p)}><path d="M12 7 V17 M7 12 H17" /></svg>
);
export const Tick = (p: P) => (
  <svg {...base(p)}><path d="M5 13 L10 18 L19 7" /></svg>
);
