/** The one OS form helper (run 10 §6): a field list in, a JSON object out. Every field prints
    its rule before it is broken (`slug — lowercase, digits, dashes`), validation runs client-side
    (required · max · url · slug · date) and again server-side (the envelope's `field` lands beside
    the input, the summary chip at the top lists every bad field as a jump link). Submit disables
    the button (`SAVING…`) — no optimistic UI; ⌘/Ctrl+Enter submits; a dirty form warns before the
    tab closes and keeps a draft in sessionStorage (`draftKey`) so a refresh restores it. `markdown`
    fields get a toolbar + live preview by the same md.ts the public site uses. */
import { useEffect, useRef, useState, type ReactNode } from "react";
import { parseMd } from "@/lib/md";
import { Button } from "@/components/Button";
import type { ApiError } from "./useOs";

export type Field = {
  name: string;
  label: string;
  type?: "text" | "textarea" | "select" | "tags" | "toggle" | "number" | "markdown" | "date" | "url" | "time";
  options?: readonly string[];
  required?: boolean;
  help?: string;
  placeholder?: string;
  rows?: number;
  max?: number;
  pattern?: "slug" | "email";
};
type Values = Record<string, unknown>;

const input =
  "w-full bg-transparent border-0 border-b border-line px-1 py-2 font-mono text-[13px] text-ink placeholder:text-muted/40 focus:border-teal outline-none";

function ruleOf(f: Field): string {
  const parts: string[] = [];
  if (f.required) parts.push("required");
  if (f.max) parts.push(`≤ ${f.max} chars`);
  if (f.type === "url") parts.push("https://…");
  if (f.type === "date") parts.push("YYYY-MM-DD");
  if (f.type === "time") parts.push("HH:MM · America/New_York");
  if (f.pattern === "slug") parts.push("lowercase, digits, dashes; unique");
  if (f.pattern === "email") parts.push("an email address");
  if (f.type === "tags") parts.push("comma-separated");
  return parts.join(" · ");
}

function validate(fields: Field[], v: Values): Record<string, string> {
  const errs: Record<string, string> = {};
  for (const f of fields) {
    const raw = v[f.name];
    const s = raw === null || raw === undefined ? "" : Array.isArray(raw) ? raw.join(",") : String(raw);
    if (f.required && !s.trim()) errs[f.name] = "required";
    else if (f.max && s.length > f.max) errs[f.name] = `${s.length} chars — the cap is ${f.max}`;
    else if (s && f.type === "url" && !/^https?:\/\/\S+$/.test(s)) errs[f.name] = "must start with http:// or https://";
    else if (s && f.type === "date" && !/^\d{4}-\d{2}-\d{2}$/.test(s)) errs[f.name] = "use YYYY-MM-DD";
    else if (s && f.type === "time" && !/^\d{2}:\d{2}$/.test(s)) errs[f.name] = "use HH:MM";
    else if (s && f.pattern === "slug" && !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(s)) errs[f.name] = "lowercase letters, digits and dashes only";
    else if (s && f.pattern === "email" && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(s)) errs[f.name] = "not an email address";
  }
  return errs;
}

export function OsForm({
  fields,
  initial = {},
  onSubmit,
  submitLabel = ">_save",
  busy = false,
  extra,
  serverError,
  draftKey,
}: {
  fields: Field[];
  initial?: Values;
  onSubmit: (values: Values) => void | Promise<void>;
  submitLabel?: string;
  busy?: boolean;
  extra?: ReactNode;
  serverError?: ApiError | null;
  draftKey?: string;
}) {
  const [v, setV] = useState<Values>(() => {
    if (draftKey) {
      try {
        const d = sessionStorage.getItem(`os-draft:${draftKey}`);
        if (d) return { ...initial, ...(JSON.parse(d) as Values), __restored: true };
      } catch {
        /* no storage */
      }
    }
    return { ...initial };
  });
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState(false);
  const dirty = useRef(false);
  const set = (k: string, val: unknown) => {
    dirty.current = true;
    setV((s) => {
      const next = { ...s, [k]: val };
      if (draftKey) {
        try {
          sessionStorage.setItem(`os-draft:${draftKey}`, JSON.stringify(next));
        } catch {
          /* ignore */
        }
      }
      return next;
    });
  };
  useEffect(() => {
    const guard = (e: BeforeUnloadEvent) => {
      if (dirty.current && !busy) e.preventDefault();
    };
    window.addEventListener("beforeunload", guard);
    return () => window.removeEventListener("beforeunload", guard);
  }, [busy]);
  const submit = async () => {
    const e = validate(fields, v);
    setErrs(e);
    setTouched(true);
    if (Object.keys(e).length) {
      document.getElementById(`f-${Object.keys(e)[0]}`)?.focus();
      return;
    }
    dirty.current = false;
    if (draftKey) sessionStorage.removeItem(`os-draft:${draftKey}`);
    const { __restored: _r, ...clean } = v;
    void _r;
    await onSubmit(clean);
  };
  const allErrs = { ...errs, ...(serverError?.field ? { [serverError.field]: serverError.message } : {}) };
  const bad = Object.keys(allErrs);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void submit();
      }}
      onKeyDown={(e) => {
        if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
          e.preventDefault();
          void submit();
        }
      }}
      className="border border-line"
      data-testid="os-form"
      noValidate
    >
      {v.__restored === true && (
        <p className="t-micro text-teal px-4 py-2 border-b border-line">DRAFT_RESTORED — your unsaved edit came back after the reload.</p>
      )}
      {touched && bad.length > 0 && (
        <p className="px-4 py-2 border-b border-(--color-red-hi)/60 t-micro text-(--color-red-hi) flex flex-wrap gap-2" data-testid="form-errors">
          <span>
            {bad.length} FIELD{bad.length > 1 ? "S" : ""} NEED ATTENTION →
          </span>
          {bad.map((k) => (
            <a
              key={k}
              href={`#f-${k}`}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(`f-${k}`)?.focus();
              }}
              className="underline"
            >
              {k}
            </a>
          ))}
        </p>
      )}
      {serverError && !serverError.field && (
        <p className="px-4 py-2 border-b border-(--color-red-hi)/60 t-micro text-(--color-red-hi)" data-testid="form-server-error">
          {serverError.message}
        </p>
      )}
      {fields.map((f) => {
        const rule = ruleOf(f);
        const err = allErrs[f.name];
        return (
          <div
            key={f.name}
            className={`grid md:grid-cols-[170px_1fr] gap-1 md:gap-5 items-start px-4 py-3 border-b border-line ${err ? "bg-(--color-red)/5" : ""}`}
          >
            <label htmlFor={`f-${f.name}`} className="mono-label text-muted pt-2">
              {f.label}
              {f.required && " *"}
            </label>
            <div>
              {rule && !err && (
                <p className="t-micro opacity-45 mb-1">
                  {f.name} — {rule}
                </p>
              )}
              <FieldInput f={f} value={v[f.name]} set={(val) => set(f.name, val)} invalid={!!err} />
              {err && (
                <p className="t-micro text-(--color-red-hi) mt-1.5" data-testid={`err-${f.name}`}>
                  ✗ {err}
                </p>
              )}
              {f.help && !err && <p className="t-micro opacity-50 mt-1.5">{f.help}</p>}
              {f.max && typeof v[f.name] === "string" && (v[f.name] as string).length > f.max * 0.8 && (
                <p className={`t-micro mt-1 tnum ${(v[f.name] as string).length > f.max ? "text-(--color-red-hi)" : "opacity-50"}`}>
                  {(v[f.name] as string).length} / {f.max}
                </p>
              )}
            </div>
          </div>
        );
      })}
      <div className="px-4 py-3 flex items-center gap-3 flex-wrap">
        <Button type="submit" variant="ghost" disabled={busy}>
          {busy ? "SAVING…" : submitLabel}
        </Button>
        <span className="t-micro opacity-40">⌘↵ saves · esc closes</span>
        {extra}
      </div>
    </form>
  );
}

function FieldInput({ f, value, set, invalid }: { f: Field; value: unknown; set: (v: unknown) => void; invalid: boolean }) {
  const t = f.type ?? "text";
  const cls = `${input} ${invalid ? "border-(--color-red-hi)" : ""}`;
  const common = { id: `f-${f.name}`, "aria-invalid": invalid || undefined, "aria-describedby": invalid ? `err-${f.name}` : undefined };
  if (t === "textarea")
    return (
      <textarea {...common} className={cls} rows={f.rows ?? 4} placeholder={f.placeholder} value={String(value ?? "")} onChange={(e) => set(e.target.value)} />
    );
  if (t === "select")
    return (
      <select {...common} className={`${cls} bg-navy-900`} value={String(value ?? "")} onChange={(e) => set(e.target.value)}>
        <option value="">—</option>
        {f.options?.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    );
  if (t === "toggle")
    return (
      <button
        {...common}
        type="button"
        role="switch"
        aria-checked={!!value}
        onClick={() => set(!value)}
        className={`t-micro raise border px-3 py-1.5 cursor-pointer ${value ? "border-teal text-teal bg-teal/10" : "border-line text-muted"}`}
      >
        {value ? "ON" : "OFF"}
      </button>
    );
  if (t === "tags")
    return (
      <input
        {...common}
        className={cls}
        placeholder={f.placeholder ?? "comma, separated"}
        value={Array.isArray(value) ? value.join(", ") : String(value ?? "")}
        onChange={(e) =>
          set(
            e.target.value
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean),
          )
        }
      />
    );
  if (t === "markdown") return <Markdown id={`f-${f.name}`} value={String(value ?? "")} set={set} rows={f.rows ?? 14} />;
  return (
    <input
      {...common}
      className={cls}
      type={t === "number" ? "number" : t === "date" ? "date" : t === "time" ? "time" : "text"}
      inputMode={t === "url" ? "url" : undefined}
      placeholder={f.placeholder}
      value={String(value ?? "")}
      onChange={(e) => set(t === "number" ? Number(e.target.value) : e.target.value)}
    />
  );
}

const TOOLS: [string, (s: string) => string][] = [
  ["B", (s) => `**${s || "bold"}**`],
  ["I", (s) => `_${s || "italic"}_`],
  ["LINK", (s) => `[${s || "text"}](https://)`],
  ["H2", (s) => `\n## ${s || "Heading"}\n`],
  ["LIST", (s) => `\n- ${s || "item"}\n`],
  ["CODE", (s) => `\`${s || "code"}\``],
];

function Markdown({ id, value, set, rows }: { id: string; value: string; set: (v: string) => void; rows: number }) {
  const doc = parseMd(value);
  const ref = useRef<HTMLTextAreaElement>(null);
  const words = value.trim() ? value.trim().split(/\s+/).length : 0;
  const wrap = (fn: (s: string) => string) => {
    const el = ref.current;
    if (!el) return;
    const [a, b] = [el.selectionStart, el.selectionEnd];
    const sel = value.slice(a, b);
    const ins = fn(sel);
    set(value.slice(0, a) + ins + value.slice(b));
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(a, a + ins.length);
    });
  };
  return (
    <div className="grid lg:grid-cols-2 gap-4">
      <div>
        <div className="flex gap-1 mb-1 flex-wrap">
          {TOOLS.map(([l, fn]) => (
            <button
              key={l}
              type="button"
              onClick={() => wrap(fn)}
              className="t-micro raise border border-line px-2 py-1 text-muted hover:text-ink cursor-pointer"
            >
              {l}
            </button>
          ))}
          <span className="t-micro opacity-40 ml-auto tnum self-center">
            {words} WORDS · {Math.max(1, Math.round(words / 200))} MIN READ
          </span>
        </div>
        <textarea
          id={id}
          ref={ref}
          className={`${input} border border-line px-3 leading-relaxed`}
          rows={rows}
          value={value}
          onChange={(e) => set(e.target.value)}
          placeholder="## Heading\n\nParagraphs separated by a blank line."
        />
      </div>
      <div className="border border-line bg-paper text-ink-on-paper px-5 py-4 overflow-y-auto" style={{ maxHeight: rows * 24 + 30 }}>
        <p className="t-micro opacity-50 mb-3">PREVIEW · as /news renders it</p>
        {doc.blocks.length === 0 && <p className="text-sm opacity-50">Nothing yet.</p>}
        {doc.blocks.map((b, i) =>
          b.type === "h2" ? (
            <h2 key={i} className="font-display font-bold text-lg mt-5 mb-2">
              {b.text}
            </h2>
          ) : (
            <p key={i} className="text-[15px] leading-[1.65] mb-3 text-muted-on-paper">
              {b.text}
            </p>
          ),
        )}
      </div>
    </div>
  );
}
