import { Link } from "react-router-dom";
import { Band } from "@/components/Band";
import { IndexList } from "@/components/cards/IndexList";
import { Outline } from "@/components/type/Outline";
import { DotGrid } from "@/textures";
import * as Sg from "@/sigils";
import { Reveal } from "@/motion/Reveal";
import { CubeAnchor } from "@/cube/CubeRailContext";
import { counts } from "@/lib/readouts";

import { bandCopy, resources } from "./data";

/** Home section: /04 RESOURCES. Composed by pages/Home.tsx. */
export function HomeResources() {
  return (
    <>
    <CubeAnchor id="resources" kf={{ x: 0.07, y: 0.8, scale: 0.28, face: "threeQuarter", glow: "#6ED2E6" }}>
      <Band tone="light-2" accent="teal" index="04 — RESOURCES" sigil={<Sg.Node size={16} />} code="RES_IDX" rail="04 · RESOURCES · 01010010 · CURATED">
        <DotGrid opacity={0.06} />
        <div className="relative grid md:grid-cols-[5fr_7fr] gap-10 items-start">
          <div>
            <h2 className="t-h1 !text-[clamp(30px,4.2vw,64px)]">
              <span className="block tnum">{counts.resources} LINKS WE</span>
              <span className="block"><Outline>ACTUALLY USE.</Outline></span>
            </h2>
            <Reveal>
              <p className="text-[15px] leading-[1.6] max-w-[48ch] mt-4" style={{ color: "var(--tone-muted)" }}>
                {bandCopy("Resources")}
              </p>
            </Reveal>
          </div>
          <IndexList
            rows={resources.groups.slice(0, 6).map((g, i) => ({
              index: String(i + 1).padStart(2, "0"),
              title: g.group,
              dek: g.links.map((l) => l.title).slice(0, 3).join(" · "),
              meta: `${g.links.length} LINKS`,
              href: "/resources",
              sigil: [<Sg.Node key="n" size={14} />, <Sg.Shield key="s" size={14} />, <Sg.Terminal key="t" size={14} />, <Sg.Lambda key="l" size={14} />, <Sg.Star4 key="q" size={14} />, <Sg.Eye key="e" size={14} />][i],
            }))}
          />
        </div>
        <Reveal>
          <Link to="/resources" className="t-label raise text-(--accent-ink) u-draw inline-block mt-8">
            BROWSE_ALL_{counts.resources} ↗
          </Link>
        </Reveal>
      </Band>
    </CubeAnchor>
    </>
  );
}
