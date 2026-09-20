import { Link } from "react-router-dom";

/** Home hero cube slot. Phase 4 swaps the PNG for the R3F canvas; the PNG stays
    as the eager fallback either way. Faces map to sections (cube-as-nav). */
export function CubeSpot() {
  return (
    <div className="relative flex flex-col items-center gap-4">
      <img
        src="/cube/hero_transparent.png"
        alt="The CSS cube — red C for Events, green S for Apps, blue S for Join"
        className="w-[min(76vw,420px)] drop-shadow-[0_0_60px_rgba(110,210,230,0.25)]"
        width={420}
        height={368}
      />
      <div className="flex gap-5">
        <Link to="/events" className="mono-label text-muted hover:text-ink transition-colors">
          <span style={{ color: "var(--color-cube-red)" }}>■</span> C · Events
        </Link>
        <Link to="/apps" className="mono-label text-muted hover:text-ink transition-colors">
          <span style={{ color: "var(--color-cube-green)" }}>■</span> S · Apps
        </Link>
        <Link to="/join" className="mono-label text-muted hover:text-ink transition-colors">
          <span style={{ color: "var(--color-cube-blue)" }}>■</span> S · Join
        </Link>
      </div>
    </div>
  );
}
