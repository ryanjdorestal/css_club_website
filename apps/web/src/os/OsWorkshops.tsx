/** /os/workshops — workshops as a first-class entity (run 10 §7): series → numbered sessions
    (date, time in America/New_York, location, level, description, materials as links, recording).
    Full CRUD via useEntity: publish (needs a date) / unpublish / archive / unarchive / duplicate
    (next session) / delete draft. Published sessions show on /events#workshops grouped by series. */
import { useState } from "react";
import { workshopsSpec } from "./ui/specs";
import { OsPage, Chips, ConflictBlock, Empty, Panel } from "./ui/OsPage";
import { ListTools, OsTable, StatusWord, useListTools, type Row } from "./ui/OsTable";
import { OsForm, type Field } from "./ui/OsForm";
import { useOsList } from "./ui/useOs";
import { useEntity } from "./ui/useEntity";
import { Button } from "@/components/Button";

const VIEWS = ["all", "draft", "published", "archived"] as const;
const FIELDS: Field[] = [
  { name: "title", label: "TITLE", required: true, max: 160, placeholder: "Intro to Git — session 1" },
  {
    name: "series",
    label: "SERIES",
    required: true,
    max: 80,
    placeholder: "Intro to Git",
    help: "sessions with the same series name group together on /events",
  },
  { name: "session_no", label: "SESSION #", type: "number", required: true },
  { name: "date", label: "DATE", type: "date", required: true },
  { name: "time", label: "TIME", type: "time" },
  { name: "location", label: "LOCATION", max: 160, placeholder: "L2.85 New Building" },
  { name: "level", label: "LEVEL", type: "select", options: ["intro", "intermediate"] },
  { name: "recording_url", label: "RECORDING URL", type: "url", max: 600 },
  { name: "description_md", label: "DESCRIPTION", type: "markdown", rows: 8, max: 20000 },
];
const SEARCH = ["title", "series", "location"];

export default function OsWorkshops() {
  const [view, setView] = useState<(typeof VIEWS)[number]>("all");
  const { rows, source, reload } = useOsList("/api/os/workshops");
  const [sel, setSel] = useState<Row | "new" | null>(null);
  const [materials, setMaterials] = useState<{ label: string; url: string }[]>([]);
  const E = useEntity("/api/os/workshops", { name: "workshop", reload, publicHref: () => "/events#workshops ↗", deletable: (r) => r.status === "draft" });
  const tools = useListTools(
    rows.filter((r) => view === "all" || r.status === view),
    SEARCH,
    "date",
  );

  async function save(v: Record<string, unknown>, overwrite = false) {
    const body = {
      ...v,
      session_no: Number(v.session_no || 1),
      materials: materials.filter((m) => m.label && m.url),
      updated_at: sel !== "new" && sel ? sel.updated_at : undefined,
    };
    const r = await E.save(sel === "new" ? null : String((sel as Row).id), body, overwrite);
    if (r.ok) setSel(null);
    return r.ok;
  }
  const open = (r: Row) => {
    setMaterials(Array.isArray(r.materials) ? (r.materials as { label: string; url: string }[]) : []);
    setSel(r);
  };
  const initial = sel && sel !== "new" ? Object.fromEntries(FIELDS.map((f) => [f.name, sel[f.name]])) : { level: "intro", session_no: 1 };

  return (
    <OsPage
      dash={workshopsSpec(rows, source !== "loading")}
      kicker="WORKSHOPS · SERIES · SESSIONS"
      title="Workshops"
      source={source}
      actions={
        <Button
          variant="ghost"
          onClick={() => {
            setMaterials([]);
            setSel("new");
          }}
        >
          + new session
        </Button>
      }
      notHere={[
        "No sign-ups here — a workshop's RSVP is the event's link if you also file it as an event; attendance lives in the members tracker.",
        "Recordings are links (YouTube, Drive) — nothing is uploaded to the platform.",
        "The old-site list (data/workshops.json) seeded one session-1 record per topic; edit them into real series.",
      ]}
    >
      <ListTools tools={tools} name="workshops" sortKeys={["date", "series", "session_no", "title", "status", "updated_at"]} total={rows.length}>
        <Chips options={VIEWS} value={view} onChange={setView} />
      </ListTools>
      <div className="mt-4">
        <OsTable
          cols={[
            { key: "series", label: "SERIES", render: (r) => <span className="text-ink">{String(r.series ?? "—")}</span> },
            { key: "session_no", label: "#", mono: true },
            { key: "title", label: "TITLE" },
            { key: "date", label: "DATE", mono: true, render: (r) => `${String(r.date ?? "—")}${r.time ? ` · ${String(r.time)}` : ""}` },
            { key: "level", label: "LEVEL", mono: true },
            { key: "status", label: "STATUS", render: (r) => <StatusWord s={r.status} /> },
          ]}
          rows={tools.shown}
          onRow={open}
          actions={E.actions(open, [{ label: "PUBLISH", onClick: (r) => void E.publish(r), hidden: (r) => r.status !== "draft" }])}
          empty={
            <Empty action={{ label: "NEW_SESSION", onClick: () => setSel("new") }}>
              Workshops are the club's teaching series (Intro to Git, AWS…). Nothing matches this filter yet — file a session with a date and publish it;
              /events groups them by series.
            </Empty>
          }
        />
      </div>
      {sel && (
        <Panel title={sel === "new" ? "NEW SESSION" : `SESSION · ${String(sel.id).slice(-12)}`} onClose={() => setSel(null)} wide>
          {E.conflict && (
            <ConflictBlock
              err={E.conflict}
              onReload={() => {
                E.setConflict(null);
                const fresh = rows.find((r) => r.id === (sel as Row).id);
                if (fresh) open(fresh);
              }}
              onOverwrite={() => void save(initial, true)}
            />
          )}
          <div className="border border-line border-b-0 px-4 py-3">
            <p className="mono-label text-muted">MATERIALS · links only</p>
            {materials.map((m, i) => (
              <div key={i} className="grid grid-cols-[1fr_2fr_auto] gap-2 mt-2">
                <input
                  value={m.label}
                  onChange={(e) => setMaterials(materials.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))}
                  placeholder="Slides"
                  aria-label="Material label"
                  className="bg-transparent border-b border-line px-1 py-1 font-mono text-[12px] text-ink outline-none focus:border-teal"
                />
                <input
                  value={m.url}
                  onChange={(e) => setMaterials(materials.map((x, j) => (j === i ? { ...x, url: e.target.value } : x)))}
                  placeholder="https://…"
                  aria-label="Material URL"
                  className="bg-transparent border-b border-line px-1 py-1 font-mono text-[12px] text-ink outline-none focus:border-teal"
                />
                <button
                  type="button"
                  onClick={() => setMaterials(materials.filter((_, j) => j !== i))}
                  className="t-micro text-muted hover:text-(--color-red-hi) cursor-pointer"
                  aria-label="Remove material"
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setMaterials([...materials, { label: "", url: "" }])}
              className="mt-2 t-micro raise border border-line px-2 py-1 text-muted hover:text-ink cursor-pointer"
            >
              + add link
            </button>
          </div>
          <OsForm
            key={sel === "new" ? "new" : String(sel.id)}
            fields={FIELDS}
            initial={initial}
            busy={E.busy}
            serverError={E.serverError}
            draftKey={sel === "new" ? "workshop-new" : `workshop-${String(sel.id)}`}
            onSubmit={(v) => save(v)}
            extra={
              <>
                {sel !== "new" && String(sel.status) === "draft" && (
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
