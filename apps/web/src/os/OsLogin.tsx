import { useNavigate } from "react-router-dom";
import { brand } from "@brand/brand.config";
import { MonoLabel } from "@/components/MonoLabel";
import { BinaryRings } from "@/components/BinaryRings";

const ROLES = ["president", "vice-president", "secretary", "treasurer", "member"];

/** /os/login — Tier 1: a clearly-labeled LOCAL DEV role picker. When the
    Supabase project + Auth are configured this screen becomes the real login;
    the picker only exists so the OS is testable with zero accounts. */
export default function OsLogin() {
  const navigate = useNavigate();
  return (
    <main data-accent="teal" className="relative min-h-dvh flex items-center justify-center bg-navy-900 overflow-hidden">
      <BinaryRings opacity={0.06} />
      <div className="relative w-[min(92vw,420px)] border border-line rounded-(--radius-lg) bg-navy-800 p-8">
        <div className="flex items-center gap-3 mb-6">
          <img src={brand.logos.svg} alt="" className="w-9 h-9" />
          <div>
            <p className="font-display font-extrabold uppercase text-sm" style={{ fontStretch: "115%" }}>
              {brand.shortName} OS
            </p>
            <MonoLabel>{brand.name}</MonoLabel>
          </div>
        </div>
        <div className="border border-teal/40 bg-teal/5 rounded-(--radius-sm) px-3 py-2 mb-6">
          <MonoLabel accent>LOCAL DEV MODE — no auth configured</MonoLabel>
          <p className="text-xs text-muted mt-1 leading-relaxed">
            Pick a role to explore the OS. Real login arrives with the Supabase
            project (see SETUP.md); nothing here touches a server.
          </p>
        </div>
        <div className="grid gap-2">
          {ROLES.map((r) => (
            <button
              key={r}
              onClick={() => {
                sessionStorage.setItem("jjcss-os-role", r);
                navigate("/os");
              }}
              className="mono-label text-left px-4 py-3 border border-line rounded-(--radius-sm) text-muted hover:text-ink hover:border-teal transition-colors cursor-pointer"
            >
              → {r}
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}
