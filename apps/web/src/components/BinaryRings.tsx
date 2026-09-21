/** The binary rings — thin VT323 digits on circular paths, faint, drifting
    slowly (the old site's header art, recreated procedurally; jj_01).
    Replaces the generic dot-grid. Background texture only. */

const RINGS = [
  { r: 130, x: "12%", y: "18%", dur: 120, dir: 1, text: "01001101 01001010 01000011 01010011 " },
  { r: 90, x: "82%", y: "12%", dur: 90, dir: -1, text: "01000011 01010011 01010011 " },
  { r: 170, x: "88%", y: "72%", dur: 150, dir: 1, text: "01001010 01001010 01000001 01011001 " },
  { r: 70, x: "8%", y: "78%", dur: 80, dir: -1, text: "01000011 01010101 01001110 01011001 " },
  { r: 110, x: "50%", y: "95%", dur: 130, dir: 1, text: "01000100 01000101 01000010 01010101 01000111 " },
];

export function BinaryRings({ opacity = 0.08 }: { opacity?: number }) {
  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden pointer-events-none select-none" style={{ opacity }}>
      {RINGS.map((ring, i) => (
        <svg
          key={i}
          className="absolute animate-ring"
          style={{
            left: ring.x,
            top: ring.y,
            width: ring.r * 2,
            height: ring.r * 2,
            marginLeft: -ring.r,
            marginTop: -ring.r,
            animationDuration: `${ring.dur}s`,
            animationDirection: ring.dir === 1 ? "normal" : "reverse",
          }}
          viewBox={`0 0 ${ring.r * 2} ${ring.r * 2}`}
        >
          <defs>
            <path
              id={`ring-${i}`}
              d={`M ${ring.r},${ring.r} m -${ring.r - 14},0 a ${ring.r - 14},${ring.r - 14} 0 1,1 ${(ring.r - 14) * 2},0 a ${ring.r - 14},${ring.r - 14} 0 1,1 -${(ring.r - 14) * 2},0`}
            />
          </defs>
          <text className="fill-ink" style={{ fontFamily: "var(--font-legacy)", fontSize: 20, letterSpacing: 4 }}>
            <textPath href={`#ring-${i}`}>{ring.text.repeat(6)}</textPath>
          </text>
        </svg>
      ))}
    </div>
  );
}
