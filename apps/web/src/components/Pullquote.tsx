import type { ReactNode } from "react";
import { BracketSigil } from "@/sigils";

/** Display quote framed by Bracket sigils (run 3: no serif quote glyph). */
export function Pullquote({ children, cite }: { children: ReactNode; cite?: string }) {
  return (
    <figure className="relative py-6 pl-8 border-l-2 border-(--accent)">
      <BracketSigil size={120} className="absolute -top-6 -left-5 opacity-[0.08] pointer-events-none" />
      <blockquote className="t-h2 font-semibold tracking-tight">{children}</blockquote>
      {cite && <figcaption className="t-micro mt-3 opacity-55">{cite}</figcaption>}
    </figure>
  );
}
