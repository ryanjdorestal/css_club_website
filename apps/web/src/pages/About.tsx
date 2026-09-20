import { useState } from "react";
import aboutRaw from "@content/about.md?raw";
import board from "@data/board.json";
import { parseMd } from "@/lib/md";
import { Section } from "@/components/Section";
import { SectionHeader } from "@/components/SectionHeader";
import { MonoLabel } from "@/components/MonoLabel";
import { PixelDivider } from "@/components/PixelDivider";

const doc = parseMd(aboutRaw);

type Member = (typeof board.terms)[number]["members"][number];

function MemberCard({ m }: { m: Member }) {
  return (
    <article className="border border-line rounded-(--radius-md) overflow-hidden bg-navy-500/30">
      {m.photo && (
        <img
          src={`/${m.photo}`}
          alt={m.name}
          loading="lazy"
          className="w-full aspect-square object-cover object-top border-b border-line bg-navy-800"
        />
      )}
      <div className="p-4">
        <h3 className="font-display font-bold text-base leading-tight">{m.name}</h3>
        <MonoLabel accent>{m.role}</MonoLabel>
        {m.bio && <p className="text-xs text-muted leading-relaxed mt-2 line-clamp-4">{m.bio}</p>}
      </div>
    </article>
  );
}

/** /about — blue. Copy + current roster + alumni boards (collapsible by term). */
export default function About() {
  const [openTerms, setOpenTerms] = useState<Record<string, boolean>>({});
  const [current, ...alumni] = board.terms;
  const sections: { h: string; ps: string[] }[] = [];
  for (const b of doc.blocks) {
    if (b.type === "h2") sections.push({ h: b.text, ps: [] });
    else if (sections.length) sections[sections.length - 1].ps.push(b.text);
  }
  // the old site published the same paragraph under two headings; keep the first
  const seen = new Set<string>();
  for (const s of sections) {
    s.ps = s.ps.filter((p) => {
      const key = p.slice(0, 80);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
  return (
    <main>
      <Section accent="blue">
        <SectionHeader index="01" title="About" kicker="Who we are · What we do" as="h1" />
        <div className="grid gap-8 md:grid-cols-2 max-w-5xl">
          {sections
            .filter((s) => s.ps.length > 0 && s.ps.join("").length > 40)
            .slice(0, 4)
            .map((s, i) => (
              <div key={s.h} className="border-l-2 border-(--accent) pl-5">
                <MonoLabel accent>{"//"} 0{i + 2}</MonoLabel>
                <h2 className="font-display font-bold uppercase text-xl mt-1 mb-2" style={{ fontStretch: "112%" }}>
                  {s.h}
                </h2>
                {s.ps.map((p, j) => (
                  <p key={j} className="text-sm text-muted leading-relaxed mb-2">
                    {p}
                  </p>
                ))}
              </div>
            ))}
        </div>
      </Section>
      {current && (
        <Section accent="blue" className="pt-0">
          <PixelDivider className="mb-10" />
          <div className="flex items-baseline gap-4 mb-6 border-b border-line pb-3">
            <span className="pixel text-(--accent-fg) text-3xl">05</span>
            <h2 className="font-display font-bold uppercase text-2xl" style={{ fontStretch: "112%" }}>
              The board
            </h2>
            <MonoLabel>{current.term} · most recent on record</MonoLabel>
          </div>
          <div className="grid gap-5 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
            {current.members.map((m) => (
              <MemberCard key={m.name} m={m} />
            ))}
          </div>
        </Section>
      )}
      <Section accent="blue" className="pt-0">
        <div className="flex items-baseline gap-4 mb-6 border-b border-line pb-3">
          <span className="pixel text-(--accent-fg) text-3xl">06</span>
          <h2 className="font-display font-bold uppercase text-2xl" style={{ fontStretch: "112%" }}>
            Alumni boards
          </h2>
          <MonoLabel>Fall 2020 → · the inheritance</MonoLabel>
        </div>
        <div className="flex flex-col gap-3">
          {alumni.map((t) => (
            <div key={t.term} className="border border-line rounded-(--radius-md)">
              <button
                onClick={() => setOpenTerms((s) => ({ ...s, [t.term]: !s[t.term] }))}
                className="w-full flex items-center justify-between px-5 py-3.5 cursor-pointer"
                aria-expanded={!!openTerms[t.term]}
              >
                <span className="font-display font-bold uppercase text-sm" style={{ fontStretch: "110%" }}>
                  {t.term}
                </span>
                <MonoLabel>{t.members.length} members {openTerms[t.term] ? "−" : "+"}</MonoLabel>
              </button>
              {openTerms[t.term] && (
                <div className="grid gap-5 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 p-5 border-t border-line">
                  {t.members.map((m) => (
                    <MemberCard key={m.name} m={m} />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </Section>
    </main>
  );
}
