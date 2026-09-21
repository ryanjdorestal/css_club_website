/** Ticker: mono-display caps (Martian Mono, 12 px), // separators, ▮ block glyphs. */
export function Marquee({ items }: { items: string[] }) {
  const strip = (
    <>
      {items.map((t, i) => (
        <span key={i} className="flex items-center gap-6 shrink-0">
          <span className="t-label raise t-mono-display !text-[12px] !tracking-[0.12em]">{t.toUpperCase()}</span>
          <span aria-hidden className="t-micro raise text-(--accent-fg)">
            ▮
          </span>
          <span aria-hidden className="t-micro opacity-40">
            {"//"}
          </span>
        </span>
      ))}
    </>
  );
  return (
    <div aria-hidden data-tone="dark-2" className="overflow-hidden border-y border-line py-2.5 select-none">
      <div className="marquee-track flex gap-6 w-max">
        <div className="flex gap-6 shrink-0">{strip}</div>
        <div className="flex gap-6 shrink-0">{strip}</div>
      </div>
    </div>
  );
}
