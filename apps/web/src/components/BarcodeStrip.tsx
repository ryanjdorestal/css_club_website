/** SVG barcode from a string hash — the jj_10 ticket detail. Deterministic. */
export function BarcodeStrip({ seed, height = 22, className = "" }: { seed: string; height?: number; className?: string }) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  }
  const bars: { x: number; w: number }[] = [];
  let x = 0;
  let state = h >>> 0;
  while (x < 100) {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    const w = 0.6 + (state % 5) * 0.55;
    const gap = 0.5 + ((state >> 8) % 4) * 0.5;
    bars.push({ x, w });
    x += w + gap;
  }
  return (
    <svg aria-hidden viewBox="0 0 100 10" preserveAspectRatio="none" className={className} style={{ height, width: "100%", display: "block" }}>
      {bars.map((b, i) => (
        <rect key={i} x={b.x} y="0" width={b.w} height="10" fill="currentColor" />
      ))}
    </svg>
  );
}
