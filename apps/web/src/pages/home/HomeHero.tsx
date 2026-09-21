import { brand } from "@brand/brand.config";
import { Marquee } from "@/components/Marquee";
import { BinaryRings } from "@/components/BinaryRings";
import { Readout } from "@/components/cards/StatChip";
import { ButtonLink } from "@/components/Button";
import { Label } from "@/components/type/Label";
import { Stencil } from "@/components/type/Stencil";
import { Outline } from "@/components/type/Outline";
import { SplitFill } from "@/components/type/SplitFill";
import { Decode } from "@/components/type/Decode";
import { Brackets } from "@/components/frame";
import { HairGrid, CodeRain } from "@/textures";
import { Reveal } from "@/motion/Reveal";
import { Counter } from "@/motion/Counter";
import { CubeAnchor } from "@/cube/CubeRailContext";
import { CubeSpot } from "@/cube/CubeSpot";
import { COORDS, counts, version, buildHash } from "@/lib/readouts";

import { heroDek } from "./data";

/** Home section: /01 HERO. Composed by pages/Home.tsx. */
export function HomeHero() {
  return (
    <>
      <CubeAnchor id="hero" kf={{ x: 0.68, y: 0.47, scale: 1, face: "threeQuarter", glow: brand.palette.teal, spin: true }}>
        <section data-tone="dark" data-accent="teal" className="relative min-h-dvh flex flex-col justify-end overflow-hidden pt-[72px]">
          <HairGrid opacity={0.05} />
          <BinaryRings opacity={0.05} />
          <CodeRain className="!left-[62%]" />
          <div
            aria-hidden
            className="absolute pointer-events-none"
            style={{
              left: "50%",
              top: "8%",
              width: "44vw",
              height: "70vh",
              background: "radial-gradient(ellipse at center, color-mix(in srgb, var(--color-teal) 15%, transparent), transparent 65%)",
            }}
          />
          {/* coordinate rail */}
          <div className="absolute top-[88px] right-5 md:right-10 text-right space-y-1 z-10">
            <p className="t-micro raise tnum">
              X_{COORDS.x} / Y_{COORDS.y}
            </p>
            <p className="t-micro opacity-55">{COORDS.place}</p>
          </div>
          <div className="relative max-w-[1280px] w-full mx-auto px-5 md:px-10 grid md:grid-cols-[1.15fr_1fr] gap-8 items-center grow content-center pt-6 pb-8">
            <div>
              <Reveal y={10}>
                <Label pfx="//" className="mb-6 block">
                  <Decode text="SCN_01 · JOHN_JAY_COLLEGE · CUNY · COMPUTER_SCIENCE_SOCIETY" />
                </Label>
              </Reveal>
              <h1 className="t-hero" style={{ fontSize: "clamp(40px, 5.4vw, 82px)" }}>
                <span className="block">
                  <Stencil bars={[0.4, 0.64]}>DEBUG</Stencil>
                </span>
                <span className="block">
                  <Outline>YOUR MIND,</Outline>
                </span>
                <span className="block">COMMIT TO</span>
                <span className="block text-teal">
                  <SplitFill word="GROWTH." at={3} />
                </span>
              </h1>
              <Reveal delay={0.3}>
                <p className="text-[15px] text-muted leading-[1.6] max-w-[52ch] mt-5">{heroDek}</p>
              </Reveal>
              <Reveal delay={0.4}>
                <div className="flex flex-wrap gap-3 mt-7" data-accent="blue">
                  <ButtonLink to="/join" variant="primary">
                    Join the Society
                  </ButtonLink>
                  <span data-accent="teal">
                    <ButtonLink to="/projects" variant="ghost">
                      see the projects
                    </ButtonLink>
                  </span>
                </div>
              </Reveal>
            </div>
            {/* cube frame */}
            <div className="group relative hidden md:block aspect-square max-w-[560px] w-full justify-self-end">
              <Brackets size={14} inset={0} />
              <div className="absolute inset-0">
                <BinaryRings opacity={0.08} />
              </div>
              <Reveal delay={0.55}>
                {/* outside the frame: may cross the bracket line, never the mesh */}
                <Readout
                  value={counts.workshops}
                  suffix="+"
                  label="workshops run"
                  style={{ position: "absolute", right: 0, top: 30, transform: "translateY(-100%)", width: "max-content" }}
                />
              </Reveal>
              <Reveal delay={0.7}>
                <Readout
                  value={counts.terms}
                  label="boards since 2020"
                  style={{ position: "absolute", left: -16, bottom: 56, transform: "translateX(-100%)", width: "max-content" }}
                />
              </Reveal>
              <span className="absolute bottom-3 left-3 t-micro opacity-55">_object CS_CUBE.GLB · DRAG-FREE · CLICK_A_FACE</span>
            </div>
            <div className="md:hidden">
              <CubeSpot />
            </div>
          </div>
          <p className="absolute bottom-2 right-5 md:right-10 t-micro opacity-50 tnum">
            VERSION {version()}-{buildHash().toUpperCase()}
          </p>
          {/* stat row — labels above values, shared 1px lines */}
          <div className="relative border-t border-line bg-navy-700/60">
            <div className="max-w-[1280px] mx-auto px-5 md:px-10 grid grid-cols-2 md:grid-cols-4">
              {[
                { v: counts.officers, l: "officers · all terms" },
                { v: counts.events, l: "events logged" },
                { v: counts.resources, l: "curated resources" },
                { v: counts.semesters, l: "semesters on record" },
              ].map((s2) => (
                <div key={s2.l} className="px-5 py-4 border-l border-line first:border-l-0">
                  <p className="t-micro opacity-55 mb-1.5">_{s2.l.replace(/ · /g, "_").replace(/ /g, "_")}</p>
                  <span className="t-stat !text-[clamp(28px,3vw,44px)] text-ink">
                    <Counter value={s2.v} />
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </CubeAnchor>

      {/* ticker */}
      <div data-accent="teal">
        <Marquee items={[brand.taglines.ticker, "NEXT EVENT · FALL 2026", "PROJECTS — SUBMISSIONS OPEN", "CYBERHOUNDS · CTF"]} />
      </div>
    </>
  );
}
