import type { ReactNode } from "react";

/** Display quote with a giant accent open-quote ghosted behind. */
export function Pullquote({ children, cite }: { children: ReactNode; cite?: string }) {
  return (
    <figure className="relative py-6 pl-8 border-l-2 border-(--accent)">
      <span
        aria-hidden
        className="absolute -top-8 -left-4 font-display font-black text-(--accent) select-none"
        style={{ fontSize: 160, opacity: 0.08, lineHeight: 1 }}
      >
        “
      </span>
      <blockquote
        className="font-display font-bold text-[clamp(24px,3vw,40px)] leading-[1.1] tracking-tight"
        style={{ fontStretch: "108%" }}
      >
        {children}
      </blockquote>
      {cite && <figcaption className="mono-label mt-3 opacity-60">{cite}</figcaption>}
    </figure>
  );
}
