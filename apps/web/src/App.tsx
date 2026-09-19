import { Routes, Route } from "react-router-dom";
import { brand } from "@brand/brand.config";

/** Phase-0 shell: proves tokens + brand config load. Pages land in phase 3. */
function Scaffold() {
  return (
    <main className="min-h-dvh flex flex-col items-center justify-center gap-6 p-8">
      <img src={brand.logos.svg} alt="" className="w-28 h-28" />
      <h1 className="font-display font-black uppercase text-4xl tracking-tight text-center">
        {brand.name}
      </h1>
      <p className="mono-label text-muted">
        // {brand.collegeShort} · scaffold ok
      </p>
      <p className="pixel text-teal text-2xl">{brand.taglines.primary}</p>
    </main>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="*" element={<Scaffold />} />
    </Routes>
  );
}
