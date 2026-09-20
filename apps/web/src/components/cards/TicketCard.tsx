import type { ReactNode } from "react";
import { BarcodeStrip } from "../BarcodeStrip";

/** jj_10 ticket/stub: two-tone split (navy top / paper bottom), mono model
    label, meta rows, barcode, corner notches. For Events and Apps. */
export function TicketCard({
  model,
  title,
  image,
  imageAlt = "",
  body,
  rows = [],
  footer,
  className = "",
}: {
  model: string;                    // "EVT-S25-01"
  title: string;
  image?: string;
  imageAlt?: string;
  body?: ReactNode;
  rows?: { k: string; v: string }[];
  footer?: ReactNode;
  className?: string;
}) {
  return (
    <article className={`notch lift flex flex-col bg-paper text-ink-on-paper ${className}`}>
      <div className="bg-navy-800 text-ink p-4 pb-3">
        <div className="flex items-center justify-between gap-3 mb-1.5">
          <span className="mono-label text-(--accent-fg)">{model}</span>
          <span aria-hidden className="w-2 h-2 rounded-full bg-(--accent)" />
        </div>
        <h3 className="font-display font-bold uppercase text-lg leading-tight" style={{ fontStretch: "110%" }}>
          {title}
        </h3>
      </div>
      {image && (
        <div className="border-y border-hairline bg-navy-900 aspect-[16/9] overflow-hidden">
          <img src={image} alt={imageAlt} loading="lazy" className="w-full h-full object-cover object-top" />
        </div>
      )}
      <div className="grow p-4 pt-3">
        {body && <div className="text-sm text-muted-on-paper leading-relaxed mb-3">{body}</div>}
        {rows.length > 0 && (
          <dl>
            {rows.map((r) => (
              <div key={r.k} className="flex justify-between gap-3 py-1.5 border-b border-hairline last:border-0">
                <dt className="mono-label text-muted-on-paper">{r.k}</dt>
                <dd className="mono-label text-ink-on-paper text-right">{r.v}</dd>
              </div>
            ))}
          </dl>
        )}
        {footer && <div className="pt-3">{footer}</div>}
      </div>
      <div className="px-4 pb-3 text-ink-on-paper/70">
        <BarcodeStrip seed={model + title} height={18} />
        <p className="mono-label opacity-50 mt-1">{model} · JJCSS</p>
      </div>
    </article>
  );
}
