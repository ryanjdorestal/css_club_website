/** Dashboard specs — posts · projects · events · workshops (run 9 §5.2): every number derives from the rows the page already
    loads; nothing is invented (null → "—" + NO_DATA_YET). One builder per module; the tile texts are the
    module's rules. Used by the matching os/Os*.tsx page. */
import type { Spec } from "../Dashboard";
import type { Row } from "../OsTable";
import { st, n, last, thumbs, pct } from "./shared";

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

export function workshopsSpec(rows: Row[], loaded: boolean): Spec {
  const pub = rows.filter((r) => st(r) === "published");
  const series = [...new Set(rows.map((r) => String(r.series ?? "")))].filter(Boolean);
  const withRec = pub.filter((r) => r.recording_url);
  const upcoming = pub.filter((r) => String(r.date ?? "") >= new Date().toISOString().slice(0, 10));
  return {
    a: { title: "UPCOMING", value: n(upcoming.length, loaded), denom: "sessions" },
    b: { title: "SERIES", value: n(series.length, loaded), denom: `${rows.length} sessions` },
    c: {
      title: "PUBLISHED",
      value: n(pub.length, loaded),
      denom: `${rows.length}`,
      rows: [{ k: "NEXT", v: upcoming[0] ? String(upcoming[0].title ?? "").slice(0, 26) : "none" }],
    },
    d: { title: "SESSIONS", rows, field: "date", unit: "sessions" },
    e: {
      title: "RECORDINGS",
      value: n(withRec.length, loaded),
      denom: "on file",
      thumbsLabel: "SERIES",
      thumbs: series.slice(0, 6).map((c) => ({ key: c, text: c.toUpperCase().slice(0, 22), href: "/os/workshops" })),
      href: "/events#workshops",
    },
    f: {
      title: "HOW WORKSHOPS RUN",
      pages: [
        "A series (INTRO TO GIT) holds numbered sessions; each session has a date, a room and a level.",
        "Materials are links (repo, slides, Drive). A recording link makes the session replayable on /events.",
        "Publish needs a date. The public Events page groups published sessions by series.",
      ],
    },
    g: {
      title: "RECORDED",
      value: pct(withRec.length, pub.length) === null ? null : `${pct(withRec.length, pub.length)}%`,
      denom: "published",
      progress: pub.length ? { value: withRec.length, max: pub.length } : null,
    },
    h: { value: pct(pub.length, rows.length), label: "PUBLISHED" },
    i: { title: "NEW SESSION", meta: `${series.length} SERIES`, href: "/os/workshops#new" },
  };
}
