/** Every write /os/projects makes: a review decision, publish, reorder, feature / unfeature, unpublish, the
    full-field edit, and adding a project on a student's behalf. Module-level functions with an explicit context. */
import { act } from "../ui/useOs";
import type { Row } from "../ui/OsTable";

type Ctx = {
  reload: () => Promise<void>;
  say: (ok: boolean, text: string) => void;
  setBusy: (b: boolean) => void;
  setSel: (r: Row | null) => void;
  setEditing: (r: Row | null) => void;
  setView: (v: "queue") => void;
  note: string;
  editing: Row | null;
  published: Row[];
  save: (id: string, body: Row) => Promise<{ ok: boolean }>;
};

/** The project body the API accepts, from the form's flat values (authors come in as a tag list). */
function projectBody(v: Record<string, unknown>): Row {
  const authors = (Array.isArray(v.authors_text) ? v.authors_text : []).map((n) => ({ name: String(n) }));
  return {
    title: v.title,
    kind: v.kind,
    summary: v.summary,
    platform: v.platform ?? [],
    stack: v.stack ?? [],
    links: { repo: v.repo ?? "", live: v.live ?? "" },
    benefits_jj: v.benefits_jj ?? "",
    authors,
    term: v.term ?? "",
  };
}

async function decide(d: Ctx, id: string, decision: string) {
  if (decision === "request_changes" && !d.note.trim()) return d.say(false, "A note is required when requesting changes.");
  d.setBusy(true);
  const r = await act(`/api/os/projects/${id}/decide`, { body: { decision, note: d.note } });
  d.say(r.ok, r.ok ? `Decision recorded: ${decision.replace("_", " ")}.` : r.msg);
  d.setBusy(false);
  await d.reload();
  d.setSel(null);
}

async function publish(d: Ctx, id: string) {
  const r = await act(`/api/os/projects/${id}/publish`, { method: "POST" });
  d.say(r.ok, r.ok ? "Published to /projects." : r.msg);
  await d.reload();
  d.setSel(null);
}

async function move(d: Ctx, id: string, dir: -1 | 1) {
  const ids = d.published.map((r) => String(r.id));
  const i = ids.indexOf(id);
  if (i < 0 || i + dir < 0 || i + dir >= ids.length) return;
  [ids[i], ids[i + dir]] = [ids[i + dir], ids[i]];
  await act("/api/os/projects/reorder", { body: { ids } });
  await d.reload();
}

async function toggleFeatured(d: Ctx, r: Row) {
  const res = await act(`/api/os/projects/${r.id}/${r.featured ? "unfeature" : "feature"}`, { method: "POST" });
  d.say(res.ok, res.ok ? (r.featured ? "Unfeatured." : "Featured — pinned to the top three on /projects.") : res.msg);
  await d.reload();
  d.setSel(null);
}

async function unpublish(d: Ctx, r: Row) {
  const res = await act(`/api/os/projects/${r.id}/unpublish`, { method: "POST" });
  d.say(res.ok, res.ok ? "Unpublished — back to approved; /projects no longer lists it." : res.msg);
  await d.reload();
  d.setSel(null);
}

async function saveEdit(d: Ctx, v: Record<string, unknown>) {
  if (!d.editing) return;
  const r = await d.save(String(d.editing.id), { ...projectBody(v), updated_at: d.editing.updated_at });
  if (!r.ok) return;
  d.setEditing(null);
  d.setSel(null);
}

async function add(d: Ctx, v: Record<string, unknown>) {
  d.setBusy(true);
  const r = await act("/api/os/projects", { body: { ...projectBody(v), status: "approved", client_id: v.client_id } });
  d.say(r.ok, r.ok ? "Added — it is in the queue as approved; publish it when ready." : r.msg);
  d.setBusy(false);
  await d.reload();
  d.setView("queue");
}

export function useProjectWrites(d: Ctx) {
  return {
    decide: (id: string, decision: string) => decide(d, id, decision),
    publish: (id: string) => publish(d, id),
    move: (id: string, dir: -1 | 1) => move(d, id, dir),
    toggleFeatured: (r: Row) => toggleFeatured(d, r),
    unpublish: (r: Row) => unpublish(d, r),
    saveEdit: (v: Record<string, unknown>) => saveEdit(d, v),
    add: (v: Record<string, unknown>) => add(d, v),
  };
}
