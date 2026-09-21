/** Reads the repo's recent workflow runs from the public GitHub API — no token, from the browser, so the
    rate limit is the viewer's (60/h). Used by HostingPanel for "deployments today" (CI runs on main pushes
    are the closest free proxy for Vercel deploys) and the last keepalive / snapshot runs. Fails to UNKNOWN. */
import { brand } from "@brand/brand.config";

type Run = { name: string; event: string; head_branch: string; created_at: string; conclusion: string | null; html_url: string };

export type RunSummary = {
  ok: boolean;
  deploymentsToday: number | null;
  lastKeepalive: Run | null;
  lastSnapshot: Run | null;
  url: string;
};

export async function readGithubRuns(): Promise<RunSummary> {
  const url = `https://github.com/${brand.repo}/actions`;
  try {
    const res = await fetch(`https://api.github.com/repos/${brand.repo}/actions/runs?per_page=100`, {
      headers: { Accept: "application/vnd.github+json" },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return { ok: false, deploymentsToday: null, lastKeepalive: null, lastSnapshot: null, url };
    const runs = ((await res.json()) as { workflow_runs?: Run[] }).workflow_runs ?? [];
    const today = new Date().toISOString().slice(0, 10);
    const deploys = runs.filter((r) => r.name === "CI" && r.event === "push" && r.head_branch === "main" && r.created_at.startsWith(today));
    return {
      ok: true,
      deploymentsToday: deploys.length,
      lastKeepalive: runs.find((r) => r.name === "keepalive") ?? null,
      lastSnapshot: runs.find((r) => r.name === "snapshot") ?? null,
      url,
    };
  } catch {
    return { ok: false, deploymentsToday: null, lastKeepalive: null, lastSnapshot: null, url };
  }
}
