import { ArrowUpRight } from "lucide-react";
import cyberRaw from "@content/cyberhounds.md?raw";
import links from "@data/links.json";
import { parseMd } from "@/lib/md";
import { Band } from "@/components/Band";
import { PosterBand } from "@/components/PosterBand";
import { FinLine } from "@/components/FinLine";
import { PhotoFrame } from "@/components/PhotoFrame";
import { DotMatrix } from "@/components/DotMatrix";
import { PosterCard } from "@/components/cards/PosterCard";
import { IndexList } from "@/components/cards/IndexList";
import { TicketCard } from "@/components/cards/TicketCard";
import { BinaryRings } from "@/components/BinaryRings";
import { SplitLines } from "@/motion/SplitLines";
import { Reveal, RevealGroup, RevealItem } from "@/motion/Reveal";

const doc = parseMd(cyberRaw);
function sec(h: string): string {
  const i = doc.blocks.findIndex((b) => b.type === "h2" && b.text.toLowerCase().includes(h.toLowerCase()));
  return i >= 0 && doc.blocks[i + 1]?.type === "p" ? doc.blocks[i + 1].text : "";
}

// competitions named in the old page + flyer art (context/02)
const COMPS = [
  { word: "PICO", meta: "CMU · YEAR-ROUND", index: "01 / 04" },
  { word: "NCL", meta: "CYBER SKYLINE · TERMLY", index: "02 / 04" },
  { word: "ANG-\nSTROM", meta: "SPRING", index: "03 / 04" },
  { word: "SDCTF", meta: "SAN DIEGO · SPRING", index: "04 / 04" },
];

const STEPS = [
  { title: "Show up", dek: "Meetings are hybrid — in person is encouraged; that's how you get on rosters" },
  { title: "Pick a track", dek: "OSINT, web exploitation, cryptography, enumeration & exploitation" },
  { title: "Practice", dek: "Team practice on picoCTF-style problems in the Discord channel" },
  { title: "Compete", dek: "Cyber Skyline NCL, AngstromCTF, San Diego CTF — sufficient participation gets you rostered" },
];

export default function Cyberhounds() {
  return (
    <main>
      {/* 1 — poster hero, jj_05 + jj_09 */}
      <section data-tone="dark-3" data-accent="red" className="relative overflow-hidden pt-[120px] pb-16">
        <BinaryRings opacity={0.05} />
        <div className="relative max-w-[1280px] mx-auto px-5 md:px-10 grid md:grid-cols-[8fr_4fr] gap-10 items-center">
          <div>
            <Reveal y={10}>
              <p className="mono-label text-(--accent-fg) mb-6">{"//"} SUB-CLUB · JOHN JAY CTF TEAM · CAPTURE · THE · FLAG</p>
            </Reveal>
            <SplitLines
              as="h1"
              lines={["Cyber", { text: "hounds.", className: "text-red" }]}
              className="font-display font-black uppercase tracking-[-0.03em] leading-[0.82]"
              lineClass="text-[clamp(64px,12vw,180px)]"
            />
            <Reveal delay={0.25}>
              <p className="mono-label text-muted mt-8">PICOCTF · NCL · ANGSTROMCTF · SDCTF</p>
            </Reveal>
          </div>
          <DotMatrix src="/img/brand/hound_banner.png" size={46} color="var(--color-red)" className="w-full max-w-[340px] justify-self-center" />
        </div>
        <span aria-hidden className="absolute right-5 top-0 bottom-0 hidden lg:flex items-center">
          <span className="mono-label text-(--accent-fg)/40" style={{ writingMode: "vertical-rl", fontSize: 10 }}>
            0000100100110101001100 · FLAG CAPTURED ! · EST. SPRING 2023
          </span>
        </span>
      </section>

      {/* 2 — What is CTF (spread) */}
      <Band tone="tinted" accent="red" index="01 — WHAT IS CTF?" rail="01 · CTF · 01000110 · OSINT/WEB/CRYPTO">
        <div className="grid md:grid-cols-[6fr_6fr] gap-10 md:gap-16 items-center">
          <div>
            <SplitLines
              as="h2"
              lines={["Capture the flag,", "literally."]}
              className="font-display font-black tracking-tight leading-[0.95] mb-5"
              lineClass="text-[clamp(32px,4.4vw,64px)]"
            />
            <Reveal>
              <p className="text-[16px] leading-relaxed max-w-[58ch]" style={{ color: "var(--tone-muted)" }}>{sec("What is CTF")}</p>
            </Reveal>
          </div>
          <Reveal delay={0.1}>
            <PhotoFrame src="/img/photos/cyberhounds-header.webp" alt="Cyberhounds header art" caption="CYBERHOUNDS · HEADER ART · ORIGINAL" tag="VISUAL · 01" meta="FRAME · 001" />
          </Reveal>
        </div>
      </Band>

      {/* 3 — How It Works */}
      <Band tone="dark-2" accent="red" index="02 — HOW IT WORKS" rail="02 · ROSTER · 01001000 · HYBRID">
        <div className="md:pl-[26%]">
          <Reveal>
            <p className="text-[16px] text-muted leading-relaxed max-w-[56ch] mb-8">{sec("How It Works")}</p>
          </Reveal>
          <IndexList rows={STEPS.map((s, i) => ({ index: String(i + 1).padStart(2, "0"), ...s }))} />
        </div>
      </Band>

      {/* 4 — Competitions as posters */}
      <Band tone="light" accent="red" index="03 — COMPETITIONS" rail="03 · LEAGUES · 01001100 · SEASONAL">
        <RevealGroup className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {COMPS.map((c) => (
            <RevealItem key={c.word}>
              <PosterCard word={c.word} index={c.index} meta={c.meta}>
                <span className="absolute top-1/2 left-6 mono-label text-red/60">▶ FLAG CAPTURED !</span>
              </PosterCard>
            </RevealItem>
          ))}
        </RevealGroup>
      </Band>

      {/* 5 — Join the team */}
      <Band tone="light-2" accent="red" index="04 — JOIN THE TEAM" rail="04 · JOIN · 01001010 · DISCORD">
        <div className="grid md:grid-cols-[7fr_5fr] gap-10 items-center">
          <div>
            <SplitLines
              as="h2"
              lines={["Sufficient participation", "gets you rostered."]}
              className="font-display font-black tracking-tight leading-[0.95] mb-5"
              lineClass="text-[clamp(28px,3.6vw,52px)]"
            />
            <Reveal>
              <p className="text-[16px] leading-relaxed max-w-[56ch]" style={{ color: "var(--tone-muted)" }}>
                {sec("Join") || "Join the club, hop into the CTF channel on Discord, and show up to practice — that's the whole entry bar."}
              </p>
            </Reveal>
          </div>
          <Reveal delay={0.1}>
            <TicketCard
              model="CTF-JOIN"
              title="Cyberhounds roster"
              rows={[
                { k: "STEP 1", v: "Join the club" },
                { k: "STEP 2", v: "#ctf channel on Discord" },
                { k: "STEP 3", v: "Show up to practice" },
              ]}
              footer={
                <a href={links.discord} target="_blank" rel="noreferrer noopener" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-(--radius-sm) bg-(--accent) text-(--accent-contrast) text-sm font-semibold hover:brightness-110 transition-all">
                  Join the Discord channel <ArrowUpRight size={14} />
                </a>
              }
            />
          </Reveal>
        </div>
      </Band>

      <PosterBand accent="red" meta="// CYBERHOUNDS · JOHN JAY CTF" lines={["No flag", { text: "left behind.", className: "text-red" }]} />
      <FinLine n="05" binary="01000110 01001100 01000001 01000111" />
    </main>
  );
}
