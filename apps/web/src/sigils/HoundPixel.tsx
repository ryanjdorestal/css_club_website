/**
 * HoundPixel — THE pixel Cyberhound (run 5 §4: single source of truth).
 * One 16×16 bitmap, hand-set from the banner pose; one component; size prop.
 * Always the section red (`--color-red`) — Home poster, Cyberhounds hero,
 * section marks, poster-card corner rail, 3D fallback all render this one.
 */
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
const CELLS: [number, number][] = [];
HOUND16.forEach((row, y) => row.split("").forEach((c, x) => c === "#" && CELLS.push([x, y])));

export function HoundPixel({ size = 24, className = "", style }: { size?: number; className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 16 16" width={size} height={size} className={className} style={style} aria-hidden shapeRendering="crispEdges">
      {CELLS.map(([x, y], i) => (
        <rect key={i} x={x} y={y} width="1.02" height="1.02" fill="var(--color-red)" />
      ))}
    </svg>
  );
}
