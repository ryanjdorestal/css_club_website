/** The review sheet on /os/projects: every field of a submission, its history, the note to the student and the
    decision buttons the row's status allows (start review · approve · request changes · publish · archive),
    or, once published, feature / unpublish / reorder. The page owns the state and the writes. */
import { Button } from "@/components/Button";
import { KeyVal, Panel } from "../ui/OsPage";
import { StatusWord, type Row } from "../ui/OsTable";

type Props = {
  project: Row;
  note: string;
  setNote: (n: string) => void;
  busy: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDecide: (decision: string) => void;
  onPublish: () => void;
  onFeature: () => void;
  onUnpublish: () => void;
  onMove: (dir: -1 | 1) => void;
};

type HistoryEntry = { at: number; by: string; to: string; note?: string };

export function ReviewPanel(props: Props) {
  const { project, onClose, onEdit } = props;
  const status = String(project.status);
  return (
    <Panel title={`PROJECT · ${String(project.kind).toUpperCase()} · ${String(project.id).slice(-8)}`} onClose={onClose} wide>
      <h2 className="font-display font-bold text-xl mb-4">{String(project.title)}</h2>
      <KeyVal rows={sheetRows(project)} />
      <div className="flex gap-2 mt-3">
        <Button variant="ghost" onClick={onEdit}>
          edit fields
        </Button>
      </div>
      {status !== "published" && status !== "archived" && <ReviewActions {...props} />}
      {status === "published" && <PublishedActions {...props} />}
    </Panel>
  );
}

function sheetRows(p: Row) {
  const links = Object.entries((p.links as Record<string, string>) ?? {}).filter(([, u]) => u);
  const history = Array.isArray(p.history) ? (p.history as HistoryEntry[]) : [];
  return [
    { k: "STATUS", v: <StatusWord s={p.status} /> },
    { k: "SUMMARY", v: String(p.summary ?? "") },
    { k: "AUTHORS", v: Array.isArray(p.authors) ? p.authors.map((a) => (a as { name: string }).name).join(", ") : "—" },
    { k: "EMAIL", v: String(p.author_email ?? "—") },
    { k: "PLATFORM", v: Array.isArray(p.platform) ? p.platform.join(" · ") : "—" },
    {
      k: "LINKS",
      v: links.map(([k, u]) => (
        <a key={k} href={u} target="_blank" rel="noreferrer" className="text-teal u-draw mr-3">
          {k} ↗
        </a>
      )),
    },
    { k: "FOR JOHN JAY", v: String(p.benefits_jj ?? "") },
    { k: "REVIEW NOTES", v: String(p.review_notes ?? "") },
    { k: "REVIEWED BY", v: String(p.reviewed_by ?? "") },
    { k: "HISTORY", v: history.length ? <History entries={history} /> : "—" },
  ];
}

function History({ entries }: { entries: HistoryEntry[] }) {
  return (
    <ul className="space-y-0.5">
      {entries.map((h, i) => (
        <li key={i} className="t-micro">
          {new Date(h.at * 1000).toISOString().slice(0, 10)} · {h.by} → {h.to}
          {h.note ? ` — ${h.note}` : ""}
        </li>
      ))}
    </ul>
  );
}

function ReviewActions({ project, note, setNote, busy, onDecide, onPublish }: Props) {
  const status = String(project.status);
  return (
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
        {status === "submitted" && (
          <Button variant="ghost" disabled={busy} onClick={() => onDecide("in_review")}>
            start review
          </Button>
        )}
        {status !== "approved" && (
          <Button variant="ghost" disabled={busy} onClick={() => onDecide("approve")}>
            approve
          </Button>
        )}
        <Button variant="ghost" disabled={busy} onClick={() => onDecide("request_changes")}>
          request changes
        </Button>
        {status === "approved" && (
          <Button variant="primary" disabled={busy} onClick={onPublish}>
            publish
          </Button>
        )}
        <Button variant="ghost" disabled={busy} onClick={() => onDecide("archive")}>
          archive
        </Button>
      </div>
    </div>
  );
}

function PublishedActions({ project, onFeature, onUnpublish, onMove, onDecide }: Props) {
  return (
    <div className="flex flex-wrap gap-2 mt-5">
      <Button variant="ghost" onClick={onFeature}>
        {project.featured ? "unfeature" : "feature"}
      </Button>
      <Button variant="ghost" onClick={onUnpublish}>
        unpublish
      </Button>
      <Button variant="ghost" onClick={() => onMove(-1)}>
        ↑ up
      </Button>
      <Button variant="ghost" onClick={() => onMove(1)}>
        ↓ down
      </Button>
      <Button variant="ghost" onClick={() => onDecide("archive")}>
        archive
      </Button>
    </div>
  );
}
