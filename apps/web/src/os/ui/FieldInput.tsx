/** One input per field type for OsForm (text · textarea · select · tags · toggle · number · date · url · time)
    and the markdown editor with its toolbar + live preview (the same md.ts the public site renders with).
    Used only by OsForm.tsx. */
import { useRef } from "react";
import { parseMd } from "@/lib/md";
import type { Field } from "./formRules";

const input =
  "w-full bg-transparent border-0 border-b border-line px-1 py-2 font-mono text-[13px] text-ink placeholder:text-muted/40 focus:border-teal outline-none";

type InputProps = { f: Field; value: unknown; set: (v: unknown) => void; invalid: boolean };
type Common = { id: string; "aria-invalid": true | undefined; "aria-describedby": string | undefined; className: string };

const NATIVE_TYPE: Record<string, string> = { number: "number", date: "date", time: "time" };

export function FieldInput(props: InputProps) {
  const { f, invalid } = props;
  const t = f.type ?? "text";
  const common: Common = {
    id: `f-${f.name}`,
    "aria-invalid": invalid || undefined,
    "aria-describedby": invalid ? `err-${f.name}` : undefined,
    className: `${input} ${invalid ? "border-(--color-red-hi)" : ""}`,
  };
  if (t === "textarea") return <TextArea {...props} common={common} />;
  if (t === "select") return <Select {...props} common={common} />;
  if (t === "toggle") return <Toggle {...props} common={common} />;
  if (t === "tags") return <Tags {...props} common={common} />;
  if (t === "markdown") return <Markdown id={common.id} value={String(props.value ?? "")} set={props.set} rows={f.rows ?? 14} />;
  return (
    <input
      {...common}
      type={NATIVE_TYPE[t] ?? "text"}
      inputMode={t === "url" ? "url" : undefined}
      placeholder={f.placeholder}
      value={String(props.value ?? "")}
      onChange={(e) => props.set(t === "number" ? Number(e.target.value) : e.target.value)}
    />
  );
}

function TextArea({ f, value, set, common }: InputProps & { common: Common }) {
  return <textarea {...common} rows={f.rows ?? 4} placeholder={f.placeholder} value={String(value ?? "")} onChange={(e) => set(e.target.value)} />;
}

function Select({ f, value, set, common }: InputProps & { common: Common }) {
  return (
    <select {...common} className={`${common.className} bg-navy-900`} value={String(value ?? "")} onChange={(e) => set(e.target.value)}>
      <option value="">—</option>
      {f.options?.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}

function Toggle({ value, set, common }: InputProps & { common: Common }) {
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
}

function Tags({ f, value, set, common }: InputProps & { common: Common }) {
  const toList = (text: string) =>
    text
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  return (
    <input
      {...common}
      placeholder={f.placeholder ?? "comma, separated"}
      value={Array.isArray(value) ? value.join(", ") : String(value ?? "")}
      onChange={(e) => set(toList(e.target.value))}
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
