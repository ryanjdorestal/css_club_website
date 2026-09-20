import { SplitLines } from "@/motion/SplitLines";

/** Full-bleed dark poster movement: one or two giant words, one accent. */
export function PosterBand({
  lines,
  meta,
  accent,
}: {
  lines: (string | { text: string; className?: string })[];
  meta?: string;
  accent?: "red" | "green" | "blue" | "teal";
}) {
  return (
    <section data-tone="dark-3" data-accent={accent} className="relative overflow-hidden py-[clamp(80px,10vw,140px)]">
      <div className="absolute inset-3 md:inset-5 border border-ink/10 pointer-events-none" />
      <div className="max-w-[1280px] mx-auto px-5 md:px-10">
        {meta && <p className="mono-label text-(--accent-fg) mb-6">{meta}</p>}
        <SplitLines
          as="p"
          lines={lines}
          className="font-display font-black uppercase tracking-[-0.03em] leading-[0.85] text-center"
          lineClass="text-[clamp(52px,9vw,150px)]"
        />
      </div>
    </section>
  );
}
