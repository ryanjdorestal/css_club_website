import type { ReactNode } from "react";

export type Spec = { k: string; v: string };

/** Spec-sheet card (jj_11 TRA/D350): title, body, then a mono label row.
    Cards are spec sheets, not glass. */
export function SpecCard({
  title,
  eyebrow,
  children,
  specs = [],
  image,
  imageAlt = "",
  footer,
  className = "",
}: {
  title: string;
  eyebrow?: string;
  children?: ReactNode;
  specs?: Spec[];
  image?: string;
  imageAlt?: string;
  footer?: ReactNode;
  className?: string;
}) {
  return (
    <article
      className={`group relative flex flex-col border border-line bg-navy-500/40 rounded-(--radius-md) overflow-hidden transition-colors duration-200 hover:border-(--accent) ${className}`}
    >
      {image && (
        <div className="aspect-[16/10] overflow-hidden border-b border-line bg-navy-800">
          <img
            src={image}
            alt={imageAlt}
            loading="lazy"
            className="w-full h-full object-cover object-top"
          />
        </div>
      )}
      <div className="flex flex-col gap-2 p-5 grow">
        {eyebrow && <span className="mono-label text-(--accent-fg)">{eyebrow}</span>}
        <h3
          className="font-display font-bold uppercase text-xl leading-tight"
          style={{ fontStretch: "110%" }}
        >
          {title}
        </h3>
        {children && <div className="text-sm text-muted leading-relaxed">{children}</div>}
        {footer && <div className="mt-auto pt-3">{footer}</div>}
      </div>
      {specs.length > 0 && (
        <dl className="grid grid-cols-2 sm:grid-cols-3 border-t border-line">
          {specs.map((s) => (
            <div key={s.k} className="px-5 py-2.5 border-r border-line last:border-r-0">
              <dt className="mono-label text-muted">{s.k}</dt>
              <dd className="mono-label text-ink mt-0.5">{s.v}</dd>
            </div>
          ))}
        </dl>
      )}
    </article>
  );
}
