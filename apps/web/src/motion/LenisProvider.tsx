import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import Lenis from "lenis";

const LenisContext = createContext<Lenis | null>(null);
export const useLenis = () => useContext(LenisContext);

/** One Lenis instance + one rAF loop for the whole app. The cube rail and the
    nav read scroll from here. Reduced-motion: Lenis is not created at all. */
export function LenisProvider({ children }: { children: ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null);
  const { pathname } = useLocation();
  const raf = useRef(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const l = new Lenis({ lerp: 0.1, wheelMultiplier: 1 });
    const loop = (t: number) => {
      l.raf(t);
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
    setLenis(l);
    return () => {
      cancelAnimationFrame(raf.current);
      l.destroy();
    };
  }, []);

  useEffect(() => {
    lenis?.scrollTo(0, { immediate: true });
    if (!lenis) window.scrollTo(0, 0);
  }, [pathname, lenis]);

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>;
}
