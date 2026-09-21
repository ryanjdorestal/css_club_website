/** /os/resources — the curated link groups (inline edit, add, reorder within
    a group) + the site's own links (Discord invite, forms…) as a spec sheet
    with edit-in-place + "Check all links". This is how the board updates the
    Discord invite without a deploy. */
import { useMemo, useState } from "react";
import { resourcesSpec } from "./ui/specs";
import { FolderCard } from "@/components/cards/FolderCard";
import { OsPage, Notice, Panel, KeyVal } from "./ui/OsPage";
import { OsTable, StatusWord, type Row } from "./ui/OsTable";
import { OsForm, type Field } from "./ui/OsForm";
import { act, useNotice, useOsList } from "./ui/useOs";
import { Button } from "@/components/Button";
import { MonoLabel } from "@/components/MonoLabel";
import { BulkPaste, type Bulk } from "./resources/BulkPaste";
import { DeadLinkReport } from "./resources/DeadLinkReport";
import { useResourceWrites } from "./resources/useResourceWrites";

const FIELDS: Field[] = [
  { name: "group", label: "GROUP", required: true, placeholder: "General Knowledge" },
  { name: "title", label: "TITLE", required: true },
  { name: "url", label: "URL", type: "url", required: true },
  { name: "description", label: "DESCRIPTION", type: "textarea", rows: 3 },
];

export default function OsResources() {
  const res = useOsList("/api/os/resources");
  const links = useOsList("/api/os/links");
  const [sel, setSel] = useState<Row | "new" | null>(null);
  const [editLink, setEditLink] = useState<Row | null>(null);
  const [check, setCheck] = useState<{ checked: number; dead: Row[] } | null>(null);
  const [deadOnly, setDeadOnly] = useState(false);
  const [bulk, setBulk] = useState<Bulk | null>(null);
  const { notice, say } = useNotice();
  const [busy, setBusy] = useState(false);

  const groups = useMemo(() => {
    const m = new Map<string, Row[]>();
    const sorted = [...res.rows].sort((a, b) => Number(a.group_sort ?? 0) - Number(b.group_sort ?? 0) || Number(a.sort ?? 0) - Number(b.sort ?? 0));
    for (const r of sorted) {
      if (deadOnly && !r.dead) continue;
      m.set(String(r.group), [...(m.get(String(r.group)) ?? []), r]);
    }
    return m;
  }, [res.rows, deadOnly]);

  const writes = useResourceWrites({ reload: res.reload, groups, say, setBusy, sel, bulk, setBulk, setSel });
  const { save, remove, move, checkOne, renameCategory, deleteCategory, moveCategory, runBulk } = writes;
  async function runCheck() {
    setBusy(true);
    const r = await act<{ checked: number; dead: Row[] }>("/api/os/links/check", { method: "POST" });
    if (r.ok) setCheck(r.data);
    say(r.ok, r.ok ? `Checked ${r.data.checked} links — ${r.data.dead.length} dead.` : r.msg);
    setBusy(false);
    await Promise.all([res.reload(), links.reload()]);
  }
  async function saveLink(v: Record<string, unknown>) {
    if (!editLink) return;
    setBusy(true);
    const r = await act(`/api/os/links/${editLink.key}`, { method: "PATCH", body: { url: v.url, label: v.label } });
    say(r.ok, r.ok ? `${editLink.key} updated — the public site reads it now.` : r.msg);
    setBusy(false);
    await links.reload();
    if (r.ok) setEditLink(null);
  }

  return (
    <OsPage
      dash={resourcesSpec(res.rows, links.rows, res.source !== "loading")}
      kicker="RESOURCES · LINKS · LINK CHECK"
      title="Resources"
      source={res.source}
      actions={
        <>
          <Button variant="ghost" disabled={busy} onClick={runCheck}>
            {busy ? "checking…" : "check all links"}
          </Button>
          <Button variant="ghost" onClick={() => setSel("new")}>
            + add link
          </Button>
        </>
      }
      notHere={[
        "No link-rot service — 'Check all links' is a plain HEAD/GET from the API with a 6 s timeout; run it each semester.",
        "No drag-and-drop — ↑/↓ reorders within a group; groups are ordered as in data/resources.json.",
        "Verified-by-a-human is still the rule: a 200 is not an endorsement.",
      ]}
    >
      {notice && <Notice kind={notice.kind}>{notice.text}</Notice>}
      <div className="flex flex-wrap gap-2 mt-4">
        <Button variant="ghost" onClick={() => setBulk({ group: [...groups.keys()][0] ?? "General", text: "" })}>
          bulk paste urls
        </Button>
        <button
          onClick={() => setDeadOnly(!deadOnly)}
          aria-pressed={deadOnly}
          className={`t-micro raise border px-3 py-1.5 cursor-pointer ${deadOnly ? "border-(--color-red-hi) text-(--color-red-hi)" : "border-line text-muted"}`}
        >
          dead only
        </button>
      </div>
      {bulk && <BulkPaste bulk={bulk} setBulk={setBulk} busy={busy} onRun={runBulk} />}
      {check && <DeadLinkReport check={check} />}

      <section className="mt-6">
        <MonoLabel accent>SITE LINKS · edit in place</MonoLabel>
        <div className="mt-2 max-w-[820px]">
          <KeyVal
            rows={links.rows.map((l) => ({
              k: String(l.key).toUpperCase(),
              v: (
                <span className="flex items-center gap-3 flex-wrap">
                  <span className="font-mono text-[12px] break-all">{String(l.url)}</span>
                  {l.dead ? <StatusWord s="dead" /> : l.last_status ? <StatusWord s={`${l.last_status}`} /> : null}
                  <button onClick={() => setEditLink(l)} className="t-micro text-teal u-draw cursor-pointer">
                    edit
                  </button>
                </span>
              ),
            }))}
          />
        </div>
      </section>

      {/* run 9 §3: each category is a folder (T11), the table inside */}
      {[...groups.entries()].map(([g, rows], gi) => (
        <FolderCard
          key={g}
          as="article"
          tab={`RES · ${String.fromCharCode(65 + gi)} · ${g.toUpperCase()}`}
          tone="os"
          tabFrac={0.5}
          edgeLabel={`//RES_${String(gi + 1).padStart(2, "0")} · ${rows.length}_LINKS`}
          className="mt-6"
        >
          <div className="-mt-1">
            <div className="flex gap-3 mb-2 t-micro" data-testid={`category-${g}`}>
              <button onClick={() => renameCategory(g)} className="text-teal u-draw cursor-pointer">
                rename
              </button>
              <button onClick={() => moveCategory(g, -1)} className="text-muted hover:text-ink cursor-pointer" aria-label={`Move ${g} up`}>
                ▲ up
              </button>
              <button onClick={() => moveCategory(g, 1)} className="text-muted hover:text-ink cursor-pointer" aria-label={`Move ${g} down`}>
                ▼ down
              </button>
              <button onClick={() => deleteCategory(g)} className="text-(--color-red-hi) cursor-pointer">
                delete category
              </button>
            </div>
            <OsTable
              cols={[
                { key: "title", label: "TITLE", render: (r) => <span className="text-ink">{String(r.title)}</span> },
                { key: "url", label: "URL", mono: true, render: (r) => <span className="break-all">{String(r.url)}</span> },
                {
                  key: "last_status",
                  label: "LAST CHECK",
                  render: (r) => (r.dead ? <StatusWord s="dead" /> : r.last_status ? <StatusWord s={String(r.last_status)} /> : "—"),
                },
                {
                  key: "sort",
                  label: "",
                  width: "90px",
                  render: (r) => (
                    <span className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => move(r, -1)} className="text-muted hover:text-ink cursor-pointer">
                        ↑
                      </button>
                      <button onClick={() => move(r, 1)} className="text-muted hover:text-ink cursor-pointer">
                        ↓
                      </button>
                    </span>
                  ),
                },
              ]}
              rows={rows}
              onRow={setSel}
              actions={[
                { label: "EDIT", onClick: (r) => setSel(r) },
                { label: "RE-CHECK", onClick: (r) => void checkOne(r) },
                { label: "DELETE", onClick: (r) => void remove(String(r.id)), danger: true },
              ]}
            />
          </div>
        </FolderCard>
      ))}

      {sel && (
        <Panel title={sel === "new" ? "ADD LINK" : `LINK · ${String(sel.id)}`} onClose={() => setSel(null)}>
          <OsForm
            key={sel === "new" ? "new" : String(sel.id)}
            fields={FIELDS}
            initial={sel === "new" ? {} : sel}
            busy={busy}
            onSubmit={save}
            extra={
              sel !== "new" && (
                <Button type="button" variant="ghost" onClick={() => remove(String(sel.id))}>
                  delete
                </Button>
              )
            }
          />
        </Panel>
      )}
      {editLink && (
        <Panel title={`SITE LINK · ${String(editLink.key)}`} onClose={() => setEditLink(null)}>
          <OsForm
            fields={[
              { name: "label", label: "LABEL" },
              { name: "url", label: "URL", required: true },
            ]}
            initial={editLink}
            busy={busy}
            onSubmit={saveLink}
          />
        </Panel>
      )}
    </OsPage>
  );
}
