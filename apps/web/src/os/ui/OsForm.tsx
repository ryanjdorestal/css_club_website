/** The one OS form helper (run 10 §6): a field list in, a JSON object out. Every field prints
    its rule before it is broken (`slug — lowercase, digits, dashes`), validation runs client-side
    (required · max · url · slug · date) and again server-side (the envelope's `field` lands beside
    the input, the summary chip at the top lists every bad field as a jump link). Submit disables
    the button (`SAVING…`) — no optimistic UI; ⌘/Ctrl+Enter submits; a dirty form warns before the
    tab closes and keeps a draft in sessionStorage (`draftKey`) so a refresh restores it. `markdown`
    fields get a toolbar + live preview by the same md.ts the public site uses. */
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Button } from "@/components/Button";
import { newClientId, type ApiError } from "./useOs";
import { ruleOf, validate, type Field, type Values } from "./formRules";
import { FieldInput } from "./FieldInput";

export type { Field } from "./formRules";

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
  onSubmit: (values: Values) => void | boolean | Promise<void | boolean>;
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
  const cid = useRef(newClientId()); // one idempotency key per form session: a double-click cannot make two rows
  const inFlight = useRef(false);
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
    if (inFlight.current) return;
    inFlight.current = true;
    const { __restored: _r, ...clean } = v;
    void _r;
    try {
      const ok = await onSubmit({ ...clean, client_id: cid.current });
      if (ok !== false) {
        // the draft survives a failed or interrupted save (401 → login → back → DRAFT_RESTORED)
        dirty.current = false;
        if (draftKey) sessionStorage.removeItem(`os-draft:${draftKey}`);
      }
    } finally {
      inFlight.current = false;
    }
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
