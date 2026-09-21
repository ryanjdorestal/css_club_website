import { FinLine } from "@/components/FinLine";
import { CubeAnchor } from "@/cube/CubeRailContext";


/** Home section: fin. Composed by pages/Home.tsx. */
export function HomeFin() {
  return (
    <>
    <CubeAnchor id="fin" kf={{ x: 0.84, y: 0.5, scale: 0.42, face: "threeQuarter", glow: "#6ED2E6" }}>
      <div data-accent="teal"><FinLine n="01" next="/events" binary="01001010 01001010 01000011 01010011" /></div>
    </CubeAnchor>
    </>
  );
}
