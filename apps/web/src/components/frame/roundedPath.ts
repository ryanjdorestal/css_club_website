/** Rounded-corner polyline → SVG path (used by FolderCard's clip-path). Each vertex is
    [x, y, radius?]; a radius turns the corner into a tangent arc; open ends stay sharp. */
export type Pt = [number, number, number?];

/** Round the corners of a polyline: each vertex with a radius becomes a tangent arc
    (t = r / tan(θ/2) along both edges); open ends and radius-less vertices stay sharp. */
export function pathOf(line: Pt[], closed = false): string {
  const n = line.length;
  const segs: string[] = [];
  for (let i = 0; i < n; i++) {
    const [x, y, rad] = line[i];
    const prev = closed ? line[(i - 1 + n) % n] : i > 0 ? line[i - 1] : null;
    const next = closed ? line[(i + 1) % n] : i + 1 < n ? line[i + 1] : null;
    if (!rad || !prev || !next) {
      segs.push(`${x} ${y}`);
      continue;
    }
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
    segs.push(`${p1[0].toFixed(1)} ${p1[1].toFixed(1)} A${rad} ${rad} 0 0 ${sweep} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`);
  }
  return "M" + segs.join(" L") + (closed ? " Z" : "");
}
