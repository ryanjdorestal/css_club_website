/** /os/posts — write News posts. List (status · author · date) → editor with
    a markdown textarea + live preview (same md.ts as /news), cover upload,
    save draft / send to review / publish. */
import { useState } from "react";
import { OsPage, Chips, Notice, Panel } from "./ui/OsPage";
import { OsTable, StatusWord, ago, type Row } from "./ui/OsTable";
import { OsForm, type Field } from "./ui/OsForm";
import { act, useNotice, useOsList } from "./ui/useOs";
import { Button } from "@/components/Button";
import { Upload } from "./ui/Upload";

const VIEWS = ["all", "draft", "review", "published", "archived"] as const;
const FIELDS: Field[] = [
  { name: "title", label: "TITLE", required: true },
  { name: "slug", label: "SLUG", help: "auto from the title; editable before the first publish", placeholder: "fall-kickoff" },
  { name: "dek", label: "DEK", placeholder: "one line under the title" },
  { name: "tags", label: "TAGS", type: "tags", placeholder: "bulletin, ctf" },
  { name: "body_md", label: "BODY (MARKDOWN)", type: "markdown", rows: 16 },
];

export default function OsPosts() {
  const [view, setView] = useState<(typeof VIEWS)[number]>("all");
  const { rows, source, reload } = useOsList("/api/os/posts");
  const [sel, setSel] = useState<Row | "new" | null>(null);
  const [cover, setCover] = useState<string>("");
  const { notice, say } = useNotice();
  const [busy, setBusy] = useState(false);
  const shown = rows.filter((r) => view === "all" || r.status === view);

  async function save(v: Record<string, unknown>, status?: string) {
    setBusy(true);
    const body = {
      title: v.title,
      slug: v.slug || undefined,
      dek: v.dek ?? "",
      tags: v.tags ?? [],
      body_md: v.body_md ?? "",
      cover_path: cover || undefined,
      ...(status ? { status } : {}),
    };
    const r = sel === "new" ? await act("/api/os/posts", { body }) : await act(`/api/os/posts/${(sel as Row).id}`, { method: "PATCH", body });
    say(r.ok, r.ok ? `Saved${status ? ` as ${status}` : ""}.` : r.msg);
    setBusy(false);
    await reload();
    if (r.ok) setSel(null);
  }
  async function publish(id: string) {
    const r = await act(`/api/os/posts/${id}/publish`, { method: "POST" });
    say(r.ok, r.ok ? `Published to /news/${id}` : r.msg);
    await reload();
    setSel(null);
  }

  const initial = sel && sel !== "new" ? { title: sel.title, slug: sel.slug, dek: sel.dek, tags: sel.tags, body_md: sel.body_md } : {};
  return (
    <OsPage
      kicker="NEWS · BULLETINS · BLOG"
      title="Posts"
      source={source}
      actions={
        <>
          <Chips options={VIEWS} value={view} onChange={setView} />
          <Button
            variant="ghost"
            onClick={() => {
              setCover("");
              setSel("new");
            }}
          >
            + new post
          </Button>
        </>
      }
      notHere={[
        "No rich-text editor — markdown with a live preview is what ships; headings and paragraphs are all /news renders.",
        "No scheduling — publish is now; write it as a draft until then.",
        "No comments or reactions on the public site — News is a bulletin board, not a feed.",
        "Cover images are resized to 1600 px; no cropper — crop before uploading.",
      ]}
    >
      {notice && <Notice kind={notice.kind}>{notice.text}</Notice>}
      <div className="mt-4">
        <OsTable
          cols={[
            { key: "title", label: "TITLE", render: (r) => <span className="text-ink">{String(r.title)}</span> },
            { key: "status", label: "STATUS", render: (r) => <StatusWord s={r.status} /> },
            { key: "author_name", label: "AUTHOR" },
            { key: "published_at", label: "PUBLISHED", mono: true },
            { key: "updated_at", label: "UPDATED", mono: true, render: (r) => ago(r.updated_at) },
          ]}
          rows={shown}
          onRow={(r) => {
            setCover(String(r.cover_path ?? ""));
            setSel(r);
          }}
          empty="No posts yet. The grad-school article is the only legacy post; write the Fall kickoff bulletin here."
        />
      </div>
      {sel && (
        <Panel title={sel === "new" ? "NEW POST" : `POST · ${String(sel.slug)}`} onClose={() => setSel(null)} wide>
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
            busy={busy}
            onSubmit={(v) => save(v)}
            submitLabel=">_save_draft"
            extra={
              <>
                {sel !== "new" && String(sel.status) === "draft" && (
                  <Button type="button" variant="ghost" disabled={busy} onClick={() => save(initial, "review")}>
                    send to review
                  </Button>
                )}
                {sel !== "new" && ["draft", "review"].includes(String(sel.status)) && (
                  <Button type="button" variant="primary" disabled={busy} onClick={() => publish(String(sel.id))}>
                    publish
                  </Button>
                )}
                {sel !== "new" && String(sel.status) === "published" && (
                  <Button type="button" variant="ghost" disabled={busy} onClick={() => save(initial, "archived")}>
                    archive
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
