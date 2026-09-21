/** The OS bento (run 9 §5): the R9_06 structure, exact — measured in
    docs/archive/context/39_OS_GRID.md. 12 columns (4 bands of 3), 10 px gutters, four row
    tracks 129 · 127 · 262 · 148 (the ref's px at 1120 wide), nine tiles in fixed slots:
      A col 1–3 row 1 (accent)    B col 1–3 row 2       C col 4–6 rows 1–2
      D col 7–12 rows 1–2         E col 1–3 rows 3–4    F col 4–6 rows 3–4 (accent)
      G col 7–9 row 3             H col 10–12 row 3     I col 7–12 row 4 (paper)
    Nothing here moves, merges or resizes a slot; the content is each module's. Under 900 px
    the tiles stack in the same order. Tile / Kpi / Histogram / Ring are the tile anatomy. */
import type { ReactNode } from "react";
import { FolderCard } from "@/components/cards/FolderCard";

type Slots = Record<"a" | "b" | "c" | "d" | "e" | "f" | "g" | "h" | "i", ReactNode>;
const AREA: Record<keyof Slots, string> = {
  a: "1 / 1 / 2 / 4",
  b: "2 / 1 / 3 / 4",
  c: "1 / 4 / 3 / 7",
  d: "1 / 7 / 3 / 13",
  e: "3 / 1 / 5 / 4",
  f: "3 / 4 / 5 / 7",
  g: "3 / 7 / 4 / 10",
  h: "3 / 10 / 4 / 13",
  i: "4 / 7 / 5 / 13",
};

export function Bento({ slots }: { slots: Slots }) {
  return (
    <div className="bento" data-testid="bento">
      {(Object.keys(AREA) as (keyof Slots)[]).map((k) => (
        <div key={k} className="bento-slot min-w-0 min-h-0" data-slot={k} style={{ gridArea: AREA[k] }}>
          {slots[k]}
        </div>
      ))}
    </div>
  );
}

type Tone = "base" | "accent" | "paper";
const TILE: Record<Tone, string> = {
  base: "bg-navy-800 text-ink",
  accent: "os-accent text-ink",
  paper: "bg-paper text-ink-on-paper",
};

/** Tile anatomy: 0 radius, no border, fill one step above the page, 20 px padding, title
    micro caps top-left, ⋮ or ↗ top-right. Tiles with the ⋮ menu are FolderCards (§3.5). */
export function Tile({
  title,
  menu,
  tone = "base",
  children,
  href,
  onArrow,
  className = "",
}: {
  title?: string;
  menu?: "dots" | "arrow";
  tone?: Tone;
  children: ReactNode;
  href?: string;
  onArrow?: () => void;
  className?: string;
}) {
  const glyph =
    menu === "dots" ? (
      <span aria-hidden className="t-label opacity-50 leading-none">
        ⋮
      </span>
    ) : menu === "arrow" ? (
      <a
        href={href ?? "#"}
        onClick={
          onArrow
            ? (e) => {
                e.preventDefault();
                onArrow();
              }
            : undefined
        }
        aria-label={`${title ?? "open"} ↗`}
        className={`w-7 h-7 rounded-full flex items-center justify-center text-[13px] ${tone === "paper" ? "bg-navy-900 text-ink" : "bg-ink text-navy-900"} hover:scale-105 transition-transform`}
      >
        ↗
      </a>
    ) : null;
  if (menu === "dots" && title) {
    return (
      <FolderCard
        tab={title}
        tabFrac={0.62}
        tone={tone === "accent" ? "slate" : tone === "paper" ? "paper" : "os"}
        className={`h-full ${className}`}
        chamfer="br"
      >
        <div className="absolute top-2 right-3">{glyph}</div>
        <div className="h-full flex flex-col">{children}</div>
      </FolderCard>
    );
  }
  return (
    <div className={`relative h-full flex flex-col p-5 ${TILE[tone]} ${className}`}>
      {(title || glyph) && (
        <div className="flex items-start justify-between gap-3 mb-2">
          <span className={`t-label raise ${tone === "paper" ? "opacity-80" : "opacity-80"}`}>{title}</span>
          {glyph}
        </div>
      )}
      <div className="grow flex flex-col min-h-0">{children}</div>
    </div>
  );
}

/** Big numeral bottom-left with the / denominator small, baseline-aligned to its right.
    `—` when there is no data yet (never a fake). */
export function Kpi({
  value,
  denom,
  size = "lg",
  note,
  className = "",
}: {
  value: string | number | null;
  denom?: string;
  size?: "lg" | "md" | "xl";
  note?: string;
  className?: string;
}) {
  const s = size === "xl" ? "text-[clamp(44px,4.6vw,72px)]" : size === "lg" ? "text-[clamp(36px,3.6vw,56px)]" : "text-[clamp(28px,2.6vw,40px)]";
  return (
    <div className={`mt-auto ${className}`}>
      <div className="flex items-baseline gap-4">
        <span className={`t-kpi ${s}`} data-testid="kpi">
          {value === null || value === undefined ? "—" : value}
        </span>
        {denom && <span className="t-label raise opacity-70 tnum whitespace-nowrap">/ {denom}</span>}
      </div>
      {(value === null || note) && <p className="t-micro opacity-50 mt-2">{value === null ? "NO_DATA_YET" : note}</p>}
    </div>
  );
}

/** Five bars, one accent-coloured with a value callout above it (R9_06 tile D). */
export function Histogram({
  bars,
  callout,
  className = "",
}: {
  bars: { label: string; value: number }[];
  callout?: { index: number; text: string };
  className?: string;
}) {
  const max = Math.max(1, ...bars.map((b) => b.value));
  return (
    <div className={`flex items-end gap-2 h-full ${className}`} aria-label={bars.map((b) => `${b.label} ${b.value}`).join(", ")} role="img">
      {bars.map((b, i) => {
        const h = Math.max(4, (b.value / max) * 100);
        const hot = callout?.index === i;
        return (
          <div key={b.label} className="relative flex-1 h-full flex flex-col justify-end min-w-0">
            {hot && (
              <span className="absolute -top-1 left-0 -translate-y-full t-micro raise whitespace-nowrap tnum">
                {callout.text}
                <br />
                <span className="opacity-60">{b.label}</span>
              </span>
            )}
            <div className={hot ? "os-accent-bar" : "bg-paper/70"} style={{ height: `${h}%` }} />
          </div>
        );
      })}
    </div>
  );
}

/** Ring gauge with the value + label centred (R9_06 tile H). `segments` mode: 8 cells, one active (§6.7). */
export function Ring({
  value,
  max = 100,
  label,
  segments,
  active,
  onSegment,
  className = "",
}: {
  value: number | null;
  max?: number;
  label: string;
  segments?: { key: string; ok: boolean; title: string }[];
  active?: number;
  onSegment?: (i: number) => void;
  className?: string;
}) {
  const R = 44;
  const C = 2 * Math.PI * R;
  const pct = value === null ? 0 : Math.max(0, Math.min(1, value / max));
  return (
    <div className={`relative flex items-center justify-center h-full ${className}`}>
      <svg viewBox="0 0 100 100" className="w-full h-full max-h-[220px]" aria-hidden>
        <circle cx="50" cy="50" r={R} fill="none" stroke="currentColor" strokeWidth="2.5" opacity="0.14" />
        {segments ? (
          segments.map((s, i) => {
            const a0 = (i / segments.length) * 2 * Math.PI - Math.PI / 2;
            const a1 = ((i + 1) / segments.length) * 2 * Math.PI - Math.PI / 2 - 0.06;
            const p = (a: number) => [50 + R * Math.cos(a), 50 + R * Math.sin(a)];
            const [x0, y0] = p(a0);
            const [x1, y1] = p(a1);
            return (
              <path
                key={s.key}
                d={`M${x0} ${y0} A${R} ${R} 0 0 1 ${x1} ${y1}`}
                fill="none"
                strokeWidth={active === i ? 5 : 3}
                className={`${s.ok ? "stroke-teal" : "stroke-(--color-red-hi)"} ${onSegment ? "cursor-pointer" : ""}`}
                style={{ pointerEvents: "stroke", opacity: active === undefined || active === i ? 1 : 0.55 }}
                onClick={onSegment ? () => onSegment(i) : undefined}
              >
                <title>{s.title}</title>
              </path>
            );
          })
        ) : (
          <circle
            cx="50"
            cy="50"
            r={R}
            fill="none"
            className="stroke-teal ring-fill"
            strokeWidth="3"
            strokeDasharray={`${C * pct} ${C}`}
            strokeLinecap="butt"
            transform="rotate(-90 50 50)"
          />
        )}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
        <span className="t-kpi text-[clamp(28px,2.8vw,44px)]">{value === null ? "—" : value}</span>
        <span className="t-label raise opacity-70 mt-1.5">{label}</span>
      </div>
    </div>
  );
}

/** Thin progress bar (R9_06 tile G). */
export function Bar({ value, max = 100, label = "progress", className = "" }: { value: number; max?: number; label?: string; className?: string }) {
  const pct = Math.max(0, Math.min(100, (value / Math.max(1, max)) * 100));
  return (
    <div
      className={`h-1.5 w-full bg-ink/10 ${className}`}
      role="progressbar"
      aria-label={label}
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div className="h-full os-accent-bar" style={{ width: `${pct}%` }} />
    </div>
  );
}

/** Range selector 7D 30D 3M 12M (tile D). */
export function Range({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex gap-1 t-micro raise">
      {["7D", "30D", "3M", "12M"].map((r) => (
        <button
          key={r}
          onClick={() => onChange(r)}
          className={`px-1.5 py-0.5 cursor-pointer ${value === r ? "bg-ink/15 opacity-100" : "opacity-50 hover:opacity-90"}`}
          aria-pressed={value === r}
        >
          {r}
        </button>
      ))}
    </div>
  );
}
