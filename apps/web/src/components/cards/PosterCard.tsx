import type { ReactNode } from "react";

/** jj_05/jj_06 poster: dark fill, one giant word, inset hairline frame,
    mono index corner. Hover lifts frame, shifts glyph. */
export function PosterCard({
  word,
  index,
  meta,
  href,
  children,
  className = "",
}: {
  word: string;
  index?: string;
  meta?: string;
  href?: string;
  children?: ReactNode;
  className?: string;
}) {
  const inner = (
    <div className={`group relative bg-navy-900 text-ink overflow-hidden aspect-[4/5] ${className}`}>
      <div className="absolute inset-3 border border-ink/20 transition-transform duration-300 group-hover:-translate-y-1" />
      {index && <span className="absolute top-6 left-6 mono-label text-(--accent-fg)">{index}</span>}
      {meta && <span className="absolute top-6 right-6 mono-label opacity-50">{meta}</span>}
      <span
        className="absolute bottom-5 left-5 right-5 font-display font-black uppercase leading-[0.85] tracking-tight text-[clamp(28px,3.4vw,56px)] transition-transform duration-300 group-hover:translate-x-2"
        style={{ fontStretch: "118%" }}
      >
        {word}
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
