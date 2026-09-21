/** Every write /os/members makes: open (loads the allowed next states), save, one transition, undo the last
    import, bulk transition, merge two rows, the CSV import. Module-level functions with an explicit context. */
import { act } from "../ui/useOs";
import { osFetch } from "../session";
import type { Row } from "../ui/OsTable";
import type { Import } from "./ImportPanel";

type Ctx = {
  reload: () => Promise<void>;
  say: (ok: boolean, text: string) => void;
  setBusy: (b: boolean) => void;
  sel: Row | "new" | null;
  setSel: (r: Row | "new" | null) => void;
  setNext: (n: string[]) => void;
  imp: Import | null;
  setImp: (i: Import | null) => void;
  picked: Set<string>;
  setPicked: (p: Set<string>) => void;
};

async function open(d: Ctx, r: Row) {
  d.setSel(r);
  const n = await osFetch<{ next: string[] }>(`/api/os/members/${r.id}/next`);
  d.setNext(n.ok ? n.data.next : []);
}

async function save(d: Ctx, v: Record<string, unknown>) {
  d.setBusy(true);
  const r = d.sel === "new" ? await act("/api/os/members", { body: v }) : await act(`/api/os/members/${(d.sel as Row).id}`, { method: "PATCH", body: v });
  d.say(r.ok, r.msg);
  d.setBusy(false);
  await d.reload();
  if (r.ok) d.setSel(null);
}

async function transition(d: Ctx, to: string) {
  if (!d.sel || d.sel === "new") return;
  const r = await act(`/api/os/members/${d.sel.id}/transition`, { body: { to } });
  d.say(r.ok, r.ok ? `Now ${to}.` : r.msg);
  await d.reload();
  d.setSel(null);
}

async function undoImport(d: Ctx) {
  if (!confirm("Undo the LAST import? Every row it added is deleted (changed rows keep their values; the audit has the diff).")) return;
  const r = await act<{ removed: number; batch: string }>("/api/os/members/import/undo", { method: "POST" });
  d.say(r.ok, r.ok ? `Undone — removed ${r.data.removed} row(s) from batch ${r.data.batch}.` : r.msg);
  await d.reload();
}

/** The API applies the allowed map per row and names the first refusal; the picks clear either way. */
async function bulkTransition(d: Ctx, to: string) {
  const ids = [...d.picked];
  if (!ids.length) return;
  const r = await act<{ done: number; refused: { id: string; reason: string }[] }>("/api/os/members/bulk-transition", { body: { ids, to } });
  const refused = r.ok && r.data.refused.length ? ` · ${r.data.refused.length} refused: ${r.data.refused[0].reason}` : "";
  d.say(r.ok, r.ok ? `${r.data.done} → ${to}${refused}` : r.msg);
  d.setPicked(new Set());
  await d.reload();
}

async function merge(d: Ctx) {
  const ids = [...d.picked];
  if (ids.length !== 2) return d.say(false, "Pick exactly two rows to merge — the first picked survives.");
  const r = await act("/api/os/members/merge", { body: { survivor: ids[0], duplicate: ids[1] } });
  d.say(r.ok, r.ok ? "Merged — both handles kept on the survivor." : r.msg);
  d.setPicked(new Set());
  await d.reload();
}

async function runImport(d: Ctx, dry: boolean) {
  const imp = d.imp;
  if (!imp) return;
  d.setBusy(true);
  const r = await act<Row>("/api/os/members/import", { body: { csv: imp.csv, dry_run: dry } });
  d.setBusy(false);
  if (r.ok) d.setImp({ ...imp, result: r.data });
  const done = dry ? "Dry run done — review the diff, then commit." : `Imported: ${String(r.data.added)} added, ${String(r.data.changed)} changed.`;
  d.say(r.ok, r.ok ? done : r.msg);
  if (!dry) await d.reload();
}

export function useMemberWrites(d: Ctx) {
  return {
    open: (r: Row) => open(d, r),
    save: (v: Record<string, unknown>) => save(d, v),
    transition: (to: string) => transition(d, to),
    undoImport: () => undoImport(d),
    bulkTransition: (to: string) => bulkTransition(d, to),
    merge: () => merge(d),
    runImport: (dry: boolean) => runImport(d, dry),
  };
}
