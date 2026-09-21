import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";

/** Closing fin (run 5): END_OF_SECTION · nn types itself in like a terminal —
    22 ms/char, a 2–3 glyph hack buffer ahead of the caret, block cursor ▮ that
    blinks at 1 Hz once the line lands — then "> next: /route_" in mono micro,
    then the binary whisper decodes the same way (VT323, faster). Hairlines
    draw in from the centre as the typing starts. Reduced motion → instant.
    Total run ≤ 1.4 s; sets data-fin-done for the QA harness. */

const HACK = "01<>/[]_#$%&";
const EASE = [0.22, 1, 0.36, 1] as const;
const GAP_MS = 80;
/** QA harness only: ?finslow=6 stretches the typing 6× so motion frames can be captured. */
const SLOW = typeof window === "undefined" ? 1 : Math.max(1, Number(new URLSearchParams(window.location.search).get("finslow")) || 1);

type Line = { text: string; ms: number };

function typed(text: string, k: number, frame: number, i: number): string {
  if (k >= text.length) return text;
  const buf = 2 + ((frame + i) % 2);
  let s = text.slice(0, k);
  for (let j = 0; j < buf && s.length < text.length; j++) {
    const ch = text[s.length];
    s += ch === " " ? " " : HACK[(frame * 5 + j * 3 + s.length * 7) % HACK.length];
  }
  return s;
}

function useTyper(lines: Line[], active: boolean, reduced: boolean | null) {
  const full = lines.map((l) => l.text);
  const [out, setOut] = useState<string[]>(reduced ? full : full.map(() => ""));
  const [cursor, setCursor] = useState<number>(-1); // index of the line the caret sits on
  const [done, setDone] = useState(!!reduced);
  useEffect(() => {
    if (!active) return;
    if (reduced) {
      setOut(full);
      setCursor(lines.length - 2);
      setDone(true);
      return;
    }
    let raf = 0;
    let frame = 0;
    const starts: number[] = [];
    let t = 0;
    lines.forEach((l) => {
      starts.push(t);
      t += l.text.length * l.ms * SLOW + GAP_MS;
    });
    const total = t - GAP_MS;
    const t0 = performance.now();
    const step = (now: number) => {
      const el = now - t0;
      frame++;
      let caret = -1;
      const next = lines.map((l, i) => {
        const k = Math.max(0, Math.floor((el - starts[i]) / (l.ms * SLOW)));
        if (el >= starts[i] && k < l.text.length && caret === -1) caret = i;
        return el < starts[i] ? "" : typed(l.text, k, frame, i);
      });
      setOut(next);
      if (el >= total) {
        setOut(full);
        setCursor(lines.length - 2); // parks after the "> next:" line
        setDone(true);
        return;
      }
      setCursor(caret);
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, reduced, lines.map((l) => l.text).join("\n")]);
  return { out, cursor, done };
}

function Caret({ on, blink }: { on: boolean; blink: boolean }) {
  return (
    <span aria-hidden className={`fin-caret ${on ? "" : "invisible"} ${blink ? "fin-caret-blink" : ""}`}>
      ▮
    </span>
  );
}

/** Reserve the final width, overlay the typed text so hairlines never jitter. */
function Slot({ text, shown, caret, blink, align = "center" }: { text: string; shown: string; caret: boolean; blink: boolean; align?: "center" | "left" }) {
  return (
    <span className="relative inline-block whitespace-pre">
      <span className="invisible">{text}▮</span>
      <span className={`absolute inset-0 ${align === "center" ? "text-left" : "text-left"}`}>
        {shown}
        <Caret on={caret} blink={blink} />
      </span>
    </span>
  );
}

export function FinLine({ n = "01", next = "/", binary = "01001010 01001010" }: { n?: string; next?: string; binary?: string }) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-12% 0px" });
  const reduced = useReducedMotion();
  const lines: Line[] = [
    { text: `END_OF_SECTION · ${n}`, ms: 22 },
    { text: `> next: ${next}_`, ms: 22 },
    { text: binary, ms: 12 },
  ];
  const { out, cursor, done } = useTyper(lines, inView, reduced);
  const label = `End of section ${n}. Next: ${next}`;
  const draw = { duration: 0.6, ease: EASE };
  return (
    <section ref={ref} data-tone="dark-3" className="py-14 text-center border-t border-line" aria-label={label} data-fin-done={done || undefined}>
      <div className="flex items-center gap-6 max-w-[1280px] mx-auto px-10">
        <motion.span
          aria-hidden
          className="h-px grow bg-line"
          style={{ originX: 1 }}
          initial={reduced ? false : { scaleX: 0 }}
          animate={inView ? { scaleX: 1 } : { scaleX: 0 }}
          transition={draw}
        />
        <span aria-hidden className="t-wide text-[12px] tracking-[0.3em] text-muted whitespace-nowrap">
          <Slot text={lines[0].text} shown={out[0]} caret={cursor === 0} blink={false} />
        </span>
        <motion.span
          aria-hidden
          className="h-px grow bg-line"
          style={{ originX: 0 }}
          initial={reduced ? false : { scaleX: 0 }}
          animate={inView ? { scaleX: 1 } : { scaleX: 0 }}
          transition={draw}
        />
      </div>
      <p aria-hidden className="t-micro mt-3 text-teal/70 tnum">
        <Slot text={lines[1].text} shown={out[1]} caret={cursor === 1 || (done && cursor === 1)} blink={done} align="left" />
      </p>
      <p aria-hidden className="pixel-legacy text-teal/30 text-2xl mt-5 select-none">
        <Slot text={lines[2].text} shown={out[2]} caret={cursor === 2} blink={false} />
      </p>
    </section>
  );
}
