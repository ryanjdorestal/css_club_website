import { EdgeCrop } from "@/components/type/EdgeCrop";
import { Outline } from "@/components/type/Outline";
import { Halftone } from "@/textures";

/** Poster movement v3: Michroma wide caps, edge-cropped, inset frame, halftone. */
export function PosterBand({
  lines,
  meta,
  accent,
}: {
  lines: (string | { text: string; className?: string; outline?: boolean })[];
  meta?: string;
  accent?: "red" | "green" | "blue" | "teal";
}) {
  return (
    <section data-tone="dark-3" data-accent={accent} className="relative overflow-hidden py-[clamp(72px,9vw,120px)]">
      <Halftone corner="0 100%" opacity={0.06} />
      <div className="absolute inset-3 md:inset-5 border border-ink/10 pointer-events-none" />
      {meta && <p className="t-micro raise text-(--accent-fg) absolute top-8 left-8">{meta}</p>}
      <div className="t-poster text-center" style={{ fontSize: "clamp(48px, 8.4vw, 140px)" }}>
        {lines.map((l, i) => {
          const text = (typeof l === "string" ? l : l.text).toUpperCase();
          const cls = typeof l === "string" ? "" : (l.className ?? "");
          const outline = typeof l !== "string" && l.outline;
          return (
            <EdgeCrop key={i} side={i % 2 === 0 ? "right" : "left"} className={cls}>
              {outline ? <Outline>{text}</Outline> : text}
            </EdgeCrop>
          );
        })}
      </div>
    </section>
  );
}
