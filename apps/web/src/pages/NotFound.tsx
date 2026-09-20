import { Link } from "react-router-dom";
import { BinaryRings } from "@/components/BinaryRings";

/** 404 in VT323 — the pixel font's one big moment. */
export default function NotFound() {
  return (
    <main data-accent="teal" className="relative grow flex items-center justify-center overflow-hidden py-24">
      <BinaryRings opacity={0.1} />
      <div className="relative text-center px-5">
        <p className="pixel text-teal text-[clamp(80px,18vw,180px)] leading-none">404</p>
        <p className="pixel text-ink text-2xl mt-2">SEGMENTATION FAULT (PAGE DUMPED)</p>
        <p className="text-muted text-sm mt-4 max-w-sm mx-auto">
          This route doesn't exist. The bloodhound sniffed everywhere.
        </p>
        <Link to="/" className="mono-label text-teal hover:underline inline-block mt-6">
          ← return home
        </Link>
      </div>
    </main>
  );
}
