/** ● LIVE / ○ IDLE / ● ARCHIVED — dot w/ halo, 1px border at 40%, zero radius. */
export function StatusChip({ state, label, className = "" }: { state: "live" | "idle" | "archived" | "offline"; label?: string; className?: string }) {
  const color = state === "live" ? "var(--color-teal)" : state === "archived" ? "var(--accent)" : "currentColor";
  const hollow = state === "idle" || state === "offline";
  return (
    <span
      className={`t-micro raise inline-flex items-center gap-1.5 border px-2 py-1 ${className}`}
      style={{ borderColor: `color-mix(in srgb, ${color} 40%, transparent)`, color }}
    >
      <span
        aria-hidden
        className={state === "live" ? "animate-pulse" : ""}
        style={{
          width: 6,
          height: 6,
          background: hollow ? "transparent" : color,
          border: hollow ? `1px solid ${color}` : "none",
          boxShadow: hollow ? "none" : `0 0 0 2px color-mix(in srgb, ${color} 25%, transparent)`,
        }}
      />
      {(label ?? state).toUpperCase()}
    </span>
  );
}
