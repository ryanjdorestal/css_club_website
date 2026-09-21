import { brand } from "@brand/brand.config";
import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import linksData from "@data/links.json";
import { useApi } from "@/lib/useApi";
import collaborate from "@data/collaborate.json";
import { Band } from "@/components/Band";
import { PageHero } from "@/components/PageHero";
import { FinLine } from "@/components/FinLine";
import { IndexList } from "@/components/cards/IndexList";
import { FolderCard } from "@/components/cards/FolderCard";
import { Reveal } from "@/motion/Reveal";
import * as Sg from "@/sigils";
import { Tag } from "@/components/cards/Tag";
import { Button } from "@/components/Button";
import { postWithFallback, type SubmitResult } from "@/lib/api";
import type { OnboardingSubmit } from "@/lib/api.types";

export default function Join() {
  return (
    <main>
      <PageHero
        kicker="JOIN · FREE · OPEN TO ALL MAJORS"
        cubeFace="blue"
        cubeGlow={brand.palette.blue}
        lines={[
          { text: "Join", stencil: true },
          { text: "the society.", className: "text-(--accent-fg)", outline: true },
        ]}
        dek="Joining is free and open to every John Jay student, any major. Fill the onboarding form, hop into the Discord, and show up — that's the entire process."
        right={
          <div aria-hidden className="relative border border-line p-8 hidden md:block" style={{ color: "var(--color-cube-blue)" }}>
            <Sg.CSSKufic size={54} />
            <span className="t-micro text-muted absolute bottom-2 right-3">JJ_07 · SQUARE_KUFIC</span>
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
      <Band tone="tinted" accent="blue" index="01 — WHY JOIN" sigil={<Sg.Star4 size={16} />} code="WHY" rail="01 · JOIN · 01001010 · ALL MAJORS">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              tag: "COMMUNITY",
              copy: "A society of like-minded people who are eager to connect — study sessions, movie days, merch days, and a Discord that never sleeps.",
            },
            { tag: "SKILLS", copy: "Workshops every semester: security, Python, AWS, AI, web, iOS — beginner to advanced, no prerequisites." },
            { tag: "CAREER", copy: "Interview prep, alumni panels, career workshops, and the Apps register to ship something with your name on it." },
          ].map((c) => (
            <Reveal key={c.tag}>
              <div className="border border-(--tone-line) p-6 h-full">
                <Tag>{c.tag}</Tag>
                <p className="text-sm leading-relaxed mt-4" style={{ color: "var(--tone-muted)" }}>
                  {c.copy}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </Band>

      {/* 3 — openings/committees/ideas/suggestions (full lists) */}
      <Band
        tone="dark-2"
        accent="blue"
        index="02 — OPEN SEATS · FROM THE OLD COLLABORATE PAGE"
        sigil={<Sg.Lambda size={16} />}
        code="SEATS"
        rail="02 · SEATS · 01001111 · OPEN"
      >
        <div
          aria-hidden
          className="absolute right-[-10%] top-1/2 -translate-y-1/2 pointer-events-none opacity-[0.08] hidden xl:block"
          style={{ color: "var(--color-cube-blue)" }}
        >
          <Sg.CSSKufic size={170} />
        </div>
        <div className="relative grid md:grid-cols-2 gap-x-12 gap-y-10">
          <div>
            <Tag className="mb-3">EXECUTIVE_OPENINGS</Tag>
            <IndexList rows={collaborate.openings.map((o, i) => ({ index: String(i + 1), bracket: true, title: o.role, meta: "OPEN" }))} />
          </div>
          <div>
            <Tag className="mb-3">COMMITTEES</Tag>
            <IndexList rows={collaborate.committees.map((c, i) => ({ index: String(i + 1), bracket: true, title: c, meta: "JOIN" }))} />
            <Tag className="mb-3 mt-8">PROJECT_IDEAS</Tag>
            <p className="text-sm text-muted leading-relaxed">{collaborate.project_ideas}</p>
            <Tag className="mb-3 mt-6">SUGGESTIONS</Tag>
            <p className="text-sm text-muted leading-relaxed">{collaborate.suggestions}</p>
          </div>
        </div>
      </Band>

      {/* 4 — form + discord */}
      <OnboardBand />
      <FinLine n="07" next="/" />
    </main>
  );
}

function OnboardBand() {
  // the site links (Discord invite, forms) come from the OS — API first, committed JSON second (run 10: Join read the static file)
  const { data: linksApi } = useApi<{ links: Record<string, string> }>("/api/links", { links: linksData as unknown as Record<string, string> });
  const links = { ...(linksData as unknown as Record<string, string>), ...linksApi.links };
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [busy, setBusy] = useState(false);
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    const fields = Object.fromEntries(new FormData(e.currentTarget).entries()) as Record<string, string>;
    const payload: OnboardingSubmit = {
      name: fields.name,
      email: fields.email,
      major: fields.major || null,
      class_year: fields.class_year || null,
      interests: fields.interests || null,
      discord_handle: fields.discord_handle || null,
    };
    setResult(await postWithFallback("/api/onboarding/submit", payload));
    setBusy(false);
  }
  const field =
    "w-full bg-transparent border-0 border-b border-(--tone-line) px-1 py-2.5 font-mono text-sm text-ink-on-paper placeholder:text-muted-on-paper/40 focus:border-(--accent) outline-none";
  return (
    <Band tone="light" accent="blue" index="03 — ONBOARDING" sigil={<Sg.ArrowSq size={16} />} code="INTAKE" rail="03 · FORM · 01000110 · TIER-1 SAFE">
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
                <span className="mono-label pt-2.5" style={{ color: "var(--tone-muted)" }}>
                  {row.k}
                </span>
                {row.el}
              </label>
            ))}
            <div className="px-5 py-4">
              <Button type="submit" variant="ghost" disabled={busy}>
                {busy ? "submitting" : ">_join_the_society"}
              </Button>
            </div>
          </form>
        )}
        <div className="flex flex-col gap-5">
          <Reveal>
            {/* run 9: the Discord card is a folder (T11), paper, mirrored tab */}
            <FolderCard tab="DSC-2021 · DISCORD" tone="paper" mirrorTab edgeLabel="//JOIN_01 · FAST_LANE" barcode="discord-2021">
              <p className="text-[18px] font-medium leading-tight">Discord — the fast lane</p>
              <dl className="mt-3 text-[13px] grid grid-cols-[92px_1fr] gap-y-1">
                <dt className="t-micro opacity-60 pt-0.5">MEMBERS</dt>
                <dd className="tnum">661 · EST. FEB 2021</dd>
                <dt className="t-micro opacity-60 pt-0.5">STATUS</dt>
                <dd>INVITE FROM 2021 — CLICK-TEST</dd>
              </dl>
              <a
                href={links.discord}
                target="_blank"
                rel="noreferrer noopener"
                className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 bg-(--accent) text-(--accent-contrast) text-sm font-semibold hover:brightness-110 transition-all"
              >
                Join the Discord <ArrowUpRight size={14} />
              </a>
            </FolderCard>
          </Reveal>
          <Reveal delay={0.08}>
            <div className="border border-(--tone-line) p-5">
              <p className="mono-label mb-2" style={{ color: "var(--tone-muted)" }}>
                EMAIL UPDATES
              </p>
              <p className="text-sm mb-4" style={{ color: "var(--tone-muted)" }}>
                Prefer email? The update list gets event announcements each semester.
              </p>
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
