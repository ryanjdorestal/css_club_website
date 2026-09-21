/** /os/system — is the platform working, and who holds the accounts.
    Live checks (no fake green) · Ownership sheet (owner emails, never
    credentials) · Docs index · Runbook. Knowledge lives on /os/inheritance. */
import { useEffect, useState } from "react";
import runbookRaw from "@docs/RUNBOOK.md?raw";
import docsIndex from "@docs/INDEX.json";
import { systemSpec } from "./ui/specs";
import { Ring } from "./ui/Bento";
import { SubjectSheet } from "./ui/SubjectSheet";
import { OsPage, Notice, KeyVal } from "./ui/OsPage";
import { StatusWord } from "./ui/OsTable";
import { act, useNotice, useOsList } from "./ui/useOs";
import { osFetch, useSession } from "./session";
import { StatusChip } from "@/components/cards/StatusChip";
import { MonoLabel } from "@/components/MonoLabel";
import { Button } from "@/components/Button";
import { parseMd } from "@/lib/md";
import { HostingPanel } from "./system/HostingPanel";

type Check = { state: "live" | "idle" | "offline"; label: string; detail: string; fix: string };
type Account = { name: string; owner_email: string; second_owner_email: string; last_verified: string | null };

export default function OsSystem() {
  const { actor } = useSession();
  const admin = actor?.role === "admin";
  const [checks, setChecks] = useState<Check[] | null>(null);
  const [health, setHealth] = useState<{ db: string; snapshot: string | null; keepalive: string | null } | null>(null);
  const settings = useOsList("/api/os/site-settings");
  const board = useOsList("/api/os/board");
  const [ownEdit, setOwnEdit] = useState<Account[] | null>(null);
  const [activeCheck, setActiveCheck] = useState<number | null>(null);
  const { notice, say } = useNotice();

  useEffect(() => {
    void osFetch<{ checks: Check[] }>("/api/os/status").then((r) =>
      setChecks(r.ok ? r.data.checks : [{ state: "offline", label: "API", detail: r.error ?? "unreachable", fix: "make dev (README)" }]),
    );
    void osFetch<{ db: string; snapshot: string | null; keepalive: string | null }>("/api/health").then((r) => r.ok && setHealth(r.data));
  }, []);

  const ownership = (settings.rows.find((r) => r.key === "ownership")?.value as { accounts?: Account[] } | undefined)?.accounts ?? [];
  const officerEmails = new Set(
    board.rows
      .filter((r) => r.active)
      .map((r) => String(r.email ?? "").toLowerCase())
      .filter(Boolean),
  );
  const runbook = parseMd(runbookRaw);

  async function saveOwnership() {
    if (!ownEdit) return;
    const r = await act("/api/os/site-settings/ownership", { method: "PATCH", body: { value: { accounts: ownEdit } } });
    say(r.ok, r.ok ? "Ownership sheet saved." : r.msg);
    if (r.ok) setOwnEdit(null);
    await settings.reload();
  }

  return (
    <OsPage
      dash={systemSpec(checks, health?.keepalive ?? null, health?.snapshot ?? null, health ? (health.db === "ok" ? "LIVE" : "TIER1") : "—")}
      kicker="SYSTEM · HEALTH · ACCOUNTS"
      title="System"
      source="files"
      notHere={[
        "No credentials, ever — the ownership sheet holds owner emails only; secrets live in Vercel/Supabase settings and the club password manager.",
        "No automatic account transfer — moving Vercel/Supabase/GitHub to a new owner is a human step (docs/HANDOFF.md).",
        "Checks are live probes; a red chip is information, not a page you can fix here — follow the runbook line.",
        "Board knowledge (handoffs, decisions, contacts) is not here — that is /os/inheritance.",
        "Deployments today are counted from CI runs on main (the public GitHub API, no token) — the closest free proxy for Vercel's own count, which needs a Vercel login.",
      ]}
    >
      {notice && <Notice kind={notice.kind}>{notice.text}</Notice>}

      <section className="mt-4 grid lg:grid-cols-[minmax(0,1fr)_300px] gap-5 items-start">
        <div>
          <MonoLabel accent>1 · IS_THE_PLATFORM_WORKING?</MonoLabel>
          <div className="grid md:grid-cols-[220px_1fr] gap-5 mt-2 items-start">
            {/* run 9 §6.7: the radial dial — one segment per check, red when it is not live; click → its runbook line */}
            <div className="h-[220px] border border-line bg-navy-900/60" id="checks">
              <Ring
                value={checks ? Math.round((checks.filter((c) => c.state === "live").length / Math.max(1, checks.length)) * 100) : null}
                label="CHECKS LIVE"
                segments={(checks ?? []).map((c) => ({ key: c.label, ok: c.state === "live", title: `${c.label}: ${c.detail}` }))}
                active={activeCheck ?? undefined}
                onSegment={(i) => {
                  setActiveCheck(i);
                  document.getElementById("runbook")?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-px bg-line border border-line">
              {(checks ?? []).map((c) => (
                <div key={c.label} className="bg-navy-900 px-4 py-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="mono-label text-muted">{c.label}</span>
                    <StatusChip state={c.state} />
                  </div>
                  <p className="text-[13px] text-ink mt-1.5">{c.detail}</p>
                  {c.state !== "live" && c.fix && <p className="t-micro text-teal mt-1">→ {c.fix}</p>}
                </div>
              ))}
              {!checks && <div className="bg-navy-900 px-4 py-3 text-[13px] text-muted">probing…</div>}
            </div>
          </div>
        </div>
        <SubjectSheet
          title="PLATFORM_SUBJECT"
          onRefresh={() => {
            setChecks(null);
            void osFetch<{ checks: Check[] }>("/api/os/status").then((r) => setChecks(r.ok ? r.data.checks : []));
          }}
          rows={[
            { k: "DB", v: health ? (health.db === "ok" ? "SUPABASE" : "TIER1 · LOCAL") : "—" },
            { k: "SNAPSHOT", v: health?.snapshot ? health.snapshot.slice(0, 10) : "never" },
            { k: "KEEPALIVE", v: health?.keepalive ? health.keepalive.slice(0, 10) : "never" },
            { k: "CHECKS", v: checks ? `${checks.filter((c) => c.state === "live").length}/${checks.length}` : "—" },
            { k: "OWNERS", v: ownership.length },
          ]}
          ring={{ value: checks ? Math.round((checks.filter((c) => c.state === "live").length / Math.max(1, checks.length)) * 100) : null, label: "HEALTH" }}
        />
      </section>

      <section className="mt-8">
        <div className="flex items-center justify-between">
          <MonoLabel accent>2 · OWNERSHIP · who holds each account</MonoLabel>
          {admin && !ownEdit && (
            <Button variant="ghost" onClick={() => setOwnEdit(ownership.map((a) => ({ ...a })))}>
              edit
            </Button>
          )}
        </div>
        <div className="mt-2 max-w-[900px]">
          {ownEdit ? (
            <div className="border border-line divide-y divide-line">
              {ownEdit.map((a, i) => (
                <div key={a.name} className="grid md:grid-cols-[180px_1fr_1fr_140px] gap-2 px-3 py-2 items-center">
                  <span className="mono-label text-muted">{a.name}</span>
                  {(["owner_email", "second_owner_email", "last_verified"] as const).map((k) => (
                    <input
                      key={k}
                      aria-label={`${a.name} ${k.replace(/_/g, " ")}`}
                      value={a[k] ?? ""}
                      placeholder={k.replace(/_/g, " ")}
                      onChange={(e) => setOwnEdit(ownEdit.map((x, j) => (j === i ? { ...x, [k]: e.target.value } : x)))}
                      className="bg-transparent border-b border-line px-1 py-1 font-mono text-[12px] text-ink focus:border-teal outline-none"
                    />
                  ))}
                </div>
              ))}
              <div className="px-3 py-2 flex gap-2">
                <Button variant="primary" onClick={saveOwnership}>
                  save
                </Button>
                <Button variant="ghost" onClick={() => setOwnEdit(null)}>
                  cancel
                </Button>
              </div>
            </div>
          ) : (
            <KeyVal
              className="ownership"
              rows={ownership.map((a) => ({
                k: a.name,
                v: (
                  <span className="flex flex-wrap gap-3 items-center">
                    <span
                      className={`font-mono text-[12px] ${a.owner_email && !officerEmails.has(a.owner_email.toLowerCase()) ? "text-(--color-red-hi)" : ""}`}
                    >
                      {a.owner_email || "— unassigned"}
                    </span>
                    {a.second_owner_email && <span className="font-mono text-[12px] text-muted">+ {a.second_owner_email}</span>}
                    {a.last_verified && <span className="t-micro opacity-50">verified {a.last_verified}</span>}
                    {a.owner_email && !officerEmails.has(a.owner_email.toLowerCase()) && <StatusWord s="not a current officer" />}
                  </span>
                ),
              }))}
            />
          )}
        </div>
      </section>

      <section className="mt-8 grid md:grid-cols-2 gap-8">
        <div>
          <MonoLabel accent>3 · DOCS</MonoLabel>
          <ul className="mt-2 border border-line divide-y divide-line">
            {(docsIndex as { docs: { path: string; title: string; for: string }[] }).docs.map((d) => (
              <li key={d.path} className="px-3 py-2 text-[13px]">
                <span className="font-mono text-[12px] text-teal">{d.path}</span> · <span className="text-ink">{d.title}</span>{" "}
                <span className="text-muted">— {d.for}</span>
              </li>
            ))}
          </ul>
        </div>
        <div id="runbook">
          <MonoLabel accent>
            4 · RUNBOOK · docs/RUNBOOK.md{activeCheck !== null && checks?.[activeCheck] ? ` · → ${checks[activeCheck].label.toUpperCase()}` : ""}
          </MonoLabel>
          {activeCheck !== null && checks?.[activeCheck] && (
            <p className="t-micro text-teal mt-2 border border-teal/40 px-3 py-2">
              {checks[activeCheck].label}: {checks[activeCheck].detail} {checks[activeCheck].fix ? `→ ${checks[activeCheck].fix}` : ""}
            </p>
          )}
          <div className="mt-2 border border-line px-4 py-3 max-h-[420px] overflow-y-auto" tabIndex={0} aria-label="Runbook">
            {runbook.blocks.map((b, i) =>
              b.type === "h2" ? (
                <p key={i} className="mono-label text-teal mt-3 mb-1">
                  {b.text}
                </p>
              ) : (
                <p key={i} className="text-[13px] text-muted leading-relaxed mb-2">
                  {b.text}
                </p>
              ),
            )}
          </div>
        </div>
      </section>

      <HostingPanel />
    </OsPage>
  );
}
