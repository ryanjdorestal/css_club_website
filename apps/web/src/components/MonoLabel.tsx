import type { ReactNode } from "react";

/** Legacy shim — run-3 label style; prefer <Label> with a prefix glyph. */
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
    <span className={`t-label ${accent ? "raise text-(--accent-ink)" : ""} ${className}`}>
      {children}
    </span>
  );
}
