/** The term editor on /os/board: create a term (id + label + dates), or edit one and move the current flag. */
import { OsForm, type Field } from "../ui/OsForm";
import { Panel } from "../ui/OsPage";
import type { Row } from "../ui/OsTable";

const ID_FIELD: Field = { name: "id", label: "ID", required: true, max: 12, placeholder: "F26", help: "F = fall, S = spring, two-digit year" };
const FIELDS: Field[] = [
  { name: "label", label: "LABEL", required: true, max: 60, placeholder: "Fall 2026" },
  { name: "starts_on", label: "STARTS", type: "date" },
  { name: "ends_on", label: "ENDS", type: "date" },
  { name: "is_current", label: "CURRENT", type: "toggle", help: "moves the current flag here; the roster gate and /about follow it" },
];

export function TermPanel({
  term,
  busy,
  onClose,
  onSubmit,
}: {
  term: Row | "new";
  busy: boolean;
  onClose: () => void;
  onSubmit: (v: Record<string, unknown>) => Promise<void>;
}) {
  const isNew = term === "new";
  return (
    <Panel title={isNew ? "NEW TERM" : `TERM · ${String(term.id)}`} onClose={onClose}>
      <OsForm
        key={isNew ? "new" : String(term.id)}
        fields={isNew ? [ID_FIELD, ...FIELDS] : FIELDS}
        initial={isNew ? { is_current: false } : { label: term.label, starts_on: term.starts_on, ends_on: term.ends_on, is_current: term.is_current }}
        busy={busy}
        onSubmit={onSubmit}
      />
    </Panel>
  );
}
