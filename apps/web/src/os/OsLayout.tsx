/** /os shell: left rail (mono nav with /01…) + content column. Guests are
    sent to /os/login; admin-only items are hidden for officers (the API
    enforces the real gate). No cube canvas here — perf. */
import { useEffect, useRef } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { brand } from "@brand/brand.config";
import { MonoLabel } from "@/components/MonoLabel";
import { OsSessionProvider, reasonFor, useSession } from "./session";
import { StatusBar } from "@/components/StatusBar";
import { ApiStateContext } from "@/lib/readouts";

export const OS_MODULES = [
  { to: "/os", label: "Today", end: true },
  { to: "/os/projects", label: "Projects" },
  { to: "/os/posts", label: "Posts" },
  { to: "/os/events", label: "Events" },
  { to: "/os/resources", label: "Resources" },
  { to: "/os/members", label: "Members" },
  { to: "/os/board", label: "Board" },
  { to: "/os/site", label: "Site", admin: true },
  { to: "/os/inheritance", label: "Inheritance" },
  { to: "/os/system", label: "System" },
  { to: "/os/audit", label: "Audit" },
] as const;

function Shell() {
  const navigate = useNavigate();
  const { pathname, search } = useLocation();
  const { actor, mode, loading, logout } = useSession();
  const bounced = useRef(false);
  useEffect(() => {
    if (bounced.current || loading || (actor && actor.role !== "guest") || pathname.startsWith("/os/login")) return;
    bounced.current = true;
    navigate(`/os/login?next=${encodeURIComponent(pathname + search)}&reason=${reasonFor(actor)}`, { replace: true });
  }, [actor, loading, navigate, pathname, search]);
  if (loading || !actor || actor.role === "guest") return null;
  return (
    <div data-accent="teal" className="min-h-dvh flex flex-col md:flex-row bg-navy-900 text-ink">
      <aside className="md:w-52 shrink-0 border-b md:border-b-0 md:border-r border-line flex md:flex-col">
        <Link to="/" className="flex items-center gap-2.5 px-4 h-14 md:border-b border-line shrink-0">
          <img src={brand.logos.svg} alt="" className="w-6 h-6" />
          <span className="font-display font-extrabold uppercase text-xs">
            {brand.shortName} <span className="text-teal">OS</span>
          </span>
        </Link>
        <nav className="flex md:flex-col gap-0.5 p-2 overflow-x-auto grow">
          {OS_MODULES.filter((m) => !("admin" in m && m.admin) || actor.role === "admin").map((m, i) => (
            <NavLink
              key={m.to}
              to={m.to}
              end={"end" in m ? m.end : false}
              className={({ isActive }) =>
                `mono-label px-3 py-2 whitespace-nowrap transition-colors ${isActive ? "bg-navy-700 text-ink" : "text-muted hover:text-ink"}`
              }
            >
              <span className="opacity-50 mr-2">/{String(i + 1).padStart(2, "0")}</span>
              {m.label}
            </NavLink>
          ))}
        </nav>
        <div className="hidden md:block mt-auto p-4 pb-12 border-t border-line">
          <p className="text-[13px] text-ink truncate">{actor.name || actor.email}</p>
          <MonoLabel>
            {actor.role} · {actor.term ?? "no term"}
          </MonoLabel>
          {mode === "local" && <span className="t-micro raise border border-teal/50 text-teal px-1.5 py-0.5 inline-block mt-2">LOCAL_DEV</span>}
          <button
            onClick={() => {
              void logout().then(() => navigate("/os/login"));
            }}
            className="mono-label text-teal hover:underline block mt-2 cursor-pointer"
          >
            sign out
          </button>
        </div>
      </aside>
      <main className="grow p-5 md:p-8 pb-12 overflow-x-hidden min-w-0">
        <Outlet />
      </main>
      <ApiStateContext.Provider value={{ live: true, ms: null }}>
        <StatusBar />
      </ApiStateContext.Provider>
    </div>
  );
}

export default function OsLayout() {
  return (
    <OsSessionProvider>
      <Shell />
    </OsSessionProvider>
  );
}
