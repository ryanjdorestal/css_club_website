import { brand } from "@brand/brand.config";
import { Band } from "@/components/Band";
import { IndexList } from "@/components/cards/IndexList";
import { Tag } from "@/components/cards/Tag";
import { ButtonLink } from "@/components/Button";
import { Outline } from "@/components/type/Outline";
import * as Sg from "@/sigils";
import { Reveal } from "@/motion/Reveal";
import { CubeAnchor } from "@/cube/CubeRailContext";

import { bandCopy, collaborate } from "./data";

/** Home section: /06 COLLABORATE. Composed by pages/Home.tsx. */
export function HomeJoin() {
  return (
    <>
      <CubeAnchor id="join" kf={{ x: 0.13, y: 0.42, scale: 0.62, face: "blue", glow: brand.palette.blue }}>
        <Band tone="tinted" accent="blue" index="05 — COLLABORATE" sigil={<Sg.Lambda size={16} />} code="OPEN_SEATS" rail="05 · JOIN · 01001010 · OPEN SEATS">
          <div
            aria-hidden
            className="absolute right-[-6%] top-1/2 -translate-y-1/2 pointer-events-none hidden lg:block"
            style={{ color: "var(--color-cube-blue)", opacity: 0.07 }}
          >
            <Sg.CSSKufic size={150} />
          </div>
          <div className="max-w-[720px] mb-10">
            <h2 className="t-h1 !text-[clamp(34px,4.6vw,72px)]">
              OPEN <Outline>SEATS.</Outline>
            </h2>
            <Reveal>
              <p className="text-[16px] leading-[1.6] mt-4" style={{ color: "var(--tone-muted)" }}>
                {bandCopy("Collaborate")}
              </p>
            </Reveal>
          </div>
          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-x-10 gap-y-8">
            <div>
              <Tag className="mb-3">OPENINGS</Tag>
              <IndexList rows={collaborate.openings.slice(0, 4).map((o) => ({ title: o.role, meta: "OPEN", href: "/join", bracket: true }))} />
            </div>
            <div>
              <Tag className="mb-3">COMMITTEES</Tag>
              <IndexList rows={collaborate.committees.map((c) => ({ title: c, meta: "JOIN", href: "/join", bracket: true }))} />
            </div>
            <div>
              <Tag className="mb-3">PROJECT_IDEAS</Tag>
              <Reveal>
                <p className="text-sm leading-relaxed" style={{ color: "var(--tone-muted)" }}>
                  {collaborate.project_ideas}
                </p>
              </Reveal>
            </div>
            <div>
              <Tag className="mb-3">SUGGESTIONS</Tag>
              <Reveal>
                <p className="text-sm leading-relaxed" style={{ color: "var(--tone-muted)" }}>
                  {collaborate.suggestions}
                </p>
              </Reveal>
            </div>
          </div>
          <Reveal delay={0.1}>
            <div className="mt-10">
              <ButtonLink to="/join" variant="primary">
                Join the Society
              </ButtonLink>
            </div>
          </Reveal>
        </Band>
      </CubeAnchor>
    </>
  );
}
