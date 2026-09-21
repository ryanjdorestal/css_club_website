/** /styleguide band: Textures — one section of the component sheet (split out of Styleguide.tsx in run 11). */
import { Band } from "@/components/Band";
import { Meter } from "@/components/cards/Meter";
import { DotGrid, HairGrid, Contour, Halftone, Scanlines } from "@/textures";
import * as S from "@/sigils";
import { hexId } from "@/lib/readouts";
import { Brackets, Registration, Perforation, Tab, chamferStyle, ChamferStub } from "@/components/frame";

export function TexturesBand() {
  return (
    <>
      {/* ---- TEXTURES + FRAME TREATMENTS ---- */}
      <Band tone="dark-3" accent="red" index="04 — TEXTURES · FRAMES" code="TEX" sigil={<S.Crosshair size={16} />} rail="04 · TEX · 01010100 · ≤10%">
        <Scanlines />
        <Halftone corner="100% 0" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {[
            ["DotGrid", <DotGrid key="d" opacity={0.12} />],
            ["HairGrid", <HairGrid key="h" opacity={0.12} />],
            ["Contour", <Contour key="c" opacity={0.12} lines={12} />],
            ["Halftone", <Halftone key="x" opacity={0.16} corner="80% 20%" />],
          ].map(([name, tex]) => (
            <div key={name as string} className="relative h-36 border border-line overflow-hidden">
              {tex}
              <span className="absolute bottom-2 left-2 t-micro opacity-55">_{(name as string).toLowerCase()}</span>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mt-5">
          <div className="group relative h-28 border border-line">
            <Brackets size={12} inset={6} />
            <span className="absolute bottom-2 left-2 t-micro opacity-55">_brackets (hover)</span>
          </div>
          <div className="relative h-28 border border-line">
            <Registration inset={8} />
            <span className="absolute bottom-2 left-2 t-micro opacity-55">_registration</span>
          </div>
          <div className="relative h-28 border border-line bg-navy-800" style={chamferStyle(20)}>
            <ChamferStub px={20} />
            <span className="absolute bottom-4 left-2 t-micro opacity-55">_chamfer+stub</span>
          </div>
          <div className="relative h-28 border border-line pl-[18px]">
            <Tab label="EVT-S25-01" />
            <Perforation className="absolute top-1 left-6 right-2" />
            <span className="absolute bottom-2 left-7 t-micro opacity-55">_tab+perforation</span>
          </div>
        </div>
        <p className="t-micro opacity-55 mt-6 tnum">HASH: {hexId("styleguide")} · METER ↓</p>
        <Meter label="loading sequence" value={83} className="max-w-[320px] mt-2" />
      </Band>
    </>
  );
}
