import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { brand } from "@brand/brand.config";
import events from "@data/events.json";
import board from "@data/board.json";
import workshops from "@data/workshops.json";
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
import { CornerBrackets } from "@/components/CornerBrackets";
import { Pullquote } from "@/components/Pullquote";
import { PhotoFrame } from "@/components/PhotoFrame";
import { Watermark } from "@/components/Watermark";
import { DotMatrix } from "@/components/DotMatrix";
import { TicketCard } from "@/components/cards/TicketCard";
import { SpecSheet, BigStat } from "@/components/cards/SpecSheet";
import { IndexList } from "@/components/cards/IndexList";
import { SlotCard } from "@/components/cards/SlotCard";
import { StatChip } from "@/components/cards/StatChip";
import { SplitLines } from "@/motion/SplitLines";
import { Reveal, RevealGroup, RevealItem } from "@/motion/Reveal";
import { Counter } from "@/motion/Counter";
import { CubeRail } from "@/cube/CubeRail";
import { CubeRailProvider, CubeAnchor } from "@/cube/CubeRailContext";
import { CubeSpot } from "@/cube/CubeSpot";

const home = parseMd(homeRaw);

function bandCopy(title: string): string {
  const i = home.blocks.findIndex((b) => b.type === "h2" && b.text === title);
  return i >= 0 && home.blocks[i + 1]?.type === "p" ? home.blocks[i + 1].text : "";
}

const heroDek = home.blocks.find((b) => b.type === "p")?.text ?? "";
const nEvents = events.semesters.reduce((a, s) => a + s.events.length, 0);
const nOfficers = board.terms.reduce((a, t) => a + t.members.length, 0);
const nSemesters = board.terms.length * 2;
const nWorkshops = workshops.workshops.length;
const nResources = resources.count;
const pastEvents = events.semesters[0].events.slice(0, 2);
const exampleApps = appsData.apps;

const GALLERY = [
  { src: "/img/photos/club2.webp", cap: "GENERAL MEETING · SPRING" },
  { src: "/img/photos/intro-cyb-group-pic.webp", cap: "INTRO TO CYBERSECURITY" },
  { src: "/img/photos/involvement-fair-fall-2022.webp", cap: "INVOLVEMENT FAIR · FALL 2022" },
  { src: "/img/photos/shirt-event.webp", cap: "CLUB MERCH DAY" },
  { src: "/img/photos/invol-fair.webp", cap: "TABLING · ATRIUM" },
  { src: "/img/photos/cybersecurity.webp", cap: "SECURITY WORKSHOP" },
];

export default function Home() {
  return (
    <CubeRailProvider>
      <CubeRail />
      <main className="relative">
        {/* 1 — HERO */}
        <CubeAnchor id="hero" kf={{ x: 0.68, y: 0.47, scale: 1, face: "threeQuarter", glow: "#6ED2E6", spin: true }}>
          <section data-tone="dark" data-accent="teal" className="relative min-h-dvh flex flex-col justify-end overflow-hidden pt-[72px]">
            <BinaryRings opacity={0.07} />
            <div
              aria-hidden
              className="absolute pointer-events-none"
              style={{
                left: "50%", top: "8%", width: "44vw", height: "70vh",
                background: "radial-gradient(ellipse at center, color-mix(in srgb, var(--color-teal) 18%, transparent), transparent 65%)",
              }}
            />
            <div className="relative max-w-[1280px] w-full mx-auto px-5 md:px-10 grid md:grid-cols-[1.15fr_1fr] gap-8 items-center grow content-center pt-6 pb-8">
              <div>
                <Reveal y={12}>
                  <p className="mono-label text-teal mb-5">
                    {"//"} JOHN JAY COLLEGE · CUNY · COMPUTER SCIENCE SOCIETY
                  </p>
                </Reveal>
                <SplitLines
                  as="h1"
                  lines={["Debug", "your mind,", "commit to", { text: "growth.", className: "text-teal" }]}
                  className="font-display font-black uppercase tracking-[-0.02em] leading-[0.9]"
                  lineClass="text-[clamp(48px,6.8vw,104px)]"
                />
                <Reveal delay={0.3}>
                  <p className="text-[16px] text-muted leading-relaxed max-w-[52ch] mt-5">{heroDek}</p>
                </Reveal>
                <Reveal delay={0.4}>
                  <div className="flex flex-wrap gap-3 mt-8">
                    <Link to="/join" className="inline-flex items-center gap-2 px-6 py-3 rounded-(--radius-sm) bg-blue text-ink font-semibold text-sm hover:brightness-110 transition-all">
                      Join the Society
                    </Link>
                    <Link to="/apps" className="inline-flex items-center gap-2 px-6 py-3 rounded-(--radius-sm) border border-teal text-teal text-sm hover:bg-teal/10 transition-colors">
                      See the Apps <ArrowUpRight size={15} />
                    </Link>
                  </div>
                </Reveal>
              </div>
              {/* cube frame — the fixed CubeRail floats over this square */}
              <div className="relative hidden md:block aspect-square max-w-[560px] w-full justify-self-end">
                <CornerBrackets inset="0" />
                <div className="absolute inset-0"><BinaryRings opacity={0.09} /></div>
                <Reveal delay={0.55} className="absolute z-40" >
                  <StatChip value={nWorkshops} suffix="+" label="Workshops run" style={{ position: "absolute", left: "58%", top: "10%", width: "max-content" }} />
                </Reveal>
                <Reveal delay={0.7}>
                  <StatChip value={board.terms.length} label="Boards since 2020" style={{ position: "absolute", left: "72%", top: "76%", width: "max-content" }} />
                </Reveal>
                <span className="absolute bottom-3 left-3 mono-label text-muted/70">CS_CUBE.GLB · DRAG-FREE · CLICK A FACE</span>
              </div>
              <div className="md:hidden"><CubeSpot /></div>
            </div>
            {/* stat row */}
            <div className="relative border-t border-line bg-navy-700/60">
              <div className="max-w-[1280px] mx-auto px-5 md:px-10 grid grid-cols-2 md:grid-cols-4">
                {[
                  { v: nOfficers, l: "OFFICERS · ALL TERMS" },
                  { v: nEvents, l: "EVENTS LOGGED" },
                  { v: nResources, l: "CURATED RESOURCES" },
                  { v: nSemesters, l: "SEMESTERS ON RECORD" },
                ].map((s2) => (
                  <div key={s2.l} className="px-5 py-5 border-l border-line first:border-l-0">
                    <span className="font-display font-black text-3xl md:text-4xl text-ink" style={{ fontStretch: "115%" }}>
                      <Counter value={s2.v} />
                    </span>
                    <p className="mono-label text-muted mt-1">{s2.l}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </CubeAnchor>

        {/* 2 — MARQUEE */}
        <div data-accent="teal">
          <Marquee items={[brand.taglines.ticker, "Next event · Fall 2026", "Apps — submissions open", "Cyberhounds · CTF"]} />
        </div>

        {/* 3 — ABOUT SPREAD */}
        <CubeAnchor id="about" kf={{ x: 0.9, y: 0.24, scale: 0.4, face: "edge", glow: "#6ED2E6" }}>
          <Band tone="light" accent="teal" index="01 — WHAT THE CLUB IS ABOUT" rail="01 · HOME · 01001010 · SINCE 2020">
            <div className="grid md:grid-cols-[5fr_7fr] gap-10 md:gap-16 items-start">
              <Reveal>
                <PhotoFrame
                  src="/img/photos/club2.webp"
                  alt="CSS members at a general meeting"
                  caption="JJCSS · GENERAL MEETING"
                  meta="FRAME · 001"
                  tag="VISUAL · 01 / CLUB"
                />
              </Reveal>
              <div>
                <SplitLines
                  as="h2"
                  lines={["A society for", "people who build."]}
                  className="font-display font-black tracking-tight leading-[0.95] mb-6"
                  lineClass="text-[clamp(36px,4.6vw,72px)]"
                />
                <Reveal>
                  <p className="text-[17px] leading-relaxed max-w-[58ch]" style={{ color: "var(--tone-muted)" }}>
                    {bandCopy("What the Club is About")}
                  </p>
                </Reveal>
                <Reveal delay={0.1}>
                  <div className="my-8"><Pullquote cite="— the About page, kept verbatim">Let's grow together!</Pullquote></div>
                </Reveal>
                <Reveal delay={0.15}>
                  <dl className="grid grid-cols-2 md:grid-cols-4 gap-px bg-(--tone-line) border border-(--tone-line)">
                    {[
                      ["CAMPUS", "John Jay · CUNY"],
                      ["MODE", "Hybrid"],
                      ["DISCORD", "Est. 2021"],
                      ["EMAIL", "computersocjjay"],
                    ].map(([k, v]) => (
                      <div key={k} className="bg-paper px-4 py-3">
                        <dt className="mono-label" style={{ color: "var(--tone-muted)" }}>{k}</dt>
                        <dd className="font-semibold text-sm mt-0.5">{v}</dd>
                      </div>
                    ))}
                  </dl>
                </Reveal>
              </div>
            </div>
          </Band>
        </CubeAnchor>

        {/* 4 — EVENTS BAND */}
        <CubeAnchor id="events" kf={{ x: 0.11, y: 0.52, scale: 0.66, face: "red", glow: "#CE4A4A" }}>
          <Band tone="dark-2" accent="red" index="02 — EVENTS" rail="02 · EVENTS · 01000101 · FALL 2026">
            <Watermark src={brand.logos.svg} side="right" width="38vw" opacity={0.06} />
            <div className="grid md:grid-cols-[7fr_3fr] gap-10 items-end mb-10">
              <div className="md:pl-[26%]">
                <SplitLines
                  as="h2"
                  lines={["Workshops, panels, and", "the occasional pizza."]}
                  className="font-display font-black uppercase tracking-tight leading-[0.95]"
                  lineClass="text-[clamp(32px,4.4vw,68px)]"
                />
                <Reveal>
                  <p className="text-[16px] text-muted leading-relaxed max-w-[56ch] mt-4">{bandCopy("Events")}</p>
                </Reveal>
              </div>
              <Reveal className="hidden md:block">
                <PhotoFrame src="/img/photos/intro-cyb-group-pic.webp" alt="Intro to Cybersecurity workshop group photo" caption="INTRO TO CYBERSECURITY" tag="VISUAL · 02" meta="FRAME · 002" />
              </Reveal>
            </div>
            <RevealGroup className="grid gap-6 md:grid-cols-3 md:pl-[26%]">
              <RevealItem>
                <SlotCard n="01" label="Next event — Open" action="propose one ↗" href="/join" className="min-h-full" />
              </RevealItem>
              {pastEvents.map((ev, i) => (
                <RevealItem key={ev.title}>
                  <TicketCard
                    model={`EVT-S25-0${i + 1}`}
                    title={ev.title}
                    image={ev.flyer ? `/${ev.flyer}` : undefined}
                    imageAlt={`${ev.title} flyer`}
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
              <div className="md:pl-[26%] mt-8 flex items-center gap-6">
                <Link to="/events" className="btn-slide inline-flex items-center gap-2 px-6 py-3 rounded-(--radius-sm) text-sm font-semibold text-(--accent-contrast)">
                  All events <ArrowUpRight size={15} />
                </Link>
                <span className="mono-label text-muted">+ {nWorkshops} PAST WORKSHOPS ON GITHUB</span>
              </div>
            </Reveal>
          </Band>
        </CubeAnchor>

        {/* 5 — APPS SPOTLIGHT */}
        <CubeAnchor id="apps" kf={{ x: 0.88, y: 0.55, scale: 0.66, face: "green", glow: "#40A33F" }}>
          <Band tone="tinted" accent="green" index="03 — APPS · BUILT AT JOHN JAY" rail="03 · APPS · 01010011 · OPEN">
            <div className="grid md:grid-cols-[7fr_5fr] gap-10 items-start">
              <div>
                <SplitLines
                  as="h2"
                  lines={["Ship something.", "Get it on the board."]}
                  className="font-display font-black tracking-tight leading-[0.95] mb-6"
                  lineClass="text-[clamp(32px,4.4vw,68px)]"
                />
                <Reveal>
                  <p className="text-[17px] leading-relaxed max-w-[56ch] mb-8" style={{ color: "var(--tone-muted)" }}>
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
                  rows={[
                    { k: "AUTHOR", v: "Your name here" },
                    { k: "PLATFORM", v: exampleApps[0].platform.join(" · ") },
                    { k: "STACK", v: exampleApps[0].stack.join(" · ") },
                    { k: "FOR JOHN JAY", v: exampleApps[0].benefits_jj },
                  ]}
                >
                  <BigStat value={3} label="REVIEW STEPS · SUBMIT → BOARD → LIVE" />
                  <div className="px-5 pb-5">
                    <Link to="/apps" className="mono-label text-(--accent-ink) u-draw">SUBMIT YOUR APP ↗</Link>
                  </div>
                </SpecSheet>
              </Reveal>
            </div>
          </Band>
        </CubeAnchor>

        {/* 6 — RESOURCES INDEX */}
        <CubeAnchor id="resources" kf={{ x: 0.07, y: 0.8, scale: 0.28, face: "threeQuarter", glow: "#6ED2E6" }}>
        <Band tone="light-2" accent="teal" index="04 — RESOURCES" rail="04 · RESOURCES · 01010010 · CURATED">
          <div className="grid md:grid-cols-[5fr_7fr] gap-10 items-start">
            <div>
              <SplitLines
                as="h2"
                lines={[`${nResources} links we`, "actually use."]}
                className="font-display font-black tracking-tight leading-[0.95] mb-5"
                lineClass="text-[clamp(32px,4.4vw,68px)]"
              />
              <Reveal>
                <p className="text-[16px] leading-relaxed max-w-[48ch]" style={{ color: "var(--tone-muted)" }}>
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
              }))}
            />
          </div>
          <Reveal>
            <Link to="/resources" className="mono-label text-(--accent-ink) u-draw inline-block mt-8">BROWSE ALL {nResources} ↗</Link>
          </Reveal>
        </Band>
        </CubeAnchor>

        {/* 7 — CYBERHOUNDS POSTER */}
        <CubeAnchor id="cyber" kf={{ x: 0.5, y: 0.88, scale: 0.32, face: "edge", glow: "#CE4A4A" }}>
          <section data-tone="dark-3" data-accent="red" className="relative overflow-hidden py-[clamp(96px,12vw,160px)]">
            <div className="max-w-[1280px] mx-auto px-5 md:px-10 grid md:grid-cols-[8fr_4fr] gap-10 items-center">
              <div>
                <p className="mono-label text-(--accent-fg) mb-6">05 — SUB-CLUB · CAPTURE THE FLAG</p>
                <SplitLines
                  as="h2"
                  lines={["Cyber", { text: "hounds", className: "text-red" }]}
                  className="font-display font-black uppercase tracking-[-0.03em] leading-[0.82]"
                  lineClass="text-[clamp(72px,11vw,176px)]"
                />
                <p className="mono-label text-muted mt-8">CTF TEAM · PICOCTF · NCL · ANGSTROMCTF · SDCTF</p>
                <Reveal delay={0.15}>
                  <Link to="/cyberhounds" className="inline-flex items-center gap-2 mt-6 px-6 py-3 rounded-(--radius-sm) border border-(--accent) text-(--accent-fg) text-sm hover:bg-(--accent)/10 transition-colors">
                    What is CTF? <ArrowUpRight size={15} />
                  </Link>
                </Reveal>
              </div>
              <DotMatrix src="/img/brand/hound_banner.png" size={44} color="var(--color-red)" className="w-full max-w-[320px] justify-self-center" />
            </div>
            <span aria-hidden className="absolute right-6 top-0 bottom-0 hidden lg:flex items-center">
              <span className="mono-label text-(--accent-fg)/40" style={{ writingMode: "vertical-rl", fontSize: 10 }}>
                0000100100110101 · JOHN JAY CTF · EST. SPRING 2023
              </span>
            </span>
          </section>
        </CubeAnchor>

        {/* 8 — JOIN / COLLABORATE */}
        <CubeAnchor id="join" kf={{ x: 0.13, y: 0.42, scale: 0.66, face: "blue", glow: "#1E80F0" }}>
          <Band tone="tinted" accent="blue" index="06 — COLLABORATE" rail="06 · JOIN · 01001010 · OPEN SEATS">
            <span
              aria-hidden
              className="absolute -right-10 top-1/2 -translate-y-1/2 font-display font-black uppercase select-none pointer-events-none hidden lg:block"
              style={{ fontSize: "22vw", lineHeight: 0.8, color: "var(--color-cube-blue)", opacity: 0.07, writingMode: "vertical-rl" }}
            >
              CSS
            </span>
            <div className="max-w-[720px] mb-10">
              <SplitLines
                as="h2"
                lines={["Open seats."]}
                className="font-display font-black tracking-tight leading-[0.95] mb-5"
                lineClass="text-[clamp(36px,5vw,80px)]"
              />
              <Reveal>
                <p className="text-[17px] leading-relaxed" style={{ color: "var(--tone-muted)" }}>
                  {bandCopy("Collaborate")}
                </p>
              </Reveal>
            </div>
            <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-x-10 gap-y-8">
              <div>
                <p className="mono-label mb-3"><span className="bg-(--accent) text-(--accent-contrast) px-2 py-1">OPENINGS</span></p>
                <IndexList rows={collaborate.openings.slice(0, 4).map((o) => ({ title: o.role, meta: "OPEN", href: "/join" }))} />
              </div>
              <div>
                <p className="mono-label mb-3"><span className="bg-(--accent) text-(--accent-contrast) px-2 py-1">COMMITTEES</span></p>
                <IndexList rows={collaborate.committees.map((c) => ({ title: c, meta: "JOIN", href: "/join" }))} />
              </div>
              <div>
                <p className="mono-label mb-3"><span className="bg-(--accent) text-(--accent-contrast) px-2 py-1">PROJECT IDEAS</span></p>
                <Reveal><p className="text-sm leading-relaxed" style={{ color: "var(--tone-muted)" }}>{collaborate.project_ideas}</p></Reveal>
              </div>
              <div>
                <p className="mono-label mb-3"><span className="bg-(--accent) text-(--accent-contrast) px-2 py-1">SUGGESTIONS</span></p>
                <Reveal><p className="text-sm leading-relaxed" style={{ color: "var(--tone-muted)" }}>{collaborate.suggestions}</p></Reveal>
              </div>
            </div>
            <Reveal delay={0.1}>
              <Link to="/join" className="inline-flex items-center gap-2 mt-10 px-6 py-3 rounded-(--radius-sm) bg-(--accent) text-(--accent-contrast) font-semibold text-sm hover:brightness-110 transition-all">
                Join the Society <ArrowUpRight size={15} />
              </Link>
            </Reveal>
          </Band>
        </CubeAnchor>

        {/* 9 — GALLERY */}
        <CubeAnchor id="gallery" kf={{ x: 0.93, y: 0.18, scale: 0.26, face: "threeQuarter", glow: "#6ED2E6" }}>
        <Band tone="light" accent="teal" index="07 — ON CAMPUS" rail="07 · GALLERY · 01000111 · FRAMES">
          <RevealGroup className="columns-2 md:columns-3 gap-5 [&>div]:mb-5">
            {GALLERY.map((g) => (
              <RevealItem key={g.src} className="break-inside-avoid">
                <figure className="border border-(--tone-line) p-2 group overflow-hidden">
                  <div className="overflow-hidden">
                    <img src={g.src} alt={g.cap.toLowerCase()} loading="lazy" className="w-full transition-transform duration-500 group-hover:scale-[1.03]" />
                  </div>
                  <figcaption className="mono-label pt-2" style={{ color: "var(--tone-muted)" }}>{g.cap}</figcaption>
                </figure>
              </RevealItem>
            ))}
          </RevealGroup>
        </Band>
        </CubeAnchor>

        {/* 10 — PROGRAMS & PARTNERS */}
        <CubeAnchor id="partners" kf={{ x: 0.93, y: 0.22, scale: 0.26, face: "threeQuarter", glow: "#6ED2E6" }}>
        <Band tone="light-2" accent="teal" index="08 — PROGRAMS & PARTNERS" rail="08 · PARTNERS · 01010000 · SLOTS">
          <RevealGroup className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { title: "MSRC Tutoring", meta: "JOHN JAY", href: "https://linktr.ee/jsuite" },
              { title: "PRISM", meta: "JOHN JAY", href: "https://www.jjay.cuny.edu/prism" },
              { title: "Discord", meta: "661 MEMBERS · 2021", href: links.discord },
            ].map((p2) => (
              <RevealItem key={p2.title}>
                <a href={p2.href} target="_blank" rel="noreferrer noopener" className="flex flex-col justify-between border border-(--tone-line) p-4 min-h-[110px] hover:border-(--accent) transition-colors">
                  <span className="mono-label" style={{ color: "var(--tone-muted)" }}>{p2.meta}</span>
                  <span className="font-display font-bold text-base flex items-center gap-1.5" style={{ fontStretch: "108%" }}>
                    {p2.title} <ArrowUpRight size={14} />
                  </span>
                </a>
              </RevealItem>
            ))}
            <RevealItem><SlotCard n="04" label="Open" action="partner ↗" /></RevealItem>
            <RevealItem><SlotCard n="05" label="Open" /></RevealItem>
          </RevealGroup>
        </Band>
        </CubeAnchor>

        {/* 11 — FIN */}
        <CubeAnchor id="fin" kf={{ x: 0.5, y: 0.5, scale: 0.5, face: "threeQuarter", glow: "#6ED2E6" }}>
          <div data-accent="teal"><FinLine n="01" binary="01001010 01001010 01000011 01010011" /></div>
        </CubeAnchor>
      </main>
    </CubeRailProvider>
  );
}
