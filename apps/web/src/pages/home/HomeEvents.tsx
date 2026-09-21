import { brand } from "@brand/brand.config";
import { Band } from "@/components/Band";
import { PhotoFrame } from "@/components/PhotoFrame";
import { TicketCard } from "@/components/cards/TicketCard";
import { SlotCard } from "@/components/cards/SlotCard";
import { ButtonLink } from "@/components/Button";
import { Label } from "@/components/type/Label";
import { Wireframe } from "@/components/type/Wireframe";
import * as Sg from "@/sigils";
import { Reveal, RevealGroup, RevealItem } from "@/motion/Reveal";
import { CubeAnchor } from "@/cube/CubeRailContext";
import { counts } from "@/lib/readouts";

import { bandCopy, pastEvents } from "./data";

/** Home section: /02 EVENTS. Composed by pages/Home.tsx. */
export function HomeEvents() {
  return (
    <>
    <CubeAnchor id="events" kf={{ x: 0.11, y: 0.52, scale: 0.62, face: "red", glow: brand.palette.red }}>
      <Band tone="dark-2" accent="red" index="02 — EVENTS" sigil={<Sg.Flag size={16} />} code="EVT_S25" rail="02 · EVENTS · 01000101 · FALL 2026">
        <div aria-hidden className="absolute -right-24 top-8 opacity-[0.06] pointer-events-none text-red">
          <Sg.CubeSigil face="r" size={420} />
        </div>
        <div className="grid md:grid-cols-[7fr_3fr] gap-10 items-end mb-10">
          <div className="md:pl-[26%]">
            <h2 className="t-h1 !text-[clamp(30px,4.2vw,64px)]">
              <Wireframe>WORKSHOPS, PANELS,</Wireframe>
              <span className="block">AND THE OCCASIONAL PIZZA.</span>
            </h2>
            <Reveal>
              <p className="text-[15px] text-muted leading-[1.6] max-w-[56ch] mt-4">{bandCopy("Events")}</p>
            </Reveal>
          </div>
          <Reveal className="hidden md:block">
            <PhotoFrame src="/img/photos/intro-cyb-group-pic.webp" alt="Intro to Cybersecurity workshop group photo" tag="//IMG_002" meta="FRAME · 002" caption="INTRO_TO_CYBERSECURITY" />
          </Reveal>
        </div>
        <RevealGroup className="grid gap-6 md:grid-cols-3 md:pl-[26%]">
          <RevealItem>
            <SlotCard n="01" label="Next event — Open" action="propose ↗" href="/join" className="min-h-full" />
          </RevealItem>
          {pastEvents.map((ev, i) => (
            <RevealItem key={ev.title}>
              <TicketCard
                model={`EVT-S25-0${i + 1}`}
                title={ev.title}
                image={ev.flyer ? `/${ev.flyer}` : undefined}
                imageAlt={`${ev.title} flyer`}
                href="/events"
                rows={[
                  ...(ev.date ? [{ k: "DATE", v: ev.date.replace(/, 20\d\d$/, "") }] : []),
                  ...(ev.room ? [{ k: "ROOM", v: ev.room }] : []),
                  { k: "STATUS", v: "ARCHIVED" },
                ]}
              />
            </RevealItem>
          ))}
        </RevealGroup>
        <Reveal delay={0.1}>
          <div className="md:pl-[26%] mt-8 flex items-center gap-6 flex-wrap">
            <ButtonLink to="/events" variant="primary">All events</ButtonLink>
            <Label pfx=">">
              <span className="tnum">{counts.workshops}</span> PAST_WORKSHOPS_ON_GITHUB
            </Label>
          </div>
        </Reveal>
      </Band>
    </CubeAnchor>
    </>
  );
}
