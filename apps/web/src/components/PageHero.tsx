import type { ReactNode } from "react";
import { Reveal } from "@/motion/Reveal";
import { BinaryRings } from "@/components/BinaryRings";
import { Counter } from "@/motion/Counter";
import { Decode } from "@/components/type/Decode";
import { Outline } from "@/components/type/Outline";
import { SplitFill } from "@/components/type/SplitFill";
import { Stencil } from "@/components/type/Stencil";
import { Label } from "@/components/type/Label";
import { HairGrid, CodeRain } from "@/textures";
import { COORDS, version, buildHash } from "@/lib/readouts";
import { CubeSpot } from "@/cube/CubeSpot";
import { Brackets } from "@/components/frame";

/** Sub-page hero v3: //kicker + Decode display stack + coord/version rails +
    stat cells (_label above value). */
export function PageHero({
  kicker,
  lines,
  dek,
  right,
  stats,
  tone = "dark",
  cubeFace,
  cubeGlow,
  children,
}: {
  kicker: string;
  lines: (string | { text: string; className?: string; outline?: boolean; split?: number; stencil?: boolean })[];
  dek?: string;
  right?: ReactNode;
  stats?: { v: number; suffix?: string; l: string }[];
  tone?: "dark" | "dark-3";
  cubeFace?: "red" | "green" | "blue" | "threeQuarter" | "edge";
  cubeGlow?: string;
  children?: ReactNode;
}) {
  return (
    <section data-tone={tone} className="relative overflow-hidden pt-[120px] pb-0">
      <HairGrid opacity={0.045} />
      <BinaryRings opacity={0.05} />
      <div className="absolute top-[88px] right-5 md:right-10 text-right space-y-1 z-10">
        <p className="t-micro raise tnum">
          X_{COORDS.x} / Y_{COORDS.y}
        </p>
        <p className="t-micro opacity-55">{COORDS.place}</p>
      </div>
      <div className="relative max-w-[1280px] mx-auto px-5 md:px-10 pb-12">
        <div className="grid md:grid-cols-[8fr_4fr] gap-10 items-end">
          <div>
            <Reveal y={10}>
              <Label pfx="//" className="mb-6 block">
                {kicker
                  .toUpperCase()
                  .replace(/ · /g, " · ")
                  .replace(/ (?!·)/g, "_")}
              </Label>
            </Reveal>
            <h1 className="t-hero" style={{ fontSize: "clamp(52px, 9.5vw, 152px)" }}>
              {lines.map((l, i) => {
                const text = (typeof l === "string" ? l : l.text).toUpperCase();
                const o: { className?: string; outline?: boolean; split?: number; stencil?: boolean } = typeof l === "string" ? {} : l;
                return (
                  <span key={i} className={`block ${o.className ?? ""}`}>
                    {o.stencil ? (
                      <Stencil bars={[0.4, 0.64]} barColor={tone === "dark-3" ? "var(--color-navy-900)" : "var(--color-navy-600)"}>
                        {text}
                      </Stencil>
                    ) : o.outline ? (
                      <Outline>{text}</Outline>
                    ) : o.split ? (
                      <SplitFill word={text} at={o.split} />
                    ) : (
                      <Decode text={text} />
                    )}
                  </span>
                );
              })}
            </h1>
            {dek && (
              <Reveal delay={0.25}>
                <p className="t-dek text-muted mt-6">{dek}</p>
              </Reveal>
            )}
          </div>
          {(right || cubeFace) && (
            <Reveal delay={0.2}>
              <div className="flex flex-col items-center gap-6">
                {cubeFace && (
                  <div className="group relative p-4 hidden md:block">
                    <Brackets size={14} inset={0} />
                    <CodeRain className="opacity-70" />
                    <CubeSpot size={360} face={cubeFace} glow={cubeGlow} />
                  </div>
                )}
                {right}
              </div>
            </Reveal>
          )}
        </div>
        <p className="t-micro opacity-50 tnum mt-6 text-right">
          VERSION {version()}-{buildHash().toUpperCase()}
        </p>
        {children}
      </div>
      {stats && stats.length > 0 && (
        <div className="relative border-t border-line bg-navy-700/50">
          <div className="max-w-[1280px] mx-auto px-5 md:px-10 grid grid-cols-2 md:grid-cols-4">
            {stats.map((s) => (
              <div key={s.l} className="px-5 py-4 border-l border-line first:border-l-0">
                <p className="t-micro opacity-55 mb-1.5">_{s.l.toLowerCase().replace(/ · /g, "_").replace(/ /g, "_")}</p>
                <span className="t-stat !text-[clamp(26px,2.8vw,40px)] text-ink">
                  <Counter value={s.v} />
                  {s.suffix && <span className="unit">{s.suffix}</span>}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

/** jj_06 dossier meta block. */
export function DossierMeta({ rows }: { rows: [string, string][] }) {
  return (
    <dl className="border border-line divide-y divide-(--color-line) min-w-[220px]">
      {rows.map(([k, v]) => (
        <div key={k} className="flex justify-between gap-6 px-4 py-2.5">
          <dt className="t-micro opacity-55">_{k.toLowerCase().replace(/ /g, "_")}</dt>
          <dd className="t-micro raise text-right tnum">{v}</dd>
        </div>
      ))}
    </dl>
  );
}
