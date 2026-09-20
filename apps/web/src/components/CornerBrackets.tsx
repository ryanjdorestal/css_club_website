/** Corner brackets, used sparingly (hero + featured cards). Parent needs `relative`. */
export function CornerBrackets({ inset = "0.5rem" }: { inset?: string }) {
  const base = "absolute w-4 h-4 border-(--accent) pointer-events-none";
  return (
    <div aria-hidden style={{ inset }} className="absolute pointer-events-none">
      <span className={`${base} top-0 left-0 border-t-2 border-l-2`} style={{ position: "absolute" }} />
      <span className={`${base} top-0 right-0 border-t-2 border-r-2`} style={{ position: "absolute" }} />
      <span className={`${base} bottom-0 left-0 border-b-2 border-l-2`} style={{ position: "absolute" }} />
      <span className={`${base} bottom-0 right-0 border-b-2 border-r-2`} style={{ position: "absolute" }} />
    </div>
  );
}
