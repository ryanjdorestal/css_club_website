import { Link } from "react-router-dom";
import { Perforation, Brackets } from "../frame";

/** Dashed slot: SLOT_02 · [ OPEN ] bracket CTA; 40% → 100% on hover. */
export function SlotCard({
  n,
  label = "OPEN",
  action,
  href,
  className = "",
}: {
  n: string;
  label?: string;
  action?: string;
  href?: string;
  className?: string;
}) {
  const inner = (
    <div className={`group relative flex flex-col justify-between border border-dashed border-(--tone-line) p-4 min-h-[110px] opacity-40 hover:opacity-100 transition-opacity duration-200 ${className}`}>
      <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"><Brackets size={10} inset={3} /></span>
      <Perforation className="absolute top-0 left-3 right-3" />
      <span className="t-micro opacity-70 mt-2">SLOT_{n}</span>
      <div className="flex items-end justify-between gap-2">
        <span className="t-label raise text-(--accent-ink)">[ {label.toUpperCase().replace(/\s+/g, "_")} ]</span>
        {action && <span className="t-micro opacity-60">{action}</span>}
      </div>
    </div>
  );
  return href ? <Link to={href} className="block h-full">{inner}</Link> : inner;
}
