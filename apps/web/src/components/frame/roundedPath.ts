/** Rounded-corner polyline → SVG path (used by FolderCard's clip-path). Each vertex is
    [x, y, radius?]; a radius turns the corner into a tangent arc; open ends stay sharp. */
type Pt = [number, number, number?];

/** The tangent arc that replaces one vertex: t = r / tan(θ/2) along both edges, clamped to half an edge. */
function arc([x, y, rad = 0]: Pt, prev: Pt, next: Pt): string {
  const ax = prev[0] - x,
    ay = prev[1] - y,
    bx = next[0] - x,
    by = next[1] - y;
  const la = Math.hypot(ax, ay),
    lb = Math.hypot(bx, by);
  const theta = Math.acos(Math.max(-1, Math.min(1, (ax * bx + ay * by) / (la * lb))));
  const t = Math.min(rad / Math.tan(theta / 2), la / 2, lb / 2);
  const p1 = [x + (ax / la) * t, y + (ay / la) * t];
  const p2 = [x + (bx / lb) * t, y + (by / lb) * t];
  const sweep = ax * by - ay * bx < 0 ? 1 : 0;
  return `${p1[0].toFixed(1)} ${p1[1].toFixed(1)} A${rad} ${rad} 0 0 ${sweep} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
}

/** Round the corners of a polyline: each vertex with a radius becomes a tangent arc
    (t = r / tan(θ/2) along both edges); open ends and radius-less vertices stay sharp. */
export function pathOf(line: Pt[], closed = false): string {
  const n = line.length;
  const neighbour = (i: number) => (closed ? line[(i + n) % n] : (line[i] ?? null));
  const segs: string[] = [];
  for (let i = 0; i < n; i++) {
    const [x, y, rad] = line[i];
    const prev = neighbour(i - 1);
    const next = neighbour(i + 1);
    segs.push(rad && prev && next ? arc(line[i], prev, next) : `${x} ${y}`);
  }
  return "M" + segs.join(" L") + (closed ? " Z" : "");
}
