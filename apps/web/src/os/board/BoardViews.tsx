/** The two read-only views on /os/board: officers as folder cards with the dossier layout inside (run 9,
    T11 + R9_05), and the terms table with its admin row actions. The page keeps the state and the writes. */
import { FolderCard } from "@/components/cards/FolderCard";
import { DossierCard } from "../ui/DossierCard";
import { OsTable, StatusWord, type Row } from "../ui/OsTable";

const code = (term: string, i: number) => `BRD-${term}-${String(i + 1).padStart(2, "0")}`;

export function OfficerFolders({ rows, term }: { rows: Row[]; term: string }) {
  if (!rows.length) return null;
  return (
    <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-5" data-testid="officer-folders">
      {rows.map((r, i) => (
        <FolderCard key={String(r.id)} tab={String(r.role_title ?? "OFFICER").toUpperCase()} tone="os" tabFrac={0.5} edgeLabel={code(term, i)}>
          <DossierCard
            n={i + 1}
            name={String(r.name ?? "")}
            photo={r.photo_path ? String(r.photo_path) : null}
            code={code(term, i)}
            rows={[
              { k: "ROLE", v: String(r.role_title ?? "").toUpperCase() },
              { k: "TERM", v: term },
              { k: "EMAIL", v: r.email ? String(r.email) : null },
              { k: "STATUS", v: r.active ? "● ACTIVE" : "○ INACTIVE" },
              { k: "OS", v: String(r.os_role ?? "").toUpperCase() },
            ]}
            className="!border-0 !bg-transparent !p-0 [&_.brackets]:hidden"
            compact
          />
        </FolderCard>
      ))}
    </div>
  );
}

type TermsProps = { terms: Row[]; admin: boolean; onEdit: (t: Row) => void; onSetCurrent: (t: Row) => void; onDelete: (t: Row) => void };

export function TermsTable({ terms, admin, onEdit, onSetCurrent, onDelete }: TermsProps) {
  return (
    <section className="mt-8" data-testid="terms">
      <p className="mono-label text-muted mb-2">TERMS · {terms.length} on file · exactly one is current</p>
      <OsTable
        cols={[
          { key: "id", label: "ID", mono: true },
          { key: "label", label: "LABEL", render: (t) => <span className="text-ink">{String(t.label)}</span> },
          { key: "starts_on", label: "STARTS", mono: true },
          { key: "ends_on", label: "ENDS", mono: true },
          { key: "is_current", label: "CURRENT", render: (t) => (t.is_current ? <StatusWord s="active" /> : "") },
        ]}
        rows={[...terms].sort((a, b) => String(b.id).localeCompare(String(a.id)))}
        onRow={admin ? onEdit : undefined}
        actions={
          admin
            ? [
                { label: "EDIT DATES", onClick: onEdit },
                { label: "SET CURRENT", onClick: onSetCurrent, hidden: (t) => !!t.is_current },
                { label: "DELETE", onClick: onDelete, danger: true, hidden: (t) => !!t.is_current },
              ]
            : undefined
        }
        empty="No terms on file — create one (admin)."
      />
    </section>
  );
}
