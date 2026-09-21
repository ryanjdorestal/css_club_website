/** <S01Word> — a hero / poster word drawn in the S01 display alphabet (glyphs.ts).
    Treatments live here so the run-3 vocabulary survives the switch from text to
    paths: `outlineFrom` (SplitFill: solid up to n, outline after; 0 = all outline),
    `bars` (Stencil: cuts at fractions of cap height), both as SVG masks so they work
    on any background. Height follows the font size: cap = `cap` em (default .74, the
    Unbounded cap height, so the two faces sit on one line). Used on ≤ 12 words:
    Home + Cyberhounds heroes, the poster bands, 404. */
import { useId } from "react";
import { DESCENT, SPACE, STROKE, TRACK, glyph, pathOf } from "./glyphs";

const OUTLINE_INNER = STROKE - 5.5; // ≈ 2 px at hero size

export function S01Word({
  children,
  outlineFrom,
  bars,
  cap = 0.74,
  className = "",
  style,
}: {
  children: string;
  outlineFrom?: number;
  bars?: number[];
  cap?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const id = useId().replace(/:/g, "");
  const text = children.toUpperCase();
  const glyphs: { d: string[]; x: number; w: number; outline: boolean }[] = [];
  let x = 0;
  let n = 0;
  for (const ch of text) {
    if (ch === " ") {
      x += SPACE;
      continue;
    }
    const g = glyph(ch);
    if (!g) continue;
    glyphs.push({
      d: g.lines.map((l, i) => pathOf(l, g.closed?.[i] ?? false)),
      x,
      w: g.w,
      outline: outlineFrom !== undefined && n >= outlineFrom,
    });
    x += g.w + TRACK;
    n++;
  }
  const W = Math.max(1, x - TRACK);
  const HGT = 100 + DESCENT;
  const hasMask = bars?.length || glyphs.some((g) => g.outline);
  return (
    <svg
      viewBox={`0 0 ${W} ${HGT}`}
      className={`inline-block align-baseline overflow-visible ${className}`}
      style={{ height: `${cap * (HGT / 100)}em`, width: "auto", verticalAlign: `${-cap * (DESCENT / 100)}em`, ...style }}
      role="img"
      aria-label={children}
    >
      {hasMask && (
        <defs>
          {glyphs.map(
            (g, i) =>
              g.outline && (
                // mask space = the translated glyph group's space, so the glyph's own coordinates apply
                <mask id={`${id}-o${i}`} key={i} maskUnits="userSpaceOnUse">
                  <rect x={-STROKE} y={-STROKE} width={g.w + 2 * STROKE} height={HGT + 2 * STROKE} fill="white" />
                  <g fill="none" stroke="black" strokeWidth={OUTLINE_INNER} strokeLinejoin="round">
                    {g.d.map((d, j) => (
                      <path d={d} key={j} />
                    ))}
                  </g>
                </mask>
              ),
          )}
          {bars?.length ? (
            <mask id={`${id}-bars`} maskUnits="userSpaceOnUse">
              <rect x={-STROKE} y={-STROKE} width={W + 2 * STROKE} height={HGT + 2 * STROKE} fill="white" />
              {bars.map((b) => (
                <rect key={b} x={-STROKE} y={b * 100 - 2} width={W + 2 * STROKE} height={4} fill="black" />
              ))}
            </mask>
          ) : null}
        </defs>
      )}
      <g
        mask={bars?.length ? `url(#${id}-bars)` : undefined}
        fill="none"
        stroke="currentColor"
        strokeWidth={STROKE}
        strokeLinejoin="round"
        strokeLinecap="butt"
      >
        {glyphs.map((g, i) => (
          <g key={i} transform={`translate(${g.x} 0)`} mask={g.outline ? `url(#${id}-o${i})` : undefined}>
            {g.d.map((d, j) => (
              <path d={d} key={j} />
            ))}
          </g>
        ))}
      </g>
    </svg>
  );
}
