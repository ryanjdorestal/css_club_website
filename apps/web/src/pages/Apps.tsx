import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import appsData from "@data/apps.json";
import { Section } from "@/components/Section";
import { SectionHeader } from "@/components/SectionHeader";
import { SpecCard } from "@/components/SpecCard";
import { MonoLabel } from "@/components/MonoLabel";
import { Button } from "@/components/Button";
import { postWithFallback, type SubmitResult } from "@/lib/api";

const PLATFORMS = ["all", "web", "ios", "android", "desktop", "cli"] as const;

/** /apps — green. Spec-card grid of student-built apps + submission form. */
export default function Apps() {
  const [platform, setPlatform] = useState<(typeof PLATFORMS)[number]>("all");
  const apps = appsData.apps.filter(
    (a) => platform === "all" || a.platform.includes(platform),
  );
  return (
    <main>
      <Section accent="green">
        <SectionHeader index="02" title="Apps" kicker="Student-built · Board-reviewed" as="h1" />
        <p className="text-muted max-w-2xl -mt-4 mb-8 text-sm leading-relaxed">
          Software shipped by John Jay students. Submit yours below — the board reviews
          every entry before it goes live. The cards marked EXAMPLE show the format;
          they are not real apps.
        </p>
        <div className="flex flex-wrap gap-2 mb-8">
          {PLATFORMS.map((p) => (
            <button
              key={p}
              onClick={() => setPlatform(p)}
              className={`mono-label px-3 py-1.5 rounded-(--radius-sm) border transition-colors cursor-pointer ${
                platform === p
                  ? "border-(--accent) text-(--accent-fg) bg-(--accent)/10"
                  : "border-line text-muted hover:text-ink"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {apps.map((app) => (
            <SpecCard
              key={app.id}
              title={app.title}
              eyebrow={app.status === "example" ? "// EXAMPLE — not a real app" : `// ${app.term}`}
              specs={[
                { k: "Platform", v: app.platform.join(" · ") },
                { k: "Stack", v: app.stack.join(" · ") },
                { k: "Status", v: app.status },
              ]}
            >
              {app.summary}
            </SpecCard>
          ))}
        </div>
        {apps.length === 0 && (
          <p className="mono-label text-muted">No apps on this platform yet — yours could be first.</p>
        )}
      </Section>
      <SubmitApp />
    </main>
  );
}

function SubmitApp() {
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [busy, setBusy] = useState(false);
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    const data = Object.fromEntries(new FormData(e.currentTarget).entries());
    const res = await postWithFallback("/api/apps/submit", {
      ...data,
      platform: String(data.platform ?? "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    });
    setResult(res);
    setBusy(false);
  }
  const field =
    "w-full bg-navy-800 border border-line rounded-(--radius-sm) px-3 py-2.5 text-sm text-ink placeholder:text-muted/60 focus:border-(--accent) outline-none";
  return (
    <Section accent="green" className="pt-0">
      <div className="border border-line rounded-(--radius-md) p-6 md:p-8 max-w-2xl">
        <MonoLabel accent>{"//"} 03 · Submit your app</MonoLabel>
        <h2 className="font-display font-bold uppercase text-2xl mt-2 mb-5" style={{ fontStretch: "112%" }}>
          Ship it to the board
        </h2>
        {result?.ok ? (
          <div className="text-sm leading-relaxed">
            <p className="text-(--accent-fg) font-medium">
              Submission received{result.stored === "local-browser" ? " — saved on this device" : ""}.
            </p>
            <p className="text-muted mt-2">
              {result.stored === "api"
                ? "The board reviews every submission; you'll hear back by email."
                : "The API is asleep right now, so your draft is stored in this browser. Re-submit when the site is back online — nothing was lost."}
            </p>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-1.5">
              <MonoLabel>App title *</MonoLabel>
              <input required name="title" className={field} placeholder="Campus Room Finder" />
            </label>
            <label className="grid gap-1.5">
              <MonoLabel>Your name *</MonoLabel>
              <input required name="author" className={field} placeholder="Jay Bloodhound" />
            </label>
            <label className="grid gap-1.5">
              <MonoLabel>Email *</MonoLabel>
              <input required type="email" name="email" className={field} placeholder="you@jjay.cuny.edu" />
            </label>
            <label className="grid gap-1.5">
              <MonoLabel>Platforms (comma-sep)</MonoLabel>
              <input name="platform" className={field} placeholder="web, ios" />
            </label>
            <label className="grid gap-1.5 sm:col-span-2">
              <MonoLabel>Link (repo / web / store)</MonoLabel>
              <input name="link" className={field} placeholder="https://github.com/you/app" />
            </label>
            <label className="grid gap-1.5 sm:col-span-2">
              <MonoLabel>What it does + how it helps John Jay students *</MonoLabel>
              <textarea required name="summary" rows={4} className={field} />
            </label>
            <div className="sm:col-span-2">
              <Button type="submit" disabled={busy}>
                {busy ? "Submitting…" : "Submit for review"} <ArrowUpRight size={16} />
              </Button>
            </div>
          </form>
        )}
      </div>
    </Section>
  );
}
