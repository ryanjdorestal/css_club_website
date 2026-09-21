import { Suspense, lazy } from "react";
import { HoundPixel } from "@/sigils";
import { useLazy3d } from "@/lib/useLazy3d";

const CyberhoundCanvas = lazy(() => import("./CyberhoundCanvas"));

/** The 3D Cyberhound (run 5 §5): a serious pitbull bust — black body, red
    edge rim, red emissive eye slits — built procedurally in
    assets/hound3d/build_hound.py. Lazy, in-view mounted, page-local bloom.
    Fallback (no WebGL / reduced motion / loading): THE pixel hound at 320px. */
export function CyberhoundSpot({ size = 460, className = "" }: { size?: number; className?: string }) {
  const { ref, ok, visible } = useLazy3d({ needsWebgl: true });
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
