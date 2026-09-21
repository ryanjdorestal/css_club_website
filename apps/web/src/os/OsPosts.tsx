/** /os/posts — write News posts. List (status · author · date, searchable, sortable, CSV) →
    editor with a markdown toolbar + live preview (same md.ts as /news), word count, cover
    upload/replace/remove, slug with a live uniqueness check, save draft / review / publish /
    unpublish / archive / unarchive / duplicate / delete draft, PREVIEW ↗, 409 on stale saves. */
import { useState } from "react";
import { postsSpec } from "./ui/specs";
import { OsPage, Chips, ConflictBlock, Empty, Panel } from "./ui/OsPage";
import { ListTools, OsTable, StatusWord, ago, useListTools, type Row } from "./ui/OsTable";
import { OsForm, type Field } from "./ui/OsForm";
import { useOsList } from "./ui/useOs";
import { useEntity } from "./ui/useEntity";
import { Button } from "@/components/Button";
import { Upload } from "./ui/Upload";

const VIEWS = ["all", "draft", "review", "published", "archived"] as const;
const FIELDS: Field[] = [
  { name: "title", label: "TITLE", required: true, max: 200 },
  { name: "slug", label: "SLUG", pattern: "slug", max: 120, help: "auto from the title; editable before the first publish", placeholder: "fall-kickoff" },
  { name: "dek", label: "DEK", placeholder: "one line under the title", max: 400 },
  { name: "tags", label: "TAGS", type: "tags", placeholder: "bulletin, ctf" },
  { name: "body_md", label: "BODY (MARKDOWN)", type: "markdown", rows: 16, max: 60000 },
];
const SEARCH = ["title", "slug", "dek", "author_name"];

export default function OsPosts() {
  const [view, setView] = useState<(typeof VIEWS)[number]>("all");
  const { rows, source, reload } = useOsList("/api/os/posts");
  const [sel, setSel] = useState<Row | "new" | null>(null);
  const [cover, setCover] = useState<string>("");
  const E = useEntity("/api/os/posts", { name: "post", reload, publicHref: (r) => `/news/${String(r.slug)} ↗`, deletable: (r) => r.status === "draft" });
  const tools = useListTools(
    rows.filter((r) => view === "all" || r.status === view),
    SEARCH,
  );

  const slugTaken = (slug: unknown, id?: unknown) => !!slug && rows.some((r) => r.slug === slug && r.id !== id);

  async function save(v: Record<string, unknown>, status?: string, overwrite = false) {
    if (slugTaken(v.slug, sel !== "new" && sel ? sel.id : undefined)) {
      E.setServerError({ code: "conflict", message: `slug "${String(v.slug)}" is already used by another post`, field: "slug" });
      return;
    }
    const body = {
      title: v.title,
      slug: v.slug || undefined,
      dek: v.dek ?? "",
      tags: v.tags ?? [],
      body_md: v.body_md ?? "",
      cover_path: cover || null,
      ...(status ? { status } : {}),
      updated_at: sel !== "new" && sel ? sel.updated_at : undefined,
    };
    const r = await E.save(sel === "new" ? null : String((sel as Row).id), body, overwrite);
    if (r.ok) setSel(null);
  }
  const open = (r: Row) => {
    setCover(String(r.cover_path ?? ""));
    setSel(r);
  };
  const initial = sel && sel !== "new" ? { title: sel.title, slug: sel.slug, dek: sel.dek, tags: sel.tags, body_md: sel.body_md } : {};
  return (
    <OsPage
      dash={postsSpec(rows, source !== "loading")}
      kicker="NEWS · BULLETINS · BLOG"
      title="Posts"
      source={source}
      actions={
        <Button
          variant="ghost"
          onClick={() => {
            setCover("");
            setSel("new");
          }}
        >
          + new post
        </Button>
      }
      notHere={[
        "No rich-text editor — markdown with a toolbar and a live preview is what ships; headings and paragraphs are all /news renders.",
        "No scheduled-at — publish is now; write it as a draft until then (a scheduler needs a cron and a key the club would own).",
        "No comments or reactions on the public site — News is a bulletin board, not a feed.",
        "Cover images are resized to 1600 px and EXIF-stripped; no cropper — crop before uploading.",
      ]}
    >
      <ListTools tools={tools} name="posts" sortKeys={["updated_at", "published_at", "title", "status"]} total={rows.length}>
        <Chips options={VIEWS} value={view} onChange={setView} />
      </ListTools>
      <div className="mt-4">
        <OsTable
          cols={[
            { key: "title", label: "TITLE", render: (r) => <span className="text-ink">{String(r.title)}</span> },
            { key: "status", label: "STATUS", render: (r) => <StatusWord s={r.status} /> },
            { key: "author_name", label: "AUTHOR" },
            { key: "published_at", label: "PUBLISHED", mono: true },
            { key: "updated_at", label: "UPDATED", mono: true, render: (r) => ago(r.updated_at) },
          ]}
          rows={tools.shown}
          onRow={open}
          actions={E.actions(open, [
            { label: "PUBLISH", onClick: (r) => void E.publish(r), hidden: (r) => !["draft", "review"].includes(String(r.status)) },
            { label: "PREVIEW ↗", onClick: (r) => window.open(`/news/${String(r.slug)}?preview=1`, "_blank") },
          ])}
          empty={
            <Empty action={{ label: "NEW_POST", onClick: () => setSel("new") }}>
              Posts are what /news lists. Nothing matches this filter — write a draft, send it to review or publish it, and it appears on the public site.
            </Empty>
          }
        />
      </div>
      {sel && (
        <Panel title={sel === "new" ? "NEW POST" : `POST · ${String(sel.slug)}`} onClose={() => setSel(null)} wide>
          {E.conflict && (
            <ConflictBlock
              err={E.conflict}
              onReload={() => {
                E.setConflict(null);
                const fresh = rows.find((r) => r.id === (sel as Row).id);
                if (fresh) open(fresh);
              }}
              onOverwrite={() => void save(initial, undefined, true)}
            />
          )}
          {sel !== "new" && String(sel.status) === "published" && (
            <p className="t-micro text-green mb-3">
              Published to{" "}
              <a className="u-draw" href={`/news/${String(sel.slug)}`} target="_blank" rel="noreferrer">
                /news/{String(sel.slug)} ↗
              </a>
            </p>
          )}
          <Upload label="COVER IMAGE" value={cover} onChange={setCover} />
          <OsForm
            key={sel === "new" ? "new" : String(sel.id)}
            fields={FIELDS}
            initial={initial}
            busy={E.busy}
            serverError={E.serverError}
            draftKey={sel === "new" ? "post-new" : `post-${String(sel.id)}`}
            onSubmit={(v) => save(v)}
            submitLabel=">_save_draft"
            extra={
              <>
                {sel !== "new" && String(sel.status) === "draft" && (
                  <Button type="button" variant="ghost" disabled={E.busy} onClick={() => save(initial, "review")}>
                    send to review
                  </Button>
                )}
                {sel !== "new" && ["draft", "review"].includes(String(sel.status)) && (
                  <Button type="button" variant="primary" disabled={E.busy} onClick={() => void E.publish(sel).then(() => setSel(null))}>
                    publish
                  </Button>
                )}
                {sel !== "new" && String(sel.status) === "published" && (
                  <Button type="button" variant="ghost" disabled={E.busy} onClick={() => void E.unpublish(sel).then(() => setSel(null))}>
                    unpublish
                  </Button>
                )}
              </>
            }
          />
        </Panel>
      )}
    </OsPage>
  );
}
