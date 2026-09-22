import { brand } from "@brand/brand.config";
import { Link } from "react-router-dom";
import { Band } from "@/components/Band";
import { TicketCard } from "@/components/cards/TicketCard";
import { SpecSheet } from "@/components/cards/SpecSheet";
import { SlotCard } from "@/components/cards/SlotCard";
import { Tag } from "@/components/cards/Tag";
import { Outline } from "@/components/type/Outline";
import { CubeWire } from "@/textures";
import * as Sg from "@/sigils";
import { Reveal, RevealGroup, RevealItem } from "@/motion/Reveal";
import { CubeAnchor } from "@/cube/CubeRailContext";

import { exampleApps } from "./data";

/** Home section: /03 APPS SPOTLIGHT. Composed by pages/Home.tsx. */
export function HomeProjects() {
  return (
    <>
      <CubeAnchor id="apps" kf={{ x: 0.9, y: 0.4, scale: 0.58, face: "green", glow: brand.palette.green }}>
        <Band
          tone="tinted"
          accent="green"
          index="03 — PROJECTS · BUILT AT JOHN JAY"
          sigil={<Sg.Terminal size={16} />}
          code="APP_REG"
          rail="03 · PROJECTS · 01010011 · OPEN"
        >
          <CubeWire opacity={0.05} width="30vw" />
          <div className="relative grid md:grid-cols-[7fr_5fr] gap-10 items-start">
            <div>
              <h2 className="t-h1 !text-[clamp(30px,4.2vw,64px)]">
                <span className="block">SHIP SOMETHING.</span>
                <span className="block">
                  <Outline>GET IT ON THE BOARD.</Outline>
                </span>
              </h2>
              <Reveal>
                <p className="text-[16px] leading-[1.6] max-w-[56ch] my-6" style={{ color: "var(--tone-muted)" }}>
                  The club's public register of software built by John Jay students — reviewed by the board, shipped with your name on it. The format below is
                  shown with examples until the first real submissions land.
                </p>
              </Reveal>
              <RevealGroup className="grid sm:grid-cols-2 gap-4">
                {exampleApps.slice(1).map((app) => (
                  <RevealItem key={app.id}>
                    <TicketCard
                      model={`APP-EX-${app.id.slice(-2).toUpperCase()}`}
                      title={app.title}
                      body={app.summary}
                      href="/projects"
                      rows={[
                        { k: "PLATFORM", v: app.platform.join(" · ") },
                        { k: "STATUS", v: "EXAMPLE — NOT REAL" },
                      ]}
                    />
                  </RevealItem>
                ))}
                <RevealItem>
                  <SlotCard n="02" label="Your project here" action="submit ↗" href="/projects#submit" className="min-h-[140px]" />
                </RevealItem>
              </RevealGroup>
            </div>
            <Reveal delay={0.1}>
              <SpecSheet
                tag="EXAMPLE"
                title={exampleApps[0].title}
                registration
                rows={[
                  { k: "AUTHOR", v: "Your name here" },
                  { k: "PLATFORM", v: exampleApps[0].platform.join(" · ") },
                  { k: "STACK", v: exampleApps[0].stack.join(" · ") },
                  { k: "FOR JOHN JAY", v: exampleApps[0].benefits_jj },
                ]}
                meter={{ label: "review steps", value: 3, max: 3 }}
              >
                <div className="px-5 py-4 flex items-center justify-between">
                  <Link to="/projects#submit" className="t-label raise text-(--accent-ink) u-draw">
                    [ &gt;_SUBMIT_PROJECT ]
                  </Link>
                  <Tag variant="hatch">EXAMPLE</Tag>
                </div>
              </SpecSheet>
            </Reveal>
          </div>
        </Band>
      </CubeAnchor>
    </>
  );
}
