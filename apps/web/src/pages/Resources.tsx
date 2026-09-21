import { useState } from "react";
import resourcesData from "@data/resources.json";
import linksData from "@data/links.json";
import { useApi } from "@/lib/useApi";
import { Band } from "@/components/Band";
import { PageHero } from "@/components/PageHero";
import { PosterBand } from "@/components/PosterBand";
import { FinLine } from "@/components/FinLine";
import { IndexList } from "@/components/cards/IndexList";
import { FolderCard } from "@/components/cards/FolderCard";
import { SpecSheet } from "@/components/cards/SpecSheet";
import { Reveal } from "@/motion/Reveal";
import { ArrowUpRight } from "lucide-react";
import * as Sg from "@/sigils";
import { StatusChip } from "@/components/cards/StatusChip";

const KITS = [
  {
    tag: "KIT 01",
    title: "Start coding",
    rows: [
      ["FIRST", "Git/Github — version control from day one"],
      ["THEN", "Codecademy · free web-dev track"],
      ["PRACTICE", "LeetCode + CodePath Tech Prep"],
    ],
  },
  {
    tag: "KIT 02",
    title: "Break into security",
    rows: [
      ["FIRST", "CodePath Cybersecurity course"],
      ["THEN", "Cyberhounds practice · picoCTF"],
      ["AT JJ", "Tech Talent Pipeline · MSRC tutoring"],
    ],
  },
  {
    tag: "KIT 03",
    title: "Get the internship",
    rows: [
      ["SEARCH", "WayUp — CS internship board"],
      ["COMP", "Levels.fyi — know your number"],
      ["PREP", "Technical Interview Prep series"],
    ],
  },
];

export default function Resources() {
  const [active, setActive] = useState(0);
  const { data: resources } = useApi<typeof resourcesData>("/api/resources", resourcesData);
  const { data: linksApi } = useApi<{ links: Record<string, string> }>("/api/links", { links: linksData as unknown as Record<string, string> });
  const links = { ...linksData, ...linksApi.links };
  const g = resources.groups[active];
  return (
    <main>
      <PageHero
        kicker="RESOURCES · CURATED BY BOARDS PAST AND PRESENT"
        cubeFace="threeQuarter"
        lines={[{ text: "Resources.", stencil: true }]}
        dek="Learning paths, internship boards, John Jay tech programs and tutoring. Spot a dead link? Tell the board on Discord — every link still needs its click-test (the list is from 2021-2025)."
        stats={[
          { v: resources.count, l: "LINKS · CURATED" },
          { v: resources.groups.length, l: "CATEGORIES" },
          { v: 2, l: "JJ PROGRAMS · TTP / PRISM" },
          { v: 1, l: "YOUTUBE CHANNEL" },
        ]}
      />

      {/* 2 — sticky category index + list */}
      <Band tone="light" accent="teal" index="01 — THE INDEX" sigil={<Sg.Node size={16} />} code="LINK_DB" rail="01 · LINKS · 01010010 · CLICK-TEST DUE">
        <div className="grid md:grid-cols-[260px_1fr] gap-10 items-start">
          <nav className="md:sticky md:top-24 flex md:flex-col flex-wrap gap-1.5">
            {resources.groups.map((grp, i) => (
              <button key={grp.group} onClick={() => setActive(i)} className="group flex items-center gap-3 text-left cursor-pointer py-1">
                <span
                  className={`t-label raise w-8 h-8 shrink-0 flex items-center justify-center transition-all ${
                    i === active ? "border border-(--accent) text-(--accent-ink)" : "text-current opacity-40 group-hover:opacity-80"
                  }`}
                  style={i === active ? { boxShadow: "0 0 0 3px color-mix(in srgb, var(--accent) 18%, transparent)" } : {}}
                >
                  {String.fromCharCode(65 + i)}
                </span>
                <span className={`t-micro ${i === active ? "raise text-(--accent-ink)" : "opacity-55"}`}>{grp.group.toUpperCase().replace(/ /g, "_")}</span>
              </button>
            ))}
          </nav>
          {/* run 9: each category is a folder (T11) — tab = category, the index list inside */}
          <FolderCard
            key={g.group}
            tab={`RES · ${String.fromCharCode(65 + active)} · ${g.group.toUpperCase()}`}
            tone="paper"
            edgeLabel={`//RES_${String(active + 1).padStart(2, "0")} · ${g.links.length}_LINKS`}
            barcode={g.group}
          >
            <div className="flex items-center justify-between border-b border-(--tone-line) pb-3 mb-2 gap-4">
              <h2 className="t-h2 uppercase">{g.group}</h2>
              <span className="flex items-center gap-3">
                <span className="t-micro opacity-55 tnum">{g.links.length} LINKS</span>
                <StatusChip state="idle" label="CLICK-TEST_DUE" />
              </span>
            </div>
            <IndexList
              rows={g.links.map((l, i) => ({
                index: String(i + 1).padStart(2, "0"),
                title: l.title,
                dek: l.description?.slice(0, 110),
                meta: new URL(l.url).hostname.replace("www.", "").toUpperCase(),
                href: l.url,
              }))}
            />
          </FolderCard>
        </div>
      </Band>

      {/* 3 — starter kits */}
      <Band tone="dark-2" accent="teal" index="02 — STARTER KITS" sigil={<Sg.Lambda size={16} />} code="KITS" rail="02 · KITS · 01001011 · THREE PATHS">
        <div className="grid md:grid-cols-3 gap-6">
          {KITS.map((kit) => (
            <Reveal key={kit.tag}>
              <SpecSheet tag={kit.tag} title={kit.title} rows={kit.rows.map(([k, v]) => ({ k, v }))} />
            </Reveal>
          ))}
        </div>
        <Reveal>
          <a href={links.youtube} target="_blank" rel="noreferrer noopener" className="mono-label text-teal u-draw inline-flex items-center gap-1.5 mt-8">
            MISSED A WORKSHOP? THE CSS YOUTUBE CHANNEL HAS THE RECORDINGS <ArrowUpRight size={12} />
          </a>
        </Reveal>
      </Band>

      <PosterBand
        accent="teal"
        meta="// THE OLD SITE SAID IT BEST"
        lines={["Not sure where", { text: "to start? Here.", className: "text-teal", outline: true }]}
      />
      <FinLine n="06" next="/news" />
    </main>
  );
}
