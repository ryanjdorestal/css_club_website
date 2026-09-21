import { Suspense, lazy } from "react";
import { useLazy3d } from "@/lib/useLazy3d";

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
  const { ref, ok, visible } = useLazy3d();
  const fallback = (
    <img
      src="/cube/hero_840.webp"
      alt="The CSS cube — red C for Events, green S for Apps, blue S for Join"
      width={size}
      height={size * 0.875}
      style={{ width: size, height: "auto" }}
      loading="eager"
      decoding="async"
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
