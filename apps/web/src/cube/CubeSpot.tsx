import { Suspense, lazy, useEffect, useRef, useState } from "react";

const CubeSpotCanvas = lazy(() => import("./CubeSpotCanvas"));

/** The 3D cube as a placeable object (run 4: every hero, poster band, footer).
    Interactive (drag-rotate, click a face → route), lazy, in-view mounted,
    PNG fallback for loading / reduced-motion / mobile-poster slots. */
export function CubeSpot({
  size = 360,
  face = "threeQuarter",
  glow,
  interactive = true,
  className = "",
}: {
  size?: number;
  face?: "red" | "green" | "blue" | "threeQuarter" | "edge";
  glow?: string;
  interactive?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [ok, setOk] = useState(false);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const rm = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setOk(!rm.matches);
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
    <img
      src="/cube/hero_840.webp"
      alt="The CSS cube — red C for Events, green S for Apps, blue S for Join"
      width={size}
      height={size * 0.875}
      style={{ width: size, height: "auto" }}
      className="select-none"
    />
  );
  return (
    <div ref={ref} className={`relative ${className}`} style={{ width: size, height: size }}>
      {ok && visible ? (
        <Suspense fallback={fallback}>
          <CubeSpotCanvas size={size} face={face} glow={glow} interactive={interactive} paused={!visible} />
        </Suspense>
      ) : (
        fallback
      )}
    </div>
  );
}
