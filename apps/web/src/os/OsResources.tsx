/** /os/resources — the curated link groups (inline edit, add, reorder within
    a group) + the site's own links (Discord invite, forms…) as a spec sheet
    with edit-in-place + "Check all links". This is how the board updates the
    Discord invite without a deploy. */
import { useMemo, useState } from "react";
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
  const { notice, say } = useNotice();
  const [busy, setBusy] = useState(false);

  const groups = useMemo(() => {
    const m = new Map<string, Row[]>();
    for (const r of [...res.rows].sort((a, b) => Number(a.sort ?? 0) - Number(b.sort ?? 0))) m.set(String(r.group), [...(m.get(String(r.group)) ?? []), r]);
    return m;
  }, [res.rows]);

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

      {[...groups.entries()].map(([g, rows]) => (
        <section key={g} className="mt-8">
          <MonoLabel accent>
            {g.toUpperCase()} · {rows.length}
          </MonoLabel>
          <div className="mt-2">
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
            />
          </div>
        </section>
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
