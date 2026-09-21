/** /os/events — the board's event list by semester → editor (title, date,
    time, location, summary, flyer, recap post), publish / archive.
    Published rows drive /events and Home §4 through /api/events. */
import { useState } from "react";
import { OsPage, Chips, Notice, Panel } from "./ui/OsPage";
import { OsTable, StatusWord, type Row } from "./ui/OsTable";
import { OsForm, type Field } from "./ui/OsForm";
import { act, useNotice, useOsList } from "./ui/useOs";
import { Button } from "@/components/Button";
import { Upload } from "./ui/Upload";

const VIEWS = ["all", "draft", "published", "archived"] as const;
const FIELDS: Field[] = [
  { name: "title", label: "TITLE", required: true },
  { name: "semester", label: "SEMESTER", required: true, placeholder: "Fall 2026" },
  { name: "date_label", label: "DATE", placeholder: "Thursday, September 24th, 2026" },
  { name: "time_label", label: "TIME", placeholder: "1:40 PM - 2:55 PM" },
  { name: "starts_at", label: "STARTS (ISO)", type: "date", help: "for sorting + 'next event'" },
  { name: "location", label: "LOCATION", placeholder: "L2.85 New Building" },
  { name: "when", label: "WHEN", type: "select", options: ["upcoming", "past", "cancelled"] },
  { name: "rsvp_url", label: "RSVP URL", type: "url" },
  { name: "recap_post_id", label: "RECAP POST SLUG", placeholder: "fall-kickoff" },
  { name: "summary", label: "DESCRIPTION", type: "textarea", rows: 4 },
];

export default function OsEvents() {
  const [view, setView] = useState<(typeof VIEWS)[number]>("all");
  const { rows, source, reload } = useOsList("/api/os/events");
  const [sel, setSel] = useState<Row | "new" | null>(null);
  const [flyer, setFlyer] = useState("");
  const { notice, say } = useNotice();
  const [busy, setBusy] = useState(false);
  const shown = rows.filter((r) => view === "all" || r.status === view);

  async function save(v: Record<string, unknown>, status?: string) {
    setBusy(true);
    const body = { ...v, flyer_path: flyer || undefined, ...(status ? { status } : {}) };
    const r = sel === "new" ? await act("/api/os/events", { body }) : await act(`/api/os/events/${(sel as Row).id}`, { method: "PATCH", body });
    say(r.ok, r.ok ? "Saved." : r.msg);
    setBusy(false);
    await reload();
    if (r.ok) setSel(null);
  }
  async function publish(id: string) {
    const r = await act(`/api/os/events/${id}/publish`, { method: "POST" });
    say(r.ok, r.ok ? "Published — it is on /events now." : r.msg);
    await reload();
    setSel(null);
  }
  const initial = sel && sel !== "new" ? Object.fromEntries(FIELDS.map((f) => [f.name, sel[f.name]])) : { when: "upcoming", semester: "Fall 2026" };

  return (
    <OsPage
      kicker="EVENTS · BY SEMESTER"
      title="Events"
      source={source}
      actions={
        <>
          <Chips options={VIEWS} value={view} onChange={setView} />
          <Button variant="ghost" onClick={() => { setFlyer(""); setSel("new"); }}>+ new event</Button>
        </>
      }
      notHere={[
        "No RSVP tracking — RSVP is a link (Google Form, Eventbrite); attendance lives in the members tracker if the board wants it.",
        "No calendar sync — Discord announcements are still done by a human.",
        "Flyers are images (≤ 2 MB, resized to 1600 px); no flyer designer here.",
      ]}
    >
      {notice && <Notice kind={notice.kind}>{notice.text}</Notice>}
      <div className="mt-4">
        <OsTable
          cols={[
            { key: "title", label: "TITLE", render: (r) => <span className="text-ink">{String(r.title)}</span> },
            { key: "semester", label: "SEMESTER", mono: true },
            { key: "date_label", label: "DATE", mono: true },
            { key: "when", label: "WHEN", mono: true },
            { key: "status", label: "STATUS", render: (r) => <StatusWord s={r.status} /> },
            { key: "flyer_path", label: "FLYER", render: (r) => (r.flyer_path ? "✓" : <span className="text-(--color-red-hi)">none</span>) },
          ]}
          rows={shown}
          onRow={(r) => { setFlyer(String(r.flyer_path ?? "")); setSel(r); }}
        />
      </div>
      {sel && (
        <Panel title={sel === "new" ? "NEW EVENT" : `EVENT · ${String(sel.id).slice(-12)}`} onClose={() => setSel(null)} wide>
          <Upload label="FLYER" value={flyer} onChange={setFlyer} />
          <OsForm
            key={sel === "new" ? "new" : String(sel.id)}
            fields={FIELDS}
            initial={initial}
            busy={busy}
            onSubmit={(v) => save(v)}
            extra={
              <>
                {sel !== "new" && String(sel.status) === "draft" && <Button type="button" variant="primary" disabled={busy} onClick={() => publish(String(sel.id))}>publish</Button>}
                {sel !== "new" && String(sel.status) === "published" && <Button type="button" variant="ghost" disabled={busy} onClick={() => save(initial, "archived")}>archive</Button>}
              </>
            }
          />
        </Panel>
      )}
    </OsPage>
  );
}
