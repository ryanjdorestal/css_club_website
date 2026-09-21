/** /os/events — the board's event list → editor (title, date + time in America/New_York,
    location, summary, flyer upload/replace/remove, RSVP link, recap post), publish / unpublish /
    archive / unarchive / duplicate-for-next-term / delete draft. `upcoming` vs `past` is derived
    from the date. Published rows drive /events and Home §4 through /api/events. */
import { useState } from "react";
import { eventsSpec } from "./ui/specs";
import { OsPage, Chips, Empty, Panel } from "./ui/OsPage";
import { ListTools, OsTable, StatusWord, useListTools, type Row } from "./ui/OsTable";
import { OsForm, type Field } from "./ui/OsForm";
import { useOsList } from "./ui/useOs";
import { useEntity } from "./ui/useEntity";
import { EntityConflict, PublishButtons } from "./ui/EntityPanel";
import { Button } from "@/components/Button";
import { Upload } from "./ui/Upload";

const VIEWS = ["all", "draft", "published", "archived"] as const;
const FIELDS: Field[] = [
  { name: "title", label: "TITLE", required: true, max: 160 },
  { name: "semester", label: "SEMESTER", required: true, placeholder: "Fall 2026", max: 40 },
  { name: "starts_at", label: "DATE", type: "date", required: true, help: "the date decides upcoming vs past — no manual flag" },
  { name: "time_label", label: "TIME", type: "time", help: "America/New_York (Eastern) — the public page prints it as typed" },
  { name: "date_label", label: "DATE (AS PRINTED)", placeholder: "Thursday, September 24th, 2026", max: 80 },
  { name: "location", label: "LOCATION", placeholder: "L2.85 New Building", max: 120 },
  { name: "rsvp_url", label: "RSVP URL", type: "url", max: 600 },
  { name: "recap_post_id", label: "RECAP POST SLUG", placeholder: "fall-kickoff", pattern: "slug", max: 120 },
  { name: "summary", label: "DESCRIPTION", type: "textarea", rows: 4, max: 2000 },
];
const SEARCH = ["title", "semester", "location", "date_label"];

/** upcoming / past from the date (America/New_York), never a manual flag */
export function whenOf(startsAt: unknown): "upcoming" | "past" {
  const d = typeof startsAt === "string" && /^\d{4}-\d{2}-\d{2}/.test(startsAt) ? new Date(`${startsAt.slice(0, 10)}T23:59:00-04:00`) : null;
  return d && d.getTime() >= Date.now() ? "upcoming" : "past";
}

export default function OsEvents() {
  const [view, setView] = useState<(typeof VIEWS)[number]>("all");
  const { rows, source, reload } = useOsList("/api/os/events");
  const [sel, setSel] = useState<Row | "new" | null>(null);
  const [flyer, setFlyer] = useState("");
  const E = useEntity("/api/os/events", { name: "event", reload, publicHref: () => "/events ↗", deletable: (r) => r.status === "draft" });
  const tools = useListTools(
    rows.filter((r) => view === "all" || r.status === view),
    SEARCH,
    "starts_at",
  );

  async function save(v: Record<string, unknown>, overwrite = false) {
    const body = { ...v, flyer_path: flyer || null, when: whenOf(v.starts_at), updated_at: sel !== "new" && sel ? sel.updated_at : undefined };
    const r = await E.save(sel === "new" ? null : String((sel as Row).id), body, overwrite);
    if (r.ok) setSel(null);
    return r.ok;
  }
  const open = (r: Row) => {
    setFlyer(String(r.flyer_path ?? ""));
    setSel(r);
  };
  const initial = sel && sel !== "new" ? Object.fromEntries(FIELDS.map((f) => [f.name, sel[f.name]])) : { semester: "Fall 2026" };

  return (
    <OsPage
      dash={eventsSpec(rows, source !== "loading")}
      kicker="EVENTS · BY SEMESTER"
      title="Events"
      source={source}
      actions={
        <Button
          variant="ghost"
          onClick={() => {
            setFlyer("");
            setSel("new");
          }}
        >
          + new event
        </Button>
      }
      notHere={[
        "No RSVP tracking — RSVP is a link (Google Form, Eventbrite); attendance lives in the members tracker if the board wants it.",
        "No calendar sync — Discord announcements are still done by a human.",
        "Flyers are images (≤ 2 MB, resized to 1600 px, EXIF stripped); no flyer designer here.",
      ]}
    >
      <ListTools tools={tools} name="events" sortKeys={["starts_at", "title", "semester", "status", "updated_at"]} total={rows.length}>
        <Chips options={VIEWS} value={view} onChange={setView} />
      </ListTools>
      <div className="mt-4">
        <OsTable
          cols={[
            { key: "title", label: "TITLE", render: (r) => <span className="text-ink">{String(r.title)}</span> },
            { key: "semester", label: "SEMESTER", mono: true },
            {
              key: "starts_at",
              label: "DATE",
              mono: true,
              render: (r) => `${String(r.starts_at ?? r.date_label ?? "—")}${r.time_label ? ` · ${String(r.time_label)}` : ""}`,
            },
            { key: "when", label: "WHEN", mono: true, render: (r) => whenOf(r.starts_at) },
            { key: "status", label: "STATUS", render: (r) => <StatusWord s={r.status} /> },
            { key: "flyer_path", label: "FLYER", render: (r) => (r.flyer_path ? "✓" : <span className="text-(--color-red-hi)">none</span>) },
          ]}
          rows={tools.shown}
          onRow={open}
          actions={E.actions(open, [
            { label: "PUBLISH", onClick: (r) => void E.publish(r), hidden: (r) => r.status !== "draft" },
            {
              label: "DUPLICATE → NEXT TERM",
              onClick: (r) =>
                void E.run(`/api/os/events/${r.id}/duplicate`, { method: "POST" }, { ok: "Duplicated as a draft — set the new date and semester" }),
              hidden: (r) => r.status !== "published",
            },
          ])}
          empty={
            <Empty action={{ label: "NEW_EVENT", onClick: () => setSel("new") }}>
              Events are what the public /events page and the Home band show. Nothing is filed for this filter yet — create one, add a flyer, publish.
            </Empty>
          }
        />
      </div>
      {sel && (
        <Panel title={sel === "new" ? "NEW EVENT" : `EVENT · ${String(sel.id).slice(-12)}`} onClose={() => setSel(null)} wide>
          <EntityConflict entity={E} rows={rows} selected={sel as Row} open={open} onOverwrite={() => void save(initial, true)} />
          <Upload label="FLYER" value={flyer} onChange={setFlyer} />
          <OsForm
            key={sel === "new" ? "new" : String(sel.id)}
            fields={FIELDS}
            initial={initial}
            busy={E.busy}
            serverError={E.serverError}
            draftKey={sel === "new" ? "event-new" : `event-${String(sel.id)}`}
            onSubmit={(v) => save(v)}
            extra={
              <>
                <PublishButtons entity={E} row={sel} onDone={() => setSel(null)} />
                {sel !== "new" && String(sel.status) === "published" && (
                  <a href="/events" target="_blank" rel="noreferrer" className="t-micro raise text-teal u-draw">
                    → /events ↗
                  </a>
                )}
              </>
            }
          />
        </Panel>
      )}
    </OsPage>
  );
}
