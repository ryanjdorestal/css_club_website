/** /os — Today. Platform readouts (STATUS · DB · DEPLOY · SNAPSHOT), the
    "Needs attention" list (every queue's pending count), "This term" sheet,
    quick links. With Supabase down it still renders with ○ OFFLINE and the
    inbox counts — every number here has a real source. */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { OsPage, KeyVal } from "./ui/OsPage";
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

export default function OsToday() {
  const { actor, mode } = useSession();
  const [health, setHealth] = useState<Health | null | "down">(null);
  const [att, setAtt] = useState<Attention | null>(null);
  useEffect(() => {
    void osFetch<Health>("/api/health").then((r) => setHealth(r.ok ? r.data : "down"));
    void osFetch<Attention>("/api/os/attention").then((r) => r.ok && setAtt(r.data));
  }, []);
  const h = health && health !== "down" ? health : null;
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  const pending = (att?.items ?? []).filter((i) => i.count > 0);

  return (
    <OsPage
      kicker={`TODAY · ${today.toUpperCase()}`}
      title={`Hey ${actor?.name?.split(" ")[0] ?? "board"}.`}
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
            <p className="font-display font-black text-[20px] leading-none mt-2 text-teal">{c.v}</p>
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
          <MonoLabel accent>NEEDS ATTENTION · {pending.length}</MonoLabel>
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
              <div className="border border-dashed border-line px-5 py-6 text-[13px] text-muted">{att ? "Nothing pending. Enjoy it." : "Loading…"}</div>
            )}
          </div>
        </section>
        <section>
          <MonoLabel accent>THIS TERM</MonoLabel>
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
            QUICK LINKS
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
