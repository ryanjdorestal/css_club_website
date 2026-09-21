/** BULK PASTE on /os/resources: one URL per line (or `Title | URL`) into one category — preview (dry run) shows
    OK / DUP / BAD per line, confirm creates the OK ones. The page owns the state and the API call. */
import { Button } from "@/components/Button";
import type { Row } from "../ui/OsTable";

export type Bulk = { group: string; text: string; preview?: Row[] };

const verdict = (r: Row) => (r.ok ? (r.duplicate ? "DUP " : "OK  ") : "BAD ");

export function BulkPaste({ bulk, setBulk, busy, onRun }: { bulk: Bulk; setBulk: (b: Bulk | null) => void; busy: boolean; onRun: (commit: boolean) => void }) {
  const addable = bulk.preview?.filter((r) => r.ok && !r.duplicate).length ?? 0;
  return (
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
              {verdict(r)} {String(r.title)} · {String(r.url)}
            </li>
          ))}
        </ul>
      )}
      <div className="flex gap-2 mt-3">
        <Button variant="ghost" disabled={busy || !bulk.text.trim()} onClick={() => onRun(false)}>
          preview
        </Button>
        <Button variant="primary" disabled={busy || !bulk.preview} onClick={() => onRun(true)}>
          confirm · add {addable}
        </Button>
        <Button variant="ghost" onClick={() => setBulk(null)}>
          cancel
        </Button>
      </div>
    </div>
  );
}
