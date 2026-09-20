import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { brand } from "@brand/brand.config";

const LINKS: { to: string; label: string }[] = [
  { to: "/events", label: "Events" },
  { to: "/apps", label: "Apps" },
  { to: "/cyberhounds", label: "Cyberhounds" },
  { to: "/about", label: "About" },
  { to: "/resources", label: "Resources" },
  { to: "/news", label: "News" },
];

/** The one nav. Section accent comes from the route wrapper's data-accent,
    so the active-link underline is always the section's own color. */
export function Nav() {
  const [open, setOpen] = useState(false);
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `mono-label transition-colors py-1.5 border-b-2 ${
      isActive
        ? "text-ink border-(--accent)"
        : "text-muted border-transparent hover:text-ink"
    }`;
  return (
    <nav className="sticky top-0 z-40 bg-navy-900/95 border-b border-line">
      <div className="max-w-6xl mx-auto flex items-center gap-6 px-5 h-16">
        <Link to="/" className="flex items-center gap-3 shrink-0" onClick={() => setOpen(false)}>
          <img src={brand.logos.svg} alt="" className="w-8 h-8" />
          <span
            className="font-display font-extrabold uppercase text-sm leading-tight hidden sm:block"
            style={{ fontStretch: "115%" }}
          >
            {brand.name}
            <span className="block mono-label text-muted normal-case">{brand.collegeShort}</span>
          </span>
        </Link>
        <div className="hidden md:flex items-center gap-5 ml-auto">
          {LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} className={linkClass}>
              {l.label}
            </NavLink>
          ))}
          <NavLink
            to="/join"
            className="mono-label bg-(--accent) text-(--accent-contrast) font-semibold px-4 py-2 rounded-(--radius-sm) hover:brightness-110 transition-all"
          >
            Join
          </NavLink>
        </div>
        <button
          className="md:hidden ml-auto text-ink p-2"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
      {open && (
        <div className="md:hidden border-t border-line bg-navy-900 px-5 py-4 flex flex-col gap-4">
          {LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} className={linkClass} onClick={() => setOpen(false)}>
              {l.label}
            </NavLink>
          ))}
          <NavLink
            to="/join"
            onClick={() => setOpen(false)}
            className="mono-label bg-(--accent) text-(--accent-contrast) font-semibold px-4 py-2.5 rounded-(--radius-sm) text-center"
          >
            Join
          </NavLink>
        </div>
      )}
    </nav>
  );
}
