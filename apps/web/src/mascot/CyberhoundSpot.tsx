import { Suspense, lazy, useEffect, useRef, useState } from "react";
import { HoundPixel } from "@/sigils";

const CyberhoundCanvas = lazy(() => import("./CyberhoundCanvas"));

function webglOk(): boolean {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

/** The 3D Cyberhound (run 5 §5): a serious pitbull bust — black body, red
    edge rim, red emissive eye slits — built procedurally in
    assets/hound3d/build_hound.py. Lazy, in-view mounted, page-local bloom.
    Fallback (no WebGL / reduced motion / loading): THE pixel hound at 320px. */
export function CyberhoundSpot({ size = 460, className = "" }: { size?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [ok, setOk] = useState(false);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const rm = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setOk(!rm.matches && webglOk());
    update();
    rm.addEventListener("change", update);
    return () => rm.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    if (!ref.current) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: "160px" });
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  const fallback = (
    <div className="w-full h-full flex items-center justify-center" aria-label="The Cyberhound — the John Jay CTF team's pitbull">
      <HoundPixel size={Math.min(320, size * 0.7)} />
    </div>
  );
  return (
    <div ref={ref} className={`relative ${className}`} style={{ width: size, height: size }} data-cyberhound={ok ? "3d" : "pixel"}>
      {ok && visible ? (
        <Suspense fallback={fallback}>
          <CyberhoundCanvas size={size} paused={!visible} />
        </Suspense>
      ) : (
        fallback
      )}
    </div>
  );
}
