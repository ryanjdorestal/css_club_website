/** The two blocks every entity's edit panel repeats (posts, events, workshops…): the CHANGED_ELSEWHERE
    block wired to the entity's conflict state, and the publish / unpublish buttons for a lifecycle row.
    Used inside a Panel next to OsForm; the page keeps its own fields and save(). */
import { Button } from "@/components/Button";
import { ConflictBlock } from "./OsPage";
import type { Row } from "./OsTable";
import type { useEntity } from "./useEntity";

type Entity = ReturnType<typeof useEntity>;

/** Reload = drop the conflict and reopen the row as the server has it; overwrite = the page's forced save. */
export function EntityConflict({
  entity,
  rows,
  selected,
  open,
  onOverwrite,
}: {
  entity: Entity;
  rows: Row[];
  selected: Row;
  open: (r: Row) => void;
  onOverwrite: () => void;
}) {
  if (!entity.conflict) return null;
  return (
    <ConflictBlock
      err={entity.conflict}
      onReload={() => {
        entity.setConflict(null);
        const fresh = rows.find((r) => r.id === selected.id);
        if (fresh) open(fresh);
      }}
      onOverwrite={onOverwrite}
    />
  );
}

/** PUBLISH for a draft (or a row in `publishFrom`), UNPUBLISH for a published row; both close the panel after. */
export function PublishButtons({
  entity,
  row,
  onDone,
  publishFrom = ["draft"],
}: {
  entity: Entity;
  row: Row | "new";
  onDone: () => void;
  publishFrom?: string[];
}) {
  if (row === "new") return null;
  const status = String(row.status);
  return (
    <>
      {publishFrom.includes(status) && (
        <Button type="button" variant="primary" disabled={entity.busy} onClick={() => void entity.publish(row).then(onDone)}>
          publish
        </Button>
      )}
      {status === "published" && (
        <Button type="button" variant="ghost" disabled={entity.busy} onClick={() => void entity.unpublish(row).then(onDone)}>
          unpublish
        </Button>
      )}
    </>
  );
}
