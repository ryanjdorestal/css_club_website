import { useState } from "react";
import { MonoLabel } from "@/components/MonoLabel";
import { readInbox, removeInboxItem, type InboxItem } from "./inbox";

/** /os/queue — submissions awaiting the board. Tier 1 shows this browser's
    inbox + points at the server inbox; the Supabase queue replaces both. */
export default function OsQueue() {
  const [items, setItems] = useState<InboxItem[]>(readInbox());
  return (
    <div className="max-w-4xl">
      <MonoLabel accent>{"//"} QUEUE · onboarding + app submissions</MonoLabel>
      <h1 className="font-display font-black uppercase text-3xl mt-1 mb-8" style={{ fontStretch: "115%" }}>
        Submissions
      </h1>
      {items.length === 0 ? (
        <div className="border border-line rounded-(--radius-md) p-6 text-sm text-muted leading-relaxed">
          <p>No submissions stored in this browser.</p>
          <p className="mt-2">
            Where submissions live in Tier 1: forms POST to the Python API, which
            appends to <code className="text-teal">.cache/inbox/*.jsonl</code> on the
            server; if the API itself is down, the browser keeps a local copy that
            shows up here. Once Supabase is configured (SETUP.md), everything lands
            in <code className="text-teal">onboarding_requests</code> /{" "}
            <code className="text-teal">app_submissions</code> and this queue reads them live.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((item, i) => (
            <article key={item.ts + i} className="border border-line rounded-(--radius-md) p-5">
              <div className="flex items-center justify-between gap-3 mb-3">
                <MonoLabel accent>
                  {item.path.includes("onboarding") ? "ONBOARDING" : "APP SUBMISSION"} · {new Date(item.ts).toLocaleString()}
                </MonoLabel>
                <button
                  onClick={() => setItems(removeInboxItem(i))}
                  className="mono-label text-muted hover:text-red transition-colors cursor-pointer"
                >
                  discard
                </button>
              </div>
              <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-1.5">
                {Object.entries(item.payload)
                  .filter(([, v]) => String(v).trim())
                  .map(([k, v]) => (
                    <div key={k} className="text-sm">
                      <dt className="mono-label text-muted inline">{k}: </dt>
                      <dd className="inline text-ink">{String(v)}</dd>
                    </div>
                  ))}
              </dl>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
