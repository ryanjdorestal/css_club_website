/** §6 texture layer — all ≤ 10% opacity, max two per band. CSS/SVG only. */
import { useMemo } from "react";
import kb from "@data/kb.json";
import { CubeWireSvg } from "@/components/type/Wireframe";

const wrap = "absolute inset-0 pointer-events-none";

export function DotGrid({ opacity = 0.07 }: { opacity?: number }) {
  return (
    <div
      aria-hidden
      className={wrap}
      style={{
        opacity,
        backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1.2px)",
        backgroundSize: "24px 24px",
      }}
    />
  );
}

export function HairGrid({ opacity = 0.06 }: { opacity?: number }) {
  return (
    <div
      aria-hidden
      className={wrap}
      style={{
        opacity,
        backgroundImage:
          "linear-gradient(90deg, currentColor 1px, transparent 1px), linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)",
        backgroundSize: "96px 100%, 100% 96px, 24px 100%",
        backgroundPosition: "0 0, 0 0, 0 0",
        maskImage: "linear-gradient(#000 60%, transparent)",
      }}
    />
  );
}

/** Topographic contour lines — deterministic pseudo-noise wobble circles. */
export function Contour({ opacity = 0.05, lines = 24 }: { opacity?: number; lines?: number }) {
  const paths = useMemo(() => {
    const out: string[] = [];
    for (let i = 0; i < lines; i++) {
      const r = 24 + i * 14;
      const pts: string[] = [];
      for (let a = 0; a <= 360; a += 12) {
        const rad = (a * Math.PI) / 180;
        const wob = Math.sin(a * 0.09 + i * 1.7) * 9 + Math.cos(a * 0.05 + i * 0.9) * 7;
        pts.push(`${400 + Math.cos(rad) * (r + wob)},${300 + Math.sin(rad) * (r + wob) * 0.72}`);
      }
      out.push(`M${pts.join(" L")} Z`);
    }
    return out;
  }, [lines]);
  return (
    <svg aria-hidden className={wrap} style={{ opacity }} viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice">
      {paths.map((d, i) => (
        <path key={i} d={d} fill="none" stroke="currentColor" strokeWidth="0.7" />
      ))}
    </svg>
  );
}

/** Halftone raster masked to one corner; breathes ±4% over 8s. */
export function Halftone({ opacity = 0.09, corner = "100% 0" }: { opacity?: number; corner?: string }) {
  return (
    <div
      aria-hidden
      className={`${wrap} halftone-breathe`}
      style={{
        opacity,
        backgroundImage: "radial-gradient(circle, currentColor 1.1px, transparent 1.3px)",
        backgroundSize: "6px 6px",
        WebkitMaskImage: `radial-gradient(at ${corner}, #000, transparent 62%)`,
        maskImage: `radial-gradient(at ${corner}, #000, transparent 62%)`,
      }}
    />
  );
}

export function Hatch({ className = "", opacity = 0.3, height = 16 }: { className?: string; opacity?: number; height?: number }) {
  return (
    <div
      aria-hidden
      className={className}
      style={{
        height,
        opacity,
        backgroundImage: "repeating-linear-gradient(-45deg, currentColor 0 1px, transparent 1px 6px)",
      }}
    />
  );
}

export function Scanlines({ opacity = 0.03 }: { opacity?: number }) {
  return (
    <div
      aria-hidden
      className={wrap}
      style={{
        opacity,
        backgroundImage: "repeating-linear-gradient(0deg, currentColor 0 1px, transparent 1px 4px)",
      }}
    />
  );
}

/** Vertical columns of KB question text drifting (hero right third). */
export function CodeRain({ opacity = 0.045, className = "" }: { opacity?: number; className?: string }) {
  const lines = useMemo(() => {
    const qs = kb.entries
      .flatMap((e) => e.keywords)
      .join(" · ")
      .toUpperCase();
    return Array.from({ length: 6 }, (_, i) => qs.slice(i * 40) + " · " + qs);
  }, []);
  return (
    <div aria-hidden className={`${wrap} overflow-hidden ${className}`} style={{ opacity }}>
      <div className="flex gap-8 h-[200%] rain-drift" style={{ justifyContent: "flex-end" }}>
        {lines.map((l, i) => (
          <span key={i} className="t-micro whitespace-pre leading-[1.9]" style={{ writingMode: "vertical-rl", letterSpacing: "0.3em" }}>
            {l}
          </span>
        ))}
      </div>
    </div>
  );
}

/** The cube edge wireframe at watermark scale (Apps band). */
export function CubeWire({ opacity = 0.06, width = "32vw", side = "right" as "left" | "right" }) {
  return (
    <div aria-hidden className={wrap} style={{ opacity }}>
      <CubeWireSvg
        className="absolute"
        stroke="currentColor"
        {...({ style: { width, top: "6%", [side]: `calc(-0.2 * ${width})`, position: "absolute" } } as object)}
      />
    </div>
  );
}
