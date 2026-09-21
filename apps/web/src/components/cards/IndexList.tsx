import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";
import { RevealGroup, RevealItem } from "@/motion/Reveal";
import { StatusChip } from "./StatusChip";

type IndexRowData = {
  index?: string;
  title: string;
  dek?: string;
  meta?: string;
  chip?: string;
  href?: string;
  sigil?: ReactNode;
  onClick?: () => void;
  bracket?: boolean; // [n] style index
};

/** T04 /03 SELECTED WORK rows: /01 · sigil · title · dek · ↗.
    Hover: bg +3%, arrow becomes → OPEN_. */
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

function IndexRow({ index, title, dek, meta, chip, href, sigil, onClick, bracket }: IndexRowData) {
  const body = (
    <div className="group relative flex items-center gap-4 md:gap-5 py-3.5 border-b border-(--tone-line) transition-colors duration-200 hover:bg-current/[0.03] cursor-pointer px-1">
      <span className="t-label raise text-(--accent-ink) shrink-0 w-10 tnum">{bracket ? `[${index}]` : `/${index}`}</span>
      {sigil && <span className="shrink-0 opacity-70">{sigil}</span>}
      <div className="grow min-w-0">
        <p className="t-h3 !font-medium leading-tight" style={{ textWrap: "balance" }}>
          {title}
        </p>
        {dek && <p className="t-micro opacity-55 mt-1 line-clamp-2 normal-case tracking-[0.04em]">{dek}</p>}
      </div>
      {chip && <StatusChip state={chip.toLowerCase() === "live" ? "live" : chip.toLowerCase() === "planned" ? "idle" : "archived"} label={chip} />}
      {meta && <span className="t-micro opacity-50 shrink-0 hidden sm:block tnum">{meta}</span>}
      <span className="shrink-0 w-14 text-right">
        <ArrowUpRight size={14} className="inline opacity-40 group-hover:hidden" />
        <span className="hidden group-hover:inline t-micro raise text-(--accent-ink)">→ OPEN_</span>
      </span>
    </div>
  );
  if (href?.startsWith("http"))
    return (
      <a href={href} target="_blank" rel="noreferrer noopener" className="block">
        {body}
      </a>
    );
  if (href)
    return (
      <Link to={href} className="block">
        {body}
      </Link>
    );
  return <div onClick={onClick}>{body}</div>;
}
