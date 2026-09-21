/** /projects — one public section for apps, tools, research and class
    projects. Featured spec sheet → Apps grid → Projects (the display
    section; three pitch slots while empty) → Submit → How review works.
    Reads /api/projects with data/projects.json as the fallback. */
import { useState } from "react";
import projectsData from "@data/projects.json";
import { Band } from "@/components/Band";
import { PageHero } from "@/components/PageHero";
import { FinLine } from "@/components/FinLine";
import { TicketCard } from "@/components/cards/TicketCard";
import { SpecSheet, BigStat } from "@/components/cards/SpecSheet";
import { SlotCard } from "@/components/cards/SlotCard";
import { IndexList } from "@/components/cards/IndexList";
import { Readout } from "@/components/cards/StatChip";
import { Meter } from "@/components/cards/Meter";
import { Reveal } from "@/motion/Reveal";
import { Button } from "@/components/Button";
import { postWithFallback, type SubmitResult } from "@/lib/api";
import type { ProjectSubmit } from "@/lib/api.types";
import { useApi } from "@/lib/useApi";
import { brand } from "@brand/brand.config";
import * as Sg from "@/sigils";

type Project = {
  id: string;
  kind: string;
  title: string;
  summary?: string;
  platform?: string[];
  stack?: string[];
  links?: Record<string, string>;
  benefits_jj?: string;
  authors?: { name: string; handle?: string; term?: string }[];
  featured?: boolean;
  example?: boolean;
  term?: string;
};
const KINDS = ["app", "project", "research", "tool"] as const;
const SLOTS = [
  { n: "01", label: "Your capstone" },
  { n: "02", label: "A class project" },
  { n: "03", label: "Research" },
];

export default function Projects() {
  const { data } = useApi<{ projects: Project[] }>("/api/projects", projectsData as { projects: Project[] });
  const all = data.projects;
  const featured = all.find((p) => p.featured) ?? all[0];
  const apps = all.filter((p) => p.kind === "app");
  const projects = all.filter((p) => p.kind !== "app");
  const real = all.filter((p) => !p.example).length;
  return (
    <main>
      <PageHero
        kicker="PROJECTS · BUILT AT JOHN JAY · BOARD-REVIEWED"
        cubeFace="green"
        cubeGlow={brand.palette.green}
        lines={["Projects.", { text: "Built here.", className: "text-(--accent-fg)", split: 5 }]}
        dek="Apps, tools, research and class projects by John Jay students — one register, reviewed by the board before it ships with your name on it. Cards marked EXAMPLE show the format."
        right={<Readout value={3} label="review steps" />}
        stats={[
          { v: real, l: "PUBLISHED · REAL" },
          { v: apps.length, l: "APPS" },
          { v: projects.length, l: "PROJECTS · RESEARCH · TOOLS" },
          { v: KINDS.length, l: "KINDS ACCEPTED" },
        ]}
      />

      {featured && (
        <Band tone="tinted" accent="green" index="01 — FEATURED · SPEC SHEET" sigil={<Sg.Terminal size={16} />} code="FEATURED" rail="01 · PROJECTS · 01010000 · FEATURED">
          <div className="grid md:grid-cols-[7fr_5fr] gap-10 items-start">
            <Reveal>
              <SpecSheet
                tag={featured.example ? "EXAMPLE" : featured.kind.toUpperCase()}
                title={featured.title}
                rows={[
                  { k: "AUTHORS", v: featured.authors?.map((a) => a.name).join(", ") || "Your name here" },
                  { k: "PLATFORM", v: featured.platform?.join(" · ") || "—" },
                  { k: "STACK", v: featured.stack?.join(" · ") || "—" },
                  { k: "FOR JOHN JAY", v: featured.benefits_jj || "—" },
                  { k: "LINKS", v: Object.entries(featured.links ?? {}).filter(([, u]) => u).map(([k]) => k).join(" · ") || "repo · live · demo" },
                ]}
              >
                <BigStat value={100} suffix="%" label="YOUR NAME ON IT — THE POINT" />
              </SpecSheet>
            </Reveal>
            <div>
              <p className="mono-label mb-3">HOW REVIEW WORKS</p>
              <IndexList
                rows={[
                  { index: "1", bracket: true, title: "Submit", dek: "Title, kind, summary, link — two minutes", sigil: <Sg.Terminal size={14} /> },
                  { index: "2", bracket: true, title: "Board review", dek: "Fit + a working link; a written note if changes are needed", sigil: <Sg.Eye size={14} /> },
                  { index: "3", bracket: true, title: "Published", dek: "On this page with your byline", sigil: <Sg.Tick size={14} /> },
                ]}
              />
              <Meter label="pipeline" value={real} max={Math.max(3, real)} className="mt-5" />
            </div>
          </div>
        </Band>
      )}

      <Band tone="dark-2" accent="green" index="02 — APPS" sigil={<Sg.Node size={16} />} code="APPS" rail="02 · APPS · 01000001 · REGISTER">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {apps.map((p) => (
            <TicketCard
              key={p.id}
              model={`${p.example ? "EX" : "APP"}-${p.id.slice(-4).toUpperCase()}`}
              title={p.title}
              body={p.summary}
              href={p.links?.live || p.links?.repo}
              rows={[
                { k: "PLATFORM", v: p.platform?.join(" · ") || "—" },
                { k: "STACK", v: p.stack?.join(" · ") || "—" },
                { k: "STATUS", v: p.example ? "EXAMPLE — NOT REAL" : "PUBLISHED" },
              ]}
            />
          ))}
          <SlotCard n={String(apps.length + 1).padStart(2, "0")} label="Your app here" action="submit ↓" href="#submit" className="min-h-[200px]" />
        </div>
      </Band>

      <Band tone="light" accent="green" index="03 — PROJECTS · RESEARCH · TOOLS" sigil={<Sg.Lambda size={16} />} code="DISPLAY" rail="03 · PROJECTS · 01010010 · OPEN SLOTS">
        {projects.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => (
              <TicketCard key={p.id} model={`${p.kind.toUpperCase().slice(0, 4)}-${p.id.slice(-4).toUpperCase()}`} title={p.title} body={p.summary} href={p.links?.live || p.links?.repo}
                rows={[{ k: "KIND", v: p.kind.toUpperCase() }, { k: "AUTHORS", v: p.authors?.map((a) => a.name).join(", ") || "—" }, { k: "TERM", v: p.term || "—" }]} />
            ))}
          </div>
        ) : (
          <div>
            <p className="text-[16px] leading-relaxed max-w-[58ch] mb-8" style={{ color: "var(--tone-muted)" }}>
              Nothing published yet — which is the pitch. Capstones, class projects and research get the same review and the same byline as apps. Three slots are open.
            </p>
            <div className="grid gap-6 sm:grid-cols-3">
              {SLOTS.map((s) => (
                <SlotCard key={s.n} n={s.n} label={s.label} action="submit ↓" href="#submit" className="min-h-[180px]" />
              ))}
            </div>
          </div>
        )}
      </Band>

      <SubmitBand />
      <FinLine n="04" next="/cyberhounds" />
    </main>
  );
}

function SubmitBand() {
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [busy, setBusy] = useState(false);
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    const data = Object.fromEntries(new FormData(e.currentTarget).entries()) as Record<string, string>;
    const payload: ProjectSubmit = {
      title: data.title, author: data.author, email: data.email, summary: data.summary, link: data.link || null,
      kind: (data.kind as ProjectSubmit["kind"]) ?? "app",
      platform: (data.platform ?? "").split(",").map((s) => s.trim()).filter(Boolean),
    };
    setResult(await postWithFallback("/api/projects/submit", payload));
    setBusy(false);
  }
  const field = "w-full bg-transparent border-0 border-b border-(--tone-line) px-1 py-2.5 font-mono text-sm text-ink-on-paper placeholder:text-muted-on-paper/40 focus:border-(--accent) outline-none";
  return (
    <Band tone="light-2" accent="green" index="04 — SUBMIT" sigil={<Sg.ArrowSq size={16} />} code="INTAKE" rail="04 · FORM · 01010011 · TIER-1 SAFE" id="submit">
      <div className="max-w-[760px]">
        {result?.ok ? (
          <Reveal>
            <div className="border border-(--tone-line) p-8">
              <p className="font-display font-bold text-xl mb-2">Submission received{result.stored === "local-browser" ? " — saved on this device" : ""}.</p>
              <p className="text-sm leading-relaxed" style={{ color: "var(--tone-muted)" }}>
                {result.stored === "api" ? "The board reviews every submission in the OS; you'll hear back by email." : "The API is asleep right now, so your draft is stored in this browser. Re-submit when the site is back online — nothing was lost."}
              </p>
            </div>
          </Reveal>
        ) : (
          <form onSubmit={onSubmit} className="border border-(--tone-line)">
            {[
              { k: "_TITLE *", el: <input required name="title" className={field} placeholder="Campus Room Finder" /> },
              { k: "KIND *", el: <select required name="kind" className={`${field} bg-transparent`}>{KINDS.map((k) => <option key={k} value={k}>{k}</option>)}</select> },
              { k: "YOUR NAME *", el: <input required name="author" className={field} placeholder="Jay Bloodhound" /> },
              { k: "EMAIL *", el: <input required type="email" name="email" className={field} placeholder="you@jjay.cuny.edu" /> },
              { k: "PLATFORMS", el: <input name="platform" className={field} placeholder="web, ios (apps only)" /> },
              { k: "LINK", el: <input name="link" className={field} placeholder="https://github.com/you/project" /> },
              { k: "SUMMARY *", el: <textarea required name="summary" rows={4} className={field} placeholder="What it does + how it helps John Jay students" /> },
            ].map((row) => (
              <label key={row.k} className="grid md:grid-cols-[220px_1fr] gap-2 md:gap-6 items-start px-5 py-4 border-b border-(--tone-line)">
                <span className="mono-label pt-2.5" style={{ color: "var(--tone-muted)" }}>{row.k}</span>
                {row.el}
              </label>
            ))}
            <div className="px-5 py-4">
              <Button type="submit" variant="ghost" disabled={busy}>{busy ? "submitting" : ">_submit_project"}</Button>
            </div>
          </form>
        )}
      </div>
    </Band>
  );
}
