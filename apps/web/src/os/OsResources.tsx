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
import { Meter } from "@/components/cards/Meter";
import { MonoLabel } from "@/components/MonoLabel";

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
  const [bulk, setBulk] = useState<{ group: string; text: string; preview?: Row[] } | null>(null);
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

  async function save(v: Record<string, unknown>) {
    setBusy(true);
    const r = sel === "new" ? await act("/api/os/resources", { body: v }) : await act(`/api/os/resources/${(sel as Row).id}`, { method: "PATCH", body: v });
    say(r.ok, r.msg);
    setBusy(false);
    await res.reload();
    if (r.ok) setSel(null);
  }
  async function remove(id: string) {
    const r = await act(`/api/os/resources/${id}`, { method: "DELETE" });
    say(r.ok, r.ok ? "Removed." : r.msg);
    await res.reload();
    setSel(null);
  }
  async function move(row: Row, dir: -1 | 1) {
    const ids = (groups.get(String(row.group)) ?? []).map((r) => String(r.id));
    const i = ids.indexOf(String(row.id));
    if (i + dir < 0 || i + dir >= ids.length) return;
    [ids[i], ids[i + dir]] = [ids[i + dir], ids[i]];
    await act("/api/os/resources/reorder", { body: { ids } });
    await res.reload();
  }
  async function checkOne(row: Row) {
    const r = await act<{ dead: boolean; status: number | null }>(`/api/os/resources/${row.id}/check`, { method: "POST" });
    say(r.ok, r.ok ? (r.data.dead ? `Still dead (${r.data.status ?? "no response"}) — fix the URL.` : `Alive (${r.data.status}).`) : r.msg);
    await res.reload();
  }
  async function renameCategory(g: string) {
    const to = prompt(`Rename category "${g}" to:`, g);
    if (!to || to === g) return;
    const r = await act("/api/os/resources/category/rename", { body: { group: g, to } });
    say(r.ok, r.ok ? `Renamed — /resources shows "${to}".` : r.msg);
    await res.reload();
  }
  async function deleteCategory(g: string) {
    const first = await act("/api/os/resources/category/delete", { body: { group: g } });
    if (first.ok) {
      say(true, "Category removed.");
    } else if (first.status === 409) {
      const names = ((first.err?.links as string[]) ?? []).join(", ");
      if (!confirm(`"${g}" still holds: ${names}. Delete the category AND every link in it?`)) return;
      const r = await act("/api/os/resources/category/delete", { body: { group: g, cascade: true } });
      say(r.ok, r.ok ? `Deleted the category and ${String((r.data as { deleted?: number }).deleted ?? 0)} link(s).` : r.msg);
    } else say(false, first.msg);
    await res.reload();
  }
  async function moveCategory(g: string, dir: -1 | 1) {
    const order = [...groups.keys()];
    const i = order.indexOf(g);
    if (i + dir < 0 || i + dir >= order.length) return;
    [order[i], order[i + dir]] = [order[i + dir], order[i]];
    await act("/api/os/resources/category/reorder", { body: { groups: order } });
    await res.reload();
  }
  async function runBulk(commit: boolean) {
    if (!bulk) return;
    setBusy(true);
    const r = await act<{ rows?: Row[]; created?: number; skipped?: number }>("/api/os/resources/bulk", {
      body: { group: bulk.group, text: bulk.text, dry_run: !commit },
    });
    setBusy(false);
    if (!r.ok) return say(false, r.msg);
    if (commit) {
      say(true, `Added ${r.data.created} link(s), skipped ${r.data.skipped}.`);
      setBulk(null);
      await res.reload();
    } else setBulk({ ...bulk, preview: r.data.rows ?? [] });
  }
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
      {bulk && (
        <div className="mt-4 border border-line p-4 max-w-[820px]" data-testid="bulk">
          <p className="mono-label text-muted">BULK PASTE · one URL per line, or `Title | URL`</p>
          <div className="flex gap-3 mt-2 flex-wrap">
            <input
              value={bulk.group}
              onChange={(e) => setBulk({ ...bulk, group: e.target.value })}
              aria-label="Category"
              placeholder="category"
              className="bg-transparent border-b border-line px-1 py-1 font-mono text-[12px] text-ink outline-none focus:border-teal"
            />
          </div>
          <textarea
            value={bulk.text}
            onChange={(e) => setBulk({ ...bulk, text: e.target.value, preview: undefined })}
            rows={5}
            aria-label="URLs"
            className="mt-2 w-full bg-transparent border border-line px-3 py-2 font-mono text-[12px] text-ink outline-none focus:border-teal"
          />
          {bulk.preview && (
            <ul className="mt-2 text-[12px] font-mono space-y-0.5" data-testid="bulk-preview">
              {bulk.preview.map((r, i) => (
                <li key={i} className={r.ok && !r.duplicate ? "text-green" : "text-(--color-red-hi)"}>
                  {r.ok ? (r.duplicate ? "DUP " : "OK  ") : "BAD "} {String(r.title)} · {String(r.url)}
                </li>
              ))}
            </ul>
          )}
          <div className="flex gap-2 mt-3">
            <Button variant="ghost" disabled={busy || !bulk.text.trim()} onClick={() => runBulk(false)}>
              preview
            </Button>
            <Button variant="primary" disabled={busy || !bulk.preview} onClick={() => runBulk(true)}>
              confirm · add {bulk.preview?.filter((r) => r.ok && !r.duplicate).length ?? 0}
            </Button>
            <Button variant="ghost" onClick={() => setBulk(null)}>
              cancel
            </Button>
          </div>
        </div>
      )}
      {check && (
        <div className="mt-4 max-w-[640px]">
          <Meter label="dead links" value={check.dead.length} max={Math.max(check.checked, 1)} />
          {check.dead.length > 0 && (
            <ul className="mt-2 text-[13px] text-muted space-y-1">
              {check.dead.map((d) => (
                <li key={String(d.id)} className="font-mono text-[12px]">
                  <span className="text-(--color-red-hi)">{String(d.status ?? "ERR")}</span> · {String(d.url)}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

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
