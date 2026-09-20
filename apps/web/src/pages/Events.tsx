import { ArrowUpRight } from "lucide-react";
import events from "@data/events.json";
import workshops from "@data/workshops.json";
import { Band } from "@/components/Band";
import { PageHero, DossierMeta } from "@/components/PageHero";
import { PosterBand } from "@/components/PosterBand";
import { FinLine } from "@/components/FinLine";
import { TicketCard } from "@/components/cards/TicketCard";
import { SlotCard } from "@/components/cards/SlotCard";
import { SpecSheet } from "@/components/cards/SpecSheet";
import { Watermark } from "@/components/Watermark";
import { Reveal, RevealGroup, RevealItem } from "@/motion/Reveal";
import { brand } from "@brand/brand.config";
import * as Sg from "@/sigils";

const nEvents = events.semesters.reduce((a, s) => a + s.events.length, 0);

const SERIES: { name: string; topic: string[] }[] = [
  { name: "Security series", topic: ["Security"] },
  { name: "Web & mobile series", topic: ["Web", "Mobile", "Tools", "Systems", "Cloud"] },
  { name: "Career series", topic: ["Career"] },
];

export default function Events() {
  return (
    <main>
      <PageHero
        kicker="EVENTS · THE MANIFEST"
        cubeFace="red"
        cubeGlow="#CE4A4A"
        lines={["Events."]}
        dek="Workshops, general meetings, career prep and panels — every semester ships a new slate. Below: the archive as migrated from the old site, plus the workshop repos that never stopped existing."
        right={
          <div className="relative">
            {/* jj_06/T02: sigil cubes floating through the type */}
            <span className="absolute -top-24 -left-20 text-red opacity-80 rotate-12"><Sg.CubeSigil face="r" size={56} /></span>
            <span className="absolute -top-8 right-2 text-red opacity-50 -rotate-6"><Sg.CubeSigil face="r" size={34} /></span>
            <DossierMeta rows={[["TERM", "FALL 2026"], ["ARCHIVED", `${nEvents} EVENTS`], ["VENUE", "NB · HYBRID"], ["SERIES", `${workshops.workshops.length} WORKSHOPS`]]} />
          </div>
        }
        stats={[
          { v: nEvents, l: "EVENTS ARCHIVED" },
          { v: events.semesters.length, l: "SEMESTERS MIGRATED" },
          { v: workshops.workshops.length, l: "WORKSHOP REPOS" },
          { v: 2, l: "MEETINGS · GENERAL / FINAL" },
        ]}
      />

      {/* 2 — Upcoming */}
      <Band tone="tinted" accent="red" index="01 — UPCOMING · FALL 2026" sigil={<Sg.Flag size={16} />} code="F26" rail="01 · UPCOMING · 01000101 · TBD BY BOARD">
        <div className="grid md:grid-cols-3 gap-5 items-stretch">
          <SlotCard n="01" label="Next event — Open" action="propose one ↗" href="/join" className="min-h-[160px]" />
          <SlotCard n="02" label="Open" className="min-h-[160px]" />
          <Reveal className="flex flex-col justify-center border border-(--tone-line) p-6">
            <p className="text-sm leading-relaxed" style={{ color: "var(--tone-muted)" }}>
              Nothing scheduled yet — the board sets the Fall 2026 slate at the first
              general meeting. Want something taught? Propose it and the board will
              slot it in.
            </p>
          </Reveal>
        </div>
      </Band>

      {/* 3 — Previous by semester */}
      <Band tone="dark-2" accent="red" index="02 — PREVIOUS EVENTS · BY SEMESTER" sigil={<Sg.CubeSigil size={16} />} code="ARCHIVE" rail="02 · ARCHIVE · 01000001 · 2024-2025">
        <Watermark src={brand.logos.svg} side="right" width="36vw" opacity={0.05} />
        {events.semesters.map((sem) => (
          <div key={sem.semester} className="mb-14 last:mb-0">
            <div className="flex items-baseline gap-4 mb-6">
              <span className="t-pixel text-(--accent-fg)">{"//"}{sem.semester.slice(0, 1)}{sem.semester.slice(-2)}</span>
              <h2 className="t-h2 uppercase">{sem.semester}</h2>
              <span className="t-micro opacity-55 tnum">{sem.events.length} EVENTS · ARCHIVED</span>
            </div>
            <RevealGroup className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {sem.events.map((ev, i) => (
                <RevealItem key={ev.title + i}>
                  <TicketCard
                    model={`EVT-${sem.semester.slice(0, 1)}${sem.semester.slice(-2)}-${String(i + 1).padStart(2, "0")}`}
                    title={ev.title}
                    image={ev.flyer ? `/${ev.flyer}` : undefined}
                    imageAlt={`${ev.title} flyer`}
                    rows={[
                      ...(ev.date ? [{ k: "DATE", v: ev.date.replace(/, 20\d\d$/, "") }] : []),
                      ...(ev.time ? [{ k: "TIME", v: ev.time }] : []),
                      ...(ev.room ? [{ k: "ROOM", v: ev.room }] : []),
                    ]}
                  />
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        ))}
      </Band>

      {/* 4 — Workshops as spec sheets */}
      <Band tone="light" accent="red" index="03 — PREVIOUS WORKSHOPS · LIVE ON GITHUB" sigil={<Sg.Terminal size={16} />} code="REPOS" rail="03 · WORKSHOPS · 01010111 · 2021 →">
        <div className="grid md:grid-cols-3 gap-6">
          {SERIES.map((s) => {
            const rows = workshops.workshops.filter((w) => s.topic.includes(w.topic));
            return (
              <Reveal key={s.name}>
                <SpecSheet tag={`${rows.length}`} title={s.name}
                  rows={rows.map((w) => ({
                    k: w.topic.toUpperCase(),
                    v: (
                      <a href={w.repo} target="_blank" rel="noreferrer noopener" className="u-draw inline-flex items-center gap-1">
                        {w.name} <ArrowUpRight size={12} />
                      </a>
                    ),
                  }))}
                />
              </Reveal>
            );
          })}
        </div>
        <Reveal>
          <a href={workshops.org} target="_blank" rel="noreferrer noopener" className="mono-label text-(--accent-ink) u-draw inline-block mt-8">
            ALL REPOS · GITHUB.COM/JJCSS ↗
          </a>
        </Reveal>
      </Band>

      <PosterBand accent="red" meta="// FALL 2026 · FIRST GENERAL MEETING" lines={["See you", { text: "there.", className: "text-red", outline: true }]} />
      <FinLine n="03" />
    </main>
  );
}
