import { Suspense, lazy, useEffect, useState } from "react";

const CubeRailCanvas = lazy(() => import("./CubeRailCanvas"));

/** Fixed full-viewport cube that follows the scroll path (Home only).
    Desktop + motion-allowed only; mobile and reduced-motion use static
    CubeSpot mounts instead (perf + a11y — logged decision). */
export function CubeRail() {
  const [ok, setOk] = useState(false);
  const [settled, setSettled] = useState(false);
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
  useEffect(() => {
    // don't let the Three chunk race the LCP: mount after load + idle
    const arm = () => {
      const ric = (window as Window & { requestIdleCallback?: (cb: () => void) => number }).requestIdleCallback;
      if (ric) ric(() => setSettled(true));
      else setTimeout(() => setSettled(true), 350);
    };
    if (document.readyState === "complete") arm();
    else {
      window.addEventListener("load", arm, { once: true });
      return () => window.removeEventListener("load", arm);
    }
  }, []);
  if (!ok || !settled) return null;
  return (
    <Suspense fallback={null}>
      <CubeRailCanvas />
    </Suspense>
  );
}
