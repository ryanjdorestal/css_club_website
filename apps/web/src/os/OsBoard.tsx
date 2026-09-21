/** /os/board — the roster (who can log in), roles, terms, and the admin-only
    term rollover wizard (confirm dates → who continues → done). */
import { useState } from "react";
import { boardSpec } from "./ui/specs";
import { OsPage, Chips, Notice, Panel } from "./ui/OsPage";
import { OsTable, StatusWord, type Row, type RowAction } from "./ui/OsTable";
import { OsForm, type Field } from "./ui/OsForm";
import { act, useNotice, useOsList } from "./ui/useOs";
import { useSession } from "./session";
import { Button } from "@/components/Button";
import { Upload } from "./ui/Upload";
import { RolloverWizard, type Rollover } from "./board/RolloverWizard";
import { TermPanel } from "./board/TermPanel";
import { OfficerFolders, TermsTable } from "./board/BoardViews";
import { useBoardWrites } from "./board/useBoardWrites";

const FIELDS: Field[] = [
  { name: "name", label: "NAME", required: true },
  { name: "role_title", label: "ROLE", placeholder: "President" },
  { name: "email", label: "EMAIL", help: "the login email — must match what they sign in with" },
  { name: "term", label: "TERM", placeholder: "F26" },
  { name: "os_role", label: "OS ROLE", type: "select", options: ["officer", "admin"] },
  { name: "active", label: "ACTIVE (can log in)", type: "toggle" },
  { name: "bio", label: "BIO", type: "textarea", rows: 3 },
  { name: "sort", label: "SORT", type: "number" },
];

const EMPTY_ROLLOVER: Rollover = { step: 1, next_id: "", next_label: "", starts_on: "", ends_on: "", continuing: [] };

function AdminActions({ onAddOfficer, onRollover, onNewTerm }: { onAddOfficer: () => void; onRollover: () => void; onNewTerm: () => void }) {
  return (
    <>
      <Button variant="ghost" onClick={onAddOfficer}>
        + add officer
      </Button>
      <Button variant="ghost" onClick={onRollover}>
        term rollover
      </Button>
      <Button variant="ghost" onClick={onNewTerm}>
        + new term
      </Button>
    </>
  );
}

/** EDIT · ▲ UP · ▼ DOWN · REMOVE (an officer who filed a handoff is archived by the API instead — 409). */
function officerActions(h: { term: string; open: (r: Row) => void; moveSeat: (r: Row, dir: -1 | 1) => Promise<void>; remove: (r: Row) => void }): RowAction[] {
  return [
    { label: "EDIT", onClick: h.open },
    { label: "▲ UP", onClick: (r) => void h.moveSeat(r, -1) },
    { label: "▼ DOWN", onClick: (r) => void h.moveSeat(r, 1) },
    {
      label: "REMOVE",
      danger: true,
      onClick: (r) => {
        if (confirm(`Remove ${String(r.name)} from ${h.term}? An officer who filed a handoff is archived instead.`)) h.remove(r);
      },
    },
  ];
}

export default function OsBoard() {
  const { actor } = useSession();
  const admin = actor?.role === "admin";
  const board = useOsList("/api/os/board");
  const terms = useOsList("/api/os/terms");
  const current = terms.rows.find((t) => t.is_current);
  const [term, setTerm] = useState<string>("current");
  const [sel, setSel] = useState<Row | "new" | null>(null);
  const [termPanel, setTermPanel] = useState<Row | "new" | null>(null);
  const [photo, setPhoto] = useState("");
  const [roll, setRoll] = useState<Rollover | null>(null);
  const { notice, say } = useNotice();
  const termIds = ["current", ...terms.rows.map((t) => String(t.id))];
  const shownTerm = term === "current" ? String(current?.id ?? "") : term;
  const rows = board.rows.filter((r) => r.term === shownTerm).sort((a, b) => Number(a.sort ?? 0) - Number(b.sort ?? 0));

  const openOfficer = (r: Row | "new" = "new") => {
    setPhoto(r === "new" ? "" : String(r.photo_path ?? ""));
    setSel(r);
  };
  const writes = useBoardWrites({ board, terms, rows, shownTerm, sel, termPanel, photo, roll, say, setSel, setTermPanel, setTerm, setRoll });
  const { busy, save, saveTerm, deleteTerm, moveSeat, doRollover } = writes;
  const removeOfficer = (r: Row) =>
    void act(`/api/os/board/${r.id}`, { method: "DELETE" }).then(async (res) => {
      say(res.ok || res.status === 409, res.ok ? "Removed." : res.msg);
      await board.reload();
    });

  return (
    <OsPage
      dash={boardSpec(board.rows, terms.rows, board.source !== "loading", String(current?.id ?? ""))}
      kicker="BOARD · ROLES · TERMS"
      title="Board"
      source={board.source}
      actions={
        <>
          <Chips options={termIds} value={term} onChange={setTerm} />
          {admin && <AdminActions onAddOfficer={() => openOfficer("new")} onRollover={() => setRoll(EMPTY_ROLLOVER)} onNewTerm={() => setTermPanel("new")} />}
        </>
      }
      notHere={[
        "No self-signup — an admin adds each officer's email here; only active rows on the current term can sign in.",
        "No password resets — sign-in is a one-time email code, so there is nothing to reset.",
        "Photos are paths under public/img/board (or an upload path); the About page reads the same rows.",
        admin
          ? "Rollover clones continuing officers as inactive — confirm each one after the wizard."
          : "Adding officers and rollover are admin-only (president + webmaster).",
      ]}
    >
      {notice && <Notice kind={notice.kind}>{notice.text}</Notice>}
      <div className="mt-4">
        <p className="t-micro opacity-60 mb-2">
          TERM {shownTerm || "—"} {current && String(current.id) === shownTerm && "· CURRENT"} · {rows.filter((r) => r.active).length} can sign in
        </p>
        <OfficerFolders rows={rows} term={shownTerm} />
        <OsTable
          cols={[
            { key: "name", label: "NAME", render: (r) => <span className="text-ink">{String(r.name)}</span> },
            { key: "role_title", label: "ROLE" },
            { key: "email", label: "EMAIL", mono: true },
            { key: "os_role", label: "OS ROLE", render: (r) => <StatusWord s={r.os_role} /> },
            { key: "active", label: "ACTIVE", render: (r) => (r.active ? <StatusWord s="active" /> : <StatusWord s="inactive" />) },
          ]}
          rows={rows}
          onRow={admin ? openOfficer : undefined}
          actions={admin ? officerActions({ term: shownTerm, open: openOfficer, moveSeat, remove: removeOfficer }) : undefined}
          empty="No officers on this term yet. Admin: add the first row (your own email) or run scripts/bootstrap_admin.py."
        />
      </div>
      <TermsTable
        terms={terms.rows}
        admin={admin}
        onEdit={setTermPanel}
        onSetCurrent={(t) =>
          void saveTerm({ label: t.label, starts_on: t.starts_on, ends_on: t.ends_on, is_current: true, __id: t.id }).then(() => setTermPanel(null))
        }
        onDelete={(t) => void deleteTerm(t)}
      />
      {termPanel && admin && <TermPanel term={termPanel} busy={busy} onClose={() => setTermPanel(null)} onSubmit={saveTerm} />}
      {sel && admin && (
        <Panel title={sel === "new" ? "ADD OFFICER" : `OFFICER · ${String(sel.name)}`} onClose={() => setSel(null)}>
          <Upload label="PHOTO" value={photo} onChange={setPhoto} />
          <OsForm
            key={sel === "new" ? "new" : String(sel.id)}
            fields={FIELDS}
            initial={sel === "new" ? { term: shownTerm, os_role: "officer", active: true } : sel}
            draftKey={sel === "new" ? "officer-new" : `officer-${String(sel.id)}`}
            busy={busy}
            onSubmit={save}
          />
        </Panel>
      )}
      {roll && admin && (
        <RolloverWizard
          roll={roll}
          setRoll={setRoll}
          current={current}
          officers={board.rows.filter((r) => r.term === current?.id)}
          busy={busy}
          onRun={doRollover}
        />
      )}
    </OsPage>
  );
}
