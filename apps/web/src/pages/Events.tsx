import { ArrowUpRight } from "lucide-react";
import events from "@data/events.json";
import workshops from "@data/workshops.json";
import { Section } from "@/components/Section";
import { SectionHeader } from "@/components/SectionHeader";
import { SpecCard } from "@/components/SpecCard";
import { MonoLabel } from "@/components/MonoLabel";
import { PixelDivider } from "@/components/PixelDivider";

/** /events — red. Each semester is a numbered "release" (jj_11 user-manual framing). */
export default function Events() {
  return (
    <main>
      <Section accent="red">
        <SectionHeader index="01" title="Events" kicker="Fall 2026 · Manifest" as="h1" />
        <p className="text-muted max-w-2xl -mt-4 mb-2 text-sm leading-relaxed">
          Workshops, general meetings, career prep and panels — every semester ships a
          new slate. The Fall 2026 schedule lands here; below is the archive as migrated
          from the old site.
        </p>
      </Section>
      {events.semesters.map((sem, si) => (
        <Section key={sem.semester} accent="red" className="pt-0">
          <div className="flex items-baseline gap-4 mb-6 border-b border-line pb-3">
            <span className="pixel text-(--accent-fg) text-3xl">{String(si + 2).padStart(2, "0")}</span>
            <h2 className="font-display font-bold uppercase text-2xl" style={{ fontStretch: "112%" }}>
              {sem.semester}
            </h2>
            <MonoLabel>{sem.events.length} events · archived</MonoLabel>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {sem.events.map((ev) => (
              <SpecCard
                key={ev.title + sem.semester}
                title={ev.title}
                eyebrow={`// ${sem.semester}`}
                image={ev.flyer ? `/${ev.flyer}` : undefined}
                imageAlt={`${ev.title} flyer`}
                specs={[
                  ...(ev.date ? [{ k: "Date", v: ev.date.replace(/, 20\d\d$/, "") }] : []),
                  ...(ev.time ? [{ k: "Time", v: ev.time }] : []),
                  ...(ev.room ? [{ k: "Room", v: ev.room }] : []),
                ]}
              >
                {ev.summary}
              </SpecCard>
            ))}
          </div>
        </Section>
      ))}
      <Section accent="red" className="pt-0">
        <PixelDivider className="mb-10" />
        <div className="flex items-baseline gap-4 mb-6 border-b border-line pb-3">
          <span className="pixel text-(--accent-fg) text-3xl">04</span>
          <h2 className="font-display font-bold uppercase text-2xl" style={{ fontStretch: "112%" }}>
            Previous workshops
          </h2>
          <MonoLabel>2021 → 2024 · live on GitHub</MonoLabel>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {workshops.workshops.map((w) => (
            <a
              key={w.name}
              href={w.repo}
              target="_blank"
              rel="noreferrer noopener"
              className="group flex items-center justify-between gap-3 border border-line rounded-(--radius-sm) px-4 py-3 hover:border-(--accent) transition-colors"
            >
              <div>
                <p className="text-sm font-medium">{w.name}</p>
                <MonoLabel>{w.topic}</MonoLabel>
              </div>
              <ArrowUpRight size={16} className="text-muted group-hover:text-(--accent-fg) transition-colors" />
            </a>
          ))}
        </div>
      </Section>
    </main>
  );
}
