/** The actions every entity inherits (run 10 §6, CONTRIBUTING "adding an entity"): save (create /
    patch with 409 handling), publish / unpublish, archive / unarchive, duplicate, delete — each with
    a toast, an UNDO where the inverse is cheap, a typed confirm where a row is lost, and the audit
    happening server-side. A page passes its base path and gets back `actions` for OsTable and the
    helpers for its panel. `conflict` holds the 409 payload so the page can render CHANGED_ELSEWHERE. */
import { useState } from "react";
import type { Row, RowAction } from "./OsTable";
import { act, type ApiError } from "./useOs";
import { useToast } from "./Toast";

export function useEntity(base: string, opts: { name: string; reload: () => Promise<void>; publicHref?: (r: Row) => string; deletable?: (r: Row) => boolean }) {
  const { toast, confirm } = useToast();
  const [busy, setBusy] = useState(false);
  const [conflict, setConflict] = useState<ApiError | null>(null);
  const [serverError, setServerError] = useState<ApiError | null>(null);

  const run = async (path: string, init?: Parameters<typeof act>[1], okText?: string, undo?: () => Promise<void>) => {
    setBusy(true);
    const r = await act(path, init);
    setBusy(false);
    if (r.ok) {
      toast(okText ?? r.msg, undo ? { undo } : undefined);
      setServerError(null);
      setConflict(null);
    } else if (r.status === 409 && r.err?.code === "conflict") setConflict(r.err);
    else {
      setServerError(r.err ?? null);
      toast(r.msg, { kind: "err" });
    }
    await opts.reload();
    return r;
  };

  const save = async (id: string | null, body: Row, overwrite = false) => {
    const init = id ? { method: "PATCH", body, expect: overwrite ? null : undefined } : { body };
    return run(id ? `${base}/${id}` : base, init, id ? "SAVED ✓" : `${opts.name} created ✓`);
  };
  const publish = async (r: Row) => {
    const res = await run(`${base}/${r.id}/publish`, { method: "POST" }, `Published${opts.publicHref ? ` → ${opts.publicHref(r)}` : ""}`, async () => {
      await run(`${base}/${r.id}/transition`, { method: "POST", body: { to: "draft" } }, "Undone — back to draft");
    });
    return res;
  };
  const unpublish = (r: Row) =>
    run(`${base}/${r.id}/transition`, { method: "POST", body: { to: "draft" } }, "Unpublished — off the public site", async () => {
      await run(`${base}/${r.id}/publish`, { method: "POST" }, "Undone — published again");
    });
  const archive = async (r: Row) => {
    if (
      !(await confirm({
        title: `Archive ${opts.name} "${String(r.title ?? r.name ?? r.display_name ?? r.id)}"?`,
        body: "Hidden from the public site; UNARCHIVE brings it back.",
        word: "ARCHIVE",
      }))
    )
      return;
    await run(`${base}/${r.id}/archive`, { method: "POST" }, "Archived", async () => {
      await run(`${base}/${r.id}/unarchive`, { method: "POST" }, "Undone — unarchived");
    });
  };
  const unarchive = (r: Row) => run(`${base}/${r.id}/unarchive`, { method: "POST" }, "Unarchived");
  const duplicate = (r: Row) => run(`${base}/${r.id}/duplicate`, { method: "POST" }, "Duplicated — the copy is a draft");
  const remove = async (r: Row) => {
    if (
      !(await confirm({
        title: `Delete ${opts.name} "${String(r.title ?? r.name ?? r.display_name ?? r.id)}"?`,
        body: "This cannot be undone. Archive keeps a copy instead.",
        word: "DELETE",
        danger: true,
      }))
    )
      return;
    await run(`${base}/${r.id}`, { method: "DELETE" }, "Deleted");
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

  return { busy, conflict, setConflict, serverError, setServerError, run, save, publish, unpublish, archive, unarchive, duplicate, remove, actions };
}
