import { useEffect, useRef, useState } from "react";
import { useInView } from "motion/react";
import { brand } from "@brand/brand.config";
import { Brackets } from "./frame";
import { DotGrid } from "@/textures";
import { Crosshair } from "@/sigils";

/** Footer map (run 6 §3.3), modelled on jjay.cuny.edu's footer: a keyless
    Google Maps embed of the campus inside brackets with a //LOCATION rail.
    Dark treatment (CSS filter) so it never blows a white hole in the footer;
    on hover it "lights up". The whole card links to Google Maps; the iframe
    is pointer-events:none so scroll is never hijacked.
    Tier 1 / offline: the iframe mounts only when the card scrolls into view;
    if it hasn't loaded in 4 s, or navigator.onLine is false, a DotGrid +
    Crosshair panel with the same link shows instead. Never a grey box. */

const EMBED = `https://www.google.com/maps?q=${brand.campus.mapsQuery}&z=16&output=embed`;
const LINK = `https://maps.google.com/?q=${brand.campus.mapsQuery}`;
const COORDS = `${brand.campus.lat.toFixed(4)}° N / ${Math.abs(brand.campus.lng).toFixed(4)}° W`;

type State = "idle" | "loading" | "ok" | "fallback";

function Fallback() {
  return (
    <div aria-hidden className="absolute inset-0 bg-navy-800 text-teal">
      <DotGrid opacity={0.12} />
      <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2">
        <Crosshair size={28} />
        <span className="t-micro raise opacity-70">
          {brand.collegeShort.toUpperCase()} · {COORDS}
        </span>
      </span>
      <span className="absolute left-3 top-3 t-micro opacity-40">MAP_TILE · OFFLINE_FALLBACK</span>
    </div>
  );
}

export function MapCard({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "200px 0px" });
  const [state, setState] = useState<State>("idle");
  useEffect(() => {
    if (!inView) return;
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      setState("fallback");
      return;
    }
    setState("loading");
    const t = setTimeout(() => setState((s) => (s === "loading" ? "fallback" : s)), 4000);
    return () => clearTimeout(t);
  }, [inView]);

  return (
    <div ref={ref} className={`group relative ${className}`} data-map={state}>
      <div className="flex items-center justify-between t-micro opacity-55 mb-2 px-0.5">
        <span>
          {"//"}LOCATION · {COORDS}
        </span>
        <span className="tnum hidden sm:inline">JJ_CAMPUS · 524_W_59</span>
      </div>
      <div className="relative border border-line overflow-hidden h-[220px] md:h-[300px] bg-navy-800">
        <Brackets size={12} inset={-1} className="z-20" />
        {state !== "ok" && <Fallback />}
        {(state === "loading" || state === "ok") && (
          <iframe
            src={EMBED}
            title="John Jay College on Google Maps"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            onLoad={() => setState("ok")}
            className="map-dark absolute inset-0 w-full h-full border-0 pointer-events-none"
            style={{ opacity: state === "ok" ? 1 : 0, transition: "opacity 0.4s" }}
          />
        )}
        <a href={LINK} target="_blank" rel="noopener noreferrer" className="absolute inset-0 z-10" aria-label={`Open ${brand.collegeShort} on Google Maps`}>
          <span className="absolute top-3 right-3 inline-flex items-center gap-2 border border-(--accent) px-3 py-1.5 t-micro raise text-(--accent-fg) bg-navy-900/85 transition-colors group-hover:bg-(--accent) group-hover:text-(--accent-contrast)">
            <span>[</span>OPEN_IN_MAPS ↗<span>]</span>
          </span>
        </a>
      </div>
    </div>
  );
}
