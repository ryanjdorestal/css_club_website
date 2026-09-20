import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { X } from "lucide-react";
import { brand } from "@brand/brand.config";
import links from "@data/links.json";

const ROUTES = [
  { to: "/", label: "Home" },
  { to: "/events", label: "Events" },
  { to: "/apps", label: "Apps" },
  { to: "/cyberhounds", label: "Cyberhounds" },
  { to: "/about", label: "About" },
  { to: "/resources", label: "Resources" },
  { to: "/news", label: "News" },
  { to: "/join", label: "Join" },
];

const EASE = [0.22, 1, 0.36, 1] as const;

/** Full-screen mobile menu: navy-900, display-lg routes revealing line by
    line, cube mark spinning slowly, socials in mono at the bottom. */
export function NavOverlay({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[70] bg-navy-900 flex flex-col overflow-y-auto"
      data-tone="dark-3"
    >
      <div className="flex items-center justify-between px-5 h-[72px]">
        <span className="font-display font-extrabold uppercase" style={{ fontStretch: "118%" }}>CSS</span>
        <motion.img
          src={brand.logos.svg}
          alt=""
          className="w-9 h-9"
          animate={{ rotate: 360 }}
          transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
        />
        <button onClick={onClose} aria-label="Close menu" className="text-ink p-2 cursor-pointer">
          <X size={24} />
        </button>
      </div>
      <nav className="grow flex flex-col justify-center px-8 py-6 gap-1">
        {ROUTES.map((r, i) => (
          <span key={r.to} className="block overflow-hidden">
            <motion.span
              className="block"
              initial={{ y: "110%" }}
              animate={{ y: 0 }}
              transition={{ duration: 0.6, ease: EASE, delay: 0.06 * i }}
            >
              <Link
                to={r.to}
                onClick={onClose}
                className="font-display font-black uppercase text-[clamp(36px,9vw,64px)] leading-[1.05] tracking-tight text-ink hover:text-teal transition-colors"
                style={{ fontStretch: "115%" }}
              >
                <span className="mono-label text-teal align-super mr-3">{String(i + 1).padStart(2, "0")}</span>
                {r.label}
              </Link>
            </motion.span>
          </span>
        ))}
      </nav>
      <div className="px-8 pb-10 flex flex-wrap gap-x-6 gap-y-2">
        {[
          ["Discord", links.discord],
          ["GitHub", links.github],
          ["Instagram", links.instagram],
          ["YouTube", links.youtube],
        ].map(([label, href]) => (
          <a key={label} href={href} target="_blank" rel="noreferrer noopener" className="mono-label text-muted hover:text-teal transition-colors">
            {label} ↗
          </a>
        ))}
      </div>
    </motion.div>
  );
}
