/** /os — Today. The dashboard face (run 9 §5.2 column "Today": needs attention · handoffs
    filed · this-term sheet · writes per day · last post + latest covers · what this is ·
    snapshot age · platform health ring · open queue) over the run-7 working surface: the
    readouts, the "Needs attention" list, the this-term sheet, quick links. With Supabase
    down it still renders with ○ OFFLINE and the inbox counts — every number has a source. */
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { OsPage, KeyVal } from "./ui/OsPage";
import type { Spec } from "./ui/Dashboard";
import type { Row } from "./ui/OsTable";
import { TraceStrip } from "./ui/TraceStrip";
import { IndexList } from "@/components/cards/IndexList";
import { StatusChip } from "@/components/cards/StatusChip";
import { MonoLabel } from "@/components/MonoLabel";
import { OS_MODULES } from "./OsLayout";
import { osFetch, useSession } from "./session";

type Health = { ok: boolean; sha: string; db: string; tier: string; inbox: number; snapshot: string | null; keepalive: string | null };
type Attention = {
  term: { id?: string; label?: string; ends_on?: string };
  items: { key: string; label: string; count: number; href: string }[];
  officers: number;
  last_post: string;
  next_event: { title?: string; date_label?: string } | null;
};
type Check = { state: string };

const PRINCIPLES = [
  "CSS OS is where the board writes what the public site shows — and what the next board needs to know.",
  "Every number on this page comes from the club's own data. Red means red; nothing is cached or invented.",
  "Every write is audited: who, what, before, after. The log is on /os/audit and never edited.",
  "Tier 1 always works: with no Supabase, writes land in local tables and an inbox that replays later.",
  "Inheritance is the spine: markdown files by term, readable with no software, exportable as a zip.",
];

export default function OsToday() {
  const { actor, mode } = useSession();
  const [health, setHealth] = useState<Health | null | "down">(null);
  const [att, setAtt] = useState<Attention | null>(null);
  const [records, setRecords] = useState<Row[]>([]);
  const [posts, setPosts] = useState<Row[]>([]);
  const [checks, setChecks] = useState<Check[] | null>(null);
  const [spine, setSpine] = useState<{ handoffs_filed: number; officers: number } | null>(null);
  useEffect(() => {
    void osFetch<{ stats: { handoffs_filed: number; officers: number } }>("/api/os/inheritance").then((r) => r.ok && setSpine(r.data.stats));
    void osFetch<Health>("/api/health").then((r) => setHealth(r.ok ? r.data : "down"));
    void osFetch<Attention>("/api/os/attention").then((r) => r.ok && setAtt(r.data));
    void osFetch<{ rows: Row[] }>("/api/os/records?limit=500").then((r) => r.ok && setRecords(r.data.rows ?? []));
    void osFetch<{ rows: Row[] }>("/api/os/posts").then((r) => r.ok && setPosts(r.data.rows ?? []));
    void osFetch<{ checks: Check[] }>("/api/os/status").then((r) => setChecks(r.ok ? r.data.checks : []));
  }, []);
  const h = health && health !== "down" ? health : null;
  const now = useMemo(() => Date.now(), [health, att, posts]); // one clock read per data change (react/purity)
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  const pending = (att?.items ?? []).filter((i) => i.count > 0);
  const officers = att?.officers ?? 0;
  const published = posts.filter((p) => p.status === "published");
  const lastPostAt = published
    .map((p) => String(p.published_at ?? ""))
    .sort()
    .at(-1);
  const daysAgo = lastPostAt ? Math.round((now - new Date(lastPostAt).getTime()) / 86400000) : null;
  const snapshotAgeH = h?.snapshot ? Math.round((now - new Date(h.snapshot).getTime()) / 3600000) : null;
  const okChecks = checks ? checks.filter((c) => c.state === "live" || c.state === "ok").length : null;
  const dayOfTerm = (() => {
    const e = att?.term?.ends_on;
    return e ? Math.max(0, Math.round((new Date(e).getTime() - now) / 86400000)) : null;
  })();

  const dash: Spec = {
    a: { title: "NEEDS ATTENTION", value: att ? pending.length : null, denom: "open" },
    b: { title: "HANDOFFS FILED", value: spine ? spine.handoffs_filed : null, denom: spine ? `${spine.officers || officers}` : undefined },
    c: {
      title: "THIS TERM",
      value: att?.term?.id ?? null,
      denom: dayOfTerm !== null ? `${dayOfTerm} days left` : undefined,
      rows: [
        { k: "ENDS", v: att?.term?.ends_on ?? "—" },
        { k: "NEXT EVENT", v: att?.next_event?.title ?? "none" },
        { k: "LAST POST", v: att?.last_post?.slice(0, 10) || "—" },
        { k: "INBOX", v: h ? `${h.inbox} unsynced` : "—" },
      ],
    },
    d: {
      title: "ACTIVITY · WRITES",
      rows: records,
      field: "created_at",
      unit: "writes",
      background: <TraceStrip rows={records} field="created_at" channels={4} className="absolute inset-x-5 bottom-5 top-14 opacity-30" />,
    },
    e: {
      title: "LAST POST",
      value: daysAgo,
      denom: "days ago",
      thumbsLabel: "LATEST WORKS",
      href: "/os/posts",
      thumbs: published
        .slice(-6)
        .reverse()
        .map((p) => ({
          key: String(p.id),
          src: p.cover_path ? String(p.cover_path) : undefined,
          text: `PST-${String(p.id ?? "")
            .slice(-6)
            .toUpperCase()}`,
          href: "/os/posts",
        })),
    },
    f: { title: "WHAT THIS IS", pages: PRINCIPLES },
    g: {
      title: "SNAPSHOT AGE",
      value: snapshotAgeH === null ? (h ? "∞" : null) : `${snapshotAgeH}h`,
      denom: "24h",
      progress: snapshotAgeH === null ? null : { value: Math.min(24, snapshotAgeH), max: 24 },
    },
    h: { value: okChecks === null || !checks?.length ? null : Math.round((okChecks / checks.length) * 100), max: 100, label: "PLATFORM HEALTH" },
    i: { title: "OPEN QUEUE", meta: att ? `${pending.reduce((a, i) => a + i.count, 0)}/ ${pending.length} PENDING` : "— PENDING", href: "/os/projects" },
  };

  return (
    <OsPage
      kicker={`TODAY · ${today.toUpperCase()}`}
      title={`Hey ${actor?.name?.split(" ")[0] ?? "board"}.`}
      dash={dash}
      notHere={[
        "No analytics — page views need a third-party account (docs/LATER.md); the numbers here are the club's own data.",
        "No Discord feed — there is no bot; announcements are posted by a human, tracked on /os/members.",
        "Nothing here is cached or invented: red means red. Follow the fix line on /os/system.",
      ]}
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-line border border-line">
        {[
          { l: "STATUS", v: health === "down" ? "○ OFFLINE" : h ? "● ONLINE" : "…", s: health === "down" ? "offline" : h ? "live" : "idle" },
          {
            l: "DB",
            v: h ? (h.db === "ok" ? "SUPABASE" : h.db === "skipped" ? "TIER 1 · LOCAL" : "DB ERROR") : "—",
            s: h?.db === "ok" ? "live" : h?.db === "skipped" ? "idle" : "offline",
          },
          { l: "DEPLOY", v: h ? h.sha.slice(0, 7).toUpperCase() : "—", s: "live" },
          { l: "SNAPSHOT", v: h?.snapshot ? h.snapshot.slice(0, 10) : "NEVER", s: h?.snapshot ? "live" : "idle" },
        ].map((c) => (
          <div key={c.l} className="bg-navy-900 px-4 py-3">
            <div className="flex items-center justify-between">
              <span className="mono-label text-muted">{c.l}</span>
              <StatusChip state={c.s as "live" | "idle" | "offline"} />
            </div>
            <p className="t-kpi text-[20px] mt-2 text-teal">{c.v}</p>
          </div>
        ))}
      </div>
      {mode === "local" && (
        <p className="t-micro text-teal mt-3">
          LOCAL_DEV · this browser is signed in as {actor?.role} without a server session; everything you write goes to data/*.local.json + the inbox.
        </p>
      )}

      <div className="grid lg:grid-cols-[3fr_2fr] gap-8 mt-8">
        <section>
          <MonoLabel accent>NEEDS_ATTENTION · {pending.length}</MonoLabel>
          <div className="mt-2">
            {pending.length ? (
              <IndexList
                rows={pending.map((i, n) => ({
                  index: String(n + 1),
                  bracket: true,
                  title: i.label,
                  meta: `${i.count}`,
                  href: i.href,
                  chip: i.key.toUpperCase(),
                }))}
              />
            ) : (
              <div className="border border-dashed border-line px-5 py-6 text-[13px] text-muted">{att ? "NOTHING_PENDING." : "LOADING…"}</div>
            )}
          </div>
        </section>
        <section>
          <MonoLabel accent>THIS_TERM</MonoLabel>
          <div className="mt-2">
            <KeyVal
              rows={[
                { k: "TERM", v: att?.term?.label ? `${att.term.label} (${att.term.id})` : "—" },
                { k: "ENDS", v: att?.term?.ends_on ?? "—" },
                { k: "OFFICERS", v: att ? String(att.officers) : "—" },
                { k: "NEXT EVENT", v: att?.next_event ? `${att.next_event.title} · ${att.next_event.date_label ?? ""}` : "none scheduled — /os/events" },
                { k: "LAST POST", v: att?.last_post || "—" },
                { k: "INBOX", v: h ? `${h.inbox} unsynced` : "—" },
                { k: "KEEPALIVE", v: h?.keepalive ?? "never" },
              ]}
            />
          </div>
          <MonoLabel accent className="mt-6 block">
            QUICK_LINKS
          </MonoLabel>
          <div className="flex flex-wrap gap-2 mt-2">
            {OS_MODULES.filter((m) => m.to !== "/os").map((m) => (
              <Link key={m.to} to={m.to} className="t-micro raise border border-line px-2.5 py-1.5 text-muted hover:text-ink hover:border-teal">
                {m.label}
              </Link>
            ))}
            <a href="/" className="t-micro raise border border-line px-2.5 py-1.5 text-muted hover:text-ink hover:border-teal">
              public site ↗
            </a>
          </div>
        </section>
      </div>
    </OsPage>
  );
}
