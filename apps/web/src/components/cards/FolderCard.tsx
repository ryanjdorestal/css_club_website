/** FolderCard — the T11 folder-tab card (run 9 §3). One silhouette: a label tab protruding
    from the top-left (≈ 34 % of the width, 9 % of the height, outer corners rounded 4 px,
    its inner edge a 45° cut into the body), an optional mirrored tab bottom-right, one 45°
    chamfer on the corner opposite the tab, a 4 px body radius (the one place a radius is
    allowed), a hairline inside the same path, an optional two-tone split, a rotated micro
    label on the right edge and a barcode. Never used on TicketCard / PosterCard surfaces.
    Path is measured at runtime (clip-path: path() needs px) via ResizeObserver. */
import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { pathOf } from "@/type/glyphs/glyphs";
import { BarcodeStrip } from "@/components/BarcodeStrip";

type FolderTone = "navy" | "paper" | "red" | "teal" | "os" | "slate";
const TONE: Record<FolderTone, { bg: string; ink: string; muted: string }> = {
  navy: { bg: "var(--color-navy-700)", ink: "var(--color-ink)", muted: "var(--color-muted)" },
  // OS realm tiles (run 9 §5): one step above the page, and the "slate" accent tile
  os: { bg: "var(--color-navy-800)", ink: "var(--color-ink)", muted: "var(--color-muted)" },
  slate: { bg: "var(--os-accent)", ink: "var(--color-ink)", muted: "var(--color-muted)" },
  paper: { bg: "var(--color-paper)", ink: "var(--color-ink-on-paper)", muted: "var(--color-muted-on-paper)" },
  red: { bg: "var(--color-red)", ink: "var(--color-ink)", muted: "color-mix(in srgb, var(--color-ink) 78%, transparent)" },
  teal: { bg: "var(--color-teal)", ink: "var(--color-navy-900)", muted: "color-mix(in srgb, var(--color-navy-900) 72%, transparent)" },
};
const OTHER: Record<FolderTone, FolderTone> = { navy: "paper", paper: "navy", red: "paper", teal: "navy", os: "paper", slate: "paper" };

function silhouette(w: number, h: number, mirror: boolean, chamfer: "br" | "tr" | "bl", tabFrac = 0.34) {
  const r = 4;
  const tabW = Math.round(w * tabFrac);
  const tabH = Math.max(22, Math.min(34, Math.round(h * 0.09)));
  const c = 16;
  const top = tabH;
  const bottom = mirror ? h - tabH : h;
  const pts: [number, number, number?][] = [
    [0, 0, r],
    [tabW, 0, r],
    [tabW + tabH, top],
  ];
  if (chamfer === "tr") pts.push([w - c, top], [w, top + c]);
  else pts.push([w, top, r]);
  if (mirror) pts.push([w, h, r], [w - tabW, h, r], [w - tabW - tabH, bottom]);
  else if (chamfer === "br") pts.push([w, h - c], [w - c, h]);
  else pts.push([w, h, r]);
  if (chamfer === "bl") pts.push([c, bottom], [0, bottom - c]);
  else pts.push([0, bottom, r]);
  return { d: pathOf(pts, true), tabH, tabW };
}

export function FolderCard({
  tab,
  tone = "navy",
  split = 0,
  chamfer,
  mirrorTab = false,
  edgeLabel,
  barcode,
  children,
  lower,
  className = "",
  as: Tag = "div",
  href,
  tabFrac = 0.34,
}: {
  tab: string;
  tone?: FolderTone;
  split?: number;
  chamfer?: "br" | "tr" | "bl";
  mirrorTab?: boolean;
  edgeLabel?: string;
  barcode?: string;
  children: ReactNode;
  lower?: ReactNode;
  className?: string;
  as?: "div" | "a" | "article" | "li";
  href?: string;
  /** tab width as a fraction of the card (T11 ≈ .34; OS tiles use .62 for their titles) */
  tabFrac?: number;
}) {
  const ref = useRef<HTMLElement>(null);
  const [geo, setGeo] = useState<{ d: string; tabH: number; tabW: number } | null>(null);
  const cut = chamfer ?? (mirrorTab ? "tr" : "br");
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => {
      const { width, height } = e.contentRect;
      if (width && height) setGeo(silhouette(Math.round(width), Math.round(height), mirrorTab, cut, tabFrac));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [mirrorTab, cut, tabFrac]);
  const t = TONE[tone];
  const o = TONE[OTHER[tone]];
  const tabH = geo?.tabH ?? 26;
  return (
    <Tag
      ref={ref as never}
      href={href}
      className={`folder group relative flex flex-col ${href ? "cursor-pointer" : ""} ${className}`}
      style={{ clipPath: geo ? `path("${geo.d}")` : undefined, background: t.bg, color: t.ink, "--tone-muted": t.muted } as React.CSSProperties}
    >
      {/* hairline along the same path (2 px stroke, half clipped away → 1 px) */}
      {geo && (
        <svg aria-hidden className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: "visible" }}>
          <path d={geo.d} fill="none" strokeWidth="2" className="folder-line" stroke="currentColor" style={{ opacity: 0.22 }} />
        </svg>
      )}
      <span
        className="absolute left-3 top-0 flex items-center t-label raise !tracking-[0.12em] whitespace-nowrap overflow-hidden text-ellipsis transition-transform group-hover:-translate-y-0.5 z-10"
        style={{ height: tabH, maxWidth: (geo?.tabW ?? 120) - 8 }}
      >
        {tab}
      </span>
      {edgeLabel && (
        <span
          aria-hidden
          className="absolute right-0 top-1/2 t-micro whitespace-nowrap origin-center rotate-90 translate-x-[calc(50%-10px)] -translate-y-1/2 opacity-50 group-hover:opacity-90 transition-opacity"
        >
          {edgeLabel}
        </span>
      )}
      <div
        className="relative"
        style={{
          flexGrow: lower ? split || 0.55 : 1,
          paddingTop: tabH + 14,
          paddingLeft: 18,
          paddingBottom: lower || !mirrorTab ? 18 : tabH + 14,
          paddingRight: edgeLabel ? 34 : 18,
        }}
      >
        {children}
        {barcode && !lower && <BarcodeStrip seed={barcode} height={14} className="mt-4 opacity-50" />}
      </div>
      {lower && (
        // the two-tone body: the lower tone carries its own ink and the mirrored tab's room
        <div
          className="relative"
          style={
            {
              flexGrow: 1 - (split || 0.55),
              background: o.bg,
              color: o.ink,
              "--tone-muted": o.muted,
              paddingTop: 16,
              paddingLeft: 18,
              paddingBottom: mirrorTab ? tabH + 14 : 18,
              paddingRight: edgeLabel ? 34 : 18,
            } as React.CSSProperties
          }
        >
          {lower}
          {barcode && <BarcodeStrip seed={barcode} height={14} className="mt-4 opacity-50" />}
        </div>
      )}
    </Tag>
  );
}
