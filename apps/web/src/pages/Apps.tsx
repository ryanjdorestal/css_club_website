import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import appsData from "@data/apps.json";
import { Band } from "@/components/Band";
import { PageHero } from "@/components/PageHero";
import { FinLine } from "@/components/FinLine";
import { TicketCard } from "@/components/cards/TicketCard";
import { SpecSheet, BigStat } from "@/components/cards/SpecSheet";
import { SlotCard } from "@/components/cards/SlotCard";
import { IndexList } from "@/components/cards/IndexList";
import { StatChip } from "@/components/cards/StatChip";
import { Reveal } from "@/motion/Reveal";
import { Button } from "@/components/Button";
import { postWithFallback, type SubmitResult } from "@/lib/api";
import { CubeSpot } from "@/cube/CubeSpot";
import { motion } from "motion/react";

const PLATFORMS = ["all", "web", "ios", "android", "desktop", "cli"] as const;
const featured = appsData.apps[0];

export default function Apps() {
  const [platform, setPlatform] = useState<(typeof PLATFORMS)[number]>("all");
  const apps = appsData.apps.filter((a) => platform === "all" || a.platform.includes(platform));
  return (
    <main>
      <PageHero
        kicker="APPS · BUILT AT JOHN JAY · BOARD-REVIEWED"
        lines={["Apps.", { text: "Built here.", className: "text-(--accent-fg)" }]}
        dek="The club's public register of software built by John Jay students. Submit yours below — the board reviews every entry before it ships with your name on it. Cards marked EXAMPLE show the format; they are not real apps."
        right={
          <div className="relative">
            <CubeSpot />
            <StatChip value={3} label="Review steps" style={{ position: "absolute", right: "-4%", top: "8%" }} />
          </div>
        }
        stats={[
          { v: 0, l: "LIVE APPS · REAL" },
          { v: 3, l: "EXAMPLE FORMATS" },
          { v: 3, l: "REVIEW STEPS" },
          { v: 5, l: "PLATFORMS ACCEPTED" },
        ]}
      />

      {/* 2 — Featured spec sheet */}
      <Band tone="tinted" accent="green" index="01 — THE FORMAT · SPEC SHEET" rail="01 · APPS · 01000001 · SUBMIT">
        <div className="grid md:grid-cols-[7fr_5fr] gap-10 items-start">
          <Reveal>
            <SpecSheet
              tag="EXAMPLE"
              title={featured.title}
              rows={[
                { k: "AUTHOR", v: "Your name here" },
                { k: "PLATFORM", v: featured.platform.join(" · ") },
                { k: "STACK", v: featured.stack.join(" · ") },
                { k: "FOR JOHN JAY", v: featured.benefits_jj },
                { k: "LINKS", v: "web · store · repo" },
              ]}
            >
              <BigStat value={100} suffix="%" label="YOUR NAME ON IT — THE POINT" />
            </SpecSheet>
          </Reveal>
          <div>
            <p className="mono-label mb-3">HOW REVIEW WORKS</p>
            <IndexList
              rows={[
                { title: "Submit the form", dek: "Title, platform, summary, link — two minutes", meta: "STEP 1" },
                { title: "Board reviews it", dek: "Fit + a working link; feedback by email", meta: "STEP 2" },
                { title: "It goes live", dek: "Published to this page with your byline", meta: "STEP 3" },
              ]}
            />
          </div>
        </div>
      </Band>

      {/* 3 — Directory with filter */}
      <Band tone="dark-2" accent="green" index="02 — DIRECTORY" rail="02 · REGISTER · 01000100 · OPEN">
        <div className="flex flex-wrap gap-2 mb-8">
          {PLATFORMS.map((p) => (
            <button
              key={p}
              onClick={() => setPlatform(p)}
              className={`mono-label px-3.5 py-1.5 rounded-full border transition-colors cursor-pointer ${
                platform === p ? "border-(--accent) text-(--accent-fg) bg-(--accent)/10" : "border-line text-muted hover:text-ink"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
        <motion.div layout className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {apps.map((app) => (
            <motion.div layout key={app.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <TicketCard
                model={`APP-EX-${app.id.slice(-2).toUpperCase()}`}
                title={app.title}
                body={app.summary}
                rows={[
                  { k: "PLATFORM", v: app.platform.join(" · ") },
                  { k: "STACK", v: app.stack.join(" · ") },
                  { k: "STATUS", v: "EXAMPLE — NOT REAL" },
                ]}
              />
            </motion.div>
          ))}
          <SlotCard n={String(apps.length + 1).padStart(2, "0")} label="Your app here" action="submit ↓" className="min-h-[200px]" />
        </motion.div>
      </Band>

      {/* 4 — Submit as spec sheet */}
      <SubmitBand />
      <FinLine n="04" />
    </main>
  );
}

function SubmitBand() {
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [busy, setBusy] = useState(false);
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    const data = Object.fromEntries(new FormData(e.currentTarget).entries());
    const res = await postWithFallback("/api/apps/submit", {
      ...data,
      platform: String(data.platform ?? "").split(",").map((s) => s.trim()).filter(Boolean),
    });
    setResult(res);
    setBusy(false);
  }
  const field =
    "w-full bg-white border border-(--tone-line) rounded-(--radius-sm) px-3 py-2.5 text-sm text-ink-on-paper placeholder:text-muted-on-paper/50 focus:border-(--accent) outline-none";
  return (
    <Band tone="light" accent="green" index="03 — SUBMIT YOUR APP" rail="03 · FORM · 01010011 · TIER-1 SAFE">
      <div className="max-w-[760px]">
        {result?.ok ? (
          <Reveal>
            <div className="border border-(--tone-line) p-8">
              <p className="font-display font-bold text-xl mb-2" style={{ fontStretch: "110%" }}>
                Submission received{result.stored === "local-browser" ? " — saved on this device" : ""}.
              </p>
              <p className="text-sm leading-relaxed" style={{ color: "var(--tone-muted)" }}>
                {result.stored === "api"
                  ? "The board reviews every submission; you'll hear back by email."
                  : "The API is asleep right now, so your draft is stored in this browser. Re-submit when the site is back online — nothing was lost."}
              </p>
            </div>
          </Reveal>
        ) : (
          <form onSubmit={onSubmit} className="border border-(--tone-line)">
            {[
              { k: "APP TITLE *", el: <input required name="title" className={field} placeholder="Campus Room Finder" /> },
              { k: "YOUR NAME *", el: <input required name="author" className={field} placeholder="Jay Bloodhound" /> },
              { k: "EMAIL *", el: <input required type="email" name="email" className={field} placeholder="you@jjay.cuny.edu" /> },
              { k: "PLATFORMS", el: <input name="platform" className={field} placeholder="web, ios" /> },
              { k: "LINK", el: <input name="link" className={field} placeholder="https://github.com/you/app" /> },
              { k: "SUMMARY *", el: <textarea required name="summary" rows={4} className={field} placeholder="What it does + how it helps John Jay students" /> },
            ].map((row) => (
              <label key={row.k} className="grid md:grid-cols-[220px_1fr] gap-2 md:gap-6 items-start px-5 py-4 border-b border-(--tone-line)">
                <span className="mono-label pt-2.5" style={{ color: "var(--tone-muted)" }}>{row.k}</span>
                {row.el}
              </label>
            ))}
            <div className="px-5 py-4">
              <Button type="submit" disabled={busy}>
                {busy ? "Submitting…" : "Submit for review"} <ArrowUpRight size={15} />
              </Button>
            </div>
          </form>
        )}
      </div>
    </Band>
  );
}
