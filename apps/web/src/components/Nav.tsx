import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { Menu } from "lucide-react";
import { brand } from "@brand/brand.config";
import { NavOverlay } from "./NavOverlay";

const LINKS = [
  { to: "/events", label: "Events" },
  { to: "/apps", label: "Apps" },
  { to: "/cyberhounds", label: "Cyberhounds" },
  { to: "/about", label: "About" },
  { to: "/resources", label: "Resources" },
  { to: "/news", label: "News" },
];

/** Morph nav: transparent at top → compact blurred bar after 24px; hides on
    scroll-down past 400, reveals on scroll-up. Active underline animates
    between items (layoutId). */
export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const lastY = useRef(0);
  const ticking = useRef(false);
  const { pathname } = useLocation();

  useEffect(() => {
    const onScroll = () => {
      if (ticking.current) return;
      ticking.current = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        setScrolled(y > 24);
        setHidden(y > 400 && y > lastY.current);
        lastY.current = y;
        ticking.current = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <motion.nav
        data-scrolled={scrolled || undefined}
        animate={{ y: hidden && !open ? "-100%" : "0%" }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-[background,border,height] duration-300 ${
          scrolled ? "border-b border-line" : "border-b border-transparent"
        }`}
        style={{
          background: scrolled ? "color-mix(in srgb, var(--color-navy-900) 70%, transparent)" : "transparent",
          backdropFilter: scrolled ? "blur(12px)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(12px)" : "none",
        }}
      >
        <div
          className={`max-w-[1440px] mx-auto flex items-center gap-6 px-5 md:px-10 transition-[height] duration-300 ${
            scrolled ? "h-14" : "h-[72px]"
          }`}
        >
          <Link to="/" className="flex items-center gap-2.5 shrink-0" onClick={() => setOpen(false)}>
            <motion.img
              src={brand.logos.svg}
              alt=""
              animate={{ scale: scrolled ? 0.85 : 1 }}
              className="w-7 h-7"
            />
            <span className="font-display font-extrabold uppercase text-base leading-none" style={{ fontStretch: "118%" }}>
              CSS
            </span>
            <span className="mono-label text-muted hidden sm:block">John Jay</span>
          </Link>
          <div className="hidden lg:flex items-center gap-7 mx-auto">
            {LINKS.map((l) => (
              <NavLink key={l.to} to={l.to} className="relative py-2 text-sm font-medium text-muted hover:text-ink transition-colors">
                {({ isActive }) => (
                  <>
                    <span className={isActive ? "text-ink" : ""}>{l.label}</span>
                    {isActive && (
                      <motion.span
                        layoutId="nav-underline"
                        className="absolute left-0 right-0 -bottom-px h-[2px] bg-(--accent)"
                        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>
          <div className="flex items-center gap-3 ml-auto lg:ml-0">
            <Link
              to="/join"
              className="hidden sm:inline-flex mono-label bg-(--accent) text-(--accent-contrast) font-semibold px-4 py-2 rounded-(--radius-sm) hover:brightness-110 transition-all"
            >
              Join
            </Link>
            <button
              className="lg:hidden text-ink p-2 cursor-pointer"
              aria-label="Open menu"
              onClick={() => setOpen(true)}
            >
              <Menu size={22} />
            </button>
          </div>
        </div>
      </motion.nav>
      <AnimatePresence>{open && <NavOverlay key={pathname} onClose={() => setOpen(false)} />}</AnimatePresence>
    </>
  );
}
