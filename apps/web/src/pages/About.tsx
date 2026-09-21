import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import aboutRaw from "@content/about.md?raw";
import boardData from "@data/board.json";
import { useApi } from "@/lib/useApi";
import links from "@data/links.json";
import { parseMd } from "@/lib/md";
import { Band } from "@/components/Band";
import { PageHero } from "@/components/PageHero";
import { PosterBand } from "@/components/PosterBand";
import { FolderCard } from "@/components/cards/FolderCard";
import { FinLine } from "@/components/FinLine";
import { PhotoFrame } from "@/components/PhotoFrame";
import { Pullquote } from "@/components/Pullquote";
import { Watermark } from "@/components/Watermark";
import { TicketCard } from "@/components/cards/TicketCard";
import { IndexList } from "@/components/cards/IndexList";
import { MonoLabel } from "@/components/MonoLabel";
import { SplitLines } from "@/motion/SplitLines";
import { Reveal, RevealGroup, RevealItem } from "@/motion/Reveal";
import { brand } from "@brand/brand.config";
import * as Sg from "@/sigils";

const doc = parseMd(aboutRaw);

function sectionText(h: string): string {
  const i = doc.blocks.findIndex((b) => b.type === "h2" && b.text.toLowerCase().includes(h.toLowerCase()));
  return i >= 0 && doc.blocks[i + 1]?.type === "p" ? doc.blocks[i + 1].text : "";
}

// the old About's four "What We Do" activity tiles, carried verbatim
const ACTIVITIES = [
  { t: "Explore Cybersecurity", d: "Workshops and hands-on labs across security topics — the club's home turf." },
  { t: "Learn New Languages", d: "Python, JavaScript, Swift, C++ — semester workshops for every level." },
  { t: "Find The Best Resources", d: "A curated library: classes at John Jay, internships, tutoring, roadmaps." },
  { t: "Conquer LeetCode", d: "Technical-interview prep sessions and practice together, not alone." },
];

export default function About() {
  const { data: board } = useApi<typeof boardData>("/api/board", boardData);
  const [current, ...alumni] = board.terms;
  const [open, setOpen] = useState<string | null>(null);
  const who = sectionText("grow together") || sectionText("Who We Are");
  return (
    <main>
      <PageHero
        kicker="ABOUT · WHO WE ARE · WHAT WE DO"
        cubeFace="threeQuarter"
        lines={[
          { text: "Who", stencil: true },
          { text: "we are.", outline: true },
        ]}
        dek={who.slice(0, 260) + "…"}
        stats={[
          { v: board.terms.reduce((a, t) => a + t.members.length, 0), l: "OFFICERS · ALL TERMS" },
          { v: board.terms.length, l: "BOARDS ON RECORD" },
          { v: 6, l: "YEARS AT JOHN JAY" },
          { v: 4, l: "COMMITTEES" },
        ]}
      />

      {/* 2 — Let's grow together (spread) */}
      <Band tone="light" accent="teal" index="01 — LET'S GROW TOGETHER" sigil={<Sg.Star4 size={16} />} code="ABT_01" rail="01 · ABOUT · 01000001 · 2020 →">
        <div className="grid md:grid-cols-[5fr_7fr] gap-10 md:gap-16 items-start">
          <Reveal>
            <PhotoFrame
              src="/img/photos/involvement-fair-fall-2022.webp"
              alt="CSS table at the involvement fair"
              caption="INVOLVEMENT FAIR · FALL 2022"
              tag="VISUAL · 01 / CLUB"
              meta="FRAME · 001"
            />
          </Reveal>
          <div>
            <SplitLines
              as="h2"
              lines={["The club shines when", "everyone shines."]}
              className="font-display font-black tracking-tight leading-[0.95] mb-6"
              lineClass="text-[clamp(32px,4.4vw,64px)]"
            />
            <Reveal>
              <p className="text-[16px] leading-relaxed max-w-[60ch]" style={{ color: "var(--tone-muted)" }}>
                {who}
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="mt-8">
                <Pullquote cite="— the About page, kept verbatim">Let's grow together!</Pullquote>
              </div>
            </Reveal>
          </div>
        </div>
      </Band>

      {/* 3 — What We Do During The Semester */}
      <Band
        tone="dark-2"
        accent="red"
        index="02 — WHAT WE DO DURING THE SEMESTER"
        sigil={<Sg.Chevrons size={16} />}
        code="SEMESTER"
        rail="02 · SEMESTER · 01010111 · WEEKLY"
      >
        <Watermark src={brand.logos.svg} side="left" width="34vw" opacity={0.05} />
        <IndexList
          rows={ACTIVITIES.map((a, i) => ({
            index: String(i + 1),
            bracket: true,
            title: a.t,
            dek: a.d,
            meta: "EVERY_TERM",
            href: "/events",
            sigil: [<Sg.Shield key="s" size={14} />, <Sg.Lambda key="l" size={14} />, <Sg.Node key="n" size={14} />, <Sg.Terminal key="t" size={14} />][i],
          }))}
        />
      </Band>

      {/* 4 — Discussion With Your Peers */}
      <Band
        tone="tinted"
        accent="blue"
        index="03 — DISCUSSION WITH YOUR PEERS"
        sigil={<Sg.Terminal size={16} />}
        code="DSC_2021"
        rail="03 · DISCORD · 01000100 · EST. 2021"
      >
        <div className="grid md:grid-cols-[7fr_5fr] gap-10 items-center">
          <div>
            <SplitLines
              as="h2"
              lines={["The server is the", "clubhouse."]}
              className="font-display font-black tracking-tight leading-[0.95] mb-5"
              lineClass="text-[clamp(32px,4.4vw,64px)]"
            />
            <Reveal>
              <p className="text-[16px] leading-relaxed max-w-[56ch]" style={{ color: "var(--tone-muted)" }}>
                {sectionText("Discussion")}
              </p>
            </Reveal>
          </div>
          <Reveal delay={0.1}>
            <TicketCard
              model="DSC-2021"
              title="CSS @ JJAY · Discord"
              rows={[
                { k: "ESTABLISHED", v: "FEB 2021" },
                { k: "INVITE", v: "discord.gg — click below" },
                { k: "STATUS", v: "CLICK-TEST PENDING" },
              ]}
              footer={
                <a
                  href={links.discord}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-(--radius-sm) bg-(--accent) text-(--accent-contrast) text-sm font-semibold hover:brightness-110 transition-all"
                >
                  Join the Discord <ArrowUpRight size={14} />
                </a>
              }
            />
          </Reveal>
        </div>
      </Band>

      {/* 5 — The Board + term history */}
      <Band
        tone="light-2"
        accent="green"
        sigil={<Sg.Eye size={16} />}
        code="INHERITANCE"
        index="04 — THE BOARD"
        title={`${current.term.toUpperCase()} · MOST RECENT ON RECORD`}
        rail="04 · BOARD · 01000010 · INHERITANCE"
      >
        <RevealGroup className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-14">
          {current.members.slice(0, 8).map((m) => (
            <RevealItem key={m.name}>
              {/* run 9: officer = a folder (T11) — tab = role, edge label = the board id, dossier layout inside */}
              <FolderCard
                as="article"
                tab={m.role.toUpperCase()}
                tone="paper"
                edgeLabel={`BRD-${current.term
                  .replace(/[^A-Z0-9]/gi, "")
                  .slice(0, 3)
                  .toUpperCase()}-${String(current.members.indexOf(m) + 1).padStart(2, "0")}`}
                className="h-full"
              >
                {m.photo && <img src={`/${m.photo}`} alt={m.name} loading="lazy" className="w-full aspect-square object-cover object-top" />}
                {/* the dossier sheet (R9_05): micro caps keys over values */}
                <dl className="mt-3 grid grid-cols-[46px_1fr] gap-x-2 gap-y-0.5">
                  <dt className="t-micro opacity-60 pt-0.5">NAME</dt>
                  <dd className="t-h3 !text-[14px] !font-medium leading-tight">{m.name}</dd>
                  <dt className="t-micro opacity-60 pt-0.5">ROLE</dt>
                  <dd className="t-micro raise text-(--accent-ink)">{m.role.toUpperCase()}</dd>
                  <dt className="t-micro opacity-60 pt-0.5">TERM</dt>
                  <dd className="t-micro raise">{current.term.toUpperCase()}</dd>
                </dl>
              </FolderCard>
            </RevealItem>
          ))}
        </RevealGroup>
        <p className="mono-label mb-4" style={{ color: "var(--tone-muted)" }}>
          TERM HISTORY · FALL 2020 → · THE INHERITANCE
        </p>
        <div className="border-t border-(--tone-line)">
          {alumni.map((t) => (
            <div key={t.term} className="border-b border-(--tone-line)">
              <button
                onClick={() => setOpen(open === t.term ? null : t.term)}
                aria-expanded={open === t.term}
                className="w-full flex items-center gap-6 py-4 cursor-pointer group"
              >
                <span className="mono-label text-(--accent-ink) w-8 text-left">{open === t.term ? "−" : "+"}</span>
                <span className="font-display font-bold text-lg" style={{ fontStretch: "108%" }}>
                  {t.term}
                </span>
                <span className="mono-label ml-auto" style={{ color: "var(--tone-muted)" }}>
                  {t.members.length} MEMBERS
                </span>
              </button>
              {open === t.term && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 pb-6">
                  {t.members.map((m) => (
                    <div key={m.name} className="border border-(--tone-line) bg-paper p-3">
                      <p className="font-display font-bold text-sm leading-tight" style={{ fontStretch: "108%" }}>
                        {m.name}
                      </p>
                      <MonoLabel className="!text-(--accent)">{m.role}</MonoLabel>
                      {m.bio && (
                        <p className="text-xs mt-2 line-clamp-3" style={{ color: "var(--tone-muted)" }}>
                          {m.bio}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </Band>

      <PosterBand
        accent="teal"
        meta="// THE BANNER SAYS IT"
        lines={["Debug your mind.", { text: "Commit to growth.", className: "text-teal", outline: true }]}
      />
      <FinLine n="02" next="/resources" />
    </main>
  );
}
