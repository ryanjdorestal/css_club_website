/** Dashboard specs per module (run 9 §5.2 table) — every number derives from the rows the
    page already loads; nothing is invented (null → "—" + NO_DATA_YET). One builder per module
    so the pages stay short. Column F texts are the module's rules in five pages. */
import type { Spec } from "./Dashboard";
import type { Row } from "./OsTable";

const st = (r: Row) => String(r.status ?? "");
const n = (v: number, ready: boolean) => (ready ? v : null);
const last = (rows: Row[], f: string) =>
  rows
    .map((r) => String(r[f] ?? ""))
    .filter(Boolean)
    .sort()
    .at(-1)
    ?.slice(0, 10) ?? "—";
// thumbnails are images; the text fallback is the row's id code (readout grammar), never its title
const thumbs = (rows: Row[], text: string, href: string, src?: string) =>
  rows
    .slice(-6)
    .reverse()
    .map((r) => ({
      key: String(r.id ?? r.slug ?? Math.random()),
      text: `${text.slice(0, 3).toUpperCase()}-${String(r.id ?? r.slug ?? "")
        .slice(-6)
        .toUpperCase()}`,
      href,
      src: src && r[src] ? String(r[src]) : undefined,
    }));
const pct = (a: number, b: number) => (b ? Math.round((a / b) * 100) : null);

export function projectsSpec(rows: Row[], loaded: boolean): Spec {
  const queue = rows.filter((r) => ["submitted", "in_review"].includes(st(r)));
  const pub = rows.filter((r) => st(r) === "published");
  const decided = rows.filter((r) => ["published", "approved", "archived"].includes(st(r)));
  return {
    a: { title: "SUBMITTED", value: n(queue.length, loaded), denom: "queue" },
    b: { title: "PUBLISHED", value: n(pub.length, loaded), denom: `${rows.length} all` },
    c: {
      title: "REVIEW SLA",
      value: loaded ? (queue.length ? `${queue.length}` : "0") : null,
      denom: "waiting",
      rows: [
        { k: "FEATURED", v: pub.filter((r) => r.featured).length },
        { k: "LAST PUBLISHED", v: last(pub, "updated_at") },
      ],
    },
    d: { title: "SUBMISSIONS", rows, field: "created_at", unit: "submissions" },
    e: {
      title: "FEATURED",
      value: n(pub.filter((r) => r.featured).length, loaded),
      denom: "3 slots",
      thumbsLabel: "LATEST PROJECTS",
      thumbs: thumbs(pub, "title", "/os/projects"),
      href: "/projects",
    },
    f: {
      title: "HOW REVIEW WORKS",
      pages: [
        "[1] A student submits on /projects — title, kind, summary, links. It lands here as SUBMITTED.",
        "[2] An officer opens it, reads the benefit for John Jay, and approves or requests changes with a note.",
        "[3] Publish puts it on /projects; feature pins it to the top three. Every decision is audited.",
      ],
    },
    g: {
      title: "REVIEW PROGRESS",
      value: n(decided.length, loaded),
      denom: `${rows.length} decided`,
      progress: rows.length ? { value: decided.length, max: rows.length } : null,
    },
    h: { value: pct(pub.length, decided.length), label: "APPROVAL RATE" },
    i: { title: "NEW PROJECT", meta: `${pub.length} LIVE`, href: "/os/projects#new" },
  };
}

export function postsSpec(rows: Row[], loaded: boolean): Spec {
  const drafts = rows.filter((r) => st(r) === "draft");
  const pub = rows.filter((r) => st(r) === "published");
  const review = rows.filter((r) => st(r) === "review");
  const oldest = drafts
    .map((r) => Number(r.updated_at ?? 0))
    .filter(Boolean)
    .sort()[0];
  const draftAge = oldest ? Math.round((Date.now() / 1000 - oldest) / 86400) : null;
  return {
    a: { title: "DRAFTS", value: n(drafts.length, loaded), denom: `${rows.length}` },
    b: { title: "PUBLISHED", value: n(pub.length, loaded), denom: `${rows.length}` },
    c: { title: "REVIEW", value: n(review.length, loaded), denom: "waiting", rows: [{ k: "LAST PUBLISHED", v: last(pub, "published_at") }] },
    d: { title: "POSTS", rows, field: "published_at", unit: "posts" },
    e: {
      title: "COVERS",
      value: n(pub.length, loaded),
      denom: "on /news",
      thumbsLabel: "LATEST COVERS",
      thumbs: thumbs(pub, "title", "/os/posts", "cover_path"),
      href: "/news",
    },
    f: {
      title: "WRITING RULES",
      pages: [
        "Title, dek, body in markdown. The preview is the public article at reduced width — what you see ships.",
        "Draft → review → published. A draft older than 14 days shows on Today until it moves.",
        "Covers ≤ 2 MB, resized server-side. Attach links, never paste credentials.",
      ],
    },
    g: { title: "DRAFT AGE", value: draftAge, denom: "14 d", progress: draftAge === null ? null : { value: Math.min(14, draftAge), max: 14 } },
    h: { value: pct(pub.length, rows.length), label: "PUBLISH RATE" },
    i: { title: "NEW POST", meta: `${drafts.length} DRAFTS`, href: "/os/posts#new" },
  };
}

export function eventsSpec(rows: Row[], loaded: boolean, termId?: string): Spec {
  const pub = rows.filter((r) => st(r) === "published");
  const upcoming = pub.filter((r) => r.when === "upcoming");
  const withFlyer = pub.filter((r) => r.flyer_path);
  const thisTerm = termId ? rows.filter((r) => String(r.term ?? "") === termId) : [];
  return {
    a: { title: "UPCOMING", value: n(upcoming.length, loaded), denom: "term" },
    b: { title: "THIS TERM", value: n(thisTerm.length, loaded), denom: "logged" },
    c: {
      title: "FLYERS",
      value: n(withFlyer.length, loaded),
      denom: `${pub.length}`,
      rows: [{ k: "NEXT", v: upcoming[0] ? String(upcoming[0].title ?? "").slice(0, 26) : "none" }],
    },
    d: { title: "EVENTS", rows, field: "starts_at", unit: "events" },
    e: {
      title: "FLYERS",
      value: n(withFlyer.length, loaded),
      denom: "on file",
      thumbsLabel: "LATEST FLYERS",
      thumbs: thumbs(pub, "title", "/os/events", "flyer_path"),
      href: "/events",
    },
    f: {
      title: "EVENT CHECKLIST",
      pages: [
        "[1] Title, date, location, a two-line description. Draft first.",
        "[2] A flyer — every published event without one shows on Today.",
        "[3] Publish; it lands on /events and Home. Link the recap post afterwards.",
      ],
    },
    g: {
      title: "FLYER COVERAGE",
      value: pct(withFlyer.length, pub.length) === null ? null : `${pct(withFlyer.length, pub.length)}%`,
      denom: "published",
      progress: pub.length ? { value: withFlyer.length, max: pub.length } : null,
    },
    h: { value: null, label: "ATTENDANCE" },
    i: { title: "NEW EVENT", meta: `${upcoming.length} UPCOMING`, href: "/os/events#new" },
  };
}

export function resourcesSpec(rows: Row[], links: Row[], loaded: boolean): Spec {
  const all = [...rows, ...links];
  const dead = all.filter((r) => r.dead);
  const cats = [...new Set(rows.map((r) => String(r.category ?? r.group ?? "")))].filter(Boolean);
  const checked = all.filter((r) => r.last_checked);
  return {
    a: { title: "DEAD LINKS", value: n(dead.length, loaded), denom: `${all.length}` },
    b: { title: "CATEGORIES", value: n(cats.length, loaded), denom: `${rows.length} links` },
    c: {
      title: "CHECK AGE",
      value: loaded ? (checked.length ? last(checked, "last_checked") : "never") : null,
      denom: "last run",
      rows: [{ k: "SITE LINKS", v: links.length }],
    },
    d: { title: "LINK CHECKS", rows: checked, field: "last_checked", unit: "checked" },
    e: {
      title: "LINKS",
      value: n(rows.length, loaded),
      denom: "curated",
      thumbsLabel: "CATEGORIES",
      thumbs: cats.slice(0, 6).map((c) => ({ key: c, text: c.toUpperCase().slice(0, 22), href: "/resources" })),
      href: "/resources",
    },
    f: {
      title: "LINK POLICY",
      pages: [
        "Every link is checked with a 6 s HEAD/GET. Dead ones are flagged, never silently removed.",
        "The Discord invite and the join form live here as site links — edit them without a deploy.",
        "Categories mirror the public index; reorder within a category, keep titles short.",
      ],
    },
    g: {
      title: "CHECK COVERAGE",
      value: pct(checked.length, all.length) === null ? null : `${pct(checked.length, all.length)}%`,
      denom: "checked",
      progress: all.length ? { value: checked.length, max: all.length } : null,
    },
    h: { value: all.length ? pct(all.length - dead.length, all.length) : null, label: "ALIVE" },
    i: { title: "CHECK ALL LINKS", meta: `${all.length} LINKS`, href: "/os/resources#check" },
  };
}

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

export function siteSpec(rows: Row[], loaded: boolean): Spec {
  const flags = rows.find((r) => r.key === "feature_flags")?.value as Record<string, unknown> | undefined;
  const on = flags ? Object.values(flags).filter((v) => v === true).length : 0;
  const total = flags ? Object.values(flags).filter((v) => typeof v === "boolean").length : 0;
  const banner = rows.find((r) => r.key === "maintenance_banner")?.value as { on?: boolean } | undefined;
  const ticker = (flags?.ticker_items as unknown[] | undefined)?.length ?? null;
  return {
    a: { title: "FLAGS ON", value: n(on, loaded), denom: `${total}` },
    b: { title: "BANNER", value: loaded ? (banner?.on ? "ON" : "OFF") : null, denom: "maintenance" },
    c: { title: "TICKER ITEMS", value: loaded ? (ticker ?? "—") : null, denom: "in the marquee", rows: [{ k: "KEYS", v: rows.length }] },
    d: { title: "SETTINGS CHANGES", rows, field: "updated_at", unit: "changes" },
    e: {
      title: "PAGES",
      value: n(rows.length, loaded),
      denom: "setting groups",
      thumbsLabel: "GROUPS",
      thumbs: rows.slice(0, 6).map((r) => ({ key: String(r.key), text: String(r.key).toUpperCase().slice(0, 22), href: "/os/site" })),
      href: "/",
    },
    f: {
      title: "WHAT SITE CONTROLS",
      pages: [
        "Taglines, hero copy, the about blurbs, the collaborate openings — the public site reads them with a fallback.",
        "The maintenance banner and feature flags flip without a deploy. Tier 1 snapshots keep them in the repo.",
        "Ownership (who holds which account) lives on /os/system, never credentials.",
      ],
    },
    g: { title: "FLAGS", value: n(on, loaded), denom: `${total}`, progress: total ? { value: on, max: total } : null },
    h: { value: rows.length ? pct(rows.filter((r) => r.value !== null && r.value !== undefined).length, rows.length) : null, label: "COMPLETENESS" },
    i: { title: "EDIT SETTINGS", meta: `${rows.length} KEYS`, href: "/os/site#edit" },
  };
}

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
