/** /os/inheritance — the platform survives graduation. Five panels:
    Is it working? (live checks) · Ownership (accounts → owner emails, never
    credentials) · Handoffs (one per officer per term) · Docs index · Runbook
    (docs/RUNBOOK.md rendered inline). */
import { useEffect, useState } from "react";
import runbookRaw from "@docs/RUNBOOK.md?raw";
import docsIndex from "@docs/INDEX.json";
import { OsPage, Notice, Panel, KeyVal } from "./ui/OsPage";
import { OsTable, StatusWord, ago, type Row } from "./ui/OsTable";
import { OsForm } from "./ui/OsForm";
import { act, useNotice, useOsList } from "./ui/useOs";
import { osFetch, useSession } from "./session";
import { StatusChip } from "@/components/cards/StatusChip";
import { MonoLabel } from "@/components/MonoLabel";
import { Button } from "@/components/Button";
import { parseMd } from "@/lib/md";

type Check = { state: "live" | "idle" | "offline"; label: string; detail: string; fix: string };
type Account = { name: string; owner_email: string; second_owner_email: string; last_verified: string | null };

export default function OsInheritance() {
  const { actor } = useSession();
  const admin = actor?.role === "admin";
  const [checks, setChecks] = useState<Check[] | null>(null);
  const handoffs = useOsList("/api/os/handoffs");
  const settings = useOsList("/api/os/site-settings");
  const board = useOsList("/api/os/board");
  const [sel, setSel] = useState<Row | "new" | null>(null);
  const [ownEdit, setOwnEdit] = useState<Account[] | null>(null);
  const { notice, say } = useNotice();
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void osFetch<{ checks: Check[] }>("/api/os/status").then((r) => setChecks(r.ok ? r.data.checks : [{ state: "offline", label: "API", detail: r.error ?? "unreachable", fix: "start uvicorn (README)" }]));
  }, []);

  const ownership = (settings.rows.find((r) => r.key === "ownership")?.value as { accounts?: Account[] } | undefined)?.accounts ?? [];
  const officerEmails = new Set(board.rows.filter((r) => r.active).map((r) => String(r.email ?? "").toLowerCase()).filter(Boolean));
  const runbook = parseMd(runbookRaw);

  async function saveHandoff(v: Record<string, unknown>) {
    setBusy(true);
    const r = sel === "new" ? await act("/api/os/handoffs", { body: v }) : await act(`/api/os/handoffs/${(sel as Row).id}`, { method: "PATCH", body: v });
    say(r.ok, r.msg);
    setBusy(false);
    await handoffs.reload();
    if (r.ok) setSel(null);
  }
  async function fileIt(id: string) {
    const r = await act(`/api/os/handoffs/${id}/file`, { method: "POST" });
    say(r.ok, r.ok ? "Filed. Today stops nagging you." : r.msg);
    await handoffs.reload();
    setSel(null);
  }
  async function saveOwnership() {
    if (!ownEdit) return;
    const r = await act("/api/os/site-settings/ownership", { method: "PATCH", body: { value: { accounts: ownEdit } } });
    say(r.ok, r.ok ? "Ownership sheet saved." : r.msg);
    if (r.ok) setOwnEdit(null);
    await settings.reload();
  }

  return (
    <OsPage
      kicker="INHERITANCE · INFRASTRUCTURE"
      title="Inheritance"
      source={handoffs.source}
      notHere={[
        "No credentials, ever — the ownership sheet holds owner emails only; secrets live in Vercel/Supabase settings and the club password manager.",
        "No automatic account transfer — moving Vercel/Supabase/GitHub to a new owner is a human step (docs/HANDOFF.md).",
        "Checks are live probes; a red chip is information, not a page you can fix here — follow the runbook line.",
      ]}
    >
      {notice && <Notice kind={notice.kind}>{notice.text}</Notice>}

      <section className="mt-4">
        <MonoLabel accent>1 · IS THE PLATFORM WORKING?</MonoLabel>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-line border border-line mt-2">
          {(checks ?? []).map((c) => (
            <div key={c.label} className="bg-navy-900 px-4 py-3">
              <div className="flex items-center justify-between gap-2"><span className="mono-label text-muted">{c.label}</span><StatusChip state={c.state} /></div>
              <p className="text-[13px] text-ink mt-1.5">{c.detail}</p>
              {c.state !== "live" && c.fix && <p className="t-micro text-teal mt-1">→ {c.fix}</p>}
            </div>
          ))}
          {!checks && <div className="bg-navy-900 px-4 py-3 text-[13px] text-muted">probing…</div>}
        </div>
      </section>

      <section className="mt-8">
        <div className="flex items-center justify-between"><MonoLabel accent>2 · OWNERSHIP · who holds each account</MonoLabel>{admin && !ownEdit && <Button variant="ghost" onClick={() => setOwnEdit(ownership.map((a) => ({ ...a })))}>edit</Button>}</div>
        <div className="mt-2 max-w-[900px]">
          {ownEdit ? (
            <div className="border border-line divide-y divide-line">
              {ownEdit.map((a, i) => (
                <div key={a.name} className="grid md:grid-cols-[180px_1fr_1fr_140px] gap-2 px-3 py-2 items-center">
                  <span className="mono-label text-muted">{a.name}</span>
                  {(["owner_email", "second_owner_email", "last_verified"] as const).map((k) => (
                    <input key={k} value={a[k] ?? ""} placeholder={k.replace(/_/g, " ")} onChange={(e) => setOwnEdit(ownEdit.map((x, j) => (j === i ? { ...x, [k]: e.target.value } : x)))} className="bg-transparent border-b border-line px-1 py-1 font-mono text-[12px] text-ink focus:border-teal outline-none" />
                  ))}
                </div>
              ))}
              <div className="px-3 py-2 flex gap-2"><Button variant="primary" onClick={saveOwnership}>save</Button><Button variant="ghost" onClick={() => setOwnEdit(null)}>cancel</Button></div>
            </div>
          ) : (
            <KeyVal rows={ownership.map((a) => ({ k: a.name, v: (
              <span className="flex flex-wrap gap-3 items-center">
                <span className={`font-mono text-[12px] ${a.owner_email && !officerEmails.has(a.owner_email.toLowerCase()) ? "text-(--color-red-hi)" : ""}`}>{a.owner_email || "— unassigned"}</span>
                {a.second_owner_email && <span className="font-mono text-[12px] text-muted">+ {a.second_owner_email}</span>}
                {a.last_verified && <span className="t-micro opacity-50">verified {a.last_verified}</span>}
                {a.owner_email && !officerEmails.has(a.owner_email.toLowerCase()) && <StatusWord s="not a current officer" />}
              </span>
            ) }))} />
          )}
        </div>
      </section>

      <section className="mt-8">
        <div className="flex items-center justify-between"><MonoLabel accent>3 · HANDOFFS · one per officer per term</MonoLabel><Button variant="ghost" onClick={() => setSel("new")}>+ my handoff</Button></div>
        <div className="mt-2">
          <OsTable
            cols={[
              { key: "officer_name", label: "OFFICER", render: (r) => <span className="text-ink">{String(r.officer_name ?? r.profile_id)}</span> },
              { key: "role_title", label: "ROLE" },
              { key: "term", label: "TERM", mono: true },
              { key: "status", label: "STATUS", render: (r) => <StatusWord s={r.status} /> },
              { key: "updated_at", label: "UPDATED", mono: true, render: (r) => ago(r.updated_at) },
            ]}
            rows={[...handoffs.rows].sort((a, b) => String(b.term).localeCompare(String(a.term)))}
            onRow={setSel}
            empty="No handoffs yet. Each officer files one in the last month of the term: what I ran, where things are, what's unfinished, advice."
          />
        </div>
      </section>

      <section className="mt-8 grid md:grid-cols-2 gap-8">
        <div>
          <MonoLabel accent>4 · DOCS</MonoLabel>
          <ul className="mt-2 border border-line divide-y divide-line">
            {(docsIndex as { docs: { path: string; title: string; for: string }[] }).docs.map((d) => (
              <li key={d.path} className="px-3 py-2 text-[13px]"><span className="font-mono text-[12px] text-teal">{d.path}</span> · <span className="text-ink">{d.title}</span> <span className="text-muted">— {d.for}</span></li>
            ))}
          </ul>
        </div>
        <div>
          <MonoLabel accent>5 · RUNBOOK · docs/RUNBOOK.md</MonoLabel>
          <div className="mt-2 border border-line px-4 py-3 max-h-[420px] overflow-y-auto">
            {runbook.blocks.map((b, i) => b.type === "h2" ? <p key={i} className="mono-label text-teal mt-3 mb-1">{b.text}</p> : <p key={i} className="text-[13px] text-muted leading-relaxed mb-2">{b.text}</p>)}
          </div>
        </div>
      </section>

      {sel && (
        <Panel title={sel === "new" ? "MY HANDOFF" : `HANDOFF · ${String(sel.officer_name ?? "")}`} onClose={() => setSel(null)} wide>
          <OsForm
            key={sel === "new" ? "new" : String(sel.id)}
            fields={[{ name: "term", label: "TERM", placeholder: "F26" }, { name: "body_md", label: "HANDOFF", type: "markdown", rows: 14, help: "## What I ran · ## Where things are · ## Unfinished · ## Advice" }]}
            initial={sel === "new" ? { body_md: "## What I ran\n\n\n## Where things are\n\n\n## Unfinished\n\n\n## Advice\n\n" } : sel}
            busy={busy}
            onSubmit={saveHandoff}
            extra={sel !== "new" && String(sel.status) === "draft" && <Button type="button" variant="primary" onClick={() => fileIt(String(sel.id))}>file it</Button>}
          />
        </Panel>
      )}
    </OsPage>
  );
}
