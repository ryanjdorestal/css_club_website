import { useEffect, useRef, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { X, Send } from "lucide-react";
import { Bloodhound, type Emote } from "./Bloodhound";
import { matchKb } from "./knowledgeBaseMatch";
import { brand } from "@brand/brand.config";

type Msg = {
  from: "you" | "hound";
  text: string;
  citations?: { label: string; href: string }[];
};

/** The Hound — chat help widget. Tries /api/chat (static Python KB, no LLM);
    when the API is unreachable it answers from the bundled KB with the
    sleeping emote and an "answering offline" pill. */
export function HoundChat() {
  const [open, setOpen] = useState(false);
  const [online, setOnline] = useState<boolean | null>(null);
  const [emote, setEmote] = useState<Emote>("idle");
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>(["What events are coming up?", "How do I join?", "What is Cyberhounds?"]);
  const { pathname } = useLocation();
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open || online !== null) return;
    fetch("/api/chat", { signal: AbortSignal.timeout(2500) })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(() => setOnline(true))
      .catch(() => {
        setOnline(false);
        setEmote("sleeping");
      });
  }, [open, online]);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [msgs]);

  async function ask(text: string) {
    if (!text.trim()) return;
    setMsgs((m) => [...m, { from: "you", text }]);
    setInput("");
    setEmote("thinking");
    let answer: { answer: string; suggestions: string[]; citations: { label: string; href: string }[]; emote: string };
    if (online) {
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: text, page: pathname }),
          signal: AbortSignal.timeout(4000),
        });
        if (!res.ok) throw new Error();
        answer = await res.json();
      } catch {
        setOnline(false);
        answer = matchKb(text, pathname);
      }
    } else {
      answer = matchKb(text, pathname);
    }
    setMsgs((m) => [...m, { from: "hound", text: answer.answer, citations: answer.citations }]);
    setSuggestions(answer.suggestions ?? []);
    setEmote((online === false ? "sleeping" : (answer.emote as Emote)) ?? "happy");
  }

  return (
    <div data-accent="teal" className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="w-[min(92vw,360px)] rounded-(--radius-lg) border border-line bg-navy-900 shadow-2xl overflow-hidden">
          <header className="flex items-center gap-3 px-4 py-3 border-b border-line bg-navy-800">
            <Bloodhound emote={emote} size={40} />
            <div className="grow">
              <p className="font-display font-bold text-sm uppercase" style={{ fontStretch: "112%" }}>
                {brand.mascot.name}
              </p>
              <p className="mono-label text-muted">
                {"//"} HOUND · STATIC {online === false && <span className="text-teal">· ANSWERING OFFLINE</span>}
              </p>
            </div>
            <span aria-label={online ? "online" : "offline"} className={`w-2 h-2 rounded-full ${online ? "bg-teal" : "bg-muted"}`} />
            <button onClick={() => setOpen(false)} aria-label="Close chat" className="text-muted hover:text-ink p-1 cursor-pointer">
              <X size={16} />
            </button>
          </header>
          <div ref={scroller} className="h-72 overflow-y-auto px-4 py-3 flex flex-col gap-3">
            {msgs.length === 0 && (
              <p className="text-xs text-muted leading-relaxed">
                Woof. Ask me about events, joining, apps, Cyberhounds, resources — I answer from the club's own notes, no AI cloud involved.
              </p>
            )}
            {msgs.map((m, i) => (
              <div key={i} className={`max-w-[85%] ${m.from === "you" ? "self-end" : "self-start"}`}>
                <div
                  className={`text-xs leading-relaxed px-3 py-2 rounded-(--radius-md) ${
                    m.from === "you" ? "bg-teal text-navy-900" : "bg-navy-500/50 text-ink border border-line"
                  }`}
                >
                  {m.text}
                </div>
                {m.citations && m.citations.length > 0 && (
                  <div className="flex gap-2 mt-1.5 flex-wrap">
                    {m.citations.map((c) => (
                      <Link key={c.href} to={c.href} onClick={() => setOpen(false)} className="mono-label text-teal hover:underline">
                        → {c.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          {suggestions.length > 0 && (
            <div className="px-4 pb-2 flex gap-2 flex-wrap">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => ask(s)}
                  className="mono-label text-muted border border-line rounded-full px-3 py-1 hover:text-teal hover:border-teal transition-colors cursor-pointer"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              ask(input);
            }}
            className="flex items-center gap-2 border-t border-line px-3 py-2.5"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask the Hound…"
              aria-label="Ask the Hound"
              className="grow bg-transparent text-xs text-ink placeholder:text-muted/60 outline-none"
            />
            <button type="submit" aria-label="Send" className="text-teal hover:brightness-110 p-1 cursor-pointer">
              <Send size={15} />
            </button>
          </form>
        </div>
      )}
      <button
        onClick={() => setOpen(!open)}
        aria-label={open ? "Close the Hound chat" : "Open the Hound chat"}
        className="group w-14 h-14 rounded-full bg-navy-800 border border-line hover:border-teal transition-colors flex items-center justify-center shadow-lg cursor-pointer"
      >
        <Bloodhound emote={open ? emote : "idle"} size={44} />
      </button>
    </div>
  );
}
