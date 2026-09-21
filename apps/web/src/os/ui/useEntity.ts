/** The actions every entity inherits (run 10 §6, CONTRIBUTING "adding an entity"): save (create /
    patch with 409 handling), publish / unpublish, archive / unarchive, duplicate, delete — each with
    a toast, an UNDO where the inverse is cheap, a typed confirm where a row is lost, and the audit
    happening server-side. A page passes its base path and gets back `actions` for OsTable and the
    helpers for its panel. `conflict` holds the 409 payload so the page can render CHANGED_ELSEWHERE. */
import { useState } from "react";
import type { Row, RowAction } from "./OsTable";
import { act, type ApiError } from "./useOs";
import { useToast } from "./Toast";

type EntityOptions = { name: string; reload: () => Promise<void>; publicHref?: (r: Row) => string; deletable?: (r: Row) => boolean };
type Run = (path: string, init?: Parameters<typeof act>[1], done?: { ok?: string; undo?: () => Promise<void> }) => Promise<Awaited<ReturnType<typeof act>>>;

const labelOf = (r: Row) => String(r.title ?? r.name ?? r.display_name ?? r.id);

/** The write state every page needs: busy while a request is out, the 409 payload, the last server error. */
function useWriteState(reload: () => Promise<void>) {
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  const [conflict, setConflict] = useState<ApiError | null>(null);
  const [serverError, setServerError] = useState<ApiError | null>(null);
  const run: Run = async (path, init, done) => {
    setBusy(true);
    const r = await act(path, init);
    setBusy(false);
    if (r.ok) {
      toast(done?.ok ?? r.msg, done?.undo ? { undo: done.undo } : undefined);
      setServerError(null);
      setConflict(null);
    } else if (r.status === 409 && r.err?.code === "conflict") setConflict(r.err);
    else {
      setServerError(r.err ?? null);
      toast(r.msg, { kind: "err" });
    }
    await reload();
    return r;
  };
  return { busy, conflict, setConflict, serverError, setServerError, run };
}

/** publish / unpublish / archive / unarchive / duplicate, each with its inverse as the toast's UNDO. */
function lifecycleActions(base: string, run: Run, opts: EntityOptions) {
  type Done = { ok: string; undo?: () => Promise<void> };
  const transition = (r: Row, to: string, done: Done) => run(`${base}/${r.id}/transition`, { method: "POST", body: { to } }, done);
  const post = (r: Row, action: string, done: Done) => run(`${base}/${r.id}/${action}`, { method: "POST" }, done);
  const publish = (r: Row) =>
    post(r, "publish", {
      ok: `Published${opts.publicHref ? ` → ${opts.publicHref(r)}` : ""}`,
      undo: async () => {
        await transition(r, "draft", { ok: "Undone — back to draft" });
      },
    });
  const unpublish = (r: Row) =>
    transition(r, "draft", {
      ok: "Unpublished — off the public site",
      undo: async () => {
        await post(r, "publish", { ok: "Undone — published again" });
      },
    });
  const unarchive = (r: Row) => post(r, "unarchive", { ok: "Unarchived" });
  const archiveNow = (r: Row) =>
    post(r, "archive", {
      ok: "Archived",
      undo: async () => {
        await post(r, "unarchive", { ok: "Undone — unarchived" });
      },
    });
  const duplicate = (r: Row) => post(r, "duplicate", { ok: "Duplicated — the copy is a draft" });
  return { publish, unpublish, unarchive, archiveNow, duplicate };
}

export function useEntity(base: string, opts: EntityOptions) {
  const { confirm } = useToast();
  const state = useWriteState(opts.reload);
  const { run } = state;
  const { publish, unpublish, unarchive, archiveNow, duplicate } = lifecycleActions(base, run, opts);

  const save = (id: string | null, body: Row, overwrite = false) => {
    const init = id ? { method: "PATCH", body, expect: overwrite ? null : undefined } : { body };
    return run(id ? `${base}/${id}` : base, init, { ok: id ? "SAVED ✓" : `${opts.name} created ✓` });
  };
  const archive = async (r: Row) => {
    const ok = await confirm({
      title: `Archive ${opts.name} "${labelOf(r)}"?`,
      body: "Hidden from the public site; UNARCHIVE brings it back.",
      word: "ARCHIVE",
    });
    if (ok) await archiveNow(r);
  };
  const remove = async (r: Row) => {
    const ok = await confirm({
      title: `Delete ${opts.name} "${labelOf(r)}"?`,
      body: "This cannot be undone. Archive keeps a copy instead.",
      word: "DELETE",
      danger: true,
    });
    if (ok) await run(`${base}/${r.id}`, { method: "DELETE" }, { ok: "Deleted" });
  };

  const actions = (onEdit: (r: Row) => void, extra: RowAction[] = []): RowAction[] => [
    { label: "EDIT", onClick: onEdit },
    { label: "DUPLICATE", onClick: (r) => void duplicate(r) },
    { label: "UNPUBLISH", onClick: (r) => void unpublish(r), hidden: (r) => r.status !== "published" },
    { label: "ARCHIVE", onClick: (r) => void archive(r), hidden: (r) => r.status === "archived" || r.archived === true },
    { label: "UNARCHIVE", onClick: (r) => void unarchive(r), hidden: (r) => !(r.status === "archived" || r.archived === true) },
    ...extra,
    { label: "DELETE", onClick: (r) => void remove(r), danger: true, hidden: (r) => !(opts.deletable?.(r) ?? false) },
  ];

  return { ...state, save, publish, unpublish, archive, unarchive, duplicate, remove, actions };
}
