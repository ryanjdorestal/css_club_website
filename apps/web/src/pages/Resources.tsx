import { useState } from "react";
import resources from "@data/resources.json";
import links from "@data/links.json";
import { Band } from "@/components/Band";
import { PageHero } from "@/components/PageHero";
import { PosterBand } from "@/components/PosterBand";
import { FinLine } from "@/components/FinLine";
import { IndexList } from "@/components/cards/IndexList";
import { SpecSheet } from "@/components/cards/SpecSheet";
import { Reveal } from "@/motion/Reveal";
import { ArrowUpRight } from "lucide-react";

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
  const g = resources.groups[active];
  return (
    <main>
      <PageHero
        kicker="RESOURCES · CURATED BY BOARDS PAST AND PRESENT"
        lines={["Resources."]}
        dek="Learning paths, internship boards, John Jay tech programs and tutoring. Spot a dead link? Tell the board on Discord — every link still needs its click-test (the list is from 2021-2025)."
        stats={[
          { v: resources.count, l: "LINKS · CURATED" },
          { v: resources.groups.length, l: "CATEGORIES" },
          { v: 2, l: "JJ PROGRAMS · TTP / PRISM" },
          { v: 1, l: "YOUTUBE CHANNEL" },
        ]}
      />

      {/* 2 — sticky category index + list */}
      <Band tone="light" accent="teal" index="01 — THE INDEX" rail="01 · LINKS · 01010010 · CLICK-TEST DUE">
        <div className="grid md:grid-cols-[260px_1fr] gap-10 items-start">
          <nav className="md:sticky md:top-24 flex md:flex-col flex-wrap gap-1">
            {resources.groups.map((grp, i) => (
              <button
                key={grp.group}
                onClick={() => setActive(i)}
                className={`mono-label text-left px-3 py-2 border-l-2 transition-colors cursor-pointer ${
                  i === active
                    ? "border-(--accent) text-(--accent-ink) bg-(--accent)/5"
                    : "border-transparent hover:border-(--tone-line)"
                }`}
                style={i === active ? {} : { color: "var(--tone-muted)" }}
              >
                {String(i + 1).padStart(2, "0")} — {grp.group.toUpperCase()}
              </button>
            ))}
          </nav>
          <div>
            <div className="flex items-baseline justify-between border-b border-(--tone-line) pb-3 mb-2">
              <h2 className="font-display font-black uppercase text-2xl" style={{ fontStretch: "112%" }}>{g.group}</h2>
              <span className="mono-label" style={{ color: "var(--tone-muted)" }}>{g.links.length} LINKS · STATUS: UNVERIFIED</span>
            </div>
            <IndexList
              key={g.group}
              rows={g.links.map((l, i) => ({
                index: String(i + 1).padStart(2, "0"),
                title: l.title,
                dek: l.description?.slice(0, 110),
                meta: new URL(l.url).hostname.replace("www.", "").toUpperCase(),
                href: l.url,
              }))}
            />
          </div>
        </div>
      </Band>

      {/* 3 — starter kits */}
      <Band tone="dark-2" accent="teal" index="02 — STARTER KITS" rail="02 · KITS · 01001011 · THREE PATHS">
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

      <PosterBand accent="teal" meta="// THE OLD SITE SAID IT BEST" lines={["Not sure where", { text: "to start? Here.", className: "text-teal" }]} />
      <FinLine n="06" />
    </main>
  );
}
