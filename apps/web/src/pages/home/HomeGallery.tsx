import { brand } from "@brand/brand.config";
import { Band } from "@/components/Band";
import { PhotoFrame } from "@/components/PhotoFrame";
import * as Sg from "@/sigils";
import { RevealGroup, RevealItem } from "@/motion/Reveal";
import { CubeAnchor } from "@/cube/CubeRailContext";

import { GALLERY } from "./data";

/** Home section: /07 GALLERY. Composed by pages/Home.tsx. */
export function HomeGallery() {
  return (
    <>
      <CubeAnchor id="gallery" kf={{ x: 0.93, y: 0.18, scale: 0.26, face: "threeQuarter", glow: brand.palette.teal }}>
        <Band tone="light" accent="teal" index="06 — ON CAMPUS" sigil={<Sg.Crosshair size={16} />} code="IMG_SET" rail="06 · GALLERY · 01000111 · FRAMES">
          <RevealGroup className="columns-2 md:columns-3 gap-5 [&>div]:mb-5">
            {GALLERY.map((g, i) => (
              <RevealItem key={g.src} className="break-inside-avoid">
                <PhotoFrame src={g.src} alt={g.cap.toLowerCase().replaceAll("_", " ")} tag={`//IMG_00${i + 1}`} meta={`FRAME · 00${i + 1}`} caption={g.cap} />
              </RevealItem>
            ))}
          </RevealGroup>
        </Band>
      </CubeAnchor>
    </>
  );
}
