/** Filled accent rectangle, mono 10px; hatch variant for inactive/empty. */
export function Tag({ children, variant = "fill", className = "" }: { children: string; variant?: "fill" | "hatch"; className?: string }) {
  if (variant === "hatch") {
    return (
      <span
        className={`t-micro raise inline-block border border-current px-2 py-1 ${className}`}
        style={{ backgroundImage: "repeating-linear-gradient(-45deg, currentColor 0 1px, transparent 1px 6px)", backgroundSize: "auto", opacity: 0.75 }}
      >
        <span className="bg-[color:var(--tone-bg,transparent)] px-0.5">{children}</span>
      </span>
    );
  }
  return <span className={`t-micro raise inline-block bg-(--accent) text-(--accent-contrast) px-2 py-1 ${className}`}>{children}</span>;
}
