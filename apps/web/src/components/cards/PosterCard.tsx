import type { ReactNode } from "react";
import { Halftone } from "@/textures";

/** T09/S12 poster: one wide word EdgeCropped, 3-corner label rail, halftone
    corner, inset frame; hover: outline ghost offsets. */
export function PosterCard({
  word,
  index,
  meta,
  sub,
  mark,
  href,
  children,
  className = "",
}: {
  word: string;
  index?: string;
  meta?: string;
  sub?: string;
  mark?: ReactNode;
  href?: string;
  children?: ReactNode;
  className?: string;
}) {
  const inner = (
    <div className={`group relative bg-navy-900 text-ink overflow-hidden aspect-[4/5] ${className}`}>
      <Halftone opacity={0.08} corner="100% 100%" />
      <div className="absolute inset-3 border border-ink/15 pointer-events-none" />
      {index && <span className="absolute top-5 left-5 t-micro raise text-(--accent-fg)">{"//"}{index}</span>}
      {meta && <span className="absolute top-5 right-5 t-micro opacity-50">{meta}</span>}
      {sub && <span className="absolute bottom-5 right-5 t-micro opacity-50">{sub}</span>}
      {mark && <span aria-hidden className="absolute top-11 right-5">{mark}</span>}
      <span className="absolute bottom-4 left-0 right-0 t-wide uppercase leading-[0.85] text-[clamp(30px,3.6vw,58px)]">
        <span className="relative block px-4">
          <span aria-hidden className="t-outline absolute left-4 top-0 opacity-0 group-hover:opacity-60 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-200 whitespace-pre-line">
            {word}
          </span>
          <span className="relative whitespace-pre-line">{word}</span>
        </span>
      </span>
      {children}
    </div>
  );
  return href ? (
    <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer noopener" className="block">
      {inner}
    </a>
  ) : (
    inner
  );
}
