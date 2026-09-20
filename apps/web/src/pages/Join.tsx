import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import links from "@data/links.json";
import collaborate from "@data/collaborate.json";
import { Band } from "@/components/Band";
import { PageHero } from "@/components/PageHero";
import { FinLine } from "@/components/FinLine";
import { IndexList } from "@/components/cards/IndexList";
import { TicketCard } from "@/components/cards/TicketCard";
import { Reveal } from "@/motion/Reveal";
import { Button } from "@/components/Button";
import { postWithFallback, type SubmitResult } from "@/lib/api";

export default function Join() {
  return (
    <main>
      <PageHero
        kicker="JOIN · FREE · OPEN TO ALL MAJORS"
        lines={["Join", { text: "the society.", className: "text-(--accent-fg)" }]}
        dek="Joining is free and open to every John Jay student, any major. Fill the onboarding form, hop into the Discord, and show up — that's the entire process."
        right={
          <div aria-hidden className="relative border border-line p-6 hidden md:block">
            <span className="font-display font-black uppercase leading-[0.8] text-cube-blue block" style={{ fontSize: 96, fontStretch: "118%", opacity: 0.85 }}>
              C<br />S<br />S
            </span>
            <span className="mono-label text-muted absolute bottom-2 right-3">JJ_07 · MOTIF</span>
          </div>
        }
        stats={[
          { v: 0, l: "COST · FREE FOREVER" },
          { v: collaborate.openings.length, l: "BOARD OPENINGS" },
          { v: collaborate.committees.length, l: "COMMITTEES" },
          { v: 2, l: "WAYS IN · FORM / DISCORD" },
        ]}
      />

      {/* 2 — why join */}
      <Band tone="tinted" accent="blue" index="01 — WHY JOIN" rail="01 · JOIN · 01001010 · ALL MAJORS">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { tag: "COMMUNITY", copy: "A society of like-minded people who are eager to connect — study sessions, movie days, merch days, and a Discord that never sleeps." },
            { tag: "SKILLS", copy: "Workshops every semester: security, Python, AWS, AI, web, iOS — beginner to advanced, no prerequisites." },
            { tag: "CAREER", copy: "Interview prep, alumni panels, career workshops, and the Apps register to ship something with your name on it." },
          ].map((c) => (
            <Reveal key={c.tag}>
              <div className="border border-(--tone-line) p-6 h-full">
                <span className="mono-label bg-(--accent) text-(--accent-contrast) px-2 py-1">{c.tag}</span>
                <p className="text-sm leading-relaxed mt-4" style={{ color: "var(--tone-muted)" }}>{c.copy}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Band>

      {/* 3 — openings/committees/ideas/suggestions (full lists) */}
      <Band tone="dark-2" accent="blue" index="02 — OPEN SEATS · FROM THE OLD COLLABORATE PAGE" rail="02 · SEATS · 01001111 · OPEN">
        <div className="grid md:grid-cols-2 gap-x-12 gap-y-10">
          <div>
            <p className="mono-label mb-3"><span className="bg-(--accent) text-(--accent-contrast) px-2 py-1">EXECUTIVE OPENINGS</span></p>
            <IndexList rows={collaborate.openings.map((o) => ({ title: o.role, meta: "OPEN · APPLY BELOW" }))} />
          </div>
          <div>
            <p className="mono-label mb-3"><span className="bg-(--accent) text-(--accent-contrast) px-2 py-1">COMMITTEES</span></p>
            <IndexList rows={collaborate.committees.map((c) => ({ title: c, meta: "JOIN" }))} />
            <p className="mono-label mb-3 mt-8"><span className="bg-(--accent) text-(--accent-contrast) px-2 py-1">PROJECT IDEAS</span></p>
            <p className="text-sm text-muted leading-relaxed">{collaborate.project_ideas}</p>
            <p className="mono-label mb-3 mt-6"><span className="bg-(--accent) text-(--accent-contrast) px-2 py-1">SUGGESTIONS</span></p>
            <p className="text-sm text-muted leading-relaxed">{collaborate.suggestions}</p>
          </div>
        </div>
      </Band>

      {/* 4 — form + discord */}
      <OnboardBand />
      <FinLine n="07" />
    </main>
  );
}

function OnboardBand() {
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [busy, setBusy] = useState(false);
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setResult(await postWithFallback("/api/onboarding/submit", Object.fromEntries(new FormData(e.currentTarget).entries())));
    setBusy(false);
  }
  const field =
    "w-full bg-white border border-(--tone-line) rounded-(--radius-sm) px-3 py-2.5 text-sm text-ink-on-paper placeholder:text-muted-on-paper/50 focus:border-(--accent) outline-none";
  return (
    <Band tone="light" accent="blue" index="03 — ONBOARDING" rail="03 · FORM · 01000110 · TIER-1 SAFE">
      <div className="grid lg:grid-cols-[7fr_5fr] gap-10 items-start">
        {result?.ok ? (
          <Reveal>
            <div className="border border-(--tone-line) p-8">
              <p className="font-display font-bold text-xl mb-2" style={{ fontStretch: "110%" }}>
                Welcome aboard{result.stored === "local-browser" ? " — saved on this device" : ""}.
              </p>
              <p className="text-sm leading-relaxed" style={{ color: "var(--tone-muted)" }}>
                {result.stored === "api"
                  ? "The board processes onboarding weekly during the semester. Jump into the Discord in the meantime."
                  : "The API is asleep right now, so your form is stored in this browser. Re-submit when the site is back online — and join the Discord now, that part always works."}
              </p>
            </div>
          </Reveal>
        ) : (
          <form onSubmit={onSubmit} className="border border-(--tone-line)">
            {[
              { k: "NAME *", el: <input required name="name" className={field} placeholder="Jay Bloodhound" /> },
              { k: "EMAIL *", el: <input required type="email" name="email" className={field} placeholder="you@jjay.cuny.edu" /> },
              { k: "MAJOR", el: <input name="major" className={field} placeholder="Computer Science & Information Security" /> },
              { k: "CLASS YEAR", el: <input name="class_year" className={field} placeholder="2028" /> },
              { k: "INTO", el: <textarea name="interests" rows={3} className={field} placeholder="Cybersecurity, CTFs, iOS, web dev, AI…" /> },
            ].map((row) => (
              <label key={row.k} className="grid md:grid-cols-[200px_1fr] gap-2 md:gap-6 items-start px-5 py-4 border-b border-(--tone-line)">
                <span className="mono-label pt-2.5" style={{ color: "var(--tone-muted)" }}>{row.k}</span>
                {row.el}
              </label>
            ))}
            <div className="px-5 py-4">
              <Button type="submit" disabled={busy}>
                {busy ? "Submitting…" : "Join the club"} <ArrowUpRight size={15} />
              </Button>
            </div>
          </form>
        )}
        <div className="flex flex-col gap-5">
          <Reveal>
            <TicketCard
              model="DSC-2021"
              title="Discord — the fast lane"
              rows={[{ k: "MEMBERS", v: "661 · EST. FEB 2021" }, { k: "STATUS", v: "INVITE FROM 2021 — CLICK-TEST" }]}
              footer={
                <a href={links.discord} target="_blank" rel="noreferrer noopener" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-(--radius-sm) bg-(--accent) text-(--accent-contrast) text-sm font-semibold hover:brightness-110 transition-all">
                  Join the Discord <ArrowUpRight size={14} />
                </a>
              }
            />
          </Reveal>
          <Reveal delay={0.08}>
            <div className="border border-(--tone-line) p-5">
              <p className="mono-label mb-2" style={{ color: "var(--tone-muted)" }}>EMAIL UPDATES</p>
              <p className="text-sm mb-4" style={{ color: "var(--tone-muted)" }}>Prefer email? The update list gets event announcements each semester.</p>
              <a href={links.email_updates_form} target="_blank" rel="noreferrer noopener" className="mono-label text-(--accent-ink) u-draw">
                GET EMAIL UPDATES ↗
              </a>
            </div>
          </Reveal>
        </div>
      </div>
    </Band>
  );
}
