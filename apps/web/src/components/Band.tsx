import type { ReactNode } from "react";
import { SectionIndex } from "./SectionIndex";
import { VerticalRail } from "./VerticalRail";
import { Registration } from "./frame";

type Tone = "dark" | "dark-2" | "dark-3" | "light" | "light-2" | "tinted";

/** A page movement. Bands alternate dark/light with HARD edges — the edge is
    the design (no gradients between bands). Replaces run 1's Section. */
export function Band({
  tone,
  accent,
  index,
  title,
  rail,
  children,
  className = "",
  wide = false,
  id,
  sigil,
  code,
}: {
  tone: Tone;
  accent?: "red" | "green" | "blue" | "teal";
  index?: string; // "01 — EVENTS"
  title?: string; // optional index title (right of the rule)
  rail?: string; // vertical mono rail text
  sigil?: ReactNode; // section sigil left of the title
  code?: string; // right-aligned //CODE
  children: ReactNode;
  className?: string;
  wide?: boolean;
  id?: string;
}) {
  return (
    <section id={id} data-tone={tone} data-accent={accent} className={`relative overflow-hidden py-[clamp(64px,12vw,160px)] max-md:py-16 ${className}`}>
      {rail && <VerticalRail text={rail} />}
      {(tone === "light" || tone === "light-2" || tone === "tinted") && <Registration />}
      <div className={`relative ${wide ? "max-w-[1440px]" : "max-w-[1280px]"} mx-auto px-5 md:px-10`}>
        {index && <SectionIndex label={index} title={title} sigil={sigil} code={code} />}
        {children}
      </div>
    </section>
  );
}
