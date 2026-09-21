/** /os/board — the roster (who can log in), roles, terms, and the admin-only
    term rollover wizard (confirm dates → who continues → done). */
import { useState } from "react";
import { OsPage, Chips, KeyVal, Notice, Panel } from "./ui/OsPage";
import { OsTable, StatusWord, type Row } from "./ui/OsTable";
import { OsForm, type Field } from "./ui/OsForm";
import { act, useNotice, useOsList } from "./ui/useOs";
import { useSession } from "./session";
import { Button } from "@/components/Button";
import { MonoLabel } from "@/components/MonoLabel";

const FIELDS: Field[] = [
  { name: "name", label: "NAME", required: true },
  { name: "role_title", label: "ROLE", placeholder: "President" },
  { name: "email", label: "EMAIL", help: "the login email — must match what they sign in with" },
  { name: "term", label: "TERM", placeholder: "F26" },
  { name: "os_role", label: "OS ROLE", type: "select", options: ["officer", "admin"] },
  { name: "active", label: "ACTIVE (can log in)", type: "toggle" },
  { name: "bio", label: "BIO", type: "textarea", rows: 3 },
  { name: "photo_path", label: "PHOTO PATH", placeholder: "img/board/name.webp" },
  { name: "sort", label: "SORT", type: "number" },
];

export default function OsBoard() {
  const { actor } = useSession();
  const admin = actor?.role === "admin";
  const board = useOsList("/api/os/board");
  const terms = useOsList("/api/os/terms");
  const current = terms.rows.find((t) => t.is_current);
  const [term, setTerm] = useState<string>("current");
  const [sel, setSel] = useState<Row | "new" | null>(null);
  const [roll, setRoll] = useState<null | { step: 1 | 2 | 3; next_id: string; next_label: string; starts_on: string; ends_on: string; continuing: string[]; result?: Row }>(null);
  const { notice, say } = useNotice();
  const [busy, setBusy] = useState(false);
  const termIds = ["current", ...terms.rows.map((t) => String(t.id))];
  const shownTerm = term === "current" ? String(current?.id ?? "") : term;
  const rows = board.rows.filter((r) => r.term === shownTerm).sort((a, b) => Number(a.sort ?? 0) - Number(b.sort ?? 0));

  async function save(v: Record<string, unknown>) {
    setBusy(true);
    const body = { ...v, term: v.term || shownTerm };
    const r = sel === "new" ? await act("/api/os/board", { body }) : await act(`/api/os/board/${(sel as Row).id}`, { method: "PATCH", body });
    say(r.ok, r.msg);
    setBusy(false);
    await board.reload();
    if (r.ok) setSel(null);
  }
  async function doRollover() {
    if (!roll) return;
    setBusy(true);
    const r = await act<Row>("/api/os/terms/rollover", { body: { next_id: roll.next_id, next_label: roll.next_label, starts_on: roll.starts_on || null, ends_on: roll.ends_on || null, continuing_ids: roll.continuing } });
    setBusy(false);
    if (r.ok) {
      setRoll({ ...roll, step: 3, result: r.data });
      await Promise.all([board.reload(), terms.reload()]);
      setTerm("current");
    } else say(false, r.msg);
  }

  return (
    <OsPage
      kicker="BOARD · ROLES · TERMS"
      title="Board"
      source={board.source}
      actions={
        <>
          <Chips options={termIds} value={term} onChange={setTerm} />
          {admin && <Button variant="ghost" onClick={() => setSel("new")}>+ add officer</Button>}
          {admin && <Button variant="ghost" onClick={() => setRoll({ step: 1, next_id: "", next_label: "", starts_on: "", ends_on: "", continuing: [] })}>term rollover</Button>}
        </>
      }
      notHere={[
        "No self-signup — an admin adds each officer's email here; only active rows on the current term can sign in.",
        "No password resets — sign-in is a one-time email code, so there is nothing to reset.",
        "Photos are paths under public/img/board (or an upload path); the About page reads the same rows.",
        admin ? "Rollover clones continuing officers as inactive — confirm each one after the wizard." : "Adding officers and rollover are admin-only (president + webmaster).",
      ]}
    >
      {notice && <Notice kind={notice.kind}>{notice.text}</Notice>}
      <div className="mt-4">
        <p className="t-micro opacity-60 mb-2">TERM {shownTerm || "—"} {current && String(current.id) === shownTerm && "· CURRENT"} · {rows.filter((r) => r.active).length} can sign in</p>
        <OsTable
          cols={[
            { key: "name", label: "NAME", render: (r) => <span className="text-ink">{String(r.name)}</span> },
            { key: "role_title", label: "ROLE" },
            { key: "email", label: "EMAIL", mono: true },
            { key: "os_role", label: "OS ROLE", render: (r) => <StatusWord s={r.os_role} /> },
            { key: "active", label: "ACTIVE", render: (r) => (r.active ? <StatusWord s="active" /> : <StatusWord s="inactive" />) },
          ]}
          rows={rows}
          onRow={admin ? setSel : undefined}
          empty="No officers on this term yet. Admin: add the first row (your own email) or run scripts/bootstrap_admin.py."
        />
      </div>
      {sel && admin && (
        <Panel title={sel === "new" ? "ADD OFFICER" : `OFFICER · ${String(sel.name)}`} onClose={() => setSel(null)}>
          <OsForm key={sel === "new" ? "new" : String(sel.id)} fields={FIELDS} initial={sel === "new" ? { term: shownTerm, os_role: "officer", active: true } : sel} busy={busy} onSubmit={save} />
        </Panel>
      )}
      {roll && admin && (
        <Panel title={`TERM ROLLOVER · STEP ${roll.step}/3`} onClose={() => setRoll(null)}>
          {roll.step === 1 && (
            <div className="space-y-4">
              <KeyVal rows={[{ k: "CLOSING", v: `${current?.label ?? "—"} (${current?.id ?? "—"})` }]} />
              {[["next_id", "NEXT TERM ID", "S27"], ["next_label", "NEXT TERM LABEL", "Spring 2027"], ["starts_on", "STARTS (YYYY-MM-DD)", "2027-01-25"], ["ends_on", "ENDS (YYYY-MM-DD)", "2027-05-20"]].map(([k, l, ph]) => (
                <label key={k} className="block">
                  <span className="mono-label text-muted">{l}</span>
                  <input className="w-full bg-transparent border-0 border-b border-line px-1 py-2 font-mono text-[13px] text-ink focus:border-teal outline-none" placeholder={ph} value={String(roll[k as "next_id"])} onChange={(e) => setRoll({ ...roll, [k]: e.target.value })} />
                </label>
              ))}
              <Button variant="ghost" disabled={!roll.next_id || !roll.next_label} onClick={() => setRoll({ ...roll, step: 2 })}>next: who continues →</Button>
            </div>
          )}
          {roll.step === 2 && (
            <div className="space-y-3">
              <MonoLabel>Who continues into {roll.next_label}? (cloned as inactive — you confirm each after)</MonoLabel>
              {board.rows.filter((r) => r.term === current?.id).map((o) => (
                <label key={String(o.id)} className="flex items-center gap-3 text-[13px] cursor-pointer">
                  <input type="checkbox" checked={roll.continuing.includes(String(o.id))} onChange={(e) => setRoll({ ...roll, continuing: e.target.checked ? [...roll.continuing, String(o.id)] : roll.continuing.filter((x) => x !== o.id) })} />
                  <span className="text-ink">{String(o.name)}</span>
                  <span className="text-muted">{String(o.role_title ?? "")}</span>
                </label>
              ))}
              <div className="flex gap-2 pt-2">
                <Button variant="ghost" onClick={() => setRoll({ ...roll, step: 1 })}>← back</Button>
                <Button variant="primary" disabled={busy} onClick={doRollover}>{busy ? "rolling…" : "roll the term"}</Button>
              </div>
            </div>
          )}
          {roll.step === 3 && (
            <div className="space-y-3">
              <Notice kind="ok">Closed {String(roll.result?.closed)} · opened {roll.next_id} · {String((roll.result?.cloned as unknown[] | undefined)?.length ?? 0)} continuing · {String(roll.result?.handoff_stubs)} handoff stubs filed.</Notice>
              <p className="text-[13px] text-muted">Next: open each continuing officer and set ACTIVE on; add the new officers with their emails; ask everyone from the closed term to file their handoff on /os/inheritance.</p>
              <Button variant="ghost" onClick={() => setRoll(null)}>done</Button>
            </div>
          )}
        </Panel>
      )}
    </OsPage>
  );
}
