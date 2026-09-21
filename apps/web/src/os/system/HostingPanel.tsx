/** /os/system → HOSTING: the free-tier numbers a board member can act on (run 11 §3.1.5). Every value is
    measured (the API's /os/hosting, the GitHub API in the browser) or it says UNKNOWN — never a fake number. */
import { useEffect, useState } from "react";
import { MonoLabel } from "@/components/MonoLabel";
import { KeyVal } from "../ui/OsPage";
import { osFetch } from "../session";
import { readGithubRuns, type RunSummary } from "./githubRuns";

type Limit = { host: string; what: string; limit: string; ours: string; exceed: string };
type Usage = { db_bytes: number; db_pct: number; storage_bytes: number; storage_pct: number; rows: Record<string, number> };
type Hosting = {
  tier: "db" | "local";
  limits: Limit[];
  usage: Usage | null;
  usage_reason: string | null;
  keepalive: string | null;
  snapshot: string | null;
  days_since_last_write: number | null;
  warn_at_pct: number;
};

const daysAgo = (iso: string | null | undefined): string => {
  if (!iso) return "never";
  const days = Math.round((Date.now() - new Date(iso).getTime()) / 86400000);
  return days <= 0 ? "today" : `${days} d ago (${iso.slice(0, 10)})`;
};

const mb = (bytes: number): string => `${(bytes / 1048576).toFixed(1)} MB`;

const percent = (n: number, warn: number) => <span className={n >= warn ? "text-(--color-red-hi)" : n >= warn / 2 ? "text-teal" : "text-green"}>{n} %</span>;

function deploysToday(runs: RunSummary | null): string {
  if (runs === null) return "…";
  if (!runs.ok || runs.deploymentsToday === null) return "UNKNOWN (GitHub API: private repo or offline)";
  return `${runs.deploymentsToday} of 100`;
}

function lastRun(runs: RunSummary | null, run: RunSummary["lastKeepalive"]): string {
  if (runs === null) return "…";
  return run ? `${run.conclusion ?? "running"} · ${daysAgo(run.created_at)}` : "no run yet";
}

/** The eight readouts, each measured or "…" while loading; usage rows fall back to the API's reason. */
function readouts(hosting: Hosting | null, runs: RunSummary | null) {
  if (!hosting) return [{ k: "HOSTING", v: "…" }];
  const usage = hosting.usage;
  const warn = hosting.warn_at_pct;
  return [
    { k: "DEPLOYS_TODAY", v: deploysToday(runs) },
    { k: "LAST_DB_WRITE", v: hosting.days_since_last_write === null ? "never" : `${hosting.days_since_last_write} d ago` },
    { k: "KEEPALIVE", v: daysAgo(hosting.keepalive) },
    { k: "KEEPALIVE_RUN", v: lastRun(runs, runs?.lastKeepalive ?? null) },
    { k: "SNAPSHOT", v: daysAgo(hosting.snapshot) },
    {
      k: "DATABASE",
      v: usage ? (
        <>
          {mb(usage.db_bytes)} of 500 MB · {percent(usage.db_pct, warn)}
        </>
      ) : (
        hosting.usage_reason
      ),
    },
    {
      k: "STORAGE",
      v: usage ? (
        <>
          {mb(usage.storage_bytes)} of 1 GB · {percent(usage.storage_pct, warn)}
        </>
      ) : (
        hosting.usage_reason
      ),
    },
    { k: "SOURCE", v: hosting.tier === "db" ? "SUPABASE · hosting_usage()" : "TIER 1 · local tables on disk" },
  ];
}

export function HostingPanel() {
  const [hosting, setHosting] = useState<Hosting | null>(null);
  const [runs, setRuns] = useState<RunSummary | null>(null);

  useEffect(() => {
    void osFetch<Hosting>("/api/os/hosting").then((r) => r.ok && setHosting(r.data));
    void readGithubRuns().then(setRuns);
  }, []);

  const warn = hosting?.warn_at_pct ?? 70;
  return (
    <section className="mt-8" data-testid="hosting">
      <MonoLabel accent>5 · HOSTING · free-tier budget (docs/HOSTING_LIMITS.md)</MonoLabel>
      <div className="grid lg:grid-cols-2 gap-5 mt-2 items-start">
        <KeyVal rows={readouts(hosting, runs)} />
        <LimitsTable limits={hosting?.limits ?? []} />
      </div>
      <p className="t-micro text-muted mt-2">
        Past {warn} % the keepalive workflow turns red in the Actions tab; prune audit records on /os/audit or move files out of Storage.{" "}
        {runs?.url && (
          <a href={runs.url} target="_blank" rel="noreferrer" className="text-teal underline">
            Actions ↗
          </a>
        )}
      </p>
    </section>
  );
}

function LimitsTable({ limits }: { limits: Limit[] }) {
  return (
    <div className="border border-line divide-y divide-line text-[12px]">
      <div className="grid grid-cols-[1fr_70px_80px] gap-2 px-3 py-1.5 t-micro opacity-60">
        <span>LIMIT</span>
        <span>FREE</span>
        <span>OURS</span>
      </div>
      {limits.map((l) => (
        <div key={l.what} className="px-3 py-1.5">
          <div className="grid grid-cols-[1fr_70px_80px] gap-2">
            <span className="text-ink">
              <span className="t-micro opacity-50 mr-1.5">{l.host.toUpperCase()}</span>
              {l.what}
            </span>
            <span className="font-mono text-muted">{l.limit}</span>
            <span className="font-mono text-muted">{l.ours}</span>
          </div>
          <p className="text-muted/80 mt-0.5">if exceeded: {l.exceed}</p>
        </div>
      ))}
    </div>
  );
}
