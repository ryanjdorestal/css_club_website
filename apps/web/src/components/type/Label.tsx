import type { ReactNode } from "react";

type LabelPrefix = "/" | "//" | "_" | ">" | "●" | "○" | "↗" | "→" | "↳" | "[" | "X_" | "Y_" | "+";

/** §2d label grammar: prefix + text [+ value], mono, tracked caps, tabular.
    Separators inside are · and / only. */
export function Label({
  pfx,
  children,
  value,
  micro = false,
  className = "",
  n,
}: {
  pfx?: LabelPrefix | string;
  children: ReactNode;
  value?: ReactNode;
  micro?: boolean;
  className?: string;
  n?: number | string;   // for [n] style
}) {
  const prefix = n !== undefined ? `[${n}]` : pfx;
  return (
    <span className={`${micro ? "t-micro" : "t-label"} inline-flex items-baseline gap-[0.6em] ${className}`}>
      {prefix && <span className="pfx">{prefix}</span>}
      <span>{children}</span>
      {value !== undefined && <span className="raise font-semibold">{value}</span>}
    </span>
  );
}
