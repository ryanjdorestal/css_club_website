/** The OS top strip (R9_06, ≈ 9 % of the page): the 3×3 app-grid glyph (opens the module
    launcher — the run-7 rail became this popover; ⌘K / Ctrl K too), a 7-cell stat ticker
    (LABEL over value, a hairline gap after the 4th cell), the user chip (initials · NAME · #ROLE).
    Every value is real: term, officers, pending, posts, projects, DB tier, SYS.TIME. */
import { useEffect, useRef, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { OS_MODULES } from "../OsLayout";
import { nyTime } from "@/lib/readouts";

export type Cell = { label: string; value: string | number | null };

export function TopStrip({ cells, user, admin }: { cells: Cell[]; user: { name: string; role: string }; admin: boolean }) {
  const [open, setOpen] = useState(false);
  const [time, setTime] = useState(nyTime());
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const iv = setInterval(() => setTime(nyTime()), 1000);
    return () => clearInterval(iv);
  }, []);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") setOpen(false);
    };
    const onClick = (e: MouseEvent) => {
      if (open && box.current && !box.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onClick);
    };
  }, [open]);
  const initials = user.name
    .split(/[ @]/)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? "")
    .join("");
  const all: Cell[] = [...cells.slice(0, 6), { label: "SYS.TIME", value: time.hms }];
  return (
    <header className="relative flex items-center gap-6 h-[74px] px-4 md:px-5 border-b border-line/60" data-testid="top-strip">
      <div ref={box} className="relative shrink-0">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-haspopup="menu"
          aria-label="Modules (⌘K)"
          className="grid grid-cols-3 gap-[3px] w-6 h-6 p-0.5 cursor-pointer text-ink/80 hover:text-ink"
          data-testid="launcher"
        >
          {Array.from({ length: 9 }).map((_, i) => (
            <span key={i} className="block w-1 h-1 bg-current" />
          ))}
        </button>
        {open && (
          <div
            role="menu"
            className="absolute left-0 top-10 z-50 grid grid-cols-3 gap-px bg-line border border-line w-[330px] shadow-[0_24px_48px_-24px_rgba(0,0,0,.8)] os-launcher"
          >
            {OS_MODULES.filter((m) => !("admin" in m && m.admin) || admin).map((m, i) => (
              <NavLink
                key={m.to}
                to={m.to}
                end={"end" in m ? m.end : false}
                role="menuitem"
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `bg-navy-900 aspect-square flex flex-col items-center justify-center gap-1.5 hover:bg-navy-800 ${isActive ? "text-teal" : "text-ink"}`
                }
              >
                <span className="t-micro opacity-50 tnum">/{String(i + 1).padStart(2, "0")}</span>
                <span className="t-label raise">{m.label.toUpperCase()}</span>
              </NavLink>
            ))}
          </div>
        )}
      </div>
      <span aria-hidden className="w-px h-8 bg-line/80 shrink-0" />
      <ol className="flex items-center gap-7 grow overflow-x-auto min-w-0" aria-label="Platform readouts">
        {all.map((c, i) => (
          <li key={c.label} className={`shrink-0 flex items-center gap-7 ${i === 4 ? "pl-7 border-l border-line/80" : ""}`}>
            <span className="block">
              <span className="block t-micro opacity-50">{c.label}</span>
              <span className="block t-mono-display text-[12px] mt-1 tnum">{c.value === null || c.value === undefined ? "—" : c.value}</span>
            </span>
          </li>
        ))}
      </ol>
      <Link to="/os/board" className="shrink-0 flex items-center gap-3 text-right" aria-label="Your board profile">
        <span className="w-8 h-8 rounded-full bg-navy-500 text-ink flex items-center justify-center t-label raise">{initials || "?"}</span>
        <span className="hidden sm:block">
          <span className="block t-label raise text-ink">{user.name.split(" ")[0].toUpperCase()}</span>
          <span className="block t-micro opacity-50">#{user.role.toUpperCase()}</span>
        </span>
      </Link>
    </header>
  );
}
