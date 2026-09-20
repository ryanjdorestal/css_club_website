/** §5a corner treatments: chamfer, brackets, registration, perforation, tab. */
import type { CSSProperties, ReactNode } from "react";

/** One 45° cut + optional accent stub bar inside the notch (T05). Apply the
    returned style to the card; render <ChamferStub/> inside it. */
export function chamferStyle(px = 16): CSSProperties {
  return { clipPath: `polygon(0 0, 100% 0, 100% calc(100% - ${px}px), calc(100% - ${px}px) 100%, 0 100%)` };
}
export function ChamferStub({ px = 16 }: { px?: number }) {
  return (
    <span
      aria-hidden
      className="absolute pointer-events-none"
      style={{
        right: -2,
        bottom: px * 0.62,
        width: px * 1.45,
        height: 2,
        background: "var(--accent)",
        transform: "rotate(-45deg)",
        transformOrigin: "right bottom",
      }}
    />
  );
}

/** Four L-marks; on hover of the parent (.group) they close in 4px. */
export function Brackets({ size = 12, inset = 0, accent = true, className = "" }: { size?: number; inset?: number; accent?: boolean; className?: string }) {
  const c = accent ? "border-(--accent)" : "border-current";
  const s = { width: size, height: size } as CSSProperties;
  return (
    <span aria-hidden className={`absolute pointer-events-none ${className}`} style={{ inset }}>
      <span className={`absolute top-0 left-0 border-t border-l ${c} transition-all duration-200 group-hover:translate-x-1 group-hover:translate-y-1`} style={s} />
      <span className={`absolute top-0 right-0 border-t border-r ${c} transition-all duration-200 group-hover:-translate-x-1 group-hover:translate-y-1`} style={s} />
      <span className={`absolute bottom-0 left-0 border-b border-l ${c} transition-all duration-200 group-hover:translate-x-1 group-hover:-translate-y-1`} style={s} />
      <span className={`absolute bottom-0 right-0 border-b border-r ${c} transition-all duration-200 group-hover:-translate-x-1 group-hover:-translate-y-1`} style={s} />
    </span>
  );
}

/** + marks at the four corners of a section (paper bands), 40%. */
export function Registration({ className = "", inset = 14 }: { className?: string; inset?: number }) {
  const P = ({ x, y }: { x: string; y: string }) => (
    <svg aria-hidden viewBox="0 0 12 12" width="12" height="12" className="absolute opacity-40" style={{ [x.split(":")[0]]: inset, [y.split(":")[0]]: inset } as CSSProperties}>
      <path d="M6 1 V11 M1 6 H11" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
  return (
    <span aria-hidden className={`absolute inset-0 pointer-events-none ${className}`}>
      <P x="left:0" y="top:0" /><P x="right:0" y="top:0" /><P x="left:0" y="bottom:0" /><P x="right:0" y="bottom:0" />
    </span>
  );
}

/** Dashed top edge + tick ruler (ticket stubs). */
export function Perforation({ className = "" }: { className?: string }) {
  return (
    <span aria-hidden className={`block ${className}`}>
      <span className="block border-t border-dashed border-current opacity-40" />
      <span className="flex justify-between px-1 h-[5px] items-start">
        {Array.from({ length: 24 }).map((_, i) => (
          <span key={i} className="w-px bg-current" style={{ height: i % 4 === 0 ? 5 : 3, opacity: 0.35 }} />
        ))}
      </span>
    </span>
  );
}

/** 6px side tab on the left edge with a rotated micro label (T11). */
export function Tab({ label, className = "" }: { label: string; className?: string }) {
  return (
    <span aria-hidden className={`absolute left-0 top-0 bottom-0 w-[18px] bg-(--accent) flex items-center justify-center overflow-hidden ${className}`}>
      <span className="t-micro raise text-(--accent-contrast) whitespace-nowrap" style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}>
        {label}
      </span>
    </span>
  );
}
