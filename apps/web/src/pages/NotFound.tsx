import { Link } from "react-router-dom";
import { BinaryRings } from "@/components/BinaryRings";

/** 404 — jj_07 blue geometric panel + VT323. */
export default function NotFound() {
  return (
    <main data-accent="blue" data-tone="light" className="relative grow flex items-center justify-center overflow-hidden py-32 bg-paper">
      <div className="absolute inset-0 text-navy-900"><BinaryRings opacity={0.05} /></div>
      <div className="relative border-2 border-cube-blue p-10 md:p-16 text-center bg-paper max-w-[520px] mx-5">
        <span className="absolute -inset-2 border border-cube-blue/30 pointer-events-none" />
        <p aria-hidden className="font-display font-black text-cube-blue leading-[0.8] select-none" style={{ fontSize: "clamp(96px,20vw,200px)", fontStretch: "118%" }}>
          404
        </p>
        <p className="pixel text-navy-900 text-2xl mt-4">ROUTE NOT FOUND · 0100</p>
        <p className="text-sm mt-3" style={{ color: "var(--color-muted-on-paper)" }}>
          The bloodhound sniffed everywhere. This path doesn't exist.
        </p>
        <Link to="/" className="mono-label text-cube-blue u-draw inline-block mt-8">← BACK HOME</Link>
        <span className="absolute bottom-2 left-3 mono-label text-cube-blue/50">JJ_07 · TROUBLE PANEL</span>
      </div>
    </main>
  );
}
