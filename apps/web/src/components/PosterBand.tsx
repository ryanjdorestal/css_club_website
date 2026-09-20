import { EdgeCrop } from "@/components/type/EdgeCrop";
import { Ghost } from "@/components/type/Outline";
import { Stencil } from "@/components/type/Stencil";
import { Halftone } from "@/textures";
import { CubeSpot } from "@/cube/CubeSpot";

/** Poster movement v4 (context/26 §4): Unbounded 900, solid + ghost + edge
    crop + stencil bars, cube edge-on behind the word. */
export function PosterBand({
  lines,
  meta,
  accent,
}: {
  lines: (string | { text: string; className?: string; outline?: boolean; ghost?: boolean; stencil?: boolean })[];
  meta?: string;
  accent?: "red" | "green" | "blue" | "teal";
}) {
  return (
    <section data-tone="dark-3" data-accent={accent} className="relative overflow-hidden py-[clamp(72px,9vw,120px)]">
      <Halftone corner="0 100%" opacity={0.06} />
      <div aria-hidden className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-60 pointer-events-none max-md:hidden">
        <CubeSpot size={220} face="edge" interactive={false} />
      </div>
      <div className="absolute inset-3 md:inset-5 border border-ink/10 pointer-events-none" />
      {meta && <p className="t-micro raise text-(--accent-fg) absolute top-8 left-8">{meta}</p>}
      <div className="relative t-poster text-center" style={{ fontSize: "clamp(48px, 8.4vw, 140px)" }}>
        {lines.map((l, i) => {
          const text = (typeof l === "string" ? l : l.text).toUpperCase();
          const o: { className?: string; outline?: boolean; ghost?: boolean; stencil?: boolean } = typeof l === "string" ? {} : l;
          let word: React.ReactNode = text;
          if (o.ghost || o.outline) word = <Ghost>{text}</Ghost>;
          if (o.stencil) word = <Stencil bars={[0.4, 0.66]} barColor="var(--color-navy-900)">{word as never}</Stencil>;
          return (
            <EdgeCrop key={i} side="right" className={o.className}>
              {word}
            </EdgeCrop>
          );
        })}
      </div>
    </section>
  );
}
