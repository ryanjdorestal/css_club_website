import { Link, useParams } from "react-router-dom";
import gradRaw from "@content/news/grad-school-events.md?raw";
import { parseMd } from "@/lib/md";
import { Band } from "@/components/Band";
import { PageHero } from "@/components/PageHero";
import { FinLine } from "@/components/FinLine";
import { IndexList } from "@/components/cards/IndexList";
import { Pullquote } from "@/components/Pullquote";
import { Reveal } from "@/motion/Reveal";
import { MonoLabel } from "@/components/MonoLabel";

const POSTS = [{ slug: "grad-school-events", raw: gradRaw, issue: "001", date: "MIGRATED · 2023" }];

/** /news — light reading surface (the old site's tinted sections, modernized).
    The grad-school article is issue 001; the old Blog shipped zero posts. */
export function NewsIndex() {
  return (
    <main>
      <PageHero
        kicker="NEWS · BULLETINS · ISSUE LOG"
        lines={["News."]}
        dek="Bulletins and articles. The old Blog shipped zero posts — News replaces it; board bulletins land here once the OS is live. Issue 001 is the graduate-school guide migrated from the old site."
        stats={[
          { v: 1, l: "ISSUES PUBLISHED" },
          { v: 0, l: "OLD BLOG POSTS (REALLY)" },
        ]}
      />
      <Band tone="light" accent="blue" index="01 — ISSUE LOG" rail="01 · NEWS · 01001110 · LOG">
        <IndexList
          rows={[
            ...POSTS.map((p) => {
              const doc = parseMd(p.raw);
              return {
                index: p.issue,
                title: doc.meta.title ?? p.slug,
                dek: "Programs · Colleges · Locations — what to check before any grad-school event",
                meta: p.date,
                href: `/news/${p.slug}`,
              };
            }),
            { index: "002", title: "Fall 2026 kickoff bulletin", dek: "Pending — written by the board in the OS", chip: "PLANNED" },
            { index: "003", title: "Cyberhounds season recap", dek: "Pending — after the first NCL bracket", chip: "PLANNED" },
          ]}
        />
      </Band>
      <FinLine n="08" />
    </main>
  );
}

export function NewsArticle() {
  const { slug } = useParams();
  const post = POSTS.find((p) => p.slug === slug);
  if (!post) {
    return (
      <main className="pt-[120px]" data-tone="dark">
        <div className="max-w-[720px] mx-auto px-5 py-20 text-center">
          <p className="pixel text-teal text-4xl">NO SUCH BULLETIN</p>
          <Link to="/news" className="mono-label text-teal u-draw mt-6 inline-block">← BACK TO THE ISSUE LOG</Link>
        </div>
      </main>
    );
  }
  const doc = parseMd(post.raw);
  return (
    <main>
      <section data-tone="light" data-accent="blue" className="pt-[120px] pb-20">
        <article className="max-w-[720px] mx-auto px-5">
          <Reveal y={10}>
            <div className="flex items-center gap-4 mb-8">
              <MonoLabel className="!text-(--accent)">ISSUE {post.issue}</MonoLabel>
              <span className="h-px grow bg-(--tone-line)" />
              <span className="mono-label" style={{ color: "var(--tone-muted)" }}>{post.date}</span>
            </div>
          </Reveal>
          <Reveal>
            <h1 className="font-display font-black text-[clamp(28px,4vw,48px)] leading-[1.05] tracking-tight mb-10">
              {doc.meta.title}
            </h1>
          </Reveal>
          {doc.blocks.map((b, i) =>
            b.type === "h2" ? (
              <h2 key={i} className="font-display font-bold text-xl mt-10 mb-3" style={{ fontStretch: "108%" }}>
                {b.text}
              </h2>
            ) : i === 2 ? (
              <div key={i}>
                <Pullquote>{b.text.split(".")[0] + "."}</Pullquote>
                <p className="text-[17px] leading-[1.7] mb-5 mt-6" style={{ color: "var(--tone-muted)" }}>{b.text}</p>
              </div>
            ) : (
              <p key={i} className="text-[17px] leading-[1.7] mb-5" style={{ color: "var(--tone-muted)" }}>
                {b.text}
              </p>
            ),
          )}
          <p className="mono-label mt-12 pt-6 border-t border-(--tone-line)" style={{ color: "var(--tone-muted)" }}>
            MIGRATED FROM CSS_WEBSITE@A8FCA55 · <Link to="/news" className="text-(--accent) u-draw">← ISSUE LOG</Link>
          </p>
        </article>
      </section>
      <FinLine n="08" />
    </main>
  );
}
