import { Section } from "@/components/Section";
import { SectionHeader } from "@/components/SectionHeader";
import { SpecCard } from "@/components/SpecCard";
import { StatTile } from "@/components/StatTile";
import { MonoLabel } from "@/components/MonoLabel";
import { Button, ButtonLink } from "@/components/Button";
import { CornerBrackets } from "@/components/CornerBrackets";
import { PixelDivider } from "@/components/PixelDivider";
import { Ticker } from "@/components/Ticker";
import { StampLockup } from "@/components/StampLockup";
import { brand } from "@brand/brand.config";
import { BinaryRings } from "@/components/BinaryRings";

const ACCENTS = ["red", "green", "blue"] as const;

/** /styleguide — every component in every accent, for QA screenshots. */
export default function Styleguide() {
  return (
    <main className="relative">
      <BinaryRings />
      <Section accent="teal" className="relative">
        <SectionHeader index="00" title="Styleguide" kicker="QA · Every component · Every accent" />
        <div className="flex flex-wrap gap-6 items-center">
          <StampLockup />
          <div className="flex gap-2">
            <div className="w-14 h-14 rounded-(--radius-sm) bg-navy-900 border border-line" />
            <div className="w-14 h-14 rounded-(--radius-sm) bg-navy-800 border border-line" />
            <div className="w-14 h-14 rounded-(--radius-sm) bg-navy-700 border border-line" />
            <div className="w-14 h-14 rounded-(--radius-sm) bg-navy-600 border border-line" />
            <div className="w-14 h-14 rounded-(--radius-sm) bg-navy-500 border border-line" />
            <div className="w-14 h-14 rounded-(--radius-sm) bg-teal border border-line" />
            <div className="w-14 h-14 rounded-(--radius-sm) bg-red border border-line" />
            <div className="w-14 h-14 rounded-(--radius-sm) bg-green border border-line" />
            <div className="w-14 h-14 rounded-(--radius-sm) bg-blue border border-line" />
          </div>
          <p className="pixel text-teal text-2xl">{brand.taglines.primary}</p>
        </div>
      </Section>
      <Ticker items={[brand.taglines.ticker]} />
      {ACCENTS.map((a, i) => (
        <Section key={a} accent={a}>
          <SectionHeader
            index={`0${i + 1}`}
            title={`${a} section`}
            kicker={`Fall 2026 · 0${i + 1} ${a}`}
          />
          <div className="grid gap-6 md:grid-cols-3 mb-8">
            <SpecCard
              title="Spec card title"
              eyebrow={`// ${a}`}
              specs={[
                { k: "Platform", v: "Web" },
                { k: "Stack", v: "React" },
                { k: "Status", v: "Live" },
              ]}
            >
              Body copy in Poppins 400 — a couple of lines of muted text the way a
              card summary would read.
            </SpecCard>
            <div className="relative border border-line rounded-(--radius-md) p-6 flex flex-col gap-4">
              <CornerBrackets />
              <MonoLabel accent>Corner brackets + labels</MonoLabel>
              <div className="flex flex-wrap gap-3">
                <Button>Primary action</Button>
                <Button variant="ghost">Ghost action</Button>
              </div>
              <ButtonLink to="/" variant="primary">
                Link button ↗
              </ButtonLink>
            </div>
            <div className="border border-line rounded-(--radius-md)">
              <StatTile value="34" label="Members recorded" />
              <StatTile value="12" label="Events migrated" />
            </div>
          </div>
          <PixelDivider />
        </Section>
      ))}
      <Section accent="blue" className="bg-light text-navy-900">
        <MonoLabel className="!text-navy-600">Light reading surface (News/OS docs) — blue tint</MonoLabel>
        <div className="mt-4 p-6 rounded-(--radius-md)" style={{ background: "var(--accent-tint)" }}>
          <h3 className="font-display font-bold uppercase text-xl text-navy-900">Tinted panel</h3>
          <p className="text-sm text-navy-700 mt-2">
            Light surfaces are deliberate per-page choices, tinted 12–15% with the
            section accent — exactly how the old site tinted its sections.
          </p>
        </div>
      </Section>
    </main>
  );
}
