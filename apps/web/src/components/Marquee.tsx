/** True infinite marquee (two copies, translateX(-50%)). Replaces Ticker. */
export function Marquee({ items }: { items: string[] }) {
  const strip = (
    <>
      {items.map((t, i) => (
        <span key={i} className="flex items-center gap-8 shrink-0">
          <span className="font-display font-bold uppercase text-sm tracking-wide opacity-80" style={{ fontStretch: "115%" }}>
            {t}
          </span>
          <span className="text-(--accent-fg)">✦</span>
        </span>
      ))}
    </>
  );
  return (
    <div aria-hidden data-tone="dark-2" className="overflow-hidden border-y border-line py-3.5 select-none">
      <div className="marquee-track flex gap-8 w-max">
        <div className="flex gap-8 shrink-0">{strip}</div>
        <div className="flex gap-8 shrink-0">{strip}</div>
      </div>
    </div>
  );
}
