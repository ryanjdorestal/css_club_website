/** /os shell (run 9 §5–§6): the OS realm — page navy-900 with scanlines + a 32 px grid, a
    56 px icon rail on the left (R9_04: Today at the top, the module set, Audit at the bottom;
    the active cell has a red edge), the top strip (launcher glyph · 7-cell ticker · user chip)
    and the content column. Guests are sent to /os/login; admin-only items are hidden for
    officers (the API enforces the real gate). SYS VER {version}.{sha7} bottom-right (R9_05).
    No cube canvas here — login only. */
import { useEffect, useRef, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import "./os.css";
import { OsSessionProvider, osFetch, reasonFor, useSession } from "./session";
import { outboxRead, replayOutbox } from "./ui/useOs";
import { StatusBar } from "@/components/StatusBar";
import { ApiStateContext, buildHash, version } from "@/lib/readouts";
import * as Sg from "@/sigils";
import { TopStrip, type Cell } from "./ui/TopStrip";
import { ToastProvider } from "./ui/Toast";

export const OS_MODULES = [
  { to: "/os", label: "Today", end: true },
  { to: "/os/projects", label: "Projects" },
  { to: "/os/posts", label: "Posts" },
  { to: "/os/events", label: "Events" },
  { to: "/os/workshops", label: "Workshops" },
  { to: "/os/resources", label: "Resources" },
  { to: "/os/members", label: "Members" },
  { to: "/os/board", label: "Board" },
  { to: "/os/site", label: "Site", admin: true },
  { to: "/os/inheritance", label: "Inheritance" },
  { to: "/os/system", label: "System" },
  { to: "/os/audit", label: "Audit" },
] as const;

const SIGIL: Record<string, (p: { size?: number }) => React.ReactElement> = {
  Today: (p) => <Sg.Star4 {...p} />,
  Projects: (p) => <Sg.Terminal {...p} />,
  Posts: (p) => <Sg.Lambda {...p} />,
  Events: (p) => <Sg.Flag {...p} />,
  Workshops: (p) => <Sg.Chevrons {...p} />,
  Resources: (p) => <Sg.Node {...p} />,
  Members: (p) => <Sg.Crosshair {...p} />,
  Board: (p) => <Sg.Eye {...p} />,
  Site: (p) => <Sg.CubeSigil {...p} />,
  Inheritance: (p) => <Sg.BracketSigil {...p} />,
  System: (p) => <Sg.Shield {...p} />,
  Audit: (p) => <Sg.Tick {...p} />,
};

type Attention = { term?: { id?: string; label?: string }; officers?: number; items?: { count: number }[] };
type Health = { db: string; sha: string };

function Shell() {
  const navigate = useNavigate();
  const { pathname, search } = useLocation();
  const { actor, mode, loading, logout } = useSession();
  const bounced = useRef(false);
  const [att, setAtt] = useState<Attention | null>(null);
  const [counts, setCounts] = useState<{ posts: number | null; projects: number | null; db: string }>({ posts: null, projects: null, db: "—" });
  useEffect(() => {
    if (bounced.current || loading || (actor && actor.role !== "guest") || pathname.startsWith("/os/login")) return;
    bounced.current = true;
    navigate(`/os/login?next=${encodeURIComponent(pathname + search)}&reason=${reasonFor(actor)}`, { replace: true });
  }, [actor, loading, navigate, pathname, search]);
  const [outbox, setOutbox] = useState(() => outboxRead().length);
  useEffect(() => {
    if (!actor || actor.role === "guest") return;
    if (outboxRead().length) void replayOutbox().then(() => setOutbox(outboxRead().length));
    void osFetch<Attention>("/api/os/attention").then((r) => r.ok && setAtt(r.data));
    void Promise.all([osFetch<{ rows: unknown[] }>("/api/os/posts"), osFetch<{ rows: unknown[] }>("/api/os/projects"), osFetch<Health>("/api/health")]).then(
      ([p, pr, h]) =>
        setCounts({
          posts: p.ok ? p.data.rows.length : null,
          projects: pr.ok ? pr.data.rows.length : null,
          db: h.ok ? (h.data.db === "ok" ? "LIVE" : "TIER1") : "OFFLINE",
        }),
    );
  }, [actor, pathname]);
  if (loading || !actor || actor.role === "guest") return null;
  const pending = (att?.items ?? []).reduce((a, i) => a + (i.count > 0 ? 1 : 0), 0);
  const cells: Cell[] = [
    { label: "TERM", value: att?.term?.id ?? null },
    { label: "OFFICERS", value: att ? (att.officers ?? 0) : null },
    { label: "PENDING", value: att ? pending : null },
    { label: "POSTS", value: counts.posts },
    { label: "PROJECTS", value: counts.projects },
    { label: "DB", value: counts.db },
  ];
  const modules = OS_MODULES.filter((m) => !("admin" in m && m.admin) || actor.role === "admin");
  return (
    <div data-accent="teal" data-realm="os" data-tone="dark-3" className="min-h-dvh flex text-ink">
      <nav className="shrink-0 border-r border-line flex flex-col max-md:hidden" style={{ width: "var(--os-rail)" }} aria-label="Modules">
        {modules.map((m) => (
          <NavLink key={m.to} to={m.to} end={"end" in m ? m.end : false} className="os-rail-cell" title={m.label} aria-label={m.label}>
            {SIGIL[m.label]({ size: 18 })}
          </NavLink>
        ))}
        <div className="mt-auto flex flex-col items-center gap-2 py-3 border-t border-line">
          {mode === "local" && <span className="t-micro raise text-teal [writing-mode:vertical-rl] rotate-180">LOCAL_DEV</span>}
          <button
            onClick={() => {
              void logout().then(() => navigate("/os/login"));
            }}
            className="os-rail-cell !border-0 cursor-pointer"
            title="Sign out"
            aria-label="Sign out"
          >
            <span className="t-micro raise">OUT</span>
          </button>
        </div>
      </nav>
      <div className="grow min-w-0 flex flex-col pb-12">
        <TopStrip cells={cells} user={{ name: actor.name || actor.email || "board", role: actor.role }} admin={actor.role === "admin"} />
        {outbox > 0 && (
          <p className="t-micro raise text-(--color-red-hi) border-b border-(--color-red)/50 px-5 py-1.5" data-testid="outbox">
            {outbox} WRITE{outbox > 1 ? "S" : ""} QUEUED IN THIS BROWSER · WILL_SYNC when the API answers ·{" "}
            <button onClick={() => void replayOutbox().then(() => setOutbox(outboxRead().length))} className="underline cursor-pointer">
              retry now
            </button>
          </p>
        )}
        <main className="grow p-4 md:p-5 min-w-0">
          <Outlet />
        </main>
        <p className="fixed right-4 bottom-9 t-micro opacity-40 tnum pointer-events-none z-30 max-md:hidden" aria-hidden>
          SYS VER {version()}.{buildHash().slice(0, 7).toUpperCase()}
        </p>
      </div>
      <ApiStateContext.Provider value={{ live: true, ms: null }}>
        <StatusBar />
      </ApiStateContext.Provider>
    </div>
  );
}

export default function OsLayout() {
  return (
    <OsSessionProvider>
      <ToastProvider>
        <Shell />
      </ToastProvider>
    </OsSessionProvider>
  );
}
