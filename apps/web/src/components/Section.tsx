import type { ReactNode } from "react";

/** Page-section wrapper. Sets the accent for everything inside (one accent
    per section — DESIGN.md) and the standard container width. */
export function Section({
  accent,
  children,
  className = "",
  wide = false,
}: {
  accent?: "red" | "green" | "blue" | "teal";
  children: ReactNode;
  className?: string;
  wide?: boolean;
}) {
  return (
    <section data-accent={accent} className={`py-14 md:py-20 ${className}`}>
      <div className={`${wide ? "max-w-7xl" : "max-w-6xl"} mx-auto px-5`}>{children}</div>
    </section>
  );
}
