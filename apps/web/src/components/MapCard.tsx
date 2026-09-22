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

/** idle → probing (can we reach Google at all?) → mounted (iframe in the DOM) → ok | fallback. */
type State = "idle" | "probing" | "mounted" | "ok" | "fallback";

/** Is the maps host reachable from this browser?
 *
 *  The iframe cannot tell us. Its onLoad fires for the browser's own network-error page as well as
 *  for the real map, and that page is cross-origin, so contentDocument is null either way — which
 *  is how a blocked network ended up showing a grey box with a broken-file glyph instead of the
 *  fallback this component promises. A favicon is a request we can actually read the result of.
 *  It is the same third party the embed contacts, and only when the footer scrolls into view. */
function probeMapsHost(signal: { cancelled: boolean }, onAnswer: (reachable: boolean) => void): () => void {
  const probe = new Image();
  const answer = (reachable: boolean) => {
    if (signal.cancelled) return;
    signal.cancelled = true;
    window.clearTimeout(timer);
    onAnswer(reachable);
  };
  const timer = window.setTimeout(() => answer(false), PROBE_MS);
  probe.onload = () => answer(true);
  probe.onerror = () => answer(false);
  probe.src = `https://maps.google.com/favicon.ico?cachebust=${Date.now()}`;
  return () => {
    signal.cancelled = true;
    window.clearTimeout(timer);
    probe.onload = null;
    probe.onerror = null;
  };
}

const PROBE_MS = 4000;
const EMBED_MS = 8000;

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
      {/* Hidden on phones: the OPEN_IN_MAPS chip sits on this line at 390 px. */}
      <span className="absolute left-3 top-3 t-micro opacity-40 hidden sm:block">MAP_TILE · OFFLINE_FALLBACK</span>
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
    setState("probing");
    return probeMapsHost({ cancelled: false }, (reachable) => setState(reachable ? "mounted" : "fallback"));
  }, [inView]);

  // Reachable but still not painted: something between here and the embed is slow or filtering it.
  useEffect(() => {
    if (state !== "mounted") return;
    const t = window.setTimeout(() => setState((s) => (s === "mounted" ? "fallback" : s)), EMBED_MS);
    return () => window.clearTimeout(t);
  }, [state]);

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
        {(state === "mounted" || state === "ok") && (
          <iframe
            src={EMBED}
            title="John Jay College on Google Maps"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            onError={() => setState("fallback")}
            onLoad={() => setState("ok")}
            className="map-dark absolute inset-0 w-full h-full border-0 pointer-events-none"
            style={{ opacity: state === "ok" ? 1 : 0, transition: "opacity 0.4s" }}
          />
        )}
        {/* Same rule as the nav OS button: the words on the chip are the name, and the rest of
            the sentence is screen-reader-only rather than an aria-label that would replace them. */}
        <a href={LINK} target="_blank" rel="noopener noreferrer" className="absolute inset-0 z-10">
          <span className="absolute top-3 right-3 inline-flex items-center gap-2 border border-(--accent) px-3 py-1.5 t-micro raise text-(--accent-fg) bg-navy-900/85 transition-colors group-hover:bg-(--accent) group-hover:text-(--accent-contrast)">
            <span aria-hidden>[</span>OPEN_IN_MAPS<span aria-hidden> ↗</span>
            <span aria-hidden>]</span>
          </span>
          <span className="sr-only"> — {brand.collegeShort} on Google Maps (opens in a new tab)</span>
        </a>
      </div>
    </div>
  );
}
