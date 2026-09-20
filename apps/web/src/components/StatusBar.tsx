import { useEffect, useState } from "react";
import { nyTime, node, useApiState } from "@/lib/readouts";

/** T04 bottom status bar: fixed 28px mono-micro cells. Hidden < 768px.
    CONNECTION · > ACCESS GRANTED_ · SCN · NODE · SYS.TIME — all real. */
export function StatusBar() {
  const [time, setTime] = useState(nyTime());
  const [scnN, setScnN] = useState(1);
  const api = useApiState();

  useEffect(() => {
    const iv = setInterval(() => setTime(nyTime()), 1000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    // SCN follows the section under the viewport center
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const sections = document.querySelectorAll("main section");
        const mid = window.innerHeight / 2;
        let n = 1;
        sections.forEach((s, i) => {
          const r = s.getBoundingClientRect();
          if (r.top <= mid) n = i + 1;
        });
        setScnN(n);
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      data-tone="dark-3"
      className="hidden md:flex fixed bottom-0 left-0 right-0 h-[28px] z-40 bg-navy-900/90 border-t border-line items-stretch"
      style={{ backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }}
      aria-hidden
    >
      <Cell>
        <span className={api.live ? "text-teal" : "opacity-60"}>
          {api.live === null ? "○ CONNECTION --" : api.live ? "● CONNECTION SECURE" : "○ CONNECTION OFFLINE"}
        </span>
      </Cell>
      <Cell grow>
        <span className="text-(--accent-fg)">&gt; ACCESS GRANTED<span className="caret-blink">_</span></span>
      </Cell>
      <Cell><span className="tnum">SCN: {String(scnN).padStart(4, "0")}</span></Cell>
      <Cell>{node()}</Cell>
      <Cell><span className="tnum">SYS.TIME {time.hms} {time.utc}</span></Cell>
    </div>
  );
}

function Cell({ children, grow = false }: { children: React.ReactNode; grow?: boolean }) {
  return (
    <span className={`t-micro raise flex items-center px-4 border-r border-line last:border-r-0 ${grow ? "grow" : ""}`}>
      {children}
    </span>
  );
}
