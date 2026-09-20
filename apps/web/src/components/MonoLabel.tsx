import type { ReactNode } from "react";

/** JetBrains Mono, uppercase, 11px, 0.08em — the spec-sheet label (jj_10, jj_11). */
export function MonoLabel({
  children,
  accent = false,
  className = "",
}: {
  children: ReactNode;
  accent?: boolean;
  className?: string;
}) {
  return (
    <span
      className={`mono-label ${accent ? "text-(--accent-fg)" : "text-muted"} ${className}`}
    >
      {children}
    </span>
  );
}
