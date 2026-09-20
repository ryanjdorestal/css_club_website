import { MonoLabel } from "./MonoLabel";

/** Stat tile (jj_11 "240 / 3,549", jj_03 stat chips). Real numbers or nothing —
    render conditionally at the call site; this never invents a value. */
export function StatTile({ value, label, hint }: { value: string; label: string; hint?: string }) {
  return (
    <div className="flex flex-col gap-1 px-5 py-4 border-l-2 border-(--accent)">
      <span className="pixel text-(--accent-fg) text-[clamp(28px,4vw,44px)] leading-none">
        {value}
      </span>
      <MonoLabel>{label}</MonoLabel>
      {hint && <span className="text-xs text-muted">{hint}</span>}
    </div>
  );
}
