/** The gate every lazy 3D object shares (the cube, the Cyberhound): mount the canvas only when the
    slot is near the viewport, the visitor has not asked for reduced motion, and (optionally) WebGL
    exists. Returns the ref for the slot and whether the canvas may render; the caller shows its
    fallback otherwise. Used by cube/CubeSpot.tsx and mascot/CyberhoundSpot.tsx. */
import { useEffect, useRef, useState } from "react";

function webglOk(): boolean {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

export function useLazy3d(opts: { needsWebgl?: boolean } = {}) {
  const ref = useRef<HTMLDivElement>(null);
  const [motionOk, setMotionOk] = useState(false);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const rm = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setMotionOk(!rm.matches && (!opts.needsWebgl || webglOk()));
    update();
    rm.addEventListener("change", update);
    return () => rm.removeEventListener("change", update);
  }, [opts.needsWebgl]);
  useEffect(() => {
    if (!ref.current) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: "160px" });
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  return { ref, ok: motionOk, visible };
}
