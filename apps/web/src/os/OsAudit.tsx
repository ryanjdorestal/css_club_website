/** /os/audit — the audit log (who · action · table · row · when) with a
    before/after diff view, and the Tier-1 inbox (writes not yet in Supabase)
    with an admin "Replay to DB" button. Read-only otherwise. */
import { useMemo, useState } from "react";
import { auditSpec } from "./ui/specs";
import { TraceStrip } from "./ui/TraceStrip";
import { DossierCard } from "./ui/DossierCard";
import { SubjectSheet } from "./ui/SubjectSheet";
import { OsPage, Chips, Notice, Panel, KeyVal, Empty } from "./ui/OsPage";
import { OsTable, ago, type Row } from "./ui/OsTable";
import { act, useNotice, useOsList } from "./ui/useOs";
import { useToast } from "./ui/Toast";
import { useSession } from "./session";
import { Button } from "@/components/Button";
import { MonoLabel } from "@/components/MonoLabel";

const TABLES = [
  "all",
  "projects",
  "posts",
  "events",
  "resources",
  "links",
  "board_profiles",
  "terms",
  "members",
  "site_settings",
  "handoffs",
  "uploads",
  "inbox",
] as const;

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
  const { confirm, toast } = useToast();
  const [busy, setBusy] = useState(false);
  const rows = useMemo(() => records.rows.filter((r) => table === "all" || r.table_name === table), [records.rows, table]);

  async function replay() {
    setBusy(true);
    const r = await act<{ ok?: boolean; replayed: number; failed: string[]; error?: string }>("/api/os/inbox/replay", { body: {} });
    say(
      r.ok && r.data.ok !== false,
      r.data.error ? `Not replayed: ${r.data.error}` : `Replayed ${r.data.replayed ?? 0}; ${(r.data.failed ?? []).length} failed.`,
    );
    setBusy(false);
    await inbox.reload();
  }

  async function prune() {
    const ok = await confirm({
      title: "Prune audit records older than 12 months?",
      body: "The yearly housekeeping that keeps the free database small (docs/HOSTING_LIMITS.md). The rows removed were already snapshotted into the repo; the prune itself is logged.",
      word: "PRUNE",
      danger: true,
    });
    if (!ok) return;
    setBusy(true);
    const r = await act<{ removed: number }>("/api/os/records/prune", { body: { months: 12 } });
    toast(r.ok ? `Pruned ${r.data.removed} record(s) older than 12 months.` : r.msg, { kind: r.ok ? "ok" : "err" });
    setBusy(false);
    await records.reload();
  }

  return (
    <OsPage
      dash={auditSpec(records.rows, inbox.rows, records.source !== "loading")}
      kicker="AUDIT · RECORDS · INBOX"
      title="Audit"
      source={records.source}
      actions={<Chips options={TABLES} value={table} onChange={setTable} />}
      notHere={[
        "Nothing is editable here — the log is append-only; fix data on its own page and the fix is logged too.",
        "Retention: Supabase keeps everything until an admin prunes records older than 12 months (the button above the inbox, once a year); the Tier-1 local log keeps the last 2,000.",
        "Replay is idempotent by row id (upsert) — running it twice does not duplicate rows.",
      ]}
    >
      {notice && <Notice kind={notice.kind}>{notice.text}</Notice>}
      {/* run 9 §6.4: the activity traces are the hero of the working surface — 8 channels, one per table, real per-day counts */}
      <section className="mt-4 grid lg:grid-cols-[minmax(0,1fr)_300px] gap-5 items-start">
        <div className="border border-line bg-navy-900/60 p-3">
          <MonoLabel accent>ACTIVITY_TRACES · 60_DAYS · PER_TABLE</MonoLabel>
          <TraceStrip rows={records.rows} field="created_at" groupBy="table_name" channels={8} height={220} className="mt-3 !pointer-events-none" />
        </div>
        <SubjectSheet
          title="LOG_SUBJECT"
          onRefresh={() => void records.reload()}
          rows={[
            { k: "RECORDS", v: records.rows.length },
            { k: "INBOX", v: inbox.rows.length },
            { k: "TABLES", v: new Set(records.rows.map((r) => String(r.table_name ?? ""))).size },
            { k: "ACTORS", v: new Set(records.rows.map((r) => String(r.actor ?? ""))).size },
            { k: "SOURCE", v: records.source.toUpperCase() },
          ]}
          ring={{ value: records.rows.length ? Math.round(((records.rows.length - inbox.rows.length) / records.rows.length) * 100) : null, label: "SYNC" }}
          wave={{ rows: records.rows, field: "created_at" }}
        />
      </section>
      <section className="mt-6">
        <div className="flex items-center justify-between">
          <MonoLabel accent>INBOX · {inbox.rows.length} unsynced Tier-1 write(s)</MonoLabel>
          <span className="flex gap-2">
            {actor?.role === "admin" && (
              <Button variant="ghost" disabled={busy} onClick={prune} data-testid="prune">
                prune &gt; 12 months
              </Button>
            )}
            {actor?.role === "admin" && inbox.rows.length > 0 && (
              <Button variant="ghost" disabled={busy} onClick={replay}>
                {busy ? "replaying…" : "replay to DB"}
              </Button>
            )}
          </span>
        </div>
        <div className="mt-2">
          {inbox.rows.length ? (
            <OsTable
              cols={[
                { key: "ts", label: "WHEN", mono: true, render: (r) => ago(r.ts) },
                { key: "table", label: "TABLE", mono: true },
                { key: "action", label: "ACTION", mono: true },
                { key: "client_id", label: "CLIENT ID", mono: true, render: (r) => String(r.client_id).slice(0, 8) },
              ]}
              rows={inbox.rows}
              rowKey="client_id"
            />
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
              {
                key: "actor",
                label: "WHO",
                mono: true,
                render: (r) => (
                  <span className="relative group/who">
                    {String(r.actor ?? "")}
                    <span className="hidden group-hover/who:block absolute left-0 top-full z-30 w-[300px] pt-2">
                      <DossierCard
                        n={1}
                        name={String(r.actor ?? "")}
                        code={`ACT-${String(r.id ?? "")
                          .slice(-6)
                          .toUpperCase()}`}
                        rows={[
                          { k: "ACTION", v: String(r.action ?? "") },
                          { k: "TABLE", v: String(r.table_name ?? "") },
                          { k: "WHEN", v: ago(r.created_at) },
                        ]}
                        compact
                      />
                    </span>
                  </span>
                ),
              },
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
          <KeyVal
            rows={[
              { k: "WHO", v: String(sel.actor) },
              { k: "ROW", v: String(sel.row_id ?? "") },
              { k: "WHEN", v: new Date(Number(sel.created_at) * 1000).toLocaleString() },
              { k: "NOTE", v: String(sel.note ?? "") },
            ]}
          />
          <p className="mono-label text-muted mt-5 mb-2">BEFORE → AFTER</p>
          <Diff before={(sel.before as Row) ?? null} after={(sel.after as Row) ?? null} />
        </Panel>
      )}
    </OsPage>
  );
}
