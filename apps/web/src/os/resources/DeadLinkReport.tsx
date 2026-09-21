/** The result of CHECK ALL LINKS on /os/resources: a meter of dead vs checked and the dead ones with their status. */
import { Meter } from "@/components/cards/Meter";
import type { Row } from "../ui/OsTable";

export function DeadLinkReport({ check }: { check: { checked: number; dead: Row[] } }) {
  return (
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
  );
}
