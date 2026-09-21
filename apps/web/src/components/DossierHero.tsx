/** The S01 "dossier hero" layer (run 9 §2.6) — sits behind/around a hero without moving
    the cube or the H1: a hairline grid at 48 px, two 1-bit halftone photo blocks (accent-tinted)
    with SEC-0N chips, one accent outline path that wanders across the hero and ends in a
    hollow registration circle (draws in on reveal), and a [ ↓ SCROLL_TO_REVEAL ] bracket
    that scrolls to the first band and hides after the first scroll. Home + Cyberhounds only. */
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { useLenis } from "@/motion/LenisProvider";

const wrap = "absolute inset-0 pointer-events-none";

export function HairGrid48({ opacity = 0.06 }: { opacity?: number }) {
  return (
    <div
      aria-hidden
      className={wrap}
      style={{
        opacity,
        backgroundImage: "linear-gradient(90deg, currentColor 1px, transparent 1px), linear-gradient(currentColor 1px, transparent 1px)",
        backgroundSize: "48px 48px",
      }}
    />
  );
}

/** A photo as a 1-bit threshold halftone in the page accent, with the SEC chip bottom-right. */
export function HalftoneBlock({ src, sec, className = "", style }: { src: string; sec: string; className?: string; style?: React.CSSProperties }) {
  return (
    <div aria-hidden className={`absolute pointer-events-none overflow-hidden bg-navy-900 ${className}`} style={style}>
      {/* 1-bit threshold: grayscale + extreme contrast, then the accent multiplied over the white */}
      <img
        src={src}
        alt=""
        width={1600}
        height={900}
        loading="eager"
        decoding="async"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ filter: "grayscale(1) contrast(900%) brightness(1.1)" }}
      />
      <div className="absolute inset-0 bg-(--accent) mix-blend-multiply" />
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(circle, var(--color-navy-900) 0.9px, transparent 1.1px)",
          backgroundSize: "3px 3px",
          opacity: 0.35,
        }}
      />
      <span className="absolute bottom-0 right-0 t-micro raise bg-ink text-navy-900 px-1.5 py-1 tnum" style={{ opacity: 1 }}>
        {sec}
      </span>
    </div>
  );
}

/** The wandering 1 px accent polyline: 6–8 points, crosses the H1 once, ends in a hollow circle. */
export function OutlinePath({ points, className = "" }: { points: [number, number][]; className?: string }) {
  const reduced = useReducedMotion();
  const d = "M" + points.map(([x, y]) => `${x} ${y}`).join(" L");
  const [ex, ey] = points[points.length - 1];
  return (
    <svg aria-hidden className={`${wrap} text-(--accent) ${className}`} viewBox="0 0 1000 600" preserveAspectRatio="none">
      <motion.path
        d={d}
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        vectorEffect="non-scaling-stroke"
        initial={{ pathLength: reduced ? 1 : 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
      />
      <circle cx={ex} cy={ey} r="6" fill="none" stroke="currentColor" strokeWidth="1" vectorEffect="non-scaling-stroke" />
      <circle cx={ex} cy={ey} r="1.5" fill="currentColor" />
    </svg>
  );
}

/** [ ↓ SCROLL_TO_REVEAL ] — centred at the hero's bottom; Lenis-scrolls to the next band; gone after the first scroll. */
export function ScrollBracket({ target }: { target: string }) {
  const lenis = useLenis();
  const [gone, setGone] = useState(false);
  useEffect(() => {
    const onScroll = () => window.scrollY > 40 && setGone(true);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  if (gone) return null;
  return (
    <button
      type="button"
      onClick={() => {
        // scroll to the bottom edge of the hero (`target` = the hero section) = the first band
        const el = document.querySelector(target);
        if (!el) return;
        const y = el.getBoundingClientRect().bottom + window.scrollY - 64;
        if (lenis) lenis.scrollTo(y);
        else window.scrollTo({ top: y, behavior: "smooth" });
      }}
      className="absolute left-1/2 -translate-x-1/2 bottom-[calc(var(--hero-fin,88px)+14px)] z-20 t-mono-display uppercase text-[14px] tracking-[0.08em] text-ink/80 hover:text-ink px-4 py-2.5 border border-ink/40 hover:border-ink/70 transition-colors cursor-pointer max-md:hidden"
      style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)" }}
    >
      [ ↓ SCROLL_TO_REVEAL ]
    </button>
  );
}
