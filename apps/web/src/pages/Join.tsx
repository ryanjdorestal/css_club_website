import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import links from "@data/links.json";
import { Section } from "@/components/Section";
import { SectionHeader } from "@/components/SectionHeader";
import { MonoLabel } from "@/components/MonoLabel";
import { Button, ButtonLink } from "@/components/Button";
import { postWithFallback, type SubmitResult } from "@/lib/api";

/** /join — blue. Onboarding form (rhecwb onboarding shape) + Discord + updates. */
export default function Join() {
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [busy, setBusy] = useState(false);
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    const data = Object.fromEntries(new FormData(e.currentTarget).entries());
    setResult(await postWithFallback("/api/onboarding/submit", data));
    setBusy(false);
  }
  const field =
    "w-full bg-navy-800 border border-line rounded-(--radius-sm) px-3 py-2.5 text-sm text-ink placeholder:text-muted/60 focus:border-(--accent) outline-none";
  return (
    <main>
      <Section accent="blue">
        <SectionHeader index="03" title="Join" kicker="Free · Open to all majors" as="h1" />
        <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr] items-start">
          <div className="border border-line rounded-(--radius-md) p-6 md:p-8">
            <MonoLabel accent>{"//"} 01 · Onboarding</MonoLabel>
            <h2 className="font-display font-bold uppercase text-2xl mt-2 mb-5" style={{ fontStretch: "112%" }}>
              Tell us who you are
            </h2>
            {result?.ok ? (
              <div className="text-sm leading-relaxed">
                <p className="text-(--accent-fg) font-medium">
                  Welcome aboard{result.stored === "local-browser" ? " — saved on this device" : ""}.
                </p>
                <p className="text-muted mt-2">
                  {result.stored === "api"
                    ? "The board processes onboarding weekly during the semester. Jump into the Discord in the meantime."
                    : "The API is asleep right now, so your form is stored in this browser. Re-submit when the site is back online — and join the Discord now, that part always works."}
                </p>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-1.5">
                  <MonoLabel>Name *</MonoLabel>
                  <input required name="name" className={field} placeholder="Jay Bloodhound" />
                </label>
                <label className="grid gap-1.5">
                  <MonoLabel>Email *</MonoLabel>
                  <input required type="email" name="email" className={field} placeholder="you@jjay.cuny.edu" />
                </label>
                <label className="grid gap-1.5">
                  <MonoLabel>Major</MonoLabel>
                  <input name="major" className={field} placeholder="Computer Science & Information Security" />
                </label>
                <label className="grid gap-1.5">
                  <MonoLabel>Expected class year</MonoLabel>
                  <input name="class_year" className={field} placeholder="2028" />
                </label>
                <label className="grid gap-1.5 sm:col-span-2">
                  <MonoLabel>What are you into?</MonoLabel>
                  <textarea
                    name="interests"
                    rows={3}
                    className={field}
                    placeholder="Cybersecurity, CTFs, iOS, web dev, AI…"
                  />
                </label>
                <div className="sm:col-span-2">
                  <Button type="submit" disabled={busy}>
                    {busy ? "Submitting…" : "Join the club"} <ArrowUpRight size={16} />
                  </Button>
                </div>
              </form>
            )}
          </div>
          <div className="flex flex-col gap-4">
            <div className="border border-line rounded-(--radius-md) p-6">
              <MonoLabel accent>{"//"} 02 · Discord</MonoLabel>
              <p className="text-sm text-muted leading-relaxed mt-2 mb-4">
                Day-to-day club life — announcements, study sessions, CTF practice —
                happens on the Discord server.
              </p>
              <ButtonLink to={links.discord} external variant="primary">
                Join the Discord
              </ButtonLink>
            </div>
            <div className="border border-line rounded-(--radius-md) p-6">
              <MonoLabel accent>{"//"} 03 · Email updates</MonoLabel>
              <p className="text-sm text-muted leading-relaxed mt-2 mb-4">
                Prefer email? The update list gets event announcements each semester.
              </p>
              <ButtonLink to={links.email_updates_form} external variant="ghost">
                Get email updates <ArrowUpRight size={14} />
              </ButtonLink>
            </div>
          </div>
        </div>
      </Section>
    </main>
  );
}
