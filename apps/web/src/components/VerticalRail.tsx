/** jj_09: rotated mono rail in the gutter — slug + binary + date. ≥1280 only. */
export function VerticalRail({ text, side = "left" }: { text: string; side?: "left" | "right" }) {
  return (
    <div
      aria-hidden
      className={`hidden min-[1280px]:flex absolute top-0 bottom-0 ${side === "left" ? "left-3" : "right-3"} items-center pointer-events-none`}
    >
      <span
        className="mono-label opacity-30 whitespace-nowrap"
        style={{ writingMode: "vertical-rl", fontSize: 10, letterSpacing: "0.12em" }}
      >
        {text}
      </span>
    </div>
  );
}
