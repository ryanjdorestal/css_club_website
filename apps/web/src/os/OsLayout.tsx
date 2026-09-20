import { useEffect } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { brand } from "@brand/brand.config";
import { MonoLabel } from "@/components/MonoLabel";

export function getOsRole(): string | null {
  return sessionStorage.getItem("jjcss-os-role");
}

const OS_LINKS = [
  { to: "/os", label: "Today", end: true },
  { to: "/os/queue", label: "Queue" },
];

// Same spine as RHEC OS; these land next (listed so the shell shows the shape).
const PLANNED = ["Members", "Alumni", "Events ops", "Bulletins", "Records", "Handoffs", "Settings"];

/** /os shell — dense, dark, teal accent, John Jay tokens. Tier 1 = local dev
    role picker; Supabase Auth replaces it when the project is configured. */
export default function OsLayout() {
  const navigate = useNavigate();
  const role = getOsRole();
  useEffect(() => {
    if (!role) navigate("/os/login", { replace: true });
  }, [role, navigate]);
  if (!role) return null;
  return (
    <div data-accent="teal" className="min-h-dvh flex bg-navy-900">
      <aside className="w-52 shrink-0 border-r border-line flex flex-col">
        <Link to="/" className="flex items-center gap-2.5 px-4 h-14 border-b border-line">
          <img src={brand.logos.svg} alt="" className="w-6 h-6" />
          <span className="font-display font-extrabold uppercase text-xs" style={{ fontStretch: "115%" }}>
            {brand.shortName} <span className="text-teal">OS</span>
          </span>
        </Link>
        <nav className="flex flex-col gap-0.5 p-2">
          {OS_LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `mono-label px-3 py-2 rounded-(--radius-sm) transition-colors ${
                  isActive ? "bg-navy-700 text-ink" : "text-muted hover:text-ink"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
          <div className="mt-3 px-3">
            <MonoLabel>Planned</MonoLabel>
          </div>
          {PLANNED.map((p) => (
            <span key={p} className="mono-label px-3 py-1.5 text-muted/50 cursor-not-allowed">
              {p}
            </span>
          ))}
        </nav>
        <div className="mt-auto p-4 border-t border-line">
          <MonoLabel>role · {role}</MonoLabel>
          <button
            onClick={() => {
              sessionStorage.removeItem("jjcss-os-role");
              navigate("/os/login");
            }}
            className="mono-label text-teal hover:underline block mt-1 cursor-pointer"
          >
            switch role
          </button>
        </div>
      </aside>
      <main className="grow p-6 md:p-8 overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
}
