/** Closing fin: END_OF_TRANSMISSION in Unbounded tracked caps + VT323 whisper. */
export function FinLine({ n = "01", binary = "01001010 01001010" }: { n?: string; binary?: string }) {
  return (
    <section data-tone="dark-3" className="py-14 text-center border-t border-line">
      <div className="flex items-center gap-6 max-w-[1280px] mx-auto px-10">
        <span aria-hidden className="h-px grow bg-line" />
        <span className="t-wide text-[12px] tracking-[0.3em] text-muted whitespace-nowrap">END_OF_TRANSMISSION · {n}</span>
        <span aria-hidden className="h-px grow bg-line" />
      </div>
      <p aria-hidden className="pixel-legacy text-teal/30 text-2xl mt-5 select-none">{binary}</p>
    </section>
  );
}
