/** Dashboard specs — members · board / terms (run 9 §5.2): every number derives from the rows the page already
    loads; nothing is invented (null → "—" + NO_DATA_YET). One builder per module; the tile texts are the
    module's rules. Used by the matching os/Os*.tsx page. */
import type { Spec } from "../Dashboard";
import type { Row } from "../OsTable";
import { st, n, thumbs, pct } from "./shared";

export function membersSpec(rows: Row[], loaded: boolean): Spec {
  const by = (s: string) => rows.filter((r) => st(r) === s).length;
  const active = by("active") + by("member");
  return {
    a: { title: "INTERESTED", value: n(by("interested"), loaded), denom: "new" },
    b: { title: "ACTIVE", value: n(active, loaded), denom: `${rows.length} members` },
    c: {
      title: "BY STATUS",
      value: n(rows.length, loaded),
      denom: "tracked",
      rows: ["interested", "member", "active", "alumni", "left"].map((s) => ({ k: s.toUpperCase(), v: by(s) })),
    },
    d: { title: "JOINS", rows, field: "created_at", unit: "joins" },
    e: {
      title: "RECENT",
      value: n(rows.length, loaded),
      denom: "people",
      thumbsLabel: "RECENT",
      thumbs: thumbs(rows, "display_name", "/os/members"),
      href: "/os/members",
    },
    f: {
      title: "WHO COUNTS AS A MEMBER",
      pages: [
        "Interested = filled the join form. Member = in the Discord. Active = showed up this term.",
        "Alumni graduated; Left asked to be removed. Transitions are audited and reversible.",
        "No Discord API here — import a CSV export, or add by hand. Nothing is scraped.",
      ],
    },
    g: {
      title: "IMPORT LAST",
      value: n(rows.filter((r) => r.source === "import").length, loaded),
      denom: "rows",
      progress: rows.length ? { value: rows.filter((r) => r.source === "import").length, max: rows.length } : null,
    },
    h: { value: pct(active, rows.length), label: "RETENTION" },
    i: { title: "IMPORT CSV", meta: `${rows.length} ROWS`, href: "/os/members#import" },
  };
}

export function boardSpec(rows: Row[], terms: Row[], loaded: boolean, current?: string): Spec {
  const officers = rows.filter((r) => String(r.term ?? "") === current && r.active !== false);
  const complete = officers.filter((r) => r.email && r.name && r.role_title);
  const next = terms.find((t) => !t.is_current && String(t.id ?? "") > String(current ?? ""));
  return {
    a: { title: "OFFICERS", value: n(officers.length, loaded), denom: "seats 8" },
    b: { title: "TERMS", value: n(terms.length, loaded), denom: "on file" },
    c: {
      title: "ROLLOVER",
      value: loaded ? String(next?.id ?? "—") : null,
      denom: "next term",
      rows: [{ k: "READY", v: officers.length >= 4 ? "● ready" : "○ not yet" }],
    },
    d: { title: "OFFICERS", rows, field: "created_at", unit: "officers" },
    e: {
      title: "CURRENT BOARD",
      value: n(officers.length, loaded),
      denom: "this term",
      thumbsLabel: "CURRENT BOARD",
      thumbs: thumbs(officers, "name", "/os/board", "photo_path"),
      href: "/about",
    },
    f: {
      title: "TERM ROLLOVER",
      pages: [
        "[1] Confirm the term dates. The wizard closes the current term.",
        "[2] Tick who continues. Everyone else gets a draft handoff record in the spine.",
        "[3] Done: the next roster.md exists and the public About page shows the new board.",
      ],
      cta: { label: "START_ROLLOVER", href: "/os/board#rollover" },
    },
    g: {
      title: "ROSTER COMPLETE",
      value: pct(complete.length, officers.length) === null ? null : `${pct(complete.length, officers.length)}%`,
      denom: "emails + roles",
      progress: officers.length ? { value: complete.length, max: officers.length } : null,
    },
    h: { value: pct(officers.length, 8), label: "SEATS FILLED" },
    i: { title: "ADD OFFICER", meta: `${officers.length}/ 8 SEATS`, href: "/os/board#new" },
  };
}
