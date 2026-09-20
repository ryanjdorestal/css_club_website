import { useRef } from "react";
import { Link } from "react-router-dom";
import { useScroll, useReducedMotion } from "motion/react";
import { brand } from "@brand/brand.config";
import links from "@data/links.json";
import pkg from "../../package.json";
import { BinaryRings } from "./BinaryRings";
import { HoundGlaze } from "./HoundGlaze";
import { CubeSpot } from "@/cube/CubeSpot";
import { useLocation } from "react-router-dom";
import { useLenis } from "@/motion/LenisProvider";
import { CSSKufic } from "@/sigils";
import { buildHash, buildTime } from "@/lib/readouts";

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
  const { pathname } = useLocation();
  const isHome = pathname === "/";
  const lenis = useLenis();
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });

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
      <div className="relative max-w-[1280px] mx-auto px-5 md:px-10 pt-24 pb-14 grid gap-12 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div>
          <div className="relative flex items-center gap-6">
            <CSSKufic size={72} className="absolute -left-4 -top-6 opacity-[0.05] pointer-events-none" />
            <div id="footer-cube-dock" className="w-[180px] h-[180px] shrink-0 -ml-4">
              {!isHome && <CubeSpot size={180} face="threeQuarter" interactive />}
            </div>
            <span aria-hidden className="w-px h-16 bg-line shrink-0" />
            <img src="/img/brand/jj_logo_white.png" alt="John Jay College of Criminal Justice" className="h-[64px] w-auto shrink-0" />
          </div>
          <p className="t-micro raise mt-4 opacity-70">JOHN_JAY_COLLEGE · CUNY</p>
          <p className="mt-3 max-w-[300px] text-teal" style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18, lineHeight: 1.25 }}>
            {brand.taglines.primary.toUpperCase()}
          </p>
        </div>
        <nav aria-label="Footer navigation">
          <p className="t-micro raise text-(--accent-ink) mb-4">_navigate</p>
          <ul className="space-y-2.5">
            {NAVIGATE.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="u-draw text-[16px] font-medium text-ink/85 hover:text-ink transition-colors">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div>
          <p className="t-micro raise text-(--accent-ink) mb-4">_connect</p>
          <ul className="space-y-2.5">
            {CONNECT.map((l) => (
              <li key={l.label} className="flex items-baseline justify-between gap-3">
                <a href={l.href} target="_blank" rel="noreferrer noopener" className="u-draw text-[16px] font-medium text-ink/85 hover:text-ink transition-colors">
                  {l.label}
                </a>
                <span className="mono-label text-muted/50 truncate">{l.domain}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="t-micro raise text-(--accent-ink) mb-4">_meta</p>
          <ul className="space-y-2.5 text-[15px] text-ink/75">
            <li>Built with React · Python · Supabase</li>
            <li>
              <a href={brand.githubOrg ?? links.github} target="_blank" rel="noreferrer noopener" className="u-draw hover:text-ink">
                Source ↗ github.com/jjcss
              </a>
            </li>
            <li className="t-micro opacity-70">MIT · CONTENT FROM CSS_WEBSITE@{brand.source.commit.toUpperCase()}</li>
            <li className="t-micro opacity-70 tnum">BUILD {buildHash().toUpperCase()} · {buildTime()}</li>
            <li>
              <Link to="/os/login" className="t-micro opacity-50 hover:opacity-100 hover:text-teal transition-all">
                OS_LOGIN →
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* 2 — divider + CTA */}
      <div className="relative border-t border-line">
        <div className="max-w-[1280px] mx-auto px-5 md:px-10 py-10 flex flex-col md:flex-row md:items-center gap-6 justify-between">
          <p className="t-h1 !text-[clamp(28px,3.6vw,52px)]">READY TO COMMIT?</p>
          <div className="flex flex-wrap gap-3 items-stretch">
            <Link to="/join" className="group inline-flex items-stretch" aria-label="Join the Society">
              <span className="flex items-center px-6 py-3 bg-teal text-navy-900 t-label raise !opacity-100 font-display font-bold">JOIN_THE_SOCIETY</span>
              <span className="flex items-center justify-center w-10 bg-teal text-navy-900 border-l border-navy-900/25 transition-transform duration-200 group-hover:translate-x-1">↗</span>
            </Link>
            <Link to="/apps" className="group inline-flex items-center gap-2 border border-teal text-teal px-6 py-3 t-label raise hover:bg-teal/10 transition-colors">
              <span className="transition-transform duration-200 group-hover:-translate-x-0.5">[</span>SUBMIT_AN_APP<span className="transition-transform duration-200 group-hover:translate-x-0.5">]</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 3 — bottom rail */}
      <div className="relative border-t border-line">
        <div className="max-w-[1280px] mx-auto px-5 md:px-10 py-5 flex flex-wrap items-center gap-x-6 gap-y-2">
          <span className="font-display font-black text-[24px] leading-none tracking-[-0.02em]">CSS · JOHN JAY</span>
          <span className="t-micro opacity-60">© {new Date().getFullYear()} JOHN_JAY_COMPUTER_SCIENCE_SOCIETY</span>
          <span className="t-micro opacity-40">HANDED_TO_THE_BOARD</span>
          <span className="t-micro opacity-40 tnum">V{pkg.version}</span>
          <button
            onClick={() => (lenis ? lenis.scrollTo(0) : window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" }))}
            className="t-micro raise text-teal hover:underline ml-auto cursor-pointer"
          >
            BACK_TO_TOP ↑
          </button>
        </div>
      </div>

      {/* 4 — the Bloodhound glaze (run 4: replaces the wordmark) */}
      <HoundGlaze progress={scrollYProgress} />
    </footer>
  );
}
