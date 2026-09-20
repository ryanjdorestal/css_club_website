/** `01 — EVENTS` in accent mono + a 1px accent rule running to the edge. */
export function SectionIndex({ label, title }: { label: string; title?: string }) {
  return (
    <div className="flex items-center gap-4 mb-10 md:mb-14">
      <span className="mono-label text-(--accent-ink) whitespace-nowrap shrink-0">
        {label}
        {title ? ` — ${title}` : ""}
      </span>
      <span aria-hidden className="h-px grow bg-(--accent) opacity-40" />
    </div>
  );
}
