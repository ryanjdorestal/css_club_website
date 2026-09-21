/** The S01 display alphabet (run 9 §2.1 fallback path): no free face cleared the match
    (best IoU 0.52 — qa/REPORT_RUN9.md), so hero + poster words are drawn, not typed.
    Each glyph is a set of skeleton polylines on a 100-unit cap grid (y 0 = cap, 100 =
    baseline) stroked at STROKE with round joins; a vertex's third number is a corner
    radius. Measured from R9_01a: stroke 0.12 cap · E 0.67 · O 0.75 · N 0.90 · M 1.19 wide,
    outer corners ≈ 2× stroke, counters squared. Used by S01Word.tsx only. */

export const STROKE = 12;
const H = STROKE / 2; // skeleton inset from the outer edge
export const TRACK = 2; // +2 % of cap between glyphs (S01 hero)
export const SPACE = 40;
export const DESCENT = 12; // room under the baseline (comma)

type Pt = [number, number, number?];
export type Glyph = { w: number; lines: Pt[][]; closed?: boolean[] };

const R = 16; // bowl corners (outer ≈ 22)
const T = 12; // stem tops on M / N / A (outer ≈ 18)
const D = 34; // the D's right side (outer ≈ 40)

// helpers on the outer-width box: x from H to w-H, y from H to 100-H
const L = H;
const TOP = H;
const BASE = 100 - H;
const MID = 50;
const r = (w: number) => w - H;

const G: Record<string, Glyph> = {
  A: { w: 84, lines: [[[L, BASE], [L, TOP, T], [r(84), TOP, T], [r(84), BASE]], [[L, 62], [r(84), 62]]] },
  B: {
    w: 78,
    lines: [
      [[L, BASE], [L, TOP], [r(78), TOP, R], [r(78), MID, R], [L, MID]],
      [[L, MID], [r(78), MID, R], [r(78), BASE, R], [L, BASE]],
    ],
  },
  C: { w: 76, lines: [[[r(76), TOP], [L, TOP, R], [L, BASE, R], [r(76), BASE]]] },
  D: { w: 84, lines: [[[L, TOP], [r(84), TOP, D], [r(84), BASE, D], [L, BASE]]], closed: [true] },
  E: { w: 67, lines: [[[r(67), TOP], [L, TOP], [L, BASE], [r(67), BASE]], [[L, MID], [r(67) - 4, MID]]] },
  F: { w: 64, lines: [[[r(64), TOP], [L, TOP], [L, BASE]], [[L, MID], [r(64) - 6, MID]]] },
  G: { w: 78, lines: [[[r(78), TOP], [L, TOP, R], [L, BASE, R], [r(78), BASE], [r(78), 52], [r(78) - 24, 52]]] },
  H: { w: 84, lines: [[[L, TOP], [L, BASE]], [[r(84), TOP], [r(84), BASE]], [[L, MID], [r(84), MID]]] },
  I: { w: 12, lines: [[[L, TOP], [L, BASE]]] },
  J: { w: 60, lines: [[[r(60), TOP], [r(60), BASE, R], [L, BASE, R], [L, 74]]] },
  K: { w: 80, lines: [[[L, TOP], [L, BASE]], [[r(80), TOP], [L + 4, 52], [r(80), BASE]]] },
  L: { w: 64, lines: [[[L, TOP], [L, BASE], [r(64), BASE]]] },
  // M / N: the diagonal leaves a short top arm so the stem corner stays a 90° round (the ref's rounded tops)
  M: { w: 119, lines: [[[L, BASE], [L, TOP, T], [L + T + 6, TOP], [59.5, 82], [r(119) - T - 6, TOP], [r(119), TOP, T], [r(119), BASE]]] },
  N: { w: 90, lines: [[[L, BASE], [L, TOP, T], [L + T + 6, TOP], [r(90), BASE]], [[r(90), BASE], [r(90), TOP, T], [r(90) - T - 6, TOP]]] },
  O: { w: 76, lines: [[[L, TOP, R], [r(76), TOP, R], [r(76), BASE, R], [L, BASE, R]]], closed: [true] },
  P: { w: 76, lines: [[[L, BASE], [L, TOP], [r(76), TOP, R], [r(76), 54, R], [L, 54]]] },
  Q: { w: 76, lines: [[[L, TOP, R], [r(76), TOP, R], [r(76), BASE, R], [L, BASE, R]], [[r(76) - 24, 72], [r(76) + 2, 98]]], closed: [true, false] },
  R: { w: 78, lines: [[[L, BASE], [L, TOP], [r(78), TOP, R], [r(78), 54, R], [L, 54]], [[r(78) - 26, 54], [r(78), BASE]]] },
  S: { w: 76, lines: [[[r(76), TOP], [L, TOP, R], [L, MID, R], [r(76), MID, R], [r(76), BASE, R], [L, BASE]]] },
  T: { w: 76, lines: [[[L, TOP], [r(76), TOP]], [[38, TOP], [38, BASE]]] },
  U: { w: 84, lines: [[[L, TOP], [L, BASE, R], [r(84), BASE, R], [r(84), TOP]]] },
  V: { w: 84, lines: [[[L, TOP], [42, BASE], [r(84), TOP]]] },
  W: { w: 119, lines: [[[L, TOP], [32, BASE], [59.5, 22], [87, BASE], [r(119), TOP]]] },
  X: { w: 84, lines: [[[L, TOP], [r(84), BASE]], [[r(84), TOP], [L, BASE]]] },
  Y: { w: 84, lines: [[[L, TOP], [42, 52], [r(84), TOP]], [[42, 52], [42, BASE]]] },
  Z: { w: 76, lines: [[[L, TOP], [r(76), TOP], [L, BASE], [r(76), BASE]]] },
  "0": { w: 76, lines: [[[L, TOP, R], [r(76), TOP, R], [r(76), BASE, R], [L, BASE, R]], [[24, 72], [r(76) - 18, 28]]], closed: [true, false] },
  "1": { w: 52, lines: [[[L, 30], [30, TOP], [30, BASE]]] },
  "2": { w: 76, lines: [[[L, TOP], [r(76), TOP, R], [r(76), MID, R], [L, MID, R], [L, BASE], [r(76), BASE]]] },
  "3": { w: 76, lines: [[[L, TOP], [r(76), TOP, R], [r(76), MID, R], [26, MID]], [[r(76) - R, MID], [r(76), MID, R], [r(76), BASE, R], [L, BASE]]] },
  "4": { w: 76, lines: [[[r(76) - 18, BASE], [r(76) - 18, TOP], [L, 64], [r(76), 64]]] },
  "5": { w: 76, lines: [[[r(76), TOP], [L, TOP], [L, 46], [r(76), 46, R], [r(76), BASE, R], [L, BASE]]] },
  "6": { w: 76, lines: [[[r(76), TOP], [L, TOP, R], [L, BASE, R], [r(76), BASE, R], [r(76), 46, R], [L, 46]]] },
  "7": { w: 76, lines: [[[L, TOP], [r(76), TOP], [28, BASE]]] },
  "8": {
    w: 76,
    lines: [
      [[L, TOP, R], [r(76), TOP, R], [r(76), MID, R], [L, MID, R]],
      [[L, MID, R], [r(76), MID, R], [r(76), BASE, R], [L, BASE, R]],
    ],
    closed: [true, true],
  },
  "9": { w: 76, lines: [[[L, BASE], [r(76), BASE, R], [r(76), TOP, R], [L, TOP, R], [L, 54, R], [r(76), 54]]] },
  ".": { w: 12, lines: [[[L, BASE - 12], [L, BASE]]] },
  ",": { w: 14, lines: [[[L + 2, BASE - 12], [L + 2, BASE], [L - 2, BASE + 12]]] },
  ":": { w: 12, lines: [[[L, 34], [L, 46]], [[L, BASE - 12], [L, BASE]]] },
  "/": { w: 60, lines: [[[L, BASE], [r(60), TOP]]] },
  "-": { w: 52, lines: [[[L, MID], [r(52), MID]]] },
  _: { w: 70, lines: [[[L, BASE], [r(70), BASE]]] },
  "'": { w: 12, lines: [[[L, TOP], [L, 26]]] },
  "!": { w: 12, lines: [[[L, TOP], [L, 66]], [[L, BASE - 12], [L, BASE]]] },
  "&": { w: 84, lines: [[[r(84), BASE], [30, 40, R], [30, TOP, R], [56, TOP, R], [56, 40], [L, 72, R], [30, BASE, R], [r(84), 60]]] },
};

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

export function glyph(ch: string): Glyph | null {
  return G[ch.toUpperCase()] ?? null;
}
