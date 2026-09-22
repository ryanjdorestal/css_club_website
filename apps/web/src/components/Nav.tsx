import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { Menu } from "lucide-react";
import { NavOverlay } from "./NavOverlay";
import { CubeSigil } from "@/sigils";
import { nyTime, useApiState } from "@/lib/readouts";
import { useWhoami } from "@/os/session";

const LINKS = [
  { to: "/events", label: "EVENTS" },
  { to: "/projects", label: "PROJECTS" },
  { to: "/cyberhounds", label: "CYBERHOUNDS" },
  { to: "/about", label: "ABOUT" },
  { to: "/resources", label: "RESOURCES" },
  { to: "/news", label: "NEWS" },
];

/** Nav v2 (§5c): CubeSigil + CSS wide logotype + //JOHN_JAY; mono links with
    / separators; > prefix on active; SYS.TIME + ● LIVE readouts; Block CTA. */
export function Nav({ compact = false }: { compact?: boolean }) {
  const [scrolledRaw, setScrolled] = useState(false);
  const scrolled = compact || scrolledRaw; // /os/login (T03) shows the nav in its compact state
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const [time, setTime] = useState(nyTime());
  const api = useApiState();
  const me = useWhoami();
  // What the OS button prints. Kept in one place so the button and the mobile overlay agree.
  const osLabel = me ? `CSS_OS · ${(me.name || me.email).split(/[ @]/)[0].toUpperCase()}` : "CSS_OS";
  const lastY = useRef(0);
  const ticking = useRef(false);
  const { pathname } = useLocation();

  useEffect(() => {
    const iv = setInterval(() => setTime(nyTime()), 1000);
    return () => clearInterval(iv);
  }, []);

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
        className={`fixed top-0 left-0 right-0 z-50 transition-[background,border,height] duration-300 ${scrolled ? "border-b border-line" : "border-b border-transparent"}`}
        style={{
          background: scrolled ? "color-mix(in srgb, var(--color-navy-900) 72%, transparent)" : "transparent",
          backdropFilter: scrolled ? "blur(12px)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(12px)" : "none",
        }}
      >
        <div className={`max-w-[1440px] mx-auto flex items-center gap-5 px-5 md:px-10 transition-[height] duration-300 ${scrolled ? "h-14" : "h-[72px]"}`}>
          <Link to="/" className="flex items-center gap-2.5 shrink-0" onClick={() => setOpen(false)}>
            <motion.span animate={{ scale: scrolled ? 0.85 : 1 }} className="text-ink">
              <CubeSigil size={20} />
            </motion.span>
            <span className="t-wide text-[14px] leading-none">CSS</span>
            <span className="t-micro opacity-55 hidden sm:block">{"//"}JOHN_JAY</span>
          </Link>
          <div className="hidden lg:flex items-center mx-auto">
            {LINKS.map((l, i) => (
              <span key={l.to} className="flex items-center">
                {i > 0 && (
                  <span aria-hidden className="t-micro opacity-30 px-2.5">
                    /
                  </span>
                )}
                <NavLink to={l.to} className="relative py-2 t-label !tracking-[0.12em] !text-[12px] hover:!opacity-100 transition-opacity">
                  {({ isActive }) => (
                    <>
                      {isActive && <span className="pfx mr-1">&gt;</span>}
                      <span className={isActive ? "raise" : ""}>{l.label}</span>
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
              </span>
            ))}
          </div>
          <div className="flex items-center gap-4 ml-auto lg:ml-0">
            <span className="t-micro raise tnum hidden xl:block opacity-70">
              SYS.TIME {time.hms} {time.utc}
            </span>
            <span className={`t-micro raise hidden md:block ${api.live ? "text-teal" : "opacity-50"}`}>
              {api.live === null ? "○ --" : api.live ? "● LIVE" : "○ OFFLINE"}
            </span>
            {/* WCAG 2.5.3 (Label in Name): an aria-label here would replace the words printed on
                the control, and voice control users say what they can see. So the visible text is
                the name, and the extra context rides along as screen-reader-only text. */}
            <Link
              to={me ? "/os" : "/os/login"}
              className="hidden sm:inline-flex items-center gap-1.5 t-micro raise border border-(--accent) text-(--accent-fg) px-3 py-2 hover:bg-(--accent)/10 transition-colors"
              data-testid="nav-os"
            >
              <span aria-hidden>[</span>
              <span>{osLabel}</span>
              <span className="hidden xl:inline">{me ? "" : " · BOARD"}</span>
              <span aria-hidden>]</span>
              <span className="sr-only">{me ? " — open the board platform" : " — board login"}</span>
            </Link>
            <Link to="/join" className="hidden sm:inline-flex items-stretch t-micro raise font-semibold">
              <span className="flex items-center px-3.5 py-2 bg-(--accent) text-(--accent-contrast)">JOIN</span>
              <span aria-hidden className="flex items-center justify-center w-7 bg-(--accent) text-(--accent-contrast) border-l border-navy-900/25">
                ↗
              </span>
            </Link>
            <button className="lg:hidden text-ink p-2 cursor-pointer" aria-label="Open menu" onClick={() => setOpen(true)}>
              <Menu size={22} />
            </button>
          </div>
        </div>
      </motion.nav>
      <AnimatePresence>{open && <NavOverlay key={pathname} onClose={() => setOpen(false)} />}</AnimatePresence>
    </>
  );
}
