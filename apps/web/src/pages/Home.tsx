import { ArrowUpRight } from "lucide-react";
import { brand } from "@brand/brand.config";
import events from "@data/events.json";
import board from "@data/board.json";
import workshops from "@data/workshops.json";
import resources from "@data/resources.json";
import homeRaw from "@content/home.md?raw";
import { parseMd } from "@/lib/md";
import { Section } from "@/components/Section";
import { SectionHeader } from "@/components/SectionHeader";
import { StatTile } from "@/components/StatTile";
import { MonoLabel } from "@/components/MonoLabel";
import { ButtonLink } from "@/components/Button";
import { Ticker } from "@/components/Ticker";
import { BinaryRings } from "@/components/BinaryRings";
import { CornerBrackets } from "@/components/CornerBrackets";
import { PixelDivider } from "@/components/PixelDivider";
import { CubeHero } from "@/cube/CubeHero";

const home = parseMd(homeRaw);
const heroCopy = home.blocks.find((b) => b.type === "p")?.text ?? "";

/* Status strip — real numbers derived from committed data, or nothing.
   (No upcoming events exist at migration time, so that slot shows TBA.) */
const nEvents = events.semesters.reduce((a, s) => a + s.events.length, 0);
const nTerms = board.terms.length;
const nWorkshops = workshops.workshops.length;
const nResources = resources.count;

const BANDS = [
  {
    accent: "red" as const,
    index: "01",
    title: "Events",
    to: "/events",
    kicker: "Workshops · Meetings · Panels",
    copy: home.blocks[home.blocks.findIndex((b) => b.text === "Events") + 1]?.text ?? "",
  },
  {
    accent: "green" as const,
    index: "02",
    title: "Apps",
    to: "/apps",
    kicker: "Student-built · Board-reviewed",
    copy: "The club's showcase of software built by John Jay students. Ship something, submit it, get it on the board.",
  },
  {
    accent: "blue" as const,
    index: "03",
    title: "Join",
    to: "/join",
    kicker: "Free · All majors",
    copy: heroCopy,
  },
];

export default function Home() {
  return (
    <main>
      {/* Hero — the cube is the identity object and the nav (red→Events, green→Apps, blue→Join) */}
      <div className="relative overflow-hidden" data-accent="teal">
        <BinaryRings opacity={0.07} />
        <div className="max-w-6xl mx-auto px-5 pt-16 pb-10 md:pt-20 md:pb-16 grid md:grid-cols-[1.1fr_1fr] gap-10 items-center relative">
          <div className="relative p-2">
            <CornerBrackets inset="-0.25rem" />
            <MonoLabel accent>{"//"} {brand.collegeShort} · CUNY · Est. stamp 2020s</MonoLabel>
            <h1
              className="font-display font-black uppercase leading-[0.92] tracking-tight text-[clamp(2.8rem,7vw,5.5rem)] mt-3"
              style={{ fontStretch: "120%" }}
            >
              Computer
              <br />
              Science
              <br />
              Society
            </h1>
            <p className="pixel text-teal text-[clamp(20px,2.4vw,28px)] mt-5">
              {brand.taglines.primary}
            </p>
            <p className="text-muted text-sm leading-relaxed max-w-md mt-4">{heroCopy}</p>
            <div className="flex flex-wrap gap-3 mt-7">
              <ButtonLink to="/join" variant="primary">
                Join the club <ArrowUpRight size={16} />
              </ButtonLink>
              <ButtonLink to="/events" variant="ghost">
                See events
              </ButtonLink>
            </div>
          </div>
          <CubeHero />
        </div>
        {/* Status strip — jj_11 stat tiles; every number is derived from data */}
        <div className="border-t border-line bg-navy-700/60">
          <div className="max-w-6xl mx-auto px-5 grid grid-cols-2 md:grid-cols-4">
            <StatTile value="TBA" label="Next event · Fall 2026" />
            {nTerms > 0 && <StatTile value={String(nTerms)} label="Board generations" />}
            {nEvents > 0 && <StatTile value={String(nEvents)} label="Events on record" />}
            {nResources > 0 && <StatTile value={String(nResources)} label="Curated resources" />}
          </div>
        </div>
      </div>

      <Ticker items={[brand.taglines.ticker]} />

      {/* Three teaser bands — one accent each, never mixed */}
      {BANDS.map((band) => (
        <Section key={band.title} accent={band.accent}>
          <SectionHeader index={band.index} title={band.title} kicker={band.kicker} />
          <div className="grid md:grid-cols-[2fr_1fr] gap-8 items-start">
            <p className="text-muted leading-relaxed max-w-2xl">{band.copy}</p>
            <div className="md:justify-self-end">
              <ButtonLink to={band.to} variant="primary">
                {band.title === "Join" ? "Start onboarding" : `Open ${band.title}`}{" "}
                <ArrowUpRight size={16} />
              </ButtonLink>
            </div>
          </div>
          {band.title === "Events" && nWorkshops > 0 && (
            <p className="mono-label text-muted mt-6">
              + {nWorkshops} past workshops archived on{" "}
              <a
                href={workshops.org}
                target="_blank"
                rel="noreferrer noopener"
                className="text-teal hover:underline"
              >
                github.com/jjcss
              </a>
            </p>
          )}
          <PixelDivider className="mt-10" />
        </Section>
      ))}

      {/* Cyberhounds strip */}
      <Section accent="red" className="border-t border-line bg-navy-700/40">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div>
            <MonoLabel accent>{"//"} sub-club · CTF</MonoLabel>
            <h2 className="font-display font-black uppercase text-3xl mt-1" style={{ fontStretch: "115%" }}>
              {brand.subclubs.cyberhounds.name}
            </h2>
            <p className="text-muted text-sm mt-2 max-w-lg">
              John Jay's Capture-The-Flag team. OSINT, web exploitation, cryptography —
              compete in NCL, AngstromCTF and more.
            </p>
          </div>
          <ButtonLink to="/cyberhounds" variant="ghost">
            Meet the hounds <ArrowUpRight size={16} />
          </ButtonLink>
        </div>
      </Section>
    </main>
  );
}
