/** Ticker marquee for the second tagline (jj_03). CSS-only; reduced-motion
    freezes it via the global media rule. */
export function Ticker({ items }: { items: string[] }) {
  const row = items.flatMap((t) => t.split("|").map((s) => s.trim())).filter(Boolean);
  const strip = [...row, ...row, ...row, ...row];
  return (
    <div className="overflow-hidden border-y border-line bg-navy-700 py-3 select-none" aria-hidden>
      <div className="flex gap-8 whitespace-nowrap animate-ticker w-max">
        {strip.map((t, i) => (
          <span key={i} className="flex items-center gap-8">
            <span
              className="font-display font-bold uppercase text-sm tracking-wide text-ink/80"
              style={{ fontStretch: "115%" }}
            >
              {t}
            </span>
            <span className="text-(--accent-fg)">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
