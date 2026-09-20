import type { ReactNode } from "react";

/** /0N · sigil · TITLE ——— //CODE (right-aligned) */
export function SectionIndex({ label, title, sigil, code }: { label: string; title?: string; sigil?: ReactNode; code?: string }) {
  const [idx, ...rest] = label.split(" — ");
  const text = title ?? rest.join(" — ");
  return (
    <div className="flex items-center gap-3 mb-10 md:mb-14">
      <span className="t-label raise text-(--accent-ink) whitespace-nowrap shrink-0 tnum">/{idx.replace(/[^0-9A-Z]/g, "") || idx}</span>
      {sigil && <span className="shrink-0 text-(--accent-ink) opacity-80">{sigil}</span>}
      {text && <span className="t-label whitespace-nowrap shrink-0">{text.toUpperCase().replace(/ /g, "_")}</span>}
      <span aria-hidden className="h-px grow bg-(--accent) opacity-40" />
      {code && <span className="t-micro opacity-50 shrink-0">{"//"}{code}</span>}
    </div>
  );
}
