/** /os/members — the Discord & member tracker. Filters (status chips, term,
    search), row → side-panel editor, status transition with the allowed
    next states, CSV import with a dry-run diff, client-side CSV export. */
import { useMemo, useState } from "react";
import { membersSpec } from "./ui/specs";
import { DossierCard, DossierStack } from "./ui/DossierCard";
import { Meter } from "@/components/cards/Meter";
import { OsPage, Chips, Notice, Panel, KeyVal } from "./ui/OsPage";
import { OsTable, StatusWord, ago, type Row } from "./ui/OsTable";
import { OsForm, type Field } from "./ui/OsForm";
import { act, useNotice, useOsList } from "./ui/useOs";
import { osFetch } from "./session";
import { Button } from "@/components/Button";
import { Readout } from "@/components/cards/StatChip";

const STATUSES = ["all", "interested", "member", "active", "alumni", "left"] as const;
const FIELDS: Field[] = [
  { name: "display_name", label: "NAME", required: true },
  { name: "discord_handle", label: "DISCORD", placeholder: "handle" },
  { name: "school_email", label: "EMAIL" },
  { name: "joined_term", label: "JOINED TERM", placeholder: "F26" },
  { name: "last_seen_term", label: "LAST SEEN TERM" },
  { name: "tags", label: "TAGS", type: "tags", placeholder: "ctf, workshops" },
  { name: "notes", label: "NOTES", type: "textarea", rows: 3 },
];

function toCsv(rows: Row[]): string {
  const cols = ["display_name", "discord_handle", "school_email", "status", "joined_term", "last_seen_term", "tags"];
  const esc = (v: unknown) => `"${String(Array.isArray(v) ? v.join("|") : (v ?? "")).replace(/"/g, '""')}"`;
  return [cols.join(","), ...rows.map((r) => cols.map((c) => esc(r[c])).join(","))].join("\n");
}

export default function OsMembers() {
  const { rows, source, reload } = useOsList("/api/os/members");
  const [status, setStatus] = useState<(typeof STATUSES)[number]>("all");
  const [q, setQ] = useState("");
  const [sel, setSel] = useState<Row | "new" | null>(null);
  const [next, setNext] = useState<string[]>([]);
  const [imp, setImp] = useState<{ csv: string; result?: Row } | null>(null);
  const { notice, say } = useNotice();
  const [busy, setBusy] = useState(false);

  const counts = useMemo(() => Object.fromEntries(STATUSES.map((s) => [s, s === "all" ? rows.length : rows.filter((r) => r.status === s).length])), [rows]);
  const shown = rows.filter((r) => (status === "all" || r.status === status) && (!q || JSON.stringify(r).toLowerCase().includes(q.toLowerCase())));

  async function open(r: Row) {
    setSel(r);
    const n = await osFetch<{ next: string[] }>(`/api/os/members/${r.id}/next`);
    setNext(n.ok ? n.data.next : []);
  }
  async function save(v: Record<string, unknown>) {
    setBusy(true);
    const r = sel === "new" ? await act("/api/os/members", { body: v }) : await act(`/api/os/members/${(sel as Row).id}`, { method: "PATCH", body: v });
    say(r.ok, r.msg);
    setBusy(false);
    await reload();
    if (r.ok) setSel(null);
  }
  async function transition(to: string) {
    if (!sel || sel === "new") return;
    const r = await act(`/api/os/members/${sel.id}/transition`, { body: { to } });
    say(r.ok, r.ok ? `Now ${to}.` : r.msg);
    await reload();
    setSel(null);
  }
  const [picked, setPicked] = useState<Set<string>>(new Set());
  async function undoImport() {
    if (!confirm("Undo the LAST import? Every row it added is deleted (changed rows keep their values; the audit has the diff).")) return;
    const r = await act<{ removed: number; batch: string }>("/api/os/members/import/undo", { method: "POST" });
    say(r.ok, r.ok ? `Undone — removed ${r.data.removed} row(s) from batch ${r.data.batch}.` : r.msg);
    await reload();
  }
  async function bulkTransition(to: string) {
    const ids = [...picked];
    if (!ids.length) return;
    const r = await act<{ done: number; refused: { id: string; reason: string }[] }>("/api/os/members/bulk-transition", { body: { ids, to } });
    say(r.ok, r.ok ? `${r.data.done} → ${to}${r.data.refused.length ? ` · ${r.data.refused.length} refused: ${r.data.refused[0].reason}` : ""}` : r.msg);
    setPicked(new Set());
    await reload();
  }
  async function merge() {
    const ids = [...picked];
    if (ids.length !== 2) return say(false, "Pick exactly two rows to merge — the first picked survives.");
    const r = await act("/api/os/members/merge", { body: { survivor: ids[0], duplicate: ids[1] } });
    say(r.ok, r.ok ? "Merged — both handles kept on the survivor." : r.msg);
    setPicked(new Set());
    await reload();
  }
  async function runImport(dry: boolean) {
    if (!imp) return;
    setBusy(true);
    const r = await act<Row>("/api/os/members/import", { body: { csv: imp.csv, dry_run: dry } });
    setBusy(false);
    if (r.ok) setImp({ ...imp, result: r.data });
    say(
      r.ok,
      r.ok ? (dry ? "Dry run done — review the diff, then commit." : `Imported: ${String(r.data.added)} added, ${String(r.data.changed)} changed.`) : r.msg,
    );
    if (!dry) await reload();
  }

  return (
    <OsPage
      dash={{
        ...membersSpec(rows, source !== "loading"),
        e: {
          ...membersSpec(rows, source !== "loading").e,
          custom: rows.length ? (
            <DossierStack
              className="mt-2"
              people={rows
                .slice(-4)
                .reverse()
                .map((r) => ({
                  name: String(r.display_name ?? ""),
                  code: `MBR-${String(r.id ?? "")
                    .slice(-4)
                    .toUpperCase()}`,
                }))}
            />
          ) : undefined,
        },
      }}
      kicker="MEMBERS · DISCORD TRACKER"
      title="Members"
      source={source}
      actions={
        <>
          <Button variant="ghost" onClick={() => setImp({ csv: "" })}>
            import csv
          </Button>
          {rows.some((r) => r.import_batch) && (
            <Button variant="ghost" onClick={() => void undoImport()}>
              undo last import
            </Button>
          )}
          <Button
            variant="ghost"
            onClick={() => {
              const a = document.createElement("a");
              a.href = URL.createObjectURL(new Blob([toCsv(rows)], { type: "text/csv" }));
              a.download = "members.csv";
              a.click();
            }}
          >
            export csv
          </Button>
          <Button variant="ghost" onClick={() => setSel("new")}>
            + add
          </Button>
        </>
      }
      notHere={[
        "No Discord API — that needs a bot token (a key). Inputs are the Join form, a CSV export from Discord/Google Forms, and manual adds.",
        "Not an auth roster — who can log in to the OS is /os/board. This is the people list.",
        "No emails sent from here — copy the export into the club Gmail when you need to reach people.",
      ]}
    >
      {notice && <Notice kind={notice.kind}>{notice.text}</Notice>}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-px bg-line border border-line mt-4 max-w-[900px]">
        {STATUSES.filter((s) => s !== "all").map((s) => (
          <div key={s} className="bg-navy-900">
            <Readout value={Number(counts[s])} label={s.toUpperCase()} meter={rows.length ? Number(counts[s]) / rows.length : 0} />
          </div>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-5 mt-5">
        <Chips options={STATUSES} value={status} onChange={setStatus} counts={counts} />
        <Meter label="active" value={Number(counts.active ?? 0)} max={Math.max(1, rows.length)} className="w-40" />
        <Meter label="interested" value={Number(counts.interested ?? 0)} max={Math.max(1, rows.length)} className="w-40" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="search"
          className="bg-transparent border-b border-line px-1 py-1 font-mono text-[12px] text-ink focus:border-teal outline-none"
        />
      </div>
      {shown.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-5" data-testid="dossiers">
          {shown.slice(0, 6).map((r, i) => (
            <button key={String(r.id)} onClick={() => open(r)} className="text-left cursor-pointer">
              <DossierCard
                n={i + 1}
                name={String(r.display_name ?? "")}
                code={`MBR-${String(r.joined_term ?? "").toUpperCase() || "—"}-${String(r.id ?? "")
                  .slice(-4)
                  .toUpperCase()}`}
                rows={[
                  { k: "HANDLE", v: r.discord_handle ? String(r.discord_handle) : null },
                  { k: "STATUS", v: String(r.status ?? "").toUpperCase() },
                  { k: "TERM", v: r.joined_term ? String(r.joined_term) : null },
                ]}
                compact
              />
            </button>
          ))}
        </div>
      )}
      {picked.size > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2 border border-teal/40 px-3 py-2" data-testid="bulk-bar">
          <span className="t-micro raise text-teal">{picked.size} PICKED →</span>
          {["member", "active", "alumni", "left", "interested"].map((to) => (
            <button
              key={to}
              onClick={() => void bulkTransition(to)}
              className="t-micro raise border border-line px-2 py-1 text-muted hover:text-ink cursor-pointer"
            >
              → {to}
            </button>
          ))}
          <button onClick={() => void merge()} className="t-micro raise border border-line px-2 py-1 text-muted hover:text-ink cursor-pointer">
            merge two
          </button>
          <button onClick={() => setPicked(new Set())} className="t-micro text-muted cursor-pointer ml-auto">
            clear
          </button>
        </div>
      )}
      <div className="mt-4">
        <OsTable
          cols={[
            {
              key: "__pick",
              label: "",
              width: "28px",
              render: (r) => (
                <input
                  type="checkbox"
                  aria-label={`Pick ${String(r.display_name)}`}
                  checked={picked.has(String(r.id))}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => {
                    const n = new Set(picked);
                    if (e.target.checked) n.add(String(r.id));
                    else n.delete(String(r.id));
                    setPicked(n);
                  }}
                  className="accent-(--color-teal)"
                />
              ),
            },
            { key: "display_name", label: "NAME", render: (r) => <span className="text-ink">{String(r.display_name)}</span> },
            { key: "discord_handle", label: "DISCORD", mono: true },
            { key: "status", label: "STATUS", render: (r) => <StatusWord s={r.status} /> },
            { key: "joined_term", label: "JOINED", mono: true },
            { key: "tags", label: "TAGS" },
            { key: "source", label: "SOURCE", mono: true },
            { key: "updated_at", label: "UPDATED", mono: true, render: (r) => ago(r.updated_at) },
          ]}
          rows={shown}
          onRow={open}
          empty="Nobody tracked yet. Import Discord's member export (CSV) or add people by hand; the Join form adds 'interested' rows automatically."
        />
      </div>
      {sel && (
        <Panel title={sel === "new" ? "ADD PERSON" : `MEMBER · ${String(sel.display_name)}`} onClose={() => setSel(null)}>
          {sel !== "new" && (
            <div className="mb-4">
              <KeyVal
                rows={[
                  { k: "STATUS", v: <StatusWord s={sel.status} /> },
                  { k: "SOURCE", v: String(sel.source ?? "") },
                ]}
              />
              {next.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {next.map((n) => (
                    <Button key={n} variant="ghost" onClick={() => transition(n)}>
                      → {n}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          )}
          <OsForm key={sel === "new" ? "new" : String(sel.id)} fields={FIELDS} initial={sel === "new" ? {} : sel} busy={busy} onSubmit={save} />
        </Panel>
      )}
      {imp && (
        <Panel title="IMPORT CSV · dry run first" onClose={() => setImp(null)} wide>
          <p className="t-micro opacity-60 mb-2">
            columns: display_name, discord_handle, email, status, joined_term (extra columns ignored; Discord's export works as-is)
          </p>
          <textarea
            value={imp.csv}
            onChange={(e) => setImp({ csv: e.target.value })}
            rows={10}
            className="w-full bg-transparent border border-line px-3 py-2 font-mono text-[12px] text-ink focus:border-teal outline-none"
            placeholder="display_name,discord_handle,email,status,joined_term"
          />
          <div className="flex gap-2 mt-3">
            <Button variant="ghost" disabled={busy || !imp.csv.trim()} onClick={() => runImport(true)}>
              dry run
            </Button>
            <Button variant="primary" disabled={busy || !imp.result} onClick={() => runImport(false)}>
              commit import
            </Button>
          </div>
          {imp.result && (
            <div className="mt-4">
              <KeyVal
                rows={[
                  { k: "ADDED", v: String(imp.result.added) },
                  { k: "CHANGED", v: String(imp.result.changed) },
                  { k: "UNCHANGED", v: String(imp.result.unchanged) },
                ]}
              />
              <OsTable
                cols={[
                  { key: "display_name", label: "NAME" },
                  { key: "discord_handle", label: "DISCORD", mono: true },
                  { key: "school_email", label: "EMAIL", mono: true },
                  { key: "status", label: "STATUS" },
                ]}
                rows={(imp.result.preview as Row[]) ?? []}
                rowKey="display_name"
              />
            </div>
          )}
        </Panel>
      )}
    </OsPage>
  );
}
