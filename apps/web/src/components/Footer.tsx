import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";
import { brand } from "@brand/brand.config";
import links from "@data/links.json";
import pkg from "../../package.json";
import { StampLockup } from "./StampLockup";
import { BinaryRings } from "./BinaryRings";
import { useLenis } from "@/motion/LenisProvider";

const NAVIGATE = [
  { to: "/", label: "Home" },
  { to: "/events", label: "Events" },
  { to: "/apps", label: "Apps" },
  { to: "/cyberhounds", label: "Cyberhounds" },
  { to: "/about", label: "About" },
  { to: "/resources", label: "Resources" },
  { to: "/news", label: "News" },
  { to: "/join", label: "Join" },
];

const CONNECT = [
  { href: links.discord, label: "Discord", domain: "discord.gg" },
  { href: links.github, label: "GitHub", domain: "github.com/jjcss" },
  { href: `mailto:${links.email}`, label: "Email", domain: links.email },
  { href: links.youtube, label: "YouTube", domain: "@computersocjjay" },
  { href: links.linktree, label: "Linktree", domain: "linktr.ee/jjaycss" },
];

/** The closing movement (rhecwb footer, John Jay skin): grid → divider+CTA →
    bottom rail → giant cropped brandmark with the JJ shield + CSS stamp. */
export function Footer() {
  const ref = useRef<HTMLElement>(null);
  const lenis = useLenis();
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });
  const wmY = useTransform(scrollYProgress, [0, 1], [80, 0]);
  const wmOpacity = useTransform(scrollYProgress, [0, 1], [0.035, 0.075]);

  return (
    <footer
      ref={ref}
      id="site-footer"
      data-accent="teal"
      data-tone="dark-3"
      className="relative mt-auto overflow-hidden border-t border-line"
      style={{ background: "linear-gradient(var(--color-navy-900), var(--color-navy-900) 82%, var(--color-seam))" }}
    >
      <div className="absolute inset-0 opacity-[0.55]">
        <BinaryRings opacity={0.04} />
      </div>

      {/* 1 — grid */}
      <div className="relative max-w-[1280px] mx-auto px-5 md:px-10 pt-24 pb-14 grid gap-12 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-4">
            <StampLockup size={116} />
            <img src="/img/brand/jj_shield.png" alt="John Jay College of Criminal Justice" className="w-16 h-16" />
          </div>
          <div id="footer-cube-dock" className="mt-4 w-14 h-14">
            <img src={brand.logos.svg} alt="" className="w-14 h-14" />
          </div>
          <p className="pixel text-teal text-2xl mt-4 max-w-[240px] leading-tight">
            {brand.taglines.primary}
          </p>
        </div>
        <nav aria-label="Footer navigation">
          <p className="mono-label text-(--accent-ink) mb-4">{"//"} NAVIGATE</p>
          <ul className="space-y-2.5">
            {NAVIGATE.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="u-draw text-sm text-muted hover:text-ink transition-colors">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div>
          <p className="mono-label text-(--accent-ink) mb-4">{"//"} CONNECT</p>
          <ul className="space-y-2.5">
            {CONNECT.map((l) => (
              <li key={l.label} className="flex items-baseline justify-between gap-3">
                <a href={l.href} target="_blank" rel="noreferrer noopener" className="u-draw text-sm text-muted hover:text-ink transition-colors">
                  {l.label}
                </a>
                <span className="mono-label text-muted/50 truncate">{l.domain}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mono-label text-(--accent-ink) mb-4">{"//"} META</p>
          <ul className="space-y-2.5 text-sm text-muted">
            <li>Built with React · Python · Supabase</li>
            <li>
              <a href={brand.githubOrg ?? links.github} target="_blank" rel="noreferrer noopener" className="u-draw hover:text-ink">
                Source ↗ github.com/jjcss
              </a>
            </li>
            <li className="mono-label">MIT · content from CSS_Website@{brand.source.commit}</li>
            <li>
              <Link to="/os/login" className="mono-label text-muted/60 hover:text-teal transition-colors">
                OS login →
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* 2 — divider + CTA */}
      <div className="relative border-t border-line">
        <div className="max-w-[1280px] mx-auto px-5 md:px-10 py-10 flex flex-col md:flex-row md:items-center gap-6 justify-between">
          <p className="font-display font-black uppercase text-[clamp(28px,3.2vw,44px)] leading-none" style={{ fontStretch: "115%" }}>
            Ready to commit?
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/join"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-(--radius-sm) bg-teal text-navy-900 font-semibold text-sm hover:brightness-110 transition-all"
            >
              Join the Society
            </Link>
            <Link
              to="/apps"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-(--radius-sm) border border-teal text-teal text-sm hover:bg-teal/10 transition-colors"
            >
              Submit an app
            </Link>
          </div>
        </div>
      </div>

      {/* 3 — bottom rail */}
      <div className="relative border-t border-line">
        <div className="max-w-[1280px] mx-auto px-5 md:px-10 py-5 flex flex-wrap items-center gap-x-6 gap-y-2">
          <span className="mono-label text-muted">© {new Date().getFullYear()} John Jay Computer Science Society</span>
          <span className="mono-label text-muted/60">Handed to the board</span>
          <span className="mono-label text-muted/60">v{pkg.version}</span>
          <button
            onClick={() => (lenis ? lenis.scrollTo(0) : window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" }))}
            className="mono-label text-teal hover:underline ml-auto cursor-pointer"
          >
            Back to top ↑
          </button>
        </div>
      </div>

      {/* 4 — giant cropped brandmark */}
      <div aria-hidden className="relative overflow-hidden select-none" style={{ marginBottom: "-0.30em" }}>
        <motion.div
          style={reduced ? { opacity: 0.07 } : { y: wmY, opacity: wmOpacity }}
          className="whitespace-nowrap text-center font-display font-black uppercase text-ink leading-[0.82]"
        >
          <span className="block max-md:hidden" style={{ fontSize: "clamp(96px, 17.5vw, 260px)", letterSpacing: "-0.04em" }}>
            Computer Science
          </span>
          <span className="block max-md:hidden" style={{ fontSize: "clamp(96px, 17.5vw, 260px)", letterSpacing: "-0.04em" }}>
            Society
          </span>
          <span className="hidden max-md:block" style={{ fontSize: "26vw", letterSpacing: "-0.04em" }}>Computer</span>
          <span className="hidden max-md:block" style={{ fontSize: "26vw", letterSpacing: "-0.04em" }}>Science</span>
          <span className="hidden max-md:block" style={{ fontSize: "26vw", letterSpacing: "-0.04em" }}>Society</span>
        </motion.div>
      </div>
    </footer>
  );
}
