/** OS toasts (run 10 §6.7): a bottom-left stack; a toast may hold `UNDO` for 8 s, which POSTs the
    inverse action (audited as undo) — publish/unpublish/archive/delete all get one. Also the typed
    confirm dialog (§6.1): `type DELETE to confirm`, focus trapped, Esc cancels, focus returns. */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

type Toast = { id: number; text: string; kind: "ok" | "err" | "info"; undo?: () => Promise<void> | void; until: number };
type Api = {
  toast: (text: string, opts?: { kind?: Toast["kind"]; undo?: Toast["undo"] }) => void;
  confirm: (opts: { title: string; body?: ReactNode; word?: string; danger?: boolean }) => Promise<boolean>;
};
const Ctx = createContext<Api>({ toast: () => {}, confirm: async () => false });
export const useToast = () => useContext(Ctx);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [ask, setAsk] = useState<{ title: string; body?: ReactNode; word?: string; danger?: boolean; resolve: (v: boolean) => void } | null>(null);
  const toast = useCallback<Api["toast"]>((text, opts) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, text, kind: opts?.kind ?? "ok", undo: opts?.undo, until: Date.now() + (opts?.undo ? 8000 : 4500) }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), opts?.undo ? 8000 : 4500);
  }, []);
  const confirm = useCallback<Api["confirm"]>((opts) => new Promise<boolean>((resolve) => setAsk({ ...opts, resolve })), []);
  const api = useMemo(() => ({ toast, confirm }), [toast, confirm]);
  return (
    <Ctx.Provider value={api}>
      {children}
      <div className="fixed left-4 bottom-10 z-[60] flex flex-col gap-2 max-w-[440px]" aria-live="polite">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`flex items-center gap-4 px-3.5 py-2.5 border bg-navy-900 t-micro raise ${t.kind === "err" ? "border-(--color-red-hi) text-(--color-red-hi)" : t.kind === "info" ? "border-line text-ink" : "border-teal/60 text-teal"}`}
            data-testid="toast"
          >
            <span className="normal-case tracking-normal font-body text-[13px] text-ink">{t.text}</span>
            {t.undo && (
              <button
                onClick={() => {
                  setToasts((x) => x.filter((y) => y.id !== t.id));
                  void t.undo?.();
                }}
                className="border border-teal px-2 py-1 text-teal cursor-pointer hover:bg-teal/10"
                data-testid="undo"
              >
                UNDO
              </button>
            )}
          </div>
        ))}
      </div>
      {ask && (
        <Confirm
          {...ask}
          onDone={(v) => {
            ask.resolve(v);
            setAsk(null);
          }}
        />
      )}
    </Ctx.Provider>
  );
}

function Confirm({ title, body, word, danger, onDone }: { title: string; body?: ReactNode; word?: string; danger?: boolean; onDone: (v: boolean) => void }) {
  const [typed, setTyped] = useState("");
  const box = useRef<HTMLDivElement>(null);
  const opener = useRef<Element | null>(null);
  useEffect(() => {
    opener.current = document.activeElement;
    box.current?.querySelector<HTMLElement>("input,button")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onDone(false);
      if (e.key === "Tab" && box.current) {
        const f = [...box.current.querySelectorAll<HTMLElement>("input,button")];
        if (!f.length) return;
        const first = f[0],
          last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      (opener.current as HTMLElement | null)?.focus?.();
    };
  }, [onDone]);
  const ok = !word || typed === word;
  return (
    <div className="fixed inset-0 z-[70] bg-navy-900/70 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div ref={box} className={`w-[min(100%,460px)] bg-navy-900 border ${danger ? "border-(--color-red-hi)" : "border-teal/60"} p-5`} data-testid="confirm">
        <p className="t-label raise text-ink">{title}</p>
        {body && <div className="text-[13px] text-muted mt-2 leading-relaxed">{body}</div>}
        {word && (
          <label className="block mt-4">
            <span className="t-micro opacity-60">type {word} to confirm</span>
            <input
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && ok && onDone(true)}
              className="mt-1 w-full bg-transparent border-b border-line px-1 py-1.5 font-mono text-[13px] text-ink focus:border-teal outline-none"
              aria-label={`type ${word} to confirm`}
              data-testid="confirm-word"
            />
          </label>
        )}
        <div className="flex gap-2 mt-5">
          <button
            disabled={!ok}
            onClick={() => onDone(true)}
            className={`t-micro raise px-3 py-2 border cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${danger ? "border-(--color-red-hi) text-(--color-red-hi)" : "border-teal text-teal"}`}
            data-testid="confirm-yes"
          >
            {danger ? "[ YES · DO IT ]" : "[ CONFIRM ]"}
          </button>
          <button onClick={() => onDone(false)} className="t-micro raise px-3 py-2 border border-line text-muted cursor-pointer hover:text-ink">
            CANCEL
          </button>
        </div>
      </div>
    </div>
  );
}
