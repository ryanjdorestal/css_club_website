import type { ReactNode } from "react";
import { BarcodeStrip } from "../BarcodeStrip";
import { Tab, chamferStyle, ChamferStub, Brackets } from "../frame";
import { hexId } from "@/lib/readouts";

/** T11 + T08 ticket: side tab w/ rotated ID, display title, bracketed image,
    _key/value rail, barcode + HASH, chamfer w/ accent stub. Hover: brackets
    close, > OPEN_TICKET slides over the barcode. */
export function TicketCard({
  model,
  title,
  image,
  imageAlt = "",
  body,
  rows = [],
  footer,
  href,
  className = "",
}: {
  model: string;
  title: string;
  image?: string;
  imageAlt?: string;
  body?: ReactNode;
  rows?: { k: string; v: string }[];
  footer?: ReactNode;
  href?: string;
  className?: string;
}) {
  return (
    <article className={`group relative flex flex-col bg-paper text-ink-on-paper pl-[18px] ${className}`} style={chamferStyle(16)}>
      <Tab label={model} />
      <ChamferStub px={16} />
      <div className="bg-navy-800 text-ink px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <h3 className="t-h2 !text-[19px] uppercase leading-tight">{title}</h3>
          <span aria-hidden className="w-1.5 h-1.5 bg-(--accent) shrink-0" />
        </div>
        <p className="t-micro mt-1.5 opacity-55">
          {"//"}
          {model} · HASH: {hexId(model + title)}
        </p>
      </div>
      {image && (
        <div className="relative border-y border-hairline bg-navy-900 aspect-[16/9] overflow-hidden p-1.5">
          <Brackets size={10} inset={4} />
          <img src={image} alt={imageAlt} loading="lazy" className="w-full h-full object-cover object-top" />
        </div>
      )}
      <div className="grow px-4 py-3">
        {body && (
          <div className="text-[13px] leading-relaxed mb-2.5" style={{ color: "var(--color-muted-on-paper)" }}>
            {body}
          </div>
        )}
        {rows.length > 0 && (
          <dl>
            {rows.map((r) => (
              <div key={r.k} className="flex justify-between items-baseline gap-3 py-1.5 border-b border-hairline last:border-0">
                <dt className="t-micro" style={{ color: "var(--color-muted-on-paper)" }}>
                  _{r.k.toLowerCase().replace(/\s+/g, "_")}
                </dt>
                <dd className="t-label raise !tracking-[0.06em] text-right font-semibold text-ink-on-paper">{r.v}</dd>
              </div>
            ))}
          </dl>
        )}
        {footer && <div className="pt-2.5">{footer}</div>}
      </div>
      <div className="relative px-4 pb-3 text-ink-on-paper/70">
        <BarcodeStrip seed={model + title} height={16} />
        <p className="t-micro mt-1">{model} · JJCSS</p>
        {href && (
          <a
            href={href}
            className="absolute inset-0 flex items-center justify-center bg-paper opacity-0 group-hover:opacity-100 transition-opacity duration-200 t-label raise text-(--accent-paper)"
          >
            &gt; OPEN_TICKET ↗
          </a>
        )}
      </div>
    </article>
  );
}
