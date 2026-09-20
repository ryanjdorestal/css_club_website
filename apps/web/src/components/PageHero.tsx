import type { ReactNode } from "react";
import { SplitLines } from "@/motion/SplitLines";
import { Reveal } from "@/motion/Reveal";
import { BinaryRings } from "@/components/BinaryRings";
import { Counter } from "@/motion/Counter";

/** Sub-page hero: kicker → display-xl stack → dek → optional right slot +
    stat row. Dark by default; the page's accent does the talking. */
export function PageHero({
  kicker,
  lines,
  dek,
  right,
  stats,
  tone = "dark",
  children,
}: {
  kicker: string;
  lines: (string | { text: string; className?: string })[];
  dek?: string;
  right?: ReactNode;
  stats?: { v: number; suffix?: string; l: string }[];
  tone?: "dark" | "dark-3";
  children?: ReactNode;
}) {
  return (
    <section data-tone={tone} className="relative overflow-hidden pt-[120px] pb-0">
      <BinaryRings opacity={0.06} />
      <div className="relative max-w-[1280px] mx-auto px-5 md:px-10 pb-14">
        <div className="grid md:grid-cols-[8fr_4fr] gap-10 items-end">
          <div>
            <Reveal y={10}>
              <p className="mono-label text-(--accent-fg) mb-5">{"//"} {kicker}</p>
            </Reveal>
            <SplitLines
              as="h1"
              lines={lines}
              className="font-display font-black uppercase tracking-[-0.03em] leading-[0.85]"
              lineClass="text-[clamp(56px,10vw,160px)]"
            />
            {dek && (
              <Reveal delay={0.25}>
                <p className="text-[16px] text-muted leading-relaxed max-w-[58ch] mt-6">{dek}</p>
              </Reveal>
            )}
          </div>
          {right && <Reveal delay={0.2}>{right}</Reveal>}
        </div>
        {children}
      </div>
      {stats && stats.length > 0 && (
        <div className="relative border-t border-line bg-navy-700/50">
          <div className="max-w-[1280px] mx-auto px-5 md:px-10 grid grid-cols-2 md:grid-cols-4">
            {stats.map((s) => (
              <div key={s.l} className="px-5 py-5 border-l border-line first:border-l-0">
                <span className="font-display font-black text-3xl text-ink" style={{ fontStretch: "115%" }}>
                  <Counter value={s.v} suffix={s.suffix ?? ""} />
                </span>
                <p className="mono-label text-muted mt-1">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

/** jj_06 dossier meta block for heroes. */
export function DossierMeta({ rows }: { rows: [string, string][] }) {
  return (
    <dl className="border border-line divide-y divide-(--color-line) min-w-[220px]">
      {rows.map(([k, v]) => (
        <div key={k} className="flex justify-between gap-6 px-4 py-2.5">
          <dt className="mono-label text-muted">{k}</dt>
          <dd className="mono-label text-ink text-right">{v}</dd>
        </div>
      ))}
    </dl>
  );
}
