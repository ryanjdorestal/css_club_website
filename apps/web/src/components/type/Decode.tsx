import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "motion/react";

const GLYPHS = "01<>/[]_#";

/** Characters cycle through code glyphs then settle left-to-right. */
export function Decode({ text, className = "", as: Tag = "span" }: { text: string; className?: string; as?: "span" | "h1" | "h2" | "p" }) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-8% 0px" });
  const reduced = useReducedMotion();
  const [out, setOut] = useState(reduced ? text : "");
  useEffect(() => {
    if (!inView) return;
    if (reduced) { setOut(text); return; }
    let frame = 0;
    const iv = setInterval(() => {
      frame++;
      const settled = Math.floor((frame * 16 - 350) / 18);
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
      if (settled >= text.length) clearInterval(iv);
    }, 16);
    return () => clearInterval(iv);
  }, [inView, text, reduced]);
  // reserve space with an invisible copy so decode never shifts layout
  return (
    <Tag ref={ref as never} className={`relative inline-block ${className}`} aria-label={text}>
      <span aria-hidden className="invisible">{text}</span>
      <span aria-hidden className="absolute inset-0">{out}</span>
    </Tag>
  );
}
