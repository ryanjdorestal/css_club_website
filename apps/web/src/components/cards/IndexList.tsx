import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { RevealGroup, RevealItem } from "@/motion/Reveal";

export type IndexRowData = {
  index?: string;       // "01"
  title: string;
  dek?: string;
  meta?: string;        // right-side mono (date, domain, count)
  chip?: string;        // status chip
  href?: string;
  onClick?: () => void;
};

/** rhecwb bulletin / jj_04: hairline rows `01 — Title — dek — meta — ↗`.
    Hover translates the row 8px and brightens the arrow. */
export function IndexList({ rows, className = "" }: { rows: IndexRowData[]; className?: string }) {
  return (
    <RevealGroup className={`border-t border-(--tone-line) ${className}`}>
      {rows.map((r, i) => (
        <RevealItem key={r.title + i}>
          <IndexRow {...r} index={r.index ?? String(i + 1).padStart(2, "0")} />
        </RevealItem>
      ))}
    </RevealGroup>
  );
}

export function IndexRow({ index, title, dek, meta, chip, href, onClick }: IndexRowData) {
  const body = (
    <div className="group flex items-center gap-4 md:gap-6 py-4 border-b border-(--tone-line) transition-transform duration-300 hover:translate-x-2 cursor-pointer">
      <span className="mono-label text-(--accent-ink) shrink-0 w-8">{index}</span>
      <div className="grow min-w-0">
        <p className="font-display font-bold text-base md:text-lg leading-tight" style={{ fontStretch: "108%" }}>
          {title}
        </p>
        {dek && <p className="text-sm opacity-60 mt-0.5 line-clamp-1">{dek}</p>}
      </div>
      {chip && (
        <span className="mono-label border border-(--accent) text-(--accent-ink) rounded-full px-2.5 py-1 shrink-0">
          {chip}
        </span>
      )}
      {meta && <span className="mono-label opacity-50 shrink-0 hidden sm:block">{meta}</span>}
      <ArrowUpRight size={16} className="shrink-0 opacity-40 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1" />
    </div>
  );
  if (href?.startsWith("http")) {
    return (
      <a href={href} target="_blank" rel="noreferrer noopener" className="block">
        {body}
      </a>
    );
  }
  if (href) return <Link to={href} className="block">{body}</Link>;
  return <div onClick={onClick}>{body}</div>;
}
