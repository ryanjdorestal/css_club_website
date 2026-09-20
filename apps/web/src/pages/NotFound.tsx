import { Link } from "react-router-dom";
import { BinaryRings } from "@/components/BinaryRings";
import { CSSKufic } from "@/sigils";
import { Brackets } from "@/components/frame";
import { Decode } from "@/components/type/Decode";

/** 404 — Unbounded 900 at poster scale, Kufic behind, viewport brackets. */
export default function NotFound() {
  return (
    <main data-accent="blue" data-tone="light" className="relative grow flex items-center justify-center overflow-hidden py-32 bg-paper">
      <Brackets size={22} inset={16} accent={false} className="!fixed z-10 opacity-60 text-navy-900" />
      <div className="absolute inset-0 text-navy-900"><BinaryRings opacity={0.05} /></div>
      <div aria-hidden className="absolute pointer-events-none opacity-[0.07]" style={{ color: "var(--color-cube-blue)" }}>
        <CSSKufic size={200} />
      </div>
      <div className="relative text-center px-5">
        <p className="t-pixel text-cube-blue leading-[0.85] select-none" style={{ fontSize: "clamp(110px, 22vw, 300px)" }}>
          404
        </p>
        <p className="t-label raise text-navy-900 mt-6 tnum"><Decode text="ROUTE_NOT_FOUND · 0X194" /></p>
        <p className="text-sm mt-3" style={{ color: "var(--color-muted-on-paper)" }}>
          The bloodhound sniffed everywhere. This path doesn't exist.
        </p>
        <Link to="/" className="t-label raise text-cube-blue u-draw inline-block mt-8">[ ← RETURN_HOME ]</Link>
      </div>
    </main>
  );
}
