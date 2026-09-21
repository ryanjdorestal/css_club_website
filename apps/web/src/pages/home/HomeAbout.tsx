import { Band } from "@/components/Band";
import { Pullquote } from "@/components/Pullquote";
import { PhotoFrame } from "@/components/PhotoFrame";
import { SpecSheet } from "@/components/cards/SpecSheet";
import { Outline } from "@/components/type/Outline";
import { Contour } from "@/textures";
import * as Sg from "@/sigils";
import { Reveal } from "@/motion/Reveal";
import { CubeAnchor } from "@/cube/CubeRailContext";

import { bandCopy, links } from "./data";

/** Home section: /01 ABOUT SPREAD. Composed by pages/Home.tsx. */
export function HomeAbout() {
  return (
    <>
    <CubeAnchor id="about" kf={{ x: 0.9, y: 0.24, scale: 0.28, face: "edge", glow: "#6ED2E6" }}>
      <Band tone="light" accent="teal" index="01 — WHAT THE CLUB IS ABOUT" sigil={<Sg.CubeSigil size={16} />} code="ABT_01" rail="01 · HOME · 01001010 · SINCE 2020">
        <Contour opacity={0.05} />
        <div className="relative grid md:grid-cols-[5fr_7fr] gap-10 md:gap-16 items-start">
          <Reveal>
            <PhotoFrame
              src="/img/photos/club2.webp"
              alt="CSS members at a general meeting"
              tag="//IMG_001"
              meta="FRAME · 001"
              caption="JJCSS · GENERAL_MEETING"
              track={{ x: "10%", y: "16%", w: "34%", h: "50%", label: "SUBJ_01 · 0.92" }}
            />
          </Reveal>
          <div>
            <h2 className="t-h1 !text-[clamp(34px,4.4vw,68px)]">
              <span className="block">A SOCIETY FOR</span>
              <span className="block"><Outline>PEOPLE WHO BUILD.</Outline></span>
            </h2>
            <Reveal>
              <p className="text-[16px] leading-[1.6] max-w-[56ch] mt-5" style={{ color: "var(--tone-muted)" }}>
                {bandCopy("What the Club is About")}
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="my-7"><Pullquote cite="_source · THE_ABOUT_PAGE · VERBATIM">Let's grow together!</Pullquote></div>
            </Reveal>
            <Reveal delay={0.15}>
              <SpecSheet
                rows={[
                  { k: "CAMPUS", v: "John Jay College · CUNY" },
                  { k: "MODE", v: "Hybrid" },
                  { k: "DISCORD", v: "Est. 2021" },
                  { k: "EMAIL", v: links.email },
                ]}
              />
            </Reveal>
          </div>
        </div>
      </Band>
    </CubeAnchor>
    </>
  );
}
