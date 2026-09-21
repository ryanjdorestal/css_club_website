/** /styleguide band: Specimen — one section of the component sheet (split out of Styleguide.tsx in run 11). */
import { Band } from "@/components/Band";
import { Label } from "@/components/type/Label";
import { Decode } from "@/components/type/Decode";
import { Stencil } from "@/components/type/Stencil";
import { Outline, Ghost } from "@/components/type/Outline";
import { SplitFill } from "@/components/type/SplitFill";
import { EdgeCrop } from "@/components/type/EdgeCrop";
import { Wireframe } from "@/components/type/Wireframe";
import { HairGrid, CodeRain } from "@/textures";
import * as S from "@/sigils";
import { COORDS, version, buildHash } from "@/lib/readouts";

export function SpecimenBand() {
  return (
    <>
      {/* ---- SPECIMEN: faces + treatments (vs T01/T02/T06/T07) ---- */}
      <Band tone="dark" accent="teal" index="00 — TYPE SPECIMEN" code="SPEC_V2" sigil={<S.CubeSigil size={16} />} rail="00 · SPECIMEN · 01010100 · V2">
        <HairGrid />
        <CodeRain className="!left-2/3" />
        <div className="relative flex justify-between items-start mb-8">
          <Label pfx="//">SCN_00 · TURRET_ROAD / MICHROMA / MARTIAN_MONO / SPACE_GROTESK / JB_MONO</Label>
          <div className="text-right space-y-1">
            <p className="t-micro raise tnum">
              X_{COORDS.x} / Y_{COORDS.y}
            </p>
            <p className="t-micro opacity-55">{COORDS.place}</p>
          </div>
        </div>
        <h1 className="t-hero relative">
          <Stencil bars={[0.4, 0.64]} barColor="var(--color-navy-600)">
            DEBUG
          </Stencil>{" "}
          <Outline>YOUR MIND,</Outline>
        </h1>
        <p className="t-hero mt-2" style={{ fontSize: "clamp(44px, 7.4vw, 124px)" }}>
          COMMIT TO <SplitFill word="GROWTH." at={3} className="text-teal" />
        </p>
        <div className="mt-8 max-w-[540px]">
          <Wireframe className="t-h2 uppercase">Wireframe through type</Wireframe>
        </div>
        <div className="t-poster mt-10 text-ink/90">
          <EdgeCrop side="right">
            <Ghost dx={5} dy={5}>
              SOCIETY
            </Ghost>
          </EdgeCrop>
        </div>
        <p className="t-pixel text-teal mt-8">
          <Decode text="1 /5 · 104 : 0768 · PIXEL COUNTERS" />
        </p>
        <p className="t-micro raise mt-6 tnum opacity-70">
          VERSION {version()}-{buildHash().toUpperCase()}
        </p>
      </Band>
    </>
  );
}
