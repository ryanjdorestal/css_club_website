
/** Numbered section header with a mono kicker — `// FALL 2026 · 06 EVENTS`
    (jj_04 numbered index, jj_06 CATCH type scale). */
export function SectionHeader({
  index,
  title,
  kicker,
  as: Tag = "h2",
}: {
  index: string;
  title: string;
  kicker: string;
  as?: "h1" | "h2";
}) {
  return (
    <header className="mb-10">
      <div className="flex items-baseline gap-3 mb-3">
        <span className="mono-label text-(--accent-fg)">{"//"} {kicker}</span>
      </div>
      <div className="flex items-start gap-4 md:gap-6">
        <span
          aria-hidden
          className="font-display font-black text-(--accent-fg) leading-none select-none text-[clamp(2.2rem,6vw,4.5rem)]"
          style={{ fontStretch: "125%" }}
        >
          {index}
        </span>
        <Tag
          className="font-display font-black uppercase leading-[0.95] tracking-tight text-[clamp(2.2rem,6vw,4.5rem)]"
          style={{ fontStretch: "115%" }}
        >
          {title}
        </Tag>
      </div>
    </header>
  );
}
