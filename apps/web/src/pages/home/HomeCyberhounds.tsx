import { Link } from "react-router-dom";
import { brand } from "@brand/brand.config";
import { Label } from "@/components/type/Label";
import { EdgeCrop } from "@/components/type/EdgeCrop";
import { S01Word } from "@/type/glyphs/S01Word";
import { Halftone, Scanlines } from "@/textures";
import * as Sg from "@/sigils";
import { CubeAnchor } from "@/cube/CubeRailContext";

/** Home section: /05 CYBERHOUNDS POSTER. Composed by pages/Home.tsx. */
export function HomeCyberhounds() {
  return (
    <>
      <CubeAnchor id="cyber" kf={{ x: 0.5, y: 0.88, scale: 0.35, face: "edge", glow: brand.palette.red }}>
        <section data-tone="dark-3" data-accent="red" className="relative overflow-hidden py-[clamp(96px,12vw,160px)]">
          <Scanlines />
          <Halftone corner="100% 20%" opacity={0.08} />
          <div className="max-w-[1280px] mx-auto px-5 md:px-10">
            <div className="flex items-center justify-between mb-8">
              <Label pfx="//">CTF_01 · SUB-CLUB · CAPTURE_THE_FLAG</Label>
              <span className="t-micro opacity-50 tnum hidden md:block">2026</span>
            </div>
            <div className="grid md:grid-cols-[8fr_4fr] gap-10 items-center">
              <div className="t-poster leading-[0.95]" style={{ fontSize: "clamp(60px, 10.5vw, 175px)" }}>
                <EdgeCrop side="right">
                  <S01Word>CYBER</S01Word>
                </EdgeCrop>
                <EdgeCrop side="right">
                  <span className="text-red relative inline-block">
                    <span aria-hidden className="absolute text-ink" style={{ left: "0.06em", top: "0.06em" }}>
                      <S01Word outlineFrom={0}>HOUNDS</S01Word>
                    </span>
                    <S01Word className="relative">HOUNDS</S01Word>
                  </span>
                </EdgeCrop>
              </div>
              <Sg.HoundPixel size={240} className="justify-self-center max-md:hidden" />
            </div>
            <div className="flex items-center justify-between flex-wrap gap-4 mt-10">
              <p className="t-label raise !tracking-[0.2em]">PICOCTF · NCL · ANGSTROMCTF · SDCTF</p>
              <Link to="/cyberhounds" className="t-label raise text-(--accent-fg) border border-(--accent) px-5 py-3 hover:bg-(--accent)/10 transition-colors">
                [ &gt;_WHAT_IS_CTF ]
              </Link>
            </div>
          </div>
        </section>
      </CubeAnchor>
    </>
  );
}
