import type { ReactNode } from "react";
import { Link } from "react-router-dom";

/** rhecwb partner slot: dashed frame, "Slot 01 — Open", a real action.
    Makes absence look intended. Never an empty band, never fake data. */
export function SlotCard({
  n,
  label = "Open",
  action,
  href,
  className = "",
}: {
  n: string;
  label?: string;
  action?: ReactNode;
  href?: string;
  className?: string;
}) {
  const inner = (
    <div
      className={`flex flex-col justify-between border border-dashed border-(--tone-line) p-4 min-h-[110px] transition-colors hover:border-(--accent) ${className}`}
    >
      <span className="mono-label opacity-60">SLOT {n}</span>
      <div className="flex items-end justify-between gap-2">
        <span className="mono-label text-(--accent-ink)">{label}</span>
        {action && <span className="mono-label opacity-60">{action}</span>}
      </div>
    </div>
  );
  return href ? <Link to={href} className="block">{inner}</Link> : inner;
}
