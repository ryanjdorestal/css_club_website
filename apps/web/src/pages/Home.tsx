import { Link } from "react-router-dom";
import { brand } from "@brand/brand.config";
import events from "@data/events.json";
import resources from "@data/resources.json";
import appsData from "@data/apps.json";
import links from "@data/links.json";
import collaborate from "@data/collaborate.json";
import homeRaw from "@content/home.md?raw";
import { parseMd } from "@/lib/md";
import { Band } from "@/components/Band";
import { Marquee } from "@/components/Marquee";
import { FinLine } from "@/components/FinLine";
import { BinaryRings } from "@/components/BinaryRings";
import { Pullquote } from "@/components/Pullquote";
import { PhotoFrame } from "@/components/PhotoFrame";
import { TicketCard } from "@/components/cards/TicketCard";
import { SpecSheet } from "@/components/cards/SpecSheet";
import { IndexList } from "@/components/cards/IndexList";
import { SlotCard } from "@/components/cards/SlotCard";
import { Readout } from "@/components/cards/StatChip";
import { Tag } from "@/components/cards/Tag";
import { ButtonLink } from "@/components/Button";
import { Label } from "@/components/type/Label";
import { Stencil } from "@/components/type/Stencil";
import { Outline } from "@/components/type/Outline";
import { SplitFill } from "@/components/type/SplitFill";
import { EdgeCrop } from "@/components/type/EdgeCrop";
import { Wireframe } from "@/components/type/Wireframe";
import { Decode } from "@/components/type/Decode";
import { Brackets } from "@/components/frame";
import { HairGrid, CodeRain, Contour, DotGrid, Halftone, Scanlines, CubeWire } from "@/textures";
import * as Sg from "@/sigils";
import { Reveal, RevealGroup, RevealItem } from "@/motion/Reveal";
import { Counter } from "@/motion/Counter";
import { CubeRail } from "@/cube/CubeRail";
import { CubeRailProvider, CubeAnchor } from "@/cube/CubeRailContext";
import { CubeSpot } from "@/cube/CubeSpot";
import { COORDS, counts, version, buildHash } from "@/lib/readouts";

const home = parseMd(homeRaw);
function bandCopy(title: string): string {
  const i = home.blocks.findIndex((b) => b.type === "h2" && b.text === title);
  return i >= 0 && home.blocks[i + 1]?.type === "p" ? home.blocks[i + 1].text : "";
}
const heroDek = home.blocks.find((b) => b.type === "p")?.text ?? "";
const pastEvents = events.semesters[0].events.slice(0, 2);
const exampleApps = appsData.apps;

const GALLERY = [
  { src: "/img/photos/club2.webp", cap: "GENERAL_MEETING · SPRING" },
  { src: "/img/photos/intro-cyb-group-pic.webp", cap: "INTRO_TO_CYBERSECURITY" },
  { src: "/img/photos/involvement-fair-fall-2022.webp", cap: "INVOLVEMENT_FAIR · FALL_2022" },
  { src: "/img/photos/shirt-event.webp", cap: "CLUB_MERCH_DAY" },
  { src: "/img/photos/invol-fair.webp", cap: "TABLING · ATRIUM" },
  { src: "/img/photos/cybersecurity.webp", cap: "SECURITY_WORKSHOP" },
];

export default function Home() {
  return (
    <CubeRailProvider>
      <CubeRail />
      <main className="relative">
        {/* /01 HERO */}
        <CubeAnchor id="hero" kf={{ x: 0.68, y: 0.47, scale: 1, face: "threeQuarter", glow: "#6ED2E6", spin: true }}>
          <section data-tone="dark" data-accent="teal" className="relative min-h-dvh flex flex-col justify-end overflow-hidden pt-[72px]">
            <HairGrid opacity={0.05} />
            <BinaryRings opacity={0.05} />
            <CodeRain className="!left-[62%]" />
            <div
              aria-hidden
              className="absolute pointer-events-none"
              style={{ left: "50%", top: "8%", width: "44vw", height: "70vh", background: "radial-gradient(ellipse at center, color-mix(in srgb, var(--color-teal) 15%, transparent), transparent 65%)" }}
            />
            {/* coordinate rail */}
            <div className="absolute top-[88px] right-5 md:right-10 text-right space-y-1 z-10">
              <p className="t-micro raise tnum">X_{COORDS.x} / Y_{COORDS.y}</p>
              <p className="t-micro opacity-55">{COORDS.place}</p>
            </div>
            <div className="relative max-w-[1280px] w-full mx-auto px-5 md:px-10 grid md:grid-cols-[1.15fr_1fr] gap-8 items-center grow content-center pt-6 pb-8">
              <div>
                <Reveal y={10}>
                  <Label pfx="//" className="mb-6 block">
                    <Decode text="SCN_01 · JOHN_JAY_COLLEGE · CUNY · COMPUTER_SCIENCE_SOCIETY" />
                  </Label>
                </Reveal>
                <h1 className="t-hero" style={{ fontSize: "clamp(40px, 5.4vw, 82px)" }}>
                  <span className="block"><Stencil bars={[0.4, 0.64]}>DEBUG</Stencil></span>
                  <span className="block"><Outline>YOUR MIND,</Outline></span>
                  <span className="block">COMMIT TO</span>
                  <span className="block text-teal"><SplitFill word="GROWTH." at={3} /></span>
                </h1>
                <Reveal delay={0.3}>
                  <p className="text-[15px] text-muted leading-[1.6] max-w-[52ch] mt-5">{heroDek}</p>
                </Reveal>
                <Reveal delay={0.4}>
                  <div className="flex flex-wrap gap-3 mt-7" data-accent="blue">
                    <ButtonLink to="/join" variant="primary">Join the Society</ButtonLink>
                    <span data-accent="teal"><ButtonLink to="/apps" variant="ghost">see the apps</ButtonLink></span>
                  </div>
                </Reveal>
              </div>
              {/* cube frame */}
              <div className="group relative hidden md:block aspect-square max-w-[560px] w-full justify-self-end">
                <Brackets size={14} inset={0} />
                <div className="absolute inset-0"><BinaryRings opacity={0.08} /></div>
                <Reveal delay={0.55}>
                  {/* outside the frame: may cross the bracket line, never the mesh */}
                  <Readout value={counts.workshops} suffix="+" label="workshops run" style={{ position: "absolute", right: 0, top: 30, transform: "translateY(-100%)", width: "max-content" }} />
                </Reveal>
                <Reveal delay={0.7}>
                  <Readout value={counts.terms} label="boards since 2020" style={{ position: "absolute", left: -16, bottom: 56, transform: "translateX(-100%)", width: "max-content" }} />
                </Reveal>
                <span className="absolute bottom-3 left-3 t-micro opacity-55">_object CS_CUBE.GLB · DRAG-FREE · CLICK_A_FACE</span>
              </div>
              <div className="md:hidden"><CubeSpot /></div>
            </div>
            <p className="absolute bottom-2 right-5 md:right-10 t-micro opacity-50 tnum">VERSION {version()}-{buildHash().toUpperCase()}</p>
            {/* stat row — labels above values, shared 1px lines */}
            <div className="relative border-t border-line bg-navy-700/60">
              <div className="max-w-[1280px] mx-auto px-5 md:px-10 grid grid-cols-2 md:grid-cols-4">
                {[
                  { v: counts.officers, l: "officers · all terms" },
                  { v: counts.events, l: "events logged" },
                  { v: counts.resources, l: "curated resources" },
                  { v: counts.semesters, l: "semesters on record" },
                ].map((s2) => (
                  <div key={s2.l} className="px-5 py-4 border-l border-line first:border-l-0">
                    <p className="t-micro opacity-55 mb-1.5">_{s2.l.replace(/ · /g, "_").replace(/ /g, "_")}</p>
                    <span className="t-stat !text-[clamp(28px,3vw,44px)] text-ink"><Counter value={s2.v} /></span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </CubeAnchor>

        {/* ticker */}
        <div data-accent="teal">
          <Marquee items={[brand.taglines.ticker, "NEXT EVENT · FALL 2026", "APPS — SUBMISSIONS OPEN", "CYBERHOUNDS · CTF"]} />
        </div>

        {/* /01 ABOUT SPREAD */}
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

        {/* /02 EVENTS */}
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

        {/* /03 APPS SPOTLIGHT */}
        <CubeAnchor id="apps" kf={{ x: 0.88, y: 0.55, scale: 0.62, face: "green", glow: "#40A33F" }}>
          <Band tone="tinted" accent="green" index="03 — APPS · BUILT AT JOHN JAY" sigil={<Sg.Terminal size={16} />} code="APP_REG" rail="03 · APPS · 01010011 · OPEN">
            <CubeWire opacity={0.05} width="30vw" />
            <div className="relative grid md:grid-cols-[7fr_5fr] gap-10 items-start">
              <div>
                <h2 className="t-h1 !text-[clamp(30px,4.2vw,64px)]">
                  <span className="block">SHIP SOMETHING.</span>
                  <span className="block"><Outline>GET IT ON THE BOARD.</Outline></span>
                </h2>
                <Reveal>
                  <p className="text-[16px] leading-[1.6] max-w-[56ch] my-6" style={{ color: "var(--tone-muted)" }}>
                    The club's public register of software built by John Jay students —
                    reviewed by the board, shipped with your name on it. The format below
                    is shown with examples until the first real submissions land.
                  </p>
                </Reveal>
                <RevealGroup className="grid sm:grid-cols-2 gap-4">
                  {exampleApps.slice(1).map((app) => (
                    <RevealItem key={app.id}>
                      <TicketCard
                        model={`APP-EX-${app.id.slice(-2).toUpperCase()}`}
                        title={app.title}
                        body={app.summary}
                        href="/apps"
                        rows={[
                          { k: "PLATFORM", v: app.platform.join(" · ") },
                          { k: "STATUS", v: "EXAMPLE — NOT REAL" },
                        ]}
                      />
                    </RevealItem>
                  ))}
                  <RevealItem>
                    <SlotCard n="02" label="Your app here" action="submit ↗" href="/apps" className="min-h-[140px]" />
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
                    <Link to="/apps" className="t-label raise text-(--accent-ink) u-draw">[ &gt;_SUBMIT_APP ]</Link>
                    <Tag variant="hatch">EXAMPLE</Tag>
                  </div>
                </SpecSheet>
              </Reveal>
            </div>
          </Band>
        </CubeAnchor>

        {/* /04 RESOURCES */}
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

        {/* /05 CYBERHOUNDS POSTER */}
        <CubeAnchor id="cyber" kf={{ x: 0.5, y: 0.88, scale: 0.35, face: "edge", glow: brand.palette.red }}>
          <section data-tone="dark-3" data-accent="red" className="relative overflow-hidden py-[clamp(96px,12vw,160px)]">
            <Scanlines />
            <Halftone corner="100% 20%" opacity={0.08} />
            <div className="max-w-[1280px] mx-auto px-5 md:px-10">
              <div className="flex items-center justify-between mb-8">
                <Label pfx="//">CTF_01 · SUB-CLUB · CAPTURE_THE_FLAG</Label>
                <span className="t-micro opacity-50 tnum hidden md:block">2026</span>
              </div>
              <div className="grid md:grid-cols-[8fr_4fr] gap-10 items-center">
                <div className="t-poster" style={{ fontSize: "clamp(60px, 10.5vw, 175px)" }}>
                  <EdgeCrop side="right"><Decode text="CYBER" /></EdgeCrop>
                  <EdgeCrop side="right">
                    <span className="text-red">
                      <span className="relative inline-block">
                        <span aria-hidden className="t-outline absolute text-ink" style={{ left: 6, top: 6 }}>HOUNDS</span>
                        <span className="relative">HOUNDS</span>
                      </span>
                    </span>
                  </EdgeCrop>
                </div>
                <Sg.HoundPixel size={240} className="justify-self-center max-md:hidden" />
              </div>
              <div className="flex items-center justify-between flex-wrap gap-4 mt-10">
                <p className="t-label raise !tracking-[0.2em]">PICOCTF · NCL · ANGSTROMCTF · SDCTF</p>
                <Link to="/cyberhounds" className="t-label raise text-(--accent-fg) border border-(--accent) px-5 py-3 hover:bg-(--accent)/10 transition-colors">
                  [ &gt;_WHAT_IS_CTF ]
                </Link>
              </div>
            </div>
          </section>
        </CubeAnchor>

        {/* /06 COLLABORATE */}
        <CubeAnchor id="join" kf={{ x: 0.13, y: 0.42, scale: 0.62, face: "blue", glow: "#1E80F0" }}>
          <Band tone="tinted" accent="blue" index="05 — COLLABORATE" sigil={<Sg.Lambda size={16} />} code="OPEN_SEATS" rail="05 · JOIN · 01001010 · OPEN SEATS">
            <div aria-hidden className="absolute right-[-6%] top-1/2 -translate-y-1/2 pointer-events-none hidden lg:block" style={{ color: "var(--color-cube-blue)", opacity: 0.07 }}>
              <Sg.CSSKufic size={150} />
            </div>
            <div className="max-w-[720px] mb-10">
              <h2 className="t-h1 !text-[clamp(34px,4.6vw,72px)]">OPEN <Outline>SEATS.</Outline></h2>
              <Reveal>
                <p className="text-[16px] leading-[1.6] mt-4" style={{ color: "var(--tone-muted)" }}>{bandCopy("Collaborate")}</p>
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
                <Reveal><p className="text-sm leading-relaxed" style={{ color: "var(--tone-muted)" }}>{collaborate.project_ideas}</p></Reveal>
              </div>
              <div>
                <Tag className="mb-3">SUGGESTIONS</Tag>
                <Reveal><p className="text-sm leading-relaxed" style={{ color: "var(--tone-muted)" }}>{collaborate.suggestions}</p></Reveal>
              </div>
            </div>
            <Reveal delay={0.1}>
              <div className="mt-10"><ButtonLink to="/join" variant="primary">Join the Society</ButtonLink></div>
            </Reveal>
          </Band>
        </CubeAnchor>

        {/* /07 GALLERY */}
        <CubeAnchor id="gallery" kf={{ x: 0.93, y: 0.18, scale: 0.26, face: "threeQuarter", glow: "#6ED2E6" }}>
          <Band tone="light" accent="teal" index="06 — ON CAMPUS" sigil={<Sg.Crosshair size={16} />} code="IMG_SET" rail="06 · GALLERY · 01000111 · FRAMES">
            <RevealGroup className="columns-2 md:columns-3 gap-5 [&>div]:mb-5">
              {GALLERY.map((g, i) => (
                <RevealItem key={g.src} className="break-inside-avoid">
                  <PhotoFrame src={g.src} alt={g.cap.toLowerCase().replaceAll("_", " ")} tag={`//IMG_00${i + 1}`} meta={`FRAME · 00${i + 1}`} caption={g.cap} />
                </RevealItem>
              ))}
            </RevealGroup>
          </Band>
        </CubeAnchor>

        {/* /08 PARTNERS */}
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

        {/* fin */}
        <CubeAnchor id="fin" kf={{ x: 0.84, y: 0.5, scale: 0.42, face: "threeQuarter", glow: "#6ED2E6" }}>
          <div data-accent="teal"><FinLine n="01" next="/events" binary="01001010 01001010 01000011 01010011" /></div>
        </CubeAnchor>
      </main>
    </CubeRailProvider>
  );
}
