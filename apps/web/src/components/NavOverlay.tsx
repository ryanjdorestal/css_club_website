import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { X } from "lucide-react";
import links from "@data/links.json";
import { CubeSigil, CSSKufic } from "@/sigils";
import { Decode } from "./type/Decode";

const ROUTES = [
  { to: "/", label: "HOME" },
  { to: "/events", label: "EVENTS" },
  { to: "/projects", label: "PROJECTS" },
  { to: "/cyberhounds", label: "CYBERHOUNDS" },
  { to: "/about", label: "ABOUT" },
  { to: "/resources", label: "RESOURCES" },
  { to: "/news", label: "NEWS" },
  { to: "/join", label: "JOIN" },
];

/** Mobile overlay: display routes with Decode reveal, /0N indices, Kufic watermark. */
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
      <CSSKufic size={200} className="absolute right-[-8%] top-[30%] opacity-[0.05] pointer-events-none text-teal" />
      <div className="flex items-center justify-between px-5 h-[72px]">
        <span className="t-wide text-[14px]">CSS</span>
        <motion.span animate={{ rotate: 360 }} transition={{ duration: 24, repeat: Infinity, ease: "linear" }} className="text-ink">
          <CubeSigil size={28} />
        </motion.span>
        <button onClick={onClose} aria-label="Close menu" className="text-ink p-2 cursor-pointer"><X size={24} /></button>
      </div>
      <nav className="grow flex flex-col justify-center px-8 py-6 gap-2.5">
        {ROUTES.map((r, i) => (
          <Link key={r.to} to={r.to} onClick={onClose} className="flex items-baseline gap-4 text-ink hover:text-teal transition-colors">
            <span className="t-label raise text-teal tnum">/{String(i + 1).padStart(2, "0")}</span>
            <Decode text={r.label} className="t-h1 !text-[clamp(34px,8.5vw,56px)]" />
          </Link>
        ))}
      </nav>
      <div className="px-8 pb-10 flex flex-wrap gap-x-6 gap-y-2">
        {[["DISCORD", links.discord], ["GITHUB", links.github], ["INSTAGRAM", links.instagram], ["YOUTUBE", links.youtube]].map(([label, href]) => (
          <a key={label} href={href} target="_blank" rel="noreferrer noopener" className="t-micro opacity-60 hover:opacity-100 hover:text-teal transition-all">
            {label} ↗
          </a>
        ))}
      </div>
    </motion.div>
  );
}
