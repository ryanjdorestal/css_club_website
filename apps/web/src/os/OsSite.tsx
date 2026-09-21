/** /os/site — site content & settings (admin): one sheet per key with
    inline JSON/string editing, the maintenance banner toggle, feature flags,
    ticker items. The public site reads these through /api/site-settings. */
import { useState } from "react";
import { siteSpec } from "./ui/specs";
import { OsPage, Notice, KeyVal } from "./ui/OsPage";
import { act, useNotice, useOsList } from "./ui/useOs";
import { useSession } from "./session";
import { Button } from "@/components/Button";
import { MonoLabel } from "@/components/MonoLabel";
import type { Row } from "./ui/OsTable";

const HELP: Record<string, string> = {
  taglines: "primary = the hero tagline + footer; ticker = the marquee's first item.",
  hero_copy: "kicker + the four hero lines on Home.",
  collaborate: "openings / committees / ideas shown on Join and Home §8.",
  maintenance_banner: "on: true shows `text` across the top of every public page.",
  feature_flags: "projects_public, chat_enabled, ticker_items[].",
  ownership: "the accounts sheet on /os/inheritance — owners by email, never credentials.",
};

export default function OsSite() {
  const { actor } = useSession();
  const admin = actor?.role === "admin";
  const { rows, source, reload } = useOsList("/api/os/site-settings");
  const [editing, setEditing] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const { notice, say } = useNotice();

  async function save(key: string) {
    let value: unknown;
    try {
      value = JSON.parse(text);
    } catch (e) {
      return setErr(`Not valid JSON: ${String(e).slice(0, 80)}`);
    }
    const r = await act(`/api/os/site-settings/${key}`, { method: "PATCH", body: { value } });
    say(r.ok, r.ok ? `${key} saved — the public site reads it on next load.` : r.msg);
    if (r.ok) setEditing(null);
    await reload();
  }
  async function toggleBanner(row: Row) {
    const v = (row.value as { on?: boolean; text?: string }) ?? {};
    const r = await act(`/api/os/site-settings/maintenance_banner`, { method: "PATCH", body: { value: { ...v, on: !v.on } } });
    say(r.ok, r.ok ? `Maintenance banner ${!v.on ? "ON" : "OFF"}.` : r.msg);
    await reload();
  }

  return (
    <OsPage
      dash={siteSpec(rows, source !== "loading")}
      kicker="SITE · CONTENT · SETTINGS"
      title="Site"
      source={source}
      notHere={[
        "No page builder — the public pages are React; these keys change copy and lists, not layout.",
        "No image fields here — photos live in the repo (public/img) or on the Posts/Events editors.",
        admin ? "Every save is audited (/os/audit)." : "Editing is admin-only (president + webmaster); officers can read.",
      ]}
    >
      {notice && <Notice kind={notice.kind}>{notice.text}</Notice>}
      <div className="grid gap-6 mt-4 max-w-[900px]">
        {rows.map((row) => {
          const key = String(row.key);
          const v = row.value;
          const isBanner = key === "maintenance_banner";
          return (
            <section key={key} className="border border-line">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-line">
                <div>
                  <MonoLabel accent>{key.toUpperCase()}</MonoLabel>
                  <p className="t-micro opacity-50 mt-0.5">{HELP[key] ?? ""}</p>
                </div>
                {admin && (
                  <div className="flex gap-2">
                    {isBanner && (
                      <Button variant="ghost" onClick={() => toggleBanner(row)}>
                        {(v as { on?: boolean })?.on ? "turn off" : "turn on"}
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setEditing(key);
                        setText(JSON.stringify(v, null, 2));
                        setErr(null);
                      }}
                    >
                      edit
                    </Button>
                  </div>
                )}
              </div>
              {editing === key ? (
                <div className="p-4">
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    rows={Math.min(24, text.split("\n").length + 2)}
                    className="w-full bg-transparent border border-line px-3 py-2 font-mono text-[12px] text-ink focus:border-teal outline-none"
                  />
                  {err && <p className="t-micro text-(--color-red-hi) mt-2">{err}</p>}
                  <div className="flex gap-2 mt-3">
                    <Button variant="primary" onClick={() => save(key)}>
                      save
                    </Button>
                    <Button variant="ghost" onClick={() => setEditing(null)}>
                      cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <KeyVal
                  className="border-0"
                  rows={
                    v && typeof v === "object" && !Array.isArray(v)
                      ? Object.entries(v as Record<string, unknown>).map(([k, val]) => ({
                          k,
                          v: <span className="font-mono text-[12px] whitespace-pre-wrap break-all">{typeof val === "string" ? val : JSON.stringify(val)}</span>,
                        }))
                      : [{ k: "value", v: <span className="font-mono text-[12px]">{JSON.stringify(v)}</span> }]
                  }
                />
              )}
            </section>
          );
        })}
      </div>
    </OsPage>
  );
}
