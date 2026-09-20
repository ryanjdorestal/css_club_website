import { ArrowUpRight } from "lucide-react";
import resources from "@data/resources.json";
import { Section } from "@/components/Section";
import { SectionHeader } from "@/components/SectionHeader";
import { MonoLabel } from "@/components/MonoLabel";

/** /resources — blue. The migrated link library, grouped, spec-sheet style. */
export default function Resources() {
  return (
    <main>
      <Section accent="blue">
        <SectionHeader index="01" title="Resources" kicker={`${resources.count} curated links`} as="h1" />
        <p className="text-muted max-w-2xl -mt-4 mb-10 text-sm leading-relaxed">
          Learning paths, internship boards, John Jay tech programs and tutoring —
          collected by boards past and present. Spot a dead link? Tell the board on
          Discord.
        </p>
        <div className="flex flex-col gap-10">
          {resources.groups.map((g, gi) => (
            <div key={g.group}>
              <div className="flex items-baseline gap-3 border-b border-line pb-2 mb-4">
                <span className="pixel text-(--accent-fg) text-2xl">{String(gi + 1).padStart(2, "0")}</span>
                <h2 className="font-display font-bold uppercase text-lg" style={{ fontStretch: "112%" }}>
                  {g.group}
                </h2>
                <MonoLabel>{g.links.length} links</MonoLabel>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {g.links.map((l) => (
                  <a
                    key={l.url}
                    href={l.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="group border border-line rounded-(--radius-sm) px-4 py-3 hover:border-(--accent) transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium">{l.title}</span>
                      <ArrowUpRight
                        size={15}
                        className="text-muted group-hover:text-(--accent-fg) shrink-0 transition-colors"
                      />
                    </div>
                    {l.description && (
                      <p className="text-xs text-muted leading-relaxed mt-1.5 line-clamp-2">{l.description}</p>
                    )}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>
    </main>
  );
}
