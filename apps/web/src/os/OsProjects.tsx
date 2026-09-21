/** /os/projects — review queue + the curated public Projects list.
    Queue: submitted / in review with a review panel (spec sheet, decision
    buttons, note required on request-changes). Published: featured toggle,
    up/down reorder. "Add on behalf of a student" uses the same fields. */
import { useMemo, useState } from "react";
import { projectsSpec } from "./ui/specs";
import { OsPage, Chips, Panel, Notice, Empty } from "./ui/OsPage";
import { OsTable, StatusWord, ago, type Row } from "./ui/OsTable";
import { OsForm, type Field } from "./ui/OsForm";
import { useNotice, useOsList } from "./ui/useOs";
import { useEntity } from "./ui/useEntity";
import { ReviewPanel } from "./projects/ReviewPanel";
import { useProjectWrites } from "./projects/useProjectWrites";
import { ListTools, useListTools } from "./ui/OsTable";

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
  const E = useEntity("/api/os/projects", { name: "project", reload, publicHref: () => "/projects ↗", deletable: () => false });
  const [editing, setEditing] = useState<Row | null>(null);

  const groups = useMemo(() => {
    const st = (r: Row) => String(r.status);
    return {
      queue: rows.filter((r) => ["submitted", "in_review", "changes_requested", "approved"].includes(st(r))),
      published: rows.filter((r) => st(r) === "published").sort((a, b) => Number(a.display_order ?? 0) - Number(b.display_order ?? 0)),
      archived: rows.filter((r) => st(r) === "archived"),
    };
  }, [rows]);

  const writes = useProjectWrites({ reload, say, setBusy, setSel, setEditing, setView, note, editing, published: groups.published, save: E.save });
  const { decide, publish, move, toggleFeatured, unpublish, saveEdit, add } = writes;

  const cols = [
    { key: "title", label: "TITLE", render: (r: Row) => <span className="text-ink">{String(r.title)}</span> },
    { key: "kind", label: "KIND", mono: true },
    { key: "status", label: "STATUS", render: (r: Row) => <StatusWord s={r.status} /> },
    { key: "authors", label: "AUTHORS", render: (r: Row) => (Array.isArray(r.authors) ? r.authors.map((a) => (a as { name: string }).name).join(", ") : "—") },
    { key: "updated_at", label: "UPDATED", mono: true, render: (r: Row) => ago(r.updated_at) },
  ];

  const tools = useListTools(view === "add" ? [] : groups[view], ["title", "kind", "summary"], "updated_at");

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
        "Screenshots are URLs (or /api/os/uploads paths) — a gallery with cropping and ordering is in docs/LATER.md.",
        "No public voting or comments — review is the board's call, with a written note the student can read.",
      ]}
    >
      {notice && <Notice kind={notice.kind}>{notice.text}</Notice>}
      {view === "add" ? (
        <div className="max-w-[820px] mt-4">
          <OsForm fields={FIELDS} onSubmit={add} busy={busy} submitLabel=">_add_project" />
        </div>
      ) : (
        <div>
          <ListTools
            tools={tools}
            name={`projects-${view}`}
            sortKeys={["updated_at", "title", "kind", "status", "display_order"]}
            total={groups[view].length}
          />
          <div className="mt-4">
            <OsTable
              cols={view === "published" ? [...cols, { key: "featured", label: "FEATURED", render: (r: Row) => (r.featured ? "★" : "") }] : cols}
              rows={tools.shown}
              onRow={setSel}
              selected={sel ? String(sel.id) : null}
              actions={[
                { label: "EDIT", onClick: (r) => setEditing(r) },
                { label: "UNPUBLISH", onClick: (r) => void unpublish(r), hidden: (r) => r.status !== "published" },
                { label: "ARCHIVE", onClick: (r) => void E.archive(r), hidden: (r) => r.status === "archived" },
                { label: "UNARCHIVE", onClick: (r) => void E.unarchive(r), hidden: (r) => r.status !== "archived" },
                { label: "DUPLICATE", onClick: (r) => void E.duplicate(r) },
              ]}
              empty={
                <Empty action={{ label: "ADD_ON_BEHALF_OF_A_STUDENT", onClick: () => setView("add") }}>
                  {view === "queue"
                    ? "The review queue: the public form on /projects lands here as SUBMITTED (offline: in the inbox too). Nothing is waiting."
                    : `Nothing ${view} yet — approve a submission and publish it, and it lists here.`}
                </Empty>
              }
            />
          </div>
        </div>
      )}

      {sel && (
        <ReviewPanel
          project={sel}
          note={note}
          setNote={setNote}
          busy={busy}
          onClose={() => setSel(null)}
          onEdit={() => setEditing(sel)}
          onDecide={(decision) => decide(String(sel.id), decision)}
          onPublish={() => publish(String(sel.id))}
          onFeature={() => toggleFeatured(sel)}
          onUnpublish={() => unpublish(sel)}
          onMove={(dir) => move(String(sel.id), dir)}
        />
      )}
      {editing && (
        <Panel title={`EDIT · ${String(editing.title)}`} onClose={() => setEditing(null)} wide>
          <OsForm
            key={String(editing.id)}
            fields={FIELDS}
            initial={{
              ...editing,
              repo: (editing.links as Record<string, string> | undefined)?.repo ?? "",
              live: (editing.links as Record<string, string> | undefined)?.live ?? "",
              authors_text: Array.isArray(editing.authors) ? editing.authors.map((a) => (a as { name: string }).name) : [],
            }}
            busy={E.busy}
            serverError={E.serverError}
            draftKey={`project-${String(editing.id)}`}
            onSubmit={saveEdit}
          />
        </Panel>
      )}
    </OsPage>
  );
}
