import { Link } from "react-router-dom";
import { brand } from "@brand/brand.config";
import links from "@data/links.json";
import { StampLockup } from "./StampLockup";
import { MonoLabel } from "./MonoLabel";

const EXPLORE = [
  { to: "/events", label: "Events" },
  { to: "/apps", label: "Apps" },
  { to: "/cyberhounds", label: "Cyberhounds" },
  { to: "/about", label: "About" },
  { to: "/resources", label: "Resources" },
  { to: "/news", label: "News" },
  { to: "/join", label: "Join" },
];

const CONNECT = [
  { href: links.discord, label: "Discord" },
  { href: links.github, label: "GitHub" },
  { href: links.instagram, label: "Instagram" },
  { href: links.linkedin, label: "LinkedIn" },
  { href: links.youtube, label: "YouTube" },
  { href: `mailto:${links.email}`, label: "Email" },
];

export function Footer() {
  return (
    <footer data-accent="teal" className="border-t border-line bg-navy-900 mt-auto">
      <div className="max-w-6xl mx-auto px-5 py-12 grid gap-10 sm:grid-cols-[auto_1fr_1fr] items-start">
        <div className="text-muted">
          <StampLockup size={132} />
        </div>
        <div className="flex flex-col gap-2.5">
          <MonoLabel accent>{"//"} Explore</MonoLabel>
          {EXPLORE.map((l) => (
            <Link key={l.to} to={l.to} className="text-sm text-muted hover:text-teal transition-colors w-fit">
              {l.label}
            </Link>
          ))}
        </div>
        <div className="flex flex-col gap-2.5">
          <MonoLabel accent>{"//"} Connect</MonoLabel>
          {CONNECT.map((l) => (
            <a
              key={l.label}
              href={l.href}
              target="_blank"
              rel="noreferrer noopener"
              className="text-sm text-muted hover:text-teal transition-colors w-fit"
            >
              {l.label}
            </a>
          ))}
        </div>
      </div>
      <div className="border-t border-line">
        <div className="max-w-6xl mx-auto px-5 py-5 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
          <p className="mono-label text-muted">
            © {new Date().getFullYear()} {brand.name} · {brand.collegeShort} · {links.address}
          </p>
          <p className="mono-label text-muted">
            MIT · content from{" "}
            <a
              href={`${brand.source.oldRepo}/tree/${brand.source.commit}`}
              target="_blank"
              rel="noreferrer noopener"
              className="text-teal hover:underline"
            >
              CSS_Website@{brand.source.commit}
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
