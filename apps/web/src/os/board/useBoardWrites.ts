/** Every write /os/board makes: save an officer, save / delete a term, reorder seats, run the rollover.
    The page owns the UI state and passes it in; this hook owns `busy` and talks to the API. */
import { useState } from "react";
import { act, useOsList } from "../ui/useOs";
import type { Row } from "../ui/OsTable";
import type { Rollover } from "./RolloverWizard";

type List = ReturnType<typeof useOsList>;
type Deps = {
  board: List;
  terms: List;
  rows: Row[];
  shownTerm: string;
  sel: Row | "new" | null;
  termPanel: Row | "new" | null;
  photo: string;
  roll: Rollover | null;
  say: (ok: boolean, text: string) => void;
  setSel: (r: Row | "new" | null) => void;
  setTermPanel: (r: Row | "new" | null) => void;
  setTerm: (t: string) => void;
  setRoll: (r: Rollover | null) => void;
};

const termBody = (v: Record<string, unknown>) => ({ label: v.label, starts_on: v.starts_on || null, ends_on: v.ends_on || null, is_current: !!v.is_current });

type Ctx = Deps & { setBusy: (b: boolean) => void };

async function saveOfficer(d: Ctx, v: Record<string, unknown>) {
  d.setBusy(true);
  const body = { ...v, term: v.term || d.shownTerm, photo_path: d.photo || null, active: v.active ?? true };
  const r = d.sel === "new" ? await act("/api/os/board", { body }) : await act(`/api/os/board/${(d.sel as Row).id}`, { method: "PATCH", body });
  d.say(r.ok, r.msg);
  d.setBusy(false);
  await d.board.reload();
  if (r.ok) d.setSel(null);
}

/** The term being edited: `__id` from a table action (SET CURRENT), else the open panel's row, else none (create). */
const editedTermId = (d: Ctx, v: Record<string, unknown>): string => {
  if (v.__id) return String(v.__id);
  return d.termPanel && d.termPanel !== "new" ? String(d.termPanel.id) : "";
};
const savedTermText = (v: Record<string, unknown>) => (v.is_current ? "Term saved and set current — /about shows it." : "Term saved.");

async function saveTerm(d: Ctx, v: Record<string, unknown>) {
  d.setBusy(true);
  const tid = editedTermId(d, v);
  const r = tid
    ? await act(`/api/os/terms/${tid}`, { method: "PATCH", body: termBody(v), expect: null })
    : await act("/api/os/terms", { body: { id: String(v.id ?? "").toUpperCase(), ...termBody(v) } });
  d.say(r.ok, r.ok ? savedTermText(v) : r.msg);
  d.setBusy(false);
  await d.terms.reload();
  if (!r.ok) return;
  d.setTermPanel(null);
  if (v.is_current) d.setTerm("current");
}

async function deleteTerm(d: Ctx, t: Row) {
  if (!confirm(`Delete term ${String(t.id)}? Refused if it is current or still holds officers/records.`)) return;
  const r = await act(`/api/os/terms/${String(t.id)}`, { method: "DELETE" });
  d.say(r.ok, r.ok ? "Term deleted." : r.msg);
  await d.terms.reload();
}

async function moveSeat(d: Ctx, r: Row, dir: -1 | 1) {
  const i = d.rows.findIndex((x) => x.id === r.id);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= d.rows.length) return;
  await act(`/api/os/board/${r.id}`, { method: "PATCH", body: { name: r.name, sort: j }, expect: null });
  await act(`/api/os/board/${d.rows[j].id}`, { method: "PATCH", body: { name: d.rows[j].name, sort: i }, expect: null });
  await d.board.reload();
}

async function runRollover(d: Ctx) {
  const roll = d.roll;
  if (!roll) return;
  d.setBusy(true);
  const body = {
    next_id: roll.next_id,
    next_label: roll.next_label,
    starts_on: roll.starts_on || null,
    ends_on: roll.ends_on || null,
    continuing_ids: roll.continuing,
  };
  const r = await act<Row>("/api/os/terms/rollover", { body });
  d.setBusy(false);
  if (!r.ok) return d.say(false, r.msg);
  d.setRoll({ ...roll, step: 3, result: r.data });
  await Promise.all([d.board.reload(), d.terms.reload()]);
  d.setTerm("current");
}

export function useBoardWrites(deps: Deps) {
  const [busy, setBusy] = useState(false);
  const d: Ctx = { ...deps, setBusy };
  return {
    busy,
    save: (v: Record<string, unknown>) => saveOfficer(d, v),
    saveTerm: (v: Record<string, unknown>) => saveTerm(d, v),
    deleteTerm: (t: Row) => deleteTerm(d, t),
    moveSeat: (r: Row, dir: -1 | 1) => moveSeat(d, r, dir),
    doRollover: () => runRollover(d),
  };
}
