/** /styleguide band: Paper — one section of the component sheet (split out of Styleguide.tsx in run 11). */
import { Band } from "@/components/Band";
import { Pullquote } from "@/components/Pullquote";
import { PhotoFrame } from "@/components/PhotoFrame";
import { SpecSheet } from "@/components/cards/SpecSheet";
import { ButtonLink } from "@/components/Button";
import { Outline } from "@/components/type/Outline";
import { HairGrid, Hatch } from "@/textures";
import * as S from "@/sigils";

const rows = [
  { k: "PLATFORM", v: "web · ios" },
  { k: "STACK", v: "React · Swift" },
  { k: "STATUS", v: "EXAMPLE" },
];

export function PaperBand() {
  return (
    <>
      {/* ---- PAPER REGISTER (vs T04 white) ---- */}
      <Band tone="light" accent="blue" index="03 — PAPER REGISTER" code="PAPER" sigil={<S.PlusMark size={16} />} rail="03 · PAPER · 01010000 · T04">
        <HairGrid opacity={0.05} />
        <div className="grid md:grid-cols-2 gap-10 items-start relative">
          <div>
            <h2 className="t-h1 !text-[clamp(32px,4.5vw,64px)]">
              PAPER, <Outline>NOT CREAM.</Outline>
            </h2>
            <p className="text-[15px] leading-[1.6] max-w-[52ch] mt-4" style={{ color: "var(--color-muted-on-paper)" }}>
              The same register on white: registration marks, hair grid, hatch strip, /0N indices, notched CTAs, ↗ on every card. Space Grotesk body.
            </p>
            <Pullquote cite="_source · THE_ABOUT_PAGE">Let's grow together!</Pullquote>
            <div className="flex gap-3 mt-4">
              <ButtonLink to="#" variant="primary">
                Explore work
              </ButtonLink>
              <ButtonLink to="#" variant="ghost">
                view manifesto
              </ButtonLink>
            </div>
            <Hatch className="mt-8 text-navy-900" />
          </div>
          <div className="space-y-5">
            <PhotoFrame
              src="/img/photos/club2.webp"
              alt="Club members at a general meeting"
              tag="//IMG_003"
              meta="FRAME · 003"
              caption="GENERAL_MEETING · SPRING"
              track={{ x: "12%", y: "18%", w: "30%", h: "46%", label: "SUBJ_01 · 0.92" }}
            />
            <SpecSheet tag="OK" title="Spec on paper" rows={rows} registration meter={{ label: "capacity", value: 41 }} />
          </div>
        </div>
      </Band>
    </>
  );
}
