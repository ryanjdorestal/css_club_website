/** IMPORT CSV on /os/members: paste the export (Discord's works as-is) → dry run shows added / changed /
    unchanged and a preview → commit. The page owns the state and the API call; UNDO LAST IMPORT lives on the page. */
import { Button } from "@/components/Button";
import { KeyVal, Panel } from "../ui/OsPage";
import { OsTable, type Row } from "../ui/OsTable";

export type Import = { csv: string; result?: Row };

export function ImportPanel({ imp, setImp, busy, onRun }: { imp: Import; setImp: (i: Import | null) => void; busy: boolean; onRun: (dry: boolean) => void }) {
  return (
    <Panel title="IMPORT CSV · dry run first" onClose={() => setImp(null)} wide>
      <p className="t-micro opacity-60 mb-2">
        columns: display_name, discord_handle, email, status, joined_term (extra columns ignored; Discord's export works as-is)
      </p>
      <textarea
        value={imp.csv}
        onChange={(e) => setImp({ csv: e.target.value })}
        rows={10}
        className="w-full bg-transparent border border-line px-3 py-2 font-mono text-[12px] text-ink focus:border-teal outline-none"
        placeholder="display_name,discord_handle,email,status,joined_term"
      />
      <div className="flex gap-2 mt-3">
        <Button variant="ghost" disabled={busy || !imp.csv.trim()} onClick={() => onRun(true)}>
          dry run
        </Button>
        <Button variant="primary" disabled={busy || !imp.result} onClick={() => onRun(false)}>
          commit import
        </Button>
      </div>
      {imp.result && <ImportResult result={imp.result} />}
    </Panel>
  );
}

function ImportResult({ result }: { result: Row }) {
  return (
    <div className="mt-4">
      <KeyVal
        rows={[
          { k: "ADDED", v: String(result.added) },
          { k: "CHANGED", v: String(result.changed) },
          { k: "UNCHANGED", v: String(result.unchanged) },
        ]}
      />
      <OsTable
        cols={[
          { key: "display_name", label: "NAME" },
          { key: "discord_handle", label: "DISCORD", mono: true },
          { key: "school_email", label: "EMAIL", mono: true },
          { key: "status", label: "STATUS" },
        ]}
        rows={(result.preview as Row[]) ?? []}
        rowKey="display_name"
      />
    </div>
  );
}
