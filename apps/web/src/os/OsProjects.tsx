/** /os/projects — review queue + the curated public Projects list.
    Queue: submitted / in review with a review panel (spec sheet, decision
    buttons, note required on request-changes). Published: featured toggle,
    up/down reorder. "Add on behalf of a student" uses the same fields. */
import { useMemo, useState } from "react";
import { projectsSpec } from "./ui/specs";
import { OsPage, Chips, KeyVal, Panel, Notice } from "./ui/OsPage";
import { OsTable, StatusWord, ago, type Row } from "./ui/OsTable";
import { OsForm, type Field } from "./ui/OsForm";
import { act, useNotice, useOsList } from "./ui/useOs";
import { Button } from "@/components/Button";

const VIEWS = ["queue", "published", "archived", "add"] as const;
const KINDS = ["app", "project", "research", "tool"] as const;
const FIELDS: Field[] = [
  { name: "title", label: "TITLE", required: true },
  { name: "kind", label: "KIND", type: "select", options: KINDS, required: true },
  { name: "summary", label: "SUMMARY", type: "textarea", required: true },
  { name: "authors_text", label: "AUTHORS", type: "tags", help: "names, comma separated" },
  { name: "platform", label: "PLATFORM", type: "tags", placeholder: "web, ios" },
  { name: "stack", label: "STACK", type: "tags", placeholder: "React, Python" },
  { name: "repo", label: "REPO URL", type: "url" },
  { name: "live", label: "LIVE URL", type: "url" },
  { name: "benefits_jj", label: "FOR JOHN JAY", type: "textarea", rows: 2 },
  { name: "term", label: "TERM", placeholder: "F26" },
];

export default function OsProjects() {
  const [view, setView] = useState<(typeof VIEWS)[number]>("queue");
  const { rows, source, reload } = useOsList("/api/os/projects");
  const [sel, setSel] = useState<Row | null>(null);
  const [note, setNote] = useState("");
  const { notice, say } = useNotice();
  const [busy, setBusy] = useState(false);

  const groups = useMemo(() => {
    const st = (r: Row) => String(r.status);
    return {
      queue: rows.filter((r) => ["submitted", "in_review", "changes_requested", "approved"].includes(st(r))),
      published: rows.filter((r) => st(r) === "published").sort((a, b) => Number(a.display_order ?? 0) - Number(b.display_order ?? 0)),
      archived: rows.filter((r) => st(r) === "archived"),
    };
  }, [rows]);

  async function decide(id: string, decision: string) {
    if (decision === "request_changes" && !note.trim()) return say(false, "A note is required when requesting changes.");
    setBusy(true);
    const r = await act(`/api/os/projects/${id}/decide`, { body: { decision, note } });
    say(r.ok, r.ok ? `Decision recorded: ${decision.replace("_", " ")}.` : r.msg);
    setBusy(false);
    await reload();
    setSel(null);
  }
  async function publish(id: string) {
    const r = await act(`/api/os/projects/${id}/publish`, { method: "POST" });
    say(r.ok, r.ok ? "Published to /projects." : r.msg);
    await reload();
    setSel(null);
  }
  async function move(id: string, dir: -1 | 1) {
    const ids = groups.published.map((r) => String(r.id));
    const i = ids.indexOf(id);
    if (i < 0 || i + dir < 0 || i + dir >= ids.length) return;
    [ids[i], ids[i + dir]] = [ids[i + dir], ids[i]];
    await act("/api/os/projects/reorder", { body: { ids } });
    await reload();
  }
  async function toggleFeatured(r: Row) {
    if (r.featured) await act(`/api/os/projects/${r.id}`, { method: "PATCH", body: { title: r.title, featured: false } });
    else await act(`/api/os/projects/${r.id}/feature`, { method: "POST" });
    await reload();
  }
  async function add(v: Record<string, unknown>) {
    setBusy(true);
    const authors = (Array.isArray(v.authors_text) ? v.authors_text : []).map((n) => ({ name: String(n) }));
    const r = await act("/api/os/projects", {
      body: {
        title: v.title,
        kind: v.kind,
        summary: v.summary,
        platform: v.platform ?? [],
        stack: v.stack ?? [],
        links: { repo: v.repo ?? "", live: v.live ?? "" },
        benefits_jj: v.benefits_jj ?? "",
        authors,
        term: v.term ?? "",
        status: "approved",
      },
    });
    say(r.ok, r.ok ? "Added — it is in the queue as approved; publish it when ready." : r.msg);
    setBusy(false);
    await reload();
    setView("queue");
  }

  const cols = [
    { key: "title", label: "TITLE", render: (r: Row) => <span className="text-ink">{String(r.title)}</span> },
    { key: "kind", label: "KIND", mono: true },
    { key: "status", label: "STATUS", render: (r: Row) => <StatusWord s={r.status} /> },
    { key: "authors", label: "AUTHORS", render: (r: Row) => (Array.isArray(r.authors) ? r.authors.map((a) => (a as { name: string }).name).join(", ") : "—") },
    { key: "updated_at", label: "UPDATED", mono: true, render: (r: Row) => ago(r.updated_at) },
  ];

  return (
    <OsPage
      dash={projectsSpec(rows, source !== "loading")}
      kicker="PROJECTS · APPS · ONE QUEUE"
      title="Projects"
      source={source}
      actions={
        <Chips
          options={VIEWS}
          value={view}
          onChange={setView}
          counts={{ queue: groups.queue.length, published: groups.published.length, archived: groups.archived.length }}
        />
      }
      notHere={[
        "No GitHub sync — the repo link is whatever the student typed; the board click-tests it before publishing.",
        "No screenshot uploads yet — screenshots are URLs (or /api/os/uploads paths) until the board asks for a gallery.",
        "No public voting or comments — review is the board's call, with a written note the student can read.",
      ]}
    >
      {notice && <Notice kind={notice.kind}>{notice.text}</Notice>}
      {view === "add" ? (
        <div className="max-w-[820px] mt-4">
          <OsForm fields={FIELDS} onSubmit={add} busy={busy} submitLabel=">_add_project" />
        </div>
      ) : (
        <div className="mt-4">
          <OsTable
            cols={view === "published" ? [...cols, { key: "featured", label: "FEATURED", render: (r: Row) => (r.featured ? "★" : "") }] : cols}
            rows={groups[view]}
            onRow={setSel}
            selected={sel ? String(sel.id) : null}
            empty={view === "queue" ? "No submissions waiting. The public form on /projects lands here (offline: in the inbox too)." : "Nothing here."}
          />
        </div>
      )}

      {sel && (
        <Panel title={`PROJECT · ${String(sel.kind).toUpperCase()} · ${String(sel.id).slice(-8)}`} onClose={() => setSel(null)} wide>
          <h2 className="font-display font-bold text-xl mb-4">{String(sel.title)}</h2>
          <KeyVal
            rows={[
              { k: "STATUS", v: <StatusWord s={sel.status} /> },
              { k: "SUMMARY", v: String(sel.summary ?? "") },
              { k: "AUTHORS", v: Array.isArray(sel.authors) ? sel.authors.map((a) => (a as { name: string }).name).join(", ") : "—" },
              { k: "EMAIL", v: String(sel.author_email ?? "—") },
              { k: "PLATFORM", v: Array.isArray(sel.platform) ? sel.platform.join(" · ") : "—" },
              {
                k: "LINKS",
                v: Object.entries((sel.links as Record<string, string>) ?? {})
                  .filter(([, u]) => u)
                  .map(([k, u]) => (
                    <a key={k} href={u} target="_blank" rel="noreferrer" className="text-teal u-draw mr-3">
                      {k} ↗
                    </a>
                  )),
              },
              { k: "FOR JOHN JAY", v: String(sel.benefits_jj ?? "") },
              { k: "REVIEW NOTES", v: String(sel.review_notes ?? "") },
              { k: "REVIEWED BY", v: String(sel.reviewed_by ?? "") },
            ]}
          />
          {String(sel.status) !== "published" && String(sel.status) !== "archived" && (
            <div className="mt-5">
              <label className="block mb-3">
                <span className="mono-label text-muted">NOTE TO THE STUDENT (required for request-changes)</span>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  className="w-full bg-transparent border border-line px-3 py-2 font-mono text-[13px] text-ink focus:border-teal outline-none mt-1"
                />
              </label>
              <div className="flex flex-wrap gap-2">
                {String(sel.status) === "submitted" && (
                  <Button variant="ghost" disabled={busy} onClick={() => decide(String(sel.id), "in_review")}>
                    start review
                  </Button>
                )}
                {String(sel.status) !== "approved" && (
                  <Button variant="ghost" disabled={busy} onClick={() => decide(String(sel.id), "approve")}>
                    approve
                  </Button>
                )}
                <Button variant="ghost" disabled={busy} onClick={() => decide(String(sel.id), "request_changes")}>
                  request changes
                </Button>
                {String(sel.status) === "approved" && (
                  <Button variant="primary" disabled={busy} onClick={() => publish(String(sel.id))}>
                    publish
                  </Button>
                )}
                <Button variant="ghost" disabled={busy} onClick={() => decide(String(sel.id), "archive")}>
                  archive
                </Button>
              </div>
            </div>
          )}
          {String(sel.status) === "published" && (
            <div className="flex flex-wrap gap-2 mt-5">
              <Button variant="ghost" onClick={() => toggleFeatured(sel)}>
                {sel.featured ? "unfeature" : "feature"}
              </Button>
              <Button variant="ghost" onClick={() => move(String(sel.id), -1)}>
                ↑ up
              </Button>
              <Button variant="ghost" onClick={() => move(String(sel.id), 1)}>
                ↓ down
              </Button>
              <Button variant="ghost" onClick={() => decide(String(sel.id), "archive")}>
                archive
              </Button>
            </div>
          )}
        </Panel>
      )}
    </OsPage>
  );
}
