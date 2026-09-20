import { Band } from "@/components/Band";
import { Marquee } from "@/components/Marquee";
import { FinLine } from "@/components/FinLine";
import { Pullquote } from "@/components/Pullquote";
import { PhotoFrame } from "@/components/PhotoFrame";
import { TicketCard } from "@/components/cards/TicketCard";
import { SpecSheet, BigStat, MiniChart } from "@/components/cards/SpecSheet";
import { PosterCard } from "@/components/cards/PosterCard";
import { IndexList } from "@/components/cards/IndexList";
import { SlotCard } from "@/components/cards/SlotCard";
import { StatChip } from "@/components/cards/StatChip";
import { MonoLabel } from "@/components/MonoLabel";
import { SplitLines } from "@/motion/SplitLines";
import { Reveal } from "@/motion/Reveal";
import { Bloodhound } from "@/mascot/Bloodhound";
import { DotMatrix } from "@/components/DotMatrix";
import { brand } from "@brand/brand.config";

/** /styleguide — every run-2 component on a dark AND a light band. Loop 0's shot. */
export default function Styleguide() {
  const rows = [
    { k: "Platform", v: "web · ios" },
    { k: "Stack", v: "React · Swift" },
    { k: "Term", v: "Fall 2026" },
  ];
  const list = [
    { title: "First General Meeting", dek: "Plans and upcoming events of the semester", meta: "SEP 18", chip: "PAST" },
    { title: "Intro to AI (ChatGPT)", dek: "How chatbots work and generate responses", meta: "SEP 25" },
    { title: "Movie Day — Halloween", dek: "Friday the 13th + refreshments", meta: "OCT 30" },
  ];
  return (
    <main className="pt-[72px]">
      <Band tone="dark" accent="red" index="00 — STYLEGUIDE" title="DARK BAND" rail="STYLEGUIDE · 01001001 · 2026">
        <SplitLines
          as="h1"
          lines={["Every component,", { text: "both tones.", className: "text-(--accent-fg)" }]}
          className="font-display font-black uppercase tracking-tight leading-[0.95] mb-10"
          lineClass="text-[clamp(40px,6vw,96px)]"
        />
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          <TicketCard model="EVT-S25-01" title="Ticket card" rows={rows} body="Two-tone stub with barcode + notches (jj_10)." />
          <div className="relative">
            <PosterCard word="Poster" index="01 / 03" meta="JJ_05" />
            <StatChip value={13} suffix="+" label="Workshops" className="absolute -right-3 top-6" />
          </div>
          <SpecSheet tag="SPEC" title="Spec sheet" rows={rows}>
            <BigStat value={95} suffix="%" label="jj_11 telemetry" />
            <div className="px-5 pb-4"><MiniChart points={[3, 5, 4, 8, 7, 9, 12]} /></div>
          </SpecSheet>
        </div>
        <IndexList rows={list} />
        <div className="grid grid-cols-3 gap-4 mt-8">
          <SlotCard n="01" label="Open" action="propose ↗" />
          <SlotCard n="02" label="Open" />
          <div className="flex items-end gap-4">
            <Bloodhound emote="idle" size={72} />
            <DotMatrix src="/img/brand/cs_logo_sharp.svg" size={40} className="w-24" />
          </div>
        </div>
      </Band>
      <Marquee items={[brand.taglines.ticker, brand.taglines.primary]} />
      <Band tone="tinted" accent="green" index="01 — LIGHT BAND" title="TINTED PAPER" rail="LIGHT · 01010011 · 2026">
        <div className="grid md:grid-cols-2 gap-10 items-start">
          <div>
            <Reveal>
              <h2 className="font-display font-black uppercase text-[clamp(28px,3.2vw,44px)] leading-[0.95] tracking-tight mb-4" style={{ fontStretch: "115%" }}>
                Paper, not cream.
              </h2>
              <p className="text-[17px] leading-relaxed max-w-[56ch]" style={{ color: "var(--tone-muted)" }}>
                Light cutoffs are navy-tinted paper with hairline rules. One accent per
                section: index, tag, CTA — never a big fill.
              </p>
            </Reveal>
            <Pullquote cite="— the old site's About page">Let's grow together!</Pullquote>
            <dl className="grid grid-cols-2 gap-px bg-(--tone-line) border border-(--tone-line) mt-6">
              {[["FOUNDED", "2019"], ["MEETS", "Weekly"], ["DISCORD", "661 members"], ["MODE", "Hybrid"]].map(([k, v]) => (
                <div key={k} className="bg-paper px-4 py-3">
                  <dt className="mono-label" style={{ color: "var(--tone-muted)" }}>{k}</dt>
                  <dd className="font-semibold text-sm mt-0.5">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
          <PhotoFrame src="/img/photos/club2.webp" alt="Club members tabling" caption="JJCSS · TABLE DAY" meta="FRAME · 001" tag="VISUAL · 01" />
        </div>
        <div className="grid md:grid-cols-3 gap-6 mt-10">
          <TicketCard model="APP-26-EX1" title="Ticket on paper" rows={rows} />
          <SpecSheet tag="OK" title="Spec on paper" rows={rows} />
          <div className="flex flex-col gap-4">
            <SlotCard n="03" label="Your app here" action="submit ↗" />
            <MonoLabel>mono label on paper</MonoLabel>
          </div>
        </div>
      </Band>
      <FinLine n="00" />
    </main>
  );
}
