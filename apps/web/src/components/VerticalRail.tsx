/** jj_09: rotated mono rail in the gutter — slug + binary + date. ≥1280 only.
    opacity-60 is the floor, not a taste call: at 30% the 10px text measured 2.33:1 on navy-700
    (Lighthouse, run 11) and WCAG 2 AA wants 4.5:1 for text this size. 60% measures 4.89:1. */
export function VerticalRail({ text, side = "left" }: { text: string; side?: "left" | "right" }) {
  return (
    <div aria-hidden className={`hidden min-[1280px]:flex absolute top-0 bottom-0 ${side === "left" ? "left-3" : "right-3"} items-center pointer-events-none`}>
      <span className="mono-label opacity-60 whitespace-nowrap" style={{ writingMode: "vertical-rl", fontSize: 10, letterSpacing: "0.12em" }}>
        {text}
      </span>
    </div>
  );
}
