import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "motion/react";

const GLYPHS = "01<>/[]_#";

/** Characters cycle then settle left-to-right. Gated on document.fonts.ready;
    total run ≤ 600ms; sets data-decode-done for the QA harness. */
export function Decode({ text, className = "", as: Tag = "span" }: { text: string; className?: string; as?: "span" | "h1" | "h2" | "p" }) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-8% 0px" });
  const reduced = useReducedMotion();
  const [out, setOut] = useState(reduced ? text : "");
  const [done, setDone] = useState(reduced);
  useEffect(() => {
    if (!inView) return;
    if (reduced) {
      setOut(text);
      setDone(true);
      return;
    }
    let iv: ReturnType<typeof setInterval>;
    let cancelled = false;
    const total = 600;
    const scrambleMs = 180;
    const perChar = Math.max(4, (total - scrambleMs) / Math.max(1, text.length));
    document.fonts.ready.then(() => {
      if (cancelled) return;
      let frame = 0;
      iv = setInterval(() => {
        frame++;
        const settled = Math.floor((frame * 16 - scrambleMs) / perChar);
        setOut(
          text
            .split("")
            .map((ch, i) => {
              if (ch === " ") return " ";
              if (i <= settled) return ch;
              return GLYPHS[(i * 7 + frame * 3) % GLYPHS.length];
            })
            .join(""),
        );
        if (settled >= text.length) {
          clearInterval(iv);
          setDone(true);
        }
      }, 16);
    });
    return () => {
      cancelled = true;
      clearInterval(iv);
    };
  }, [inView, text, reduced]);
  return (
    <Tag ref={ref as never} className={`relative inline-block ${className}`} data-decode-done={done || undefined}>
      <span className="sr-only">{text}</span>
      <span aria-hidden className="invisible">
        {text}
      </span>
      <span aria-hidden className="absolute inset-0">
        {out}
      </span>
    </Tag>
  );
}
