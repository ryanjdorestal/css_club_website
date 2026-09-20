/** One word: first `at` letters solid, rest outline (T06 VIT|ALITY). */
export function SplitFill({ word, at = 3, className = "" }: { word: string; at?: number; className?: string }) {
  return (
    <span className={className} aria-label={word}>
      <span aria-hidden>{word.slice(0, at)}</span>
      <span aria-hidden className="t-outline">{word.slice(at)}</span>
    </span>
  );
}
