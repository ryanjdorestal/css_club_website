/** Dashboard specs — inheritance · system · audit (run 9 §5.2): every number derives from the rows the page already
    loads; nothing is invented (null → "—" + NO_DATA_YET). One builder per module; the tile texts are the
    module's rules. Used by the matching os/Os*.tsx page. */
import type { Spec } from "../Dashboard";
import type { Row } from "../OsTable";
import { st, n, last, thumbs, pct } from "./shared";

export function inheritanceSpec(records: Row[], loaded: boolean, termId?: string, officers = 0): Spec {
  const term = termId ? records.filter((r) => String(r.term ?? "") === termId) : records;
  const handoffs = term.filter((r) => r.type === "handoff" && st(r) === "final");
  const types = [...new Set(records.map((r) => String(r.type ?? "")))].filter(Boolean);
  return {
    a: { title: "HANDOFFS", value: n(handoffs.length, loaded), denom: `${officers}` },
    b: { title: "RECORDS", value: n(term.length, loaded), denom: termId ?? "term" },
    c: { title: "TYPES", value: n(types.length, loaded), denom: "of 8", rows: [{ k: "LAST RECORD", v: last(records, "date") }] },
    d: { title: "RECORDS", rows: records, field: "date", unit: "records" },
    e: {
      title: "LATEST",
      value: n(records.length, loaded),
      denom: "on file",
      thumbsLabel: "LATEST RECORDS",
      thumbs: thumbs(records, "title", "/os/inheritance"),
      href: "/os/inheritance",
    },
    f: {
      title: "WHY INHERITANCE",
      pages: [
        "Student clubs lose everything every 2–4 semesters: logins, contacts, why decisions were made.",
        "Inheritance is where each board writes down what the next board needs, in files that outlive the platform.",
        "Records are markdown with a small frontmatter, by term. Attach links, never uploads. Export the zip any time.",
      ],
      cta: { label: "HOW_TO_WRITE_ONE", href: "/os/inheritance#howto" },
    },
    g: {
      title: "HANDOFF PROGRESS",
      value: n(handoffs.length, loaded),
      denom: `${officers}`,
      progress: officers ? { value: handoffs.length, max: officers } : null,
    },
    h: { value: pct(types.length, 8), label: "SPINE COMPLETE" },
    i: { title: "NEW RECORD", meta: `${records.length} RECORDS`, href: "/os/inheritance#new" },
  };
}

export function systemSpec(checks: { state: string; label: string }[] | null, keepalive: string | null, snapshot: string | null, db: string): Spec {
  const ok = checks ? checks.filter((c) => c.state === "live" || c.state === "ok").length : null;
  const total = checks?.length ?? 0;
  const kaDays = keepalive ? Math.round((Date.now() - new Date(keepalive).getTime()) / 86400000) : null;
  return {
    a: { title: "INCIDENTS", value: checks ? total - (ok ?? 0) : null, denom: "open" },
    b: { title: "UPTIME", value: checks ? `${ok === total ? "100" : Math.round(((ok ?? 0) / Math.max(1, total)) * 100)}%` : null, denom: "checks now" },
    c: {
      title: "DB",
      value: db,
      denom: "storage",
      rows: [
        { k: "SNAPSHOT", v: snapshot ? snapshot.slice(0, 10) : "never" },
        { k: "KEEPALIVE", v: keepalive ? keepalive.slice(0, 10) : "never" },
      ],
    },
    d: { title: "HEALTH CHECKS", rows: [], field: "at", unit: "runs" },
    e: {
      title: "CHECKS",
      value: ok,
      denom: `${total} ok`,
      thumbsLabel: "CHECKS",
      thumbs: (checks ?? [])
        .slice(0, 6)
        .map((c) => ({ key: c.label, text: `${c.state === "live" || c.state === "ok" ? "●" : "○"} ${c.label}`.slice(0, 24), href: "/os/system" })),
      href: "/os/system",
    },
    f: {
      title: "RUNBOOK",
      pages: [
        "Supabase paused: the free tier sleeps after 7 idle days — the keepalive pings every 3; run it by hand from Actions.",
        "Deploy stale: /api/health reports the SHA; compare with main. Redeploy from Vercel.",
        "Someone graduated with a login: set the row inactive on /os/board — the roster is the gate.",
        "Rotate keys: Vercel env + Supabase settings; the browser only ever holds the anon key.",
        "Restore: scripts/snapshot.py --restore from the committed JSON.",
      ],
      cta: { label: "OPEN_RUNBOOK", href: "/os/system#runbook" },
    },
    g: {
      title: "KEEPALIVE",
      value: kaDays === null ? null : `${kaDays}d`,
      denom: "3 d",
      progress: kaDays === null ? null : { value: Math.min(3, kaDays), max: 3 },
    },
    h: { value: checks ? pct(ok ?? 0, total) : null, label: "UPTIME" },
    i: { title: "RUN CHECKS", meta: `${total} PROBES`, href: "/os/system#checks" },
  };
}

export function auditSpec(records: Row[], inbox: Row[], loaded: boolean): Spec {
  const today = records.filter((r) => Date.now() / 1000 - Number(r.created_at ?? 0) < 86400);
  const tables = [...new Set(records.map((r) => String(r.table ?? "")))].filter(Boolean);
  return {
    a: { title: "TODAY", value: n(today.length, loaded), denom: "writes" },
    b: { title: "REPLAY", value: n(inbox.length, loaded), denom: "inbox" },
    c: {
      title: "BY TABLE",
      value: n(records.length, loaded),
      denom: "records",
      rows: tables.slice(0, 5).map((t) => ({ k: t.toUpperCase(), v: records.filter((r) => r.table === t).length })),
    },
    d: { title: "WRITES", rows: records, field: "created_at", unit: "writes" },
    e: {
      title: "LATEST",
      value: n(records.length, loaded),
      denom: "records",
      thumbsLabel: "LATEST DIFFS",
      thumbs: thumbs(records, "action", "/os/audit"),
      href: "/os/audit",
    },
    f: {
      title: "WHAT GETS AUDITED",
      pages: [
        "Every OS write: who, action, table, row id, before and after. Read-only here; never edited.",
        "Denied logins are recorded without revealing who is on the roster.",
        "Tier-1 writes wait in the inbox with a client id; replay upserts them once Supabase is back.",
      ],
    },
    g: {
      title: "REPLAY PROGRESS",
      value: n(records.length - inbox.length, loaded),
      denom: `${records.length}`,
      progress: records.length ? { value: records.length - inbox.length, max: records.length } : null,
    },
    h: { value: records.length ? pct(records.length - inbox.length, records.length) : null, label: "SYNC" },
    i: { title: "EXPORT LOG", meta: `${records.length} ROWS`, href: "/os/audit#export" },
  };
}
