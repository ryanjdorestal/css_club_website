/** Inheritance record pieces: RecordView (frontmatter as a SpecSheet, links
    as Bracket buttons, the body rendered like a /news article) and
    RecordEditor (frontmatter form + the Posts markdown editor; attach = add
    a link). The API validates on save and returns the rule names on 422. */
import { useState } from "react";
import { parseMd } from "@/lib/md";
import { KeyVal, Notice } from "./OsPage";
import { StatusWord } from "./OsTable";
import { Button } from "@/components/Button";
import { MonoLabel } from "@/components/MonoLabel";
import { OsForm, type Field } from "./OsForm";
import { osFetch } from "../session";

export type Rec = {
  id: string; path: string; type: string; title: string; term: string; date: string; status: string; owners: string[]; visibility: string;
  tags?: string[]; summary?: string; links?: { label: string; url: string }[]; supersedes?: string; succeeded_by?: string; related?: string[];
  role?: string; body_md?: string; excerpt?: string; updated_at?: number;
};

export function RecordView({ rec, onEdit }: { rec: Rec; onEdit: () => void }) {
  const doc = parseMd(rec.body_md ?? "");
  return (
    <div>
      <h2 className="font-display font-bold text-xl mb-4">{rec.title}</h2>
      <KeyVal
        rows={[
          { k: "TYPE", v: rec.type },
          { k: "TERM · DATE", v: `${rec.term} · ${rec.date}` },
          { k: "OWNERS", v: (rec.owners ?? []).join(", ") },
          { k: "STATUS", v: <span className="flex gap-2"><StatusWord s={rec.status} /><StatusWord s={rec.visibility} /></span> },
          { k: "TAGS", v: (rec.tags ?? []).join(" · ") },
          { k: "FILE", v: <span className="font-mono text-[12px]">{rec.path}</span> },
          ...(rec.supersedes ? [{ k: "SUPERSEDES", v: rec.supersedes }] : []),
          ...(rec.succeeded_by ? [{ k: "SUCCEEDED BY", v: rec.succeeded_by }] : []),
        ]}
      />
      {(rec.links ?? []).length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {rec.links!.map((l) => (
            <a key={l.url} href={l.url} target="_blank" rel="noreferrer noopener" className="t-micro raise border border-teal/60 text-teal px-3 py-1.5 hover:bg-teal/10">
              [ {l.label} ↗ ]
            </a>
          ))}
        </div>
      )}
      <article className="mt-6 border border-line bg-paper text-ink-on-paper px-6 py-5 max-w-[680px]">
        {rec.summary && <p className="text-[15px] italic mb-4 text-muted-on-paper">{rec.summary}</p>}
        {doc.blocks.length === 0 && <p className="text-sm opacity-50">(empty body)</p>}
        {doc.blocks.map((b, i) => (b.type === "h2" ? <h3 key={i} className="font-display font-bold text-lg mt-5 mb-2">{b.text}</h3> : <p key={i} className="text-[15px] leading-[1.65] mb-3 text-muted-on-paper whitespace-pre-wrap">{b.text}</p>))}
      </article>
      <div className="mt-5"><Button variant="ghost" onClick={onEdit}>edit record</Button></div>
      <p className="t-micro opacity-40 mt-6">Not here: secrets (pointer records only) · uploads (links) · per-member data (/os/members).</p>
    </div>
  );
}

const STATUSES = ["draft", "final", "superseded"] as const;
const FIELDS: Field[] = [
  { name: "title", label: "TITLE", required: true },
  { name: "date", label: "DATE", type: "date", required: true },
  { name: "owners", label: "OWNERS", type: "tags", required: true, help: "names or roles from the roster, comma separated — never emails" },
  { name: "status", label: "STATUS", type: "select", options: STATUSES, required: true },
  { name: "visibility", label: "VISIBILITY", type: "select", options: ["board", "public"], required: true, help: "public = front-page safe: no emails, no phones" },
  { name: "tags", label: "TAGS", type: "tags" },
  { name: "summary", label: "SUMMARY", placeholder: "one line" },
  { name: "links_text", label: "ATTACH A DOC", type: "textarea", rows: 2, placeholder: "Label | https://…  (one per line)", help: "Attach a doc: paste a Drive/GitHub/PDF link. Files stay where you keep them." },
  { name: "body_md", label: "RECORD (MARKDOWN)", type: "markdown", rows: 16 },
];

function stripFrontmatter(t: string): string {
  return t.replace(/^---[\s\S]*?---\n?/, "").trim();
}

export function RecordEditor({ initial, term, actorName, onSaved }: { initial: Rec | { type: string; template: string; role?: string }; term: string; actorName: string; onSaved: (row: Rec) => void }) {
  const isEdit = "id" in initial;
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const type = initial.type;
  const init: Record<string, unknown> = isEdit
    ? { ...initial, links_text: (initial.links ?? []).map((l) => `${l.label} | ${l.url}`).join("\n") }
    : { title: type === "handoff" && initial.role ? `Handoff — ${initial.role}` : "", date: new Date().toISOString().slice(0, 10), owners: type === "handoff" && initial.role ? [initial.role] : actorName ? [actorName] : ["the board"], status: "draft", visibility: "board", tags: [], links_text: "", body_md: stripFrontmatter(initial.template) };

  async function save(v: Record<string, unknown>) {
    setBusy(true);
    setErrors([]);
    const links = String(v.links_text ?? "").split("\n").map((ln) => ln.trim()).filter(Boolean).map((ln) => { const [label, url] = ln.split("|").map((s) => s.trim()); return { label: label ?? "", url: url ?? "" }; });
    const meta = { type, term: isEdit ? initial.term : term, title: v.title, date: v.date, owners: v.owners, status: v.status, visibility: v.visibility, tags: v.tags ?? [], summary: v.summary ?? "", links, ...(type === "handoff" && (isEdit ? initial.role : initial.role) ? { role: isEdit ? initial.role : initial.role } : {}) };
    const r = isEdit
      ? await osFetch<{ row: Rec; detail?: { errors?: string[] } }>(`/api/os/inheritance/${initial.id}`, { method: "PATCH", body: { meta, body_md: v.body_md ?? "" } })
      : await osFetch<{ row: Rec; detail?: { errors?: string[] } }>("/api/os/inheritance", { body: { meta, body_md: v.body_md ?? "" } });
    setBusy(false);
    if (r.ok) onSaved(r.data.row);
    else setErrors(r.data.detail?.errors ?? [r.error ?? "save failed"]);
  }

  return (
    <div>
      <MonoLabel accent>{isEdit ? `content/inheritance/${initial.id}.md` : `content/inheritance/${term}/… · type: ${type}`}</MonoLabel>
      {errors.length > 0 && (
        <Notice kind="err">
          <span className="block">The validator refused this record:</span>
          {errors.map((e) => <span key={e} className="block">— {e}</span>)}
        </Notice>
      )}
      <div className="mt-3">
        <OsForm fields={FIELDS} initial={init} busy={busy} onSubmit={save} submitLabel={isEdit ? ">_save" : ">_write_file"} />
      </div>
    </div>
  );
}
