import { Band } from "@/components/Band";
import { SlotCard } from "@/components/cards/SlotCard";
import * as Sg from "@/sigils";
import { RevealGroup, RevealItem } from "@/motion/Reveal";
import { CubeAnchor } from "@/cube/CubeRailContext";

import { links } from "./data";

/** Home section: /08 PARTNERS. Composed by pages/Home.tsx. */
export function HomePartners() {
  return (
    <>
    <CubeAnchor id="partners" kf={{ x: 0.93, y: 0.22, scale: 0.26, face: "threeQuarter", glow: "#6ED2E6" }}>
      <Band tone="light-2" accent="teal" index="07 — PROGRAMS & PARTNERS" sigil={<Sg.PlusMark size={16} />} code="SLOTS" rail="07 · PARTNERS · 01010000 · SLOTS">
        <RevealGroup className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { title: "MSRC Tutoring", meta: "JOHN_JAY", href: "https://linktr.ee/jsuite" },
            { title: "PRISM", meta: "JOHN_JAY", href: "https://www.jjay.cuny.edu/prism" },
            { title: "Discord", meta: "661_MEMBERS · 2021", href: links.discord },
          ].map((p2) => (
            <RevealItem key={p2.title}>
              <a href={p2.href} target="_blank" rel="noreferrer noopener" className="group flex flex-col justify-between border border-(--tone-line) p-4 min-h-[110px] hover:border-(--accent) transition-colors">
                <span className="t-micro opacity-55">{p2.meta}</span>
                <span className="t-h3 !font-medium flex items-center gap-1.5">
                  {p2.title} <span className="t-micro raise opacity-40 group-hover:opacity-100 transition-opacity">↗</span>
                </span>
              </a>
            </RevealItem>
          ))}
          <RevealItem><SlotCard n="04" label="Open" action="partner ↗" /></RevealItem>
          <RevealItem><SlotCard n="05" label="Open" /></RevealItem>
        </RevealGroup>
      </Band>
    </CubeAnchor>
    </>
  );
}
