/** The field contract every OS form shares (run 10 §6.3): the rule line printed under a field before it is
    broken, and the client-side mirror of the server's validation (required · max · url · date · time · slug ·
    email). One table drives both, so the rule text and the check can never disagree. Used by OsForm + FieldInput. */
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
export type Values = Record<string, unknown>;

type Check = { applies: (f: Field) => boolean; rule: string; test?: RegExp; error: string };

// each entry: when it applies, what the rule line says, the regex a non-empty value must match, the error when it does not
const CHECKS: Check[] = [
  { applies: (f) => f.type === "url", rule: "https://…", test: /^https?:\/\/\S+$/, error: "must start with http:// or https://" },
  { applies: (f) => f.type === "date", rule: "YYYY-MM-DD", test: /^\d{4}-\d{2}-\d{2}$/, error: "use YYYY-MM-DD" },
  { applies: (f) => f.type === "time", rule: "HH:MM · America/New_York", test: /^\d{2}:\d{2}$/, error: "use HH:MM" },
  {
    applies: (f) => f.pattern === "slug",
    rule: "lowercase, digits, dashes; unique",
    test: /^[a-z0-9]+(-[a-z0-9]+)*$/,
    error: "lowercase letters, digits and dashes only",
  },
  { applies: (f) => f.pattern === "email", rule: "an email address", test: /^[^@\s]+@[^@\s]+\.[^@\s]+$/, error: "not an email address" },
  { applies: (f) => f.type === "tags", rule: "comma-separated", error: "" },
];

export function ruleOf(f: Field): string {
  const parts = [f.required ? "required" : "", f.max ? `≤ ${f.max} chars` : "", ...CHECKS.filter((c) => c.applies(f)).map((c) => c.rule)];
  return parts.filter(Boolean).join(" · ");
}

const asText = (raw: unknown): string => (raw === null || raw === undefined ? "" : Array.isArray(raw) ? raw.join(",") : String(raw));

function errorFor(f: Field, s: string): string | undefined {
  if (f.required && !s.trim()) return "required";
  if (f.max && s.length > f.max) return `${s.length} chars — the cap is ${f.max}`;
  if (!s) return undefined;
  return CHECKS.find((c) => c.applies(f) && c.test && !c.test.test(s))?.error;
}

export function validate(fields: Field[], v: Values): Record<string, string> {
  const errs: Record<string, string> = {};
  for (const f of fields) {
    const error = errorFor(f, asText(v[f.name]));
    if (error) errs[f.name] = error;
  }
  return errs;
}
