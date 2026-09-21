import { createContext, useContext, useEffect, useRef, type ReactNode, type RefObject } from "react";

export type Face = "red" | "green" | "blue" | "threeQuarter" | "edge" | null;

export type CubeKeyframe = {
  x: number; // viewport fraction from left
  y: number; // viewport fraction from top
  scale: number; // relative to hero size
  face: Face;
  glow?: string; // css color for the rim
  spin?: boolean; // free idle spin (hero)
};

type Entry = { id: string; el: HTMLElement; kf: CubeKeyframe };

type Registry = {
  entries: RefObject<Entry[]>;
  register: (id: string, el: HTMLElement, kf: CubeKeyframe) => () => void;
};

const Ctx = createContext<Registry | null>(null);
export const useCubeRegistry = () => useContext(Ctx);

export function CubeRailProvider({ children }: { children: ReactNode }) {
  const entries = useRef<Entry[]>([]);
  const register = (id: string, el: HTMLElement, kf: CubeKeyframe) => {
    entries.current = [...entries.current.filter((e) => e.id !== id), { id, el, kf }];
    return () => {
      entries.current = entries.current.filter((e) => e.id !== id);
    };
  };
  return <Ctx.Provider value={{ entries, register }}>{children}</Ctx.Provider>;
}

/** Wrap a section: while it's the section under the viewport center, the cube
    tweens to this keyframe. */
export function CubeAnchor({ id, kf, children }: { id: string; kf: CubeKeyframe; children: ReactNode }) {
  const reg = useCubeRegistry();
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!reg || !ref.current) return;
    return reg.register(id, ref.current, kf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reg, id]);
  return <div ref={ref}>{children}</div>;
}
