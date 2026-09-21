import { ArrowUpRight } from "lucide-react";
import aboutRaw from "@content/about.md?raw";
import boardData from "@data/board.json";
import { useApi } from "@/lib/useApi";
import links from "@data/links.json";
import { parseMd } from "@/lib/md";
import { Band } from "@/components/Band";
import { PageHero } from "@/components/PageHero";
import { PosterBand } from "@/components/PosterBand";
import { FinLine } from "@/components/FinLine";
import { PhotoFrame } from "@/components/PhotoFrame";
import { Pullquote } from "@/components/Pullquote";
import { Watermark } from "@/components/Watermark";
import { TicketCard } from "@/components/cards/TicketCard";
import { IndexList } from "@/components/cards/IndexList";
import { SplitLines } from "@/motion/SplitLines";
import { Reveal } from "@/motion/Reveal";
import { BoardBand } from "./about/BoardBand";
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
  // the grid shows the most recent board WITH seats; the current term (even before its seats are filled) is named in the title
  const withSeats = board.terms.filter((t) => t.members.length);
  const [current, ...alumni] = withSeats.length ? withSeats : board.terms;
  const currentLabel = board.current_term && board.current_term !== current.term ? `${board.current_term.toUpperCase()} · CURRENT · ` : "";
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
              className="font-display font-extrabold tracking-tight leading-[0.95] mb-6"
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
              className="font-display font-extrabold tracking-tight leading-[0.95] mb-5"
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

      <BoardBand current={current} alumni={alumni} currentLabel={currentLabel} />

      <PosterBand
        accent="teal"
        meta="// THE BANNER SAYS IT"
        lines={["Debug your mind.", { text: "Commit to growth.", className: "text-teal", outline: true }]}
      />
      <FinLine n="02" next="/resources" />
    </main>
  );
}
