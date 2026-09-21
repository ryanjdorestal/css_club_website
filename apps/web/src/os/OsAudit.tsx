/** /os/audit — the audit log (who · action · table · row · when) with a
    before/after diff view, and the Tier-1 inbox (writes not yet in Supabase)
    with an admin "Replay to DB" button. Read-only otherwise. */
import { useMemo, useState } from "react";
import { OsPage, Chips, Notice, Panel, KeyVal, Empty } from "./ui/OsPage";
import { OsTable, ago, type Row } from "./ui/OsTable";
import { act, useNotice, useOsList } from "./ui/useOs";
import { useSession } from "./session";
import { Button } from "@/components/Button";
import { MonoLabel } from "@/components/MonoLabel";

const TABLES = ["all", "projects", "posts", "events", "resources", "links", "board_profiles", "terms", "members", "site_settings", "handoffs", "uploads", "inbox"] as const;

function Diff({ before, after }: { before: Row | null; after: Row | null }) {
  const keys = [...new Set([...Object.keys(before ?? {}), ...Object.keys(after ?? {})])].filter((k) => !["updated_at"].includes(k));
  const changed = keys.filter((k) => JSON.stringify(before?.[k]) !== JSON.stringify(after?.[k]));
  if (!changed.length) return <Empty>No field changed.</Empty>;
  return (
    <div className="border border-line divide-y divide-line">
      {changed.map((k) => (
        <div key={k} className="grid grid-cols-[130px_1fr_1fr] gap-3 px-3 py-2 text-[12px] font-mono">
          <span className="text-muted">{k}</span>
          <span className="text-(--color-red-hi)/80 break-all whitespace-pre-wrap">{before ? JSON.stringify(before[k]) : "∅"}</span>
          <span className="text-green break-all whitespace-pre-wrap">{after ? JSON.stringify(after[k]) : "∅"}</span>
        </div>
      ))}
    </div>
  );
}

export default function OsAudit() {
  const { actor } = useSession();
  const [table, setTable] = useState<(typeof TABLES)[number]>("all");
  const records = useOsList("/api/os/records?limit=300");
  const inbox = useOsList("/api/os/inbox");
  const [sel, setSel] = useState<Row | null>(null);
  const { notice, say } = useNotice();
  const [busy, setBusy] = useState(false);
  const rows = useMemo(() => records.rows.filter((r) => table === "all" || r.table_name === table), [records.rows, table]);

  async function replay() {
    setBusy(true);
    const r = await act<{ replayed: number; failed: string[]; error?: string }>("/api/os/inbox/replay", { body: {} });
    say(r.ok && r.data.ok !== false, r.data.error ? `Not replayed: ${r.data.error}` : `Replayed ${r.data.replayed ?? 0}; ${(r.data.failed ?? []).length} failed.`);
    setBusy(false);
    await inbox.reload();
  }

  return (
    <OsPage
      kicker="AUDIT · RECORDS · INBOX"
      title="Audit"
      source={records.source}
      actions={<Chips options={TABLES} value={table} onChange={setTable} />}
      notHere={[
        "Nothing is editable here — the log is append-only; fix data on its own page and the fix is logged too.",
        "Retention: Supabase keeps everything; the Tier-1 local log keeps the last 2,000 records.",
        "Replay is idempotent by row id (upsert) — running it twice does not duplicate rows.",
      ]}
    >
      {notice && <Notice kind={notice.kind}>{notice.text}</Notice>}
      <section className="mt-4">
        <div className="flex items-center justify-between">
          <MonoLabel accent>INBOX · {inbox.rows.length} unsynced Tier-1 write(s)</MonoLabel>
          {actor?.role === "admin" && inbox.rows.length > 0 && <Button variant="ghost" disabled={busy} onClick={replay}>{busy ? "replaying…" : "replay to DB"}</Button>}
        </div>
        <div className="mt-2">
          {inbox.rows.length ? (
            <OsTable cols={[{ key: "ts", label: "WHEN", mono: true, render: (r) => ago(r.ts) }, { key: "table", label: "TABLE", mono: true }, { key: "action", label: "ACTION", mono: true }, { key: "client_id", label: "CLIENT ID", mono: true, render: (r) => String(r.client_id).slice(0, 8) }]} rows={inbox.rows} rowKey="client_id" />
          ) : (
            <Empty>Inbox is empty — every write is in the database (or nothing has been written offline yet).</Empty>
          )}
        </div>
      </section>
      <section className="mt-8">
        <MonoLabel accent>RECORDS · newest first</MonoLabel>
        <div className="mt-2">
          <OsTable
            cols={[
              { key: "created_at", label: "WHEN", mono: true, render: (r) => ago(r.created_at) },
              { key: "actor", label: "WHO", mono: true },
              { key: "action", label: "ACTION", mono: true },
              { key: "table_name", label: "TABLE", mono: true },
              { key: "row_id", label: "ROW", mono: true, render: (r) => String(r.row_id ?? "").slice(0, 28) },
            ]}
            rows={rows}
            onRow={setSel}
            empty="No records yet. Every OS write lands here."
          />
        </div>
      </section>
      {sel && (
        <Panel title={`RECORD · ${String(sel.action)} · ${String(sel.table_name)}`} onClose={() => setSel(null)} wide>
          <KeyVal rows={[{ k: "WHO", v: String(sel.actor) }, { k: "ROW", v: String(sel.row_id ?? "") }, { k: "WHEN", v: new Date(Number(sel.created_at) * 1000).toLocaleString() }, { k: "NOTE", v: String(sel.note ?? "") }]} />
          <p className="mono-label text-muted mt-5 mb-2">BEFORE → AFTER</p>
          <Diff before={(sel.before as Row) ?? null} after={(sel.after as Row) ?? null} />
        </Panel>
      )}
    </OsPage>
  );
}
