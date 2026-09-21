/** /os/inheritance — the spine: what each board writes down for the next
    one, as markdown files under content/inheritance/<term>/… Browse by
    term and type, read a record, write a new one from a template (frontmatter
    form + the same markdown editor as Posts), attach docs as links, export
    the whole spine as a zip. The API validates every save. */
import { useEffect, useMemo, useState } from "react";
import { inheritanceSpec } from "./ui/specs";
import { OsPage, Chips, KeyVal, Notice, Panel, Empty } from "./ui/OsPage";
import { Readout } from "@/components/cards/StatChip";
import { MonoLabel } from "@/components/MonoLabel";
import { Button } from "@/components/Button";
import { StatusWord } from "./ui/OsTable";
import { RecordEditor, RecordView, type Rec } from "./ui/SpineRecord";
import type { Row } from "./ui/OsTable";
import { FolderCard } from "@/components/cards/FolderCard";
import { osFetch, osHeaders, useSession } from "./session";

type Index = {
  rows: Rec[];
  terms: string[];
  current: string | null;
  types: string[];
  stats: { records: number; handoffs_filed: number; officers: number; last_date: string };
};
const TYPE_LABEL: Record<string, string> = {
  roster: "ROSTER",
  handoff: "HANDOFFS",
  decision: "DECISIONS",
  project: "PROJECTS",
  event: "EVENTS",
  contact: "CONTACTS",
  lesson: "LESSONS",
  minutes: "MEETINGS",
};

const BLURB =
  "Student clubs lose everything every two to four semesters: logins, contacts, why a decision was made, what a project was for. Inheritance is where each board writes down what the next board needs — in plain files that outlive the platform. The platform just organizes them.";

export default function OsInheritance() {
  const { actor } = useSession();
  const [idx, setIdx] = useState<Index | null>(null);
  const [term, setTerm] = useState<string>("");
  const [open, setOpen] = useState<Rec | null>(null);
  const [editing, setEditing] = useState<{ type: string; template: string; role?: string } | Rec | null>(null);
  const [templates, setTemplates] = useState<{ templates: Record<string, string>; howto: string } | null>(null);
  const [howto, setHowto] = useState(false);
  const [notice, setNotice] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const load = async (t?: string) => {
    const r = await osFetch<Index & { ok: boolean }>(`/api/os/inheritance${t ? `?term=${t}` : ""}`);
    if (r.ok) {
      setIdx(r.data);
      if (!t && r.data.current) setTerm(r.data.current);
    }
  };
  useEffect(() => {
    void load();
    void osFetch<{ templates: Record<string, string>; howto: string }>("/api/os/inheritance/templates").then((r) => r.ok && setTemplates(r.data));
  }, []);
  useEffect(() => {
    if (term) void load(term);
  }, [term]);

  const rowsByType = useMemo(() => {
    const m = new Map<string, Rec[]>();
    for (const r of idx?.rows ?? []) m.set(r.type, [...(m.get(r.type) ?? []), r]);
    return [...m.entries()].sort((a, b) => Object.keys(TYPE_LABEL).indexOf(a[0]) - Object.keys(TYPE_LABEL).indexOf(b[0]));
  }, [idx]);

  async function exportZip() {
    const res = await fetch("/api/os/inheritance/export.zip", { headers: osHeaders() });
    if (!res.ok) return setNotice({ kind: "err", text: "Export failed." });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(await res.blob());
    a.download = `inheritance-${new Date().toISOString().slice(0, 10)}.zip`;
    a.click();
  }

  const terms = idx?.terms ?? [];
  const chipTerms = [...new Set([...(idx?.current ? [idx.current] : []), ...terms])];

  return (
    <OsPage
      dash={inheritanceSpec((idx?.rows ?? []) as unknown as Row[], !!idx, term || idx?.current || undefined, idx?.stats.officers ?? 0)}
      kicker="INHERITANCE · THE SPINE · content/inheritance/"
      title="Inheritance"
      source="files"
      actions={
        <>
          <Button variant="ghost" onClick={exportZip}>
            EXPORT_SPINE.zip
          </Button>
          <Button variant="ghost" onClick={() => setHowto(true)}>
            HOW_TO_WRITE_ONE
          </Button>
          <Button variant="primary" onClick={() => setEditing({ type: "decision", template: templates?.templates.decision ?? "" })}>
            + new record
          </Button>
        </>
      }
      notHere={[
        'No secrets — pointer records only ("the Drive folder is at…"), never a credential; the validator refuses secret-shaped strings.',
        "No uploads — attach a doc by pasting a link (Drive, the club Gmail, GitHub, a PDF URL). Files stay where you keep them.",
        "No per-member data — that is /os/members; contact records hold a name, a role and a public email at most.",
        "Platform health and account ownership are on /os/system.",
      ]}
    >
      <p className="text-[15px] leading-relaxed text-muted max-w-[68ch] mt-1">{BLURB}</p>
      {notice && <Notice kind={notice.kind}>{notice.text}</Notice>}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-line border border-line mt-6 max-w-[900px]">
        <div className="bg-navy-900">
          <Readout value={idx?.stats.records ?? 0} label={`RECORDS · ${term || "—"}`} />
        </div>
        <div className="bg-navy-900">
          <Readout
            value={idx?.stats.handoffs_filed ?? 0}
            label={`HANDOFFS FILED / ${idx?.stats.officers ?? 0} OFFICERS`}
            meter={idx?.stats.officers ? (idx.stats.handoffs_filed ?? 0) / idx.stats.officers : 0}
          />
        </div>
        <div className="bg-navy-900 px-5 py-4">
          <span className="font-display font-black text-[22px] leading-none text-teal">{idx?.stats.last_date || "—"}</span>
          <p className="mono-label opacity-60 mt-1.5">LAST RECORD</p>
        </div>
        <div className="bg-navy-900 px-5 py-4">
          <span className="font-display font-black text-[22px] leading-none text-teal">{terms.length}</span>
          <p className="mono-label opacity-60 mt-1.5">TERMS ON FILE</p>
        </div>
      </div>

      <div className="grid md:grid-cols-[160px_1fr] gap-8 mt-8">
        <aside>
          <MonoLabel accent>TERMS</MonoLabel>
          <div className="mt-2">
            <Chips options={chipTerms.length ? chipTerms : ["—"]} value={term || "—"} onChange={(t) => setTerm(t)} />
          </div>
          <MonoLabel accent className="mt-6 block">
            NEW RECORD
          </MonoLabel>
          <div className="flex flex-col gap-1 mt-2">
            {Object.keys(TYPE_LABEL).map((t) => (
              <button
                key={t}
                onClick={() => setEditing({ type: t, template: templates?.templates[t] ?? "" })}
                className="text-left mono-label px-2 py-1.5 border border-line text-muted hover:text-ink hover:border-teal cursor-pointer"
              >
                + {t}
              </button>
            ))}
          </div>
        </aside>
        <div>
          {!idx ? (
            <Empty>Loading the spine…</Empty>
          ) : rowsByType.length === 0 ? (
            <Empty>No records for {term} yet. Start with the roster (rollover writes it) and a decision record for anything the board decides.</Empty>
          ) : (
            rowsByType.map(([type, rows], i) => (
              <section key={type} className={i ? "mt-8" : ""}>
                <MonoLabel accent>
                  /{String(i + 1).padStart(2, "0")} {TYPE_LABEL[type] ?? type.toUpperCase()} · {rows.length}
                </MonoLabel>
                {/* run 9 §3: the file metaphor is literal — each record is a folder (T11) */}
                <div className="mt-3 grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {rows.map((r) => (
                    <FolderCard
                      key={r.id}
                      as="article"
                      tab={`${type.toUpperCase()} · ${r.term}`}
                      tone="os"
                      tabFrac={0.5}
                      edgeLabel={String(r.id).split("/").pop()?.replace(/\.md$/, "").toUpperCase()}
                      className="min-h-[170px] hover:brightness-110"
                    >
                      <button
                        className="text-left w-full cursor-pointer"
                        onClick={() => void osFetch<{ row: Rec }>(`/api/os/inheritance/${r.id}`).then((x) => x.ok && setOpen(x.data.row))}
                      >
                        <p className="text-[16px] font-medium leading-tight text-ink">{r.title}</p>
                        <p className="t-micro opacity-60 mt-2">
                          {(r.owners ?? []).join(", ").toUpperCase() || "—"} · {r.date}
                        </p>
                        {r.summary && <p className="text-[13px] text-muted mt-2 leading-relaxed line-clamp-3">{r.summary}</p>}
                        <p className="t-micro raise mt-3 flex gap-2">
                          <span className={r.status === "final" ? "text-teal" : "text-(--color-red-hi)"}>
                            {r.status === "final" ? "●" : "○"} {r.status.toUpperCase()}
                          </span>
                          <span className="opacity-50">{r.visibility.toUpperCase()}</span>
                        </p>
                      </button>
                    </FolderCard>
                  ))}
                </div>
              </section>
            ))
          )}
        </div>
      </div>

      {open && (
        <Panel title={`${open.type.toUpperCase()} · ${open.id}`} onClose={() => setOpen(null)} wide>
          <FolderCard
            tab={`${open.type.toUpperCase()} · ${open.term}`}
            tone="os"
            tabFrac={0.5}
            edgeLabel={String(open.id).split("/").pop()?.replace(/\.md$/, "").toUpperCase()}
          >
            <RecordView
              rec={open}
              onEdit={() => {
                setEditing(open);
                setOpen(null);
              }}
            />
          </FolderCard>
        </Panel>
      )}
      {editing && (
        <Panel title={"id" in editing ? `EDIT · ${editing.id}` : `NEW · ${editing.type.toUpperCase()}`} onClose={() => setEditing(null)} wide>
          <RecordEditor
            initial={editing}
            term={term || idx?.current || ""}
            actorName={actor?.name ?? ""}
            onSaved={(row) => {
              setEditing(null);
              setNotice({ kind: "ok", text: `Saved ${row.path}` });
              void load(term);
            }}
          />
        </Panel>
      )}
      {howto && templates && (
        <Panel title="HOW TO WRITE ONE · content/inheritance/HOW-TO.md" onClose={() => setHowto(false)} wide>
          <HowTo text={templates.howto} />
        </Panel>
      )}
    </OsPage>
  );
}

function HowTo({ text }: { text: string }) {
  const body = text.replace(/^---[\s\S]*?---\n/, "");
  return (
    <div className="text-[13px] leading-relaxed text-muted space-y-3">
      {body.split(/\n{2,}/).map((chunk, i) =>
        chunk.startsWith("## ") ? (
          <p key={i} className="mono-label text-teal mt-4">
            {chunk.slice(3)}
          </p>
        ) : chunk.startsWith("|") ? (
          <pre key={i} className="font-mono text-[11px] whitespace-pre-wrap border border-line p-3">
            {chunk}
          </pre>
        ) : (
          <p key={i}>{chunk}</p>
        ),
      )}
      <KeyVal
        rows={[
          {
            k: "STATUS",
            v: (
              <span className="flex gap-2">
                <StatusWord s="draft" />
                <StatusWord s="final" />
                <StatusWord s="superseded" />
              </span>
            ),
          },
        ]}
      />
    </div>
  );
}
