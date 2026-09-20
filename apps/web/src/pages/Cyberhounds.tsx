import cyberRaw from "@content/cyberhounds.md?raw";
import links from "@data/links.json";
import { parseMd } from "@/lib/md";
import { Section } from "@/components/Section";
import { SectionHeader } from "@/components/SectionHeader";
import { ButtonLink } from "@/components/Button";
import { MonoLabel } from "@/components/MonoLabel";
import { CornerBrackets } from "@/components/CornerBrackets";

const doc = parseMd(cyberRaw);

/** /cyberhounds — red sub-identity, its own header art. */
export default function Cyberhounds() {
  const sections: { h: string; ps: string[] }[] = [];
  for (const b of doc.blocks) {
    if (b.type === "h2") sections.push({ h: b.text, ps: [] });
    else if (sections.length) sections[sections.length - 1].ps.push(b.text);
  }
  return (
    <main>
      <Section accent="red">
        <SectionHeader index="01" title="Cyberhounds" kicker="CTF team · Sub-club" as="h1" />
        <div className="relative rounded-(--radius-md) overflow-hidden border border-line max-w-3xl">
          <CornerBrackets />
          <img
            src="/img/photos/cyberhounds-header.webp"
            alt="Cyberhounds — the John Jay CTF team"
            className="w-full object-cover"
          />
        </div>
        <p className="pixel text-(--accent-fg) text-2xl mt-5">John Jay CTF Team</p>
      </Section>
      {sections
        .filter((s) => s.ps.length > 0)
        .map((s, i) => (
          <Section key={s.h} accent="red" className="pt-0">
            <div className="max-w-3xl border-l-2 border-(--accent) pl-6">
              <MonoLabel accent>{"//"} 0{i + 2}</MonoLabel>
              <h2 className="font-display font-bold uppercase text-2xl mt-1 mb-3" style={{ fontStretch: "112%" }}>
                {s.h}
              </h2>
              {s.ps.map((p, j) => (
                <p key={j} className="text-muted leading-relaxed text-sm mb-3">
                  {p}
                </p>
              ))}
            </div>
          </Section>
        ))}
      <Section accent="red" className="pt-0">
        <div className="flex flex-wrap gap-3">
          <ButtonLink to={links.discord} external variant="primary">
            Join the Discord channel
          </ButtonLink>
          <ButtonLink to="/join" variant="ghost">
            Join the club first
          </ButtonLink>
        </div>
      </Section>
    </main>
  );
}
