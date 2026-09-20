import { Suspense, lazy, useEffect, useState } from "react";

const CubeRailCanvas = lazy(() => import("./CubeRailCanvas"));

/** Fixed full-viewport cube that follows the scroll path (Home only).
    Desktop + motion-allowed only; mobile and reduced-motion use static
    CubeSpot mounts instead (perf + a11y — logged decision). */
export function CubeRail() {
  const [ok, setOk] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const rm = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setOk(mq.matches && !rm.matches);
    update();
    mq.addEventListener("change", update);
    rm.addEventListener("change", update);
    return () => {
      mq.removeEventListener("change", update);
      rm.removeEventListener("change", update);
    };
  }, []);
  if (!ok) return null;
  return (
    <Suspense fallback={null}>
      <CubeRailCanvas />
    </Suspense>
  );
}
