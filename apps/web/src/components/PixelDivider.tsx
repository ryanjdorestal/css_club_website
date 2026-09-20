/** Pixel-block divider between major sections (Lithosquare via jj_inspo). */
const PATTERN = [1, 0, 1, 1, 0, 0, 1, 0, 1, 1, 1, 0, 1, 0, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1];

export function PixelDivider({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden className={`flex gap-1 justify-center py-2 ${className}`}>
      {PATTERN.map((on, i) => (
        <span
          key={i}
          className={`w-1.5 h-1.5 ${on ? "bg-(--accent)" : "bg-line"}`}
          style={{ opacity: on ? 0.85 : 0.5 }}
        />
      ))}
    </div>
  );
}
