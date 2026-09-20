import { useEffect, useState } from "react";
import events from "@data/events.json";
import board from "@data/board.json";
import { MonoLabel } from "@/components/MonoLabel";
import { BigStat } from "@/components/cards/SpecSheet";
import { readInbox } from "./inbox";

/** /os — Today. Honest numbers only: local queue, API status, data snapshot. */
export default function OsToday() {
  const [api, setApi] = useState<"checking" | "online" | "offline">("checking");
  const [dbState, setDbState] = useState<string>("–");
  const inbox = readInbox();
  useEffect(() => {
    fetch("/api/health", { signal: AbortSignal.timeout(2500) })
      .then((r) => r.json())
      .then((j) => {
        setApi("online");
        setDbState(j.db);
      })
      .catch(() => setApi("offline"));
  }, []);
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  return (
    <div className="max-w-4xl">
      <MonoLabel accent>{"//"} TODAY · {today}</MonoLabel>
      <h1 className="font-display font-black uppercase text-3xl mt-1 mb-8" style={{ fontStretch: "115%" }}>
        Operations
      </h1>
      <div data-tone="dark-3" className="grid sm:grid-cols-3 gap-px bg-line border border-line mb-8">
        <div className="bg-navy-900"><BigStat value={inbox.length} label="IN THIS BROWSER'S QUEUE" /></div>
        <div className="bg-navy-900 px-5 py-4">
          <span className="font-display font-black text-[clamp(28px,3vw,44px)] leading-none text-teal" style={{ fontStretch: "115%" }}>{api === "checking" ? "…" : api.toUpperCase()}</span>
          <p className="mono-label opacity-60 mt-1.5">PYTHON API</p>
        </div>
        <div className="bg-navy-900 px-5 py-4">
          <span className="font-display font-black text-[clamp(28px,3vw,44px)] leading-none text-teal" style={{ fontStretch: "115%" }}>{dbState.toUpperCase()}</span>
          <p className="mono-label opacity-60 mt-1.5">SUPABASE{dbState === "skipped" ? " · TIER 1 — NOT CONFIGURED" : ""}</p>
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <section className="border border-line rounded-(--radius-md) p-5">
          <MonoLabel accent>Data snapshot (committed)</MonoLabel>
          <ul className="text-sm text-muted mt-3 space-y-1.5">
            <li>{events.semesters.reduce((a, s) => a + s.events.length, 0)} events across {events.semesters.length} semesters</li>
            <li>{board.terms.reduce((a, t) => a + t.members.length, 0)} board members across {board.terms.length} terms</li>
            <li>Next event: none scheduled — add Fall 2026 to data/events.json</li>
          </ul>
        </section>
        <section className="border border-line rounded-(--radius-md) p-5">
          <MonoLabel accent>Runbook</MonoLabel>
          <ul className="text-sm text-muted mt-3 space-y-1.5 list-disc list-inside">
            <li>Check the Queue for new submissions</li>
            <li>Click-test links.json quarterly (Discord invite is from 2021)</li>
            <li>Keepalive + stale-deploy checks run in GitHub Actions</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
