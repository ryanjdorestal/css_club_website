/** Every write /os/resources makes on links and categories: save / remove / reorder / re-check a link,
    rename / delete (with cascade) / reorder a category, the bulk paste. Module-level functions with an
    explicit context, bound once by the hook. */
import { act } from "../ui/useOs";
import type { Row } from "../ui/OsTable";
import type { Bulk } from "./BulkPaste";

type Ctx = {
  reload: () => Promise<void>;
  groups: Map<string, Row[]>;
  say: (ok: boolean, text: string) => void;
  setBusy: (b: boolean) => void;
  sel: Row | "new" | null;
  bulk: Bulk | null;
  setBulk: (b: Bulk | null) => void;
  setSel: (r: Row | "new" | null) => void;
};

async function save(d: Ctx, v: Record<string, unknown>) {
  d.setBusy(true);
  const r = d.sel === "new" ? await act("/api/os/resources", { body: v }) : await act(`/api/os/resources/${(d.sel as Row).id}`, { method: "PATCH", body: v });
  d.say(r.ok, r.msg);
  d.setBusy(false);
  await d.reload();
  if (r.ok) d.setSel(null);
}

async function remove(d: Ctx, id: string) {
  const r = await act(`/api/os/resources/${id}`, { method: "DELETE" });
  d.say(r.ok, r.ok ? "Removed." : r.msg);
  await d.reload();
  d.setSel(null);
}

/** Swap two neighbours and send the group's full order — one write, no race with public reads. */
async function move(d: Ctx, row: Row, dir: -1 | 1) {
  const ids = (d.groups.get(String(row.group)) ?? []).map((r) => String(r.id));
  const i = ids.indexOf(String(row.id));
  if (i + dir < 0 || i + dir >= ids.length) return;
  [ids[i], ids[i + dir]] = [ids[i + dir], ids[i]];
  await act("/api/os/resources/reorder", { body: { ids } });
  await d.reload();
}

async function checkOne(d: Ctx, row: Row) {
  const r = await act<{ dead: boolean; status: number | null }>(`/api/os/resources/${row.id}/check`, { method: "POST" });
  d.say(r.ok, r.ok ? (r.data.dead ? `Still dead (${r.data.status ?? "no response"}) — fix the URL.` : `Alive (${r.data.status}).`) : r.msg);
  await d.reload();
}

async function renameCategory(d: Ctx, g: string) {
  const to = prompt(`Rename category "${g}" to:`, g);
  if (!to || to === g) return;
  const r = await act("/api/os/resources/category/rename", { body: { group: g, to } });
  d.say(r.ok, r.ok ? `Renamed — /resources shows "${to}".` : r.msg);
  await d.reload();
}

/** Refused with 409 while the category holds links; the confirm names them and the second call cascades. */
async function deleteCategory(d: Ctx, g: string) {
  const first = await act("/api/os/resources/category/delete", { body: { group: g } });
  if (first.ok) d.say(true, "Category removed.");
  else if (first.status !== 409) d.say(false, first.msg);
  else {
    const names = ((first.err?.links as string[]) ?? []).join(", ");
    if (!confirm(`"${g}" still holds: ${names}. Delete the category AND every link in it?`)) return;
    const r = await act("/api/os/resources/category/delete", { body: { group: g, cascade: true } });
    d.say(r.ok, r.ok ? `Deleted the category and ${String((r.data as { deleted?: number }).deleted ?? 0)} link(s).` : r.msg);
  }
  await d.reload();
}

async function moveCategory(d: Ctx, g: string, dir: -1 | 1) {
  const order = [...d.groups.keys()];
  const i = order.indexOf(g);
  if (i + dir < 0 || i + dir >= order.length) return;
  [order[i], order[i + dir]] = [order[i + dir], order[i]];
  await act("/api/os/resources/category/reorder", { body: { groups: order } });
  await d.reload();
}

async function runBulk(d: Ctx, commit: boolean) {
  const bulk = d.bulk;
  if (!bulk) return;
  d.setBusy(true);
  const r = await act<{ rows?: Row[]; created?: number; skipped?: number }>("/api/os/resources/bulk", {
    body: { group: bulk.group, text: bulk.text, dry_run: !commit },
  });
  d.setBusy(false);
  if (!r.ok) return d.say(false, r.msg);
  if (!commit) return d.setBulk({ ...bulk, preview: r.data.rows ?? [] });
  d.say(true, `Added ${r.data.created} link(s), skipped ${r.data.skipped}.`);
  d.setBulk(null);
  await d.reload();
}

export function useResourceWrites(d: Ctx) {
  return {
    save: (v: Record<string, unknown>) => save(d, v),
    remove: (id: string) => remove(d, id),
    move: (row: Row, dir: -1 | 1) => move(d, row, dir),
    checkOne: (row: Row) => checkOne(d, row),
    renameCategory: (g: string) => renameCategory(d, g),
    deleteCategory: (g: string) => deleteCategory(d, g),
    moveCategory: (g: string, dir: -1 | 1) => moveCategory(d, g, dir),
    runBulk: (commit: boolean) => runBulk(d, commit),
  };
}
