/** TraceStrip (run 9 §6.4, R9_04's EEG field): N horizontal channels drawn on a canvas,
    1 px teal on dark, amplitude = the REAL per-day count of rows in that channel over the
    last 60 days (one channel per table / module, labels on the left in mono micro), drifting
    slowly left (8 px/s; static under reduced motion). Flat channels are flat — no noise.
    aria-hidden canvas + a text summary for screen readers. */
import { useEffect, useMemo, useRef } from "react";
import type { Row } from "./OsTable";

const DAYS = 60;

function dayCounts(rows: Row[], field: string, pick?: (r: Row) => boolean): number[] {
  const out = new Array<number>(DAYS).fill(0);
  const now = Date.now();
  for (const r of rows) {
    if (pick && !pick(r)) continue;
    const raw = r[field];
    const t =
      typeof raw === "number"
        ? raw < 1e12
          ? raw * 1000
          : raw
        : typeof raw === "string"
          ? /^\d+(\.\d+)?$/.test(raw)
            ? Number(raw) * 1000
            : new Date(raw).getTime()
          : NaN;
    if (Number.isNaN(t)) continue;
    const d = Math.floor((now - t) / 86400000);
    if (d >= 0 && d < DAYS) out[DAYS - 1 - d]++;
  }
  return out;
}

export function TraceStrip({
  rows,
  field,
  channels = 4,
  groupBy = "table",
  labels,
  className = "",
  height,
}: {
  rows: Row[];
  field: string;
  channels?: number;
  groupBy?: string;
  labels?: string[];
  className?: string;
  height?: number;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const data = useMemo(() => {
    const groups = [...new Set(rows.map((r) => String(r[groupBy] ?? "all")))].slice(0, channels);
    const names = labels ?? (groups.length ? groups : ["ALL"]);
    const series = names.map((_, i) => dayCounts(rows, field, labels ? undefined : (r) => String(r[groupBy] ?? "all") === groups[i]));
    return { names, series };
  }, [rows, field, channels, groupBy, labels]);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    const start = performance.now();
    const draw = (now: number) => {
      const w = (c.width = c.clientWidth * devicePixelRatio);
      const hgt = (c.height = c.clientHeight * devicePixelRatio);
      ctx.clearRect(0, 0, w, hgt);
      const n = data.series.length || 1;
      const lane = hgt / n;
      const step = w / (DAYS - 1);
      const drift = reduced ? 0 : (((now - start) / 1000) * 8 * devicePixelRatio) % step;
      ctx.lineWidth = devicePixelRatio;
      ctx.strokeStyle = getComputedStyle(c).color;
      data.series.forEach((s, i) => {
        const max = Math.max(1, ...s);
        const base = lane * i + lane * 0.8;
        ctx.beginPath();
        for (let x = 0; x < DAYS; x++) {
          const px = x * step - drift;
          const py = base - (s[x] / max) * lane * 0.6;
          if (x === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
      });
      if (!reduced) raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [data]);
  const summary = data.names.map((n, i) => `${n}: ${data.series[i].reduce((a, v) => a + v, 0)} in ${DAYS} days`).join("; ");
  return (
    <div className={`relative text-teal pointer-events-none ${className}`} style={height ? { height } : undefined}>
      <canvas ref={ref} aria-hidden className="absolute inset-0 w-full h-full" />
      <ul aria-hidden className="absolute left-0 inset-y-0 flex flex-col justify-around t-micro opacity-70">
        {data.names.map((n, i) => (
          <li key={n} className="tnum">
            {String(n).slice(0, 3).toUpperCase()}-{String(i + 1).padStart(2, "0")}
          </li>
        ))}
      </ul>
      <p className="sr-only">Activity traces — {summary}</p>
    </div>
  );
}
