/** The one OS form helper: a field list in, a JSON object out. Mono labels,
    hairline inputs, zero radius (shadcn-free — the primitives are plain
    inputs restyled to the tokens). `markdown` fields get a live preview
    rendered by the same md.ts the public site uses. */
import { useState, type ReactNode } from "react";
import { parseMd } from "@/lib/md";
import { Button } from "@/components/Button";

export type Field = {
  name: string;
  label: string;
  type?: "text" | "textarea" | "select" | "tags" | "toggle" | "number" | "markdown" | "date" | "url";
  options?: readonly string[];
  required?: boolean;
  help?: string;
  placeholder?: string;
  rows?: number;
};
type Values = Record<string, unknown>;

const input =
  "w-full bg-transparent border-0 border-b border-line px-1 py-2 font-mono text-[13px] text-ink placeholder:text-muted/40 focus:border-teal outline-none";

export function OsForm({
  fields,
  initial = {},
  onSubmit,
  submitLabel = ">_save",
  busy = false,
  extra,
}: {
  fields: Field[];
  initial?: Values;
  onSubmit: (values: Values) => void | Promise<void>;
  submitLabel?: string;
  busy?: boolean;
  extra?: ReactNode;
}) {
  const [v, setV] = useState<Values>(() => ({ ...initial }));
  const set = (k: string, val: unknown) => setV((s) => ({ ...s, [k]: val }));
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void onSubmit(v);
      }}
      className="border border-line"
    >
      {fields.map((f) => (
        <label key={f.name} className="grid md:grid-cols-[170px_1fr] gap-1 md:gap-5 items-start px-4 py-3 border-b border-line">
          <span className="mono-label text-muted pt-2">
            {f.label}
            {f.required && " *"}
          </span>
          <div>
            <FieldInput f={f} value={v[f.name]} set={(val) => set(f.name, val)} />
            {f.help && <p className="t-micro opacity-50 mt-1.5">{f.help}</p>}
          </div>
        </label>
      ))}
      <div className="px-4 py-3 flex items-center gap-3 flex-wrap">
        <Button type="submit" variant="ghost" disabled={busy}>
          {busy ? "saving" : submitLabel}
        </Button>
        {extra}
      </div>
    </form>
  );
}

function FieldInput({ f, value, set }: { f: Field; value: unknown; set: (v: unknown) => void }) {
  const t = f.type ?? "text";
  if (t === "textarea") return <textarea className={input} rows={f.rows ?? 4} required={f.required} placeholder={f.placeholder} value={String(value ?? "")} onChange={(e) => set(e.target.value)} />;
  if (t === "select")
    return (
      <select className={`${input} bg-navy-900`} required={f.required} value={String(value ?? "")} onChange={(e) => set(e.target.value)}>
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
      <button type="button" onClick={() => set(!value)} className={`t-micro raise border px-3 py-1.5 cursor-pointer ${value ? "border-teal text-teal bg-teal/10" : "border-line text-muted"}`}>
        {value ? "ON" : "OFF"}
      </button>
    );
  if (t === "tags")
    return <input className={input} placeholder={f.placeholder ?? "comma, separated"} value={Array.isArray(value) ? value.join(", ") : String(value ?? "")} onChange={(e) => set(e.target.value.split(",").map((s) => s.trim()).filter(Boolean))} />;
  if (t === "markdown") return <Markdown value={String(value ?? "")} set={set} rows={f.rows ?? 14} />;
  return <input className={input} type={t === "number" ? "number" : t === "date" ? "date" : t === "url" ? "url" : "text"} required={f.required} placeholder={f.placeholder} value={String(value ?? "")} onChange={(e) => set(t === "number" ? Number(e.target.value) : e.target.value)} />;
}

function Markdown({ value, set, rows }: { value: string; set: (v: string) => void; rows: number }) {
  const doc = parseMd(value);
  return (
    <div className="grid lg:grid-cols-2 gap-4">
      <textarea className={`${input} border border-line px-3 leading-relaxed`} rows={rows} value={value} onChange={(e) => set(e.target.value)} placeholder="## Heading\n\nParagraphs separated by a blank line." />
      <div className="border border-line bg-paper text-ink-on-paper px-5 py-4 overflow-y-auto" style={{ maxHeight: rows * 24 }}>
        <p className="t-micro opacity-50 mb-3">PREVIEW · as /news renders it</p>
        {doc.blocks.length === 0 && <p className="text-sm opacity-50">Nothing yet.</p>}
        {doc.blocks.map((b, i) =>
          b.type === "h2" ? (
            <h2 key={i} className="font-display font-bold text-lg mt-5 mb-2">{b.text}</h2>
          ) : (
            <p key={i} className="text-[15px] leading-[1.65] mb-3 text-muted-on-paper">{b.text}</p>
          ),
        )}
      </div>
    </div>
  );
}
