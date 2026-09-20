import { Link, useParams } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import gradRaw from "@content/news/grad-school-events.md?raw";
import { parseMd } from "@/lib/md";
import { MonoLabel } from "@/components/MonoLabel";

const POSTS = [{ slug: "grad-school-events", raw: gradRaw }];

/** /news — light reading surface, blue tint (the old site's tinted sections,
    modernized). The grad-school article is post #1; the Blog had zero posts. */
export function NewsIndex() {
  return (
    <main data-accent="blue" className="bg-light text-navy-900 grow">
      <div className="max-w-4xl mx-auto px-5 py-14">
        <MonoLabel className="!text-navy-600">{"//"} News · Bulletins</MonoLabel>
        <h1
          className="font-display font-black uppercase text-[clamp(2.2rem,6vw,4rem)] mt-2 mb-8 text-navy-900"
          style={{ fontStretch: "115%" }}
        >
          News
        </h1>
        <div className="flex flex-col gap-4">
          {POSTS.map((p) => {
            const doc = parseMd(p.raw);
            return (
              <Link
                key={p.slug}
                to={`/news/${p.slug}`}
                className="group block p-6 rounded-(--radius-md) border border-navy-600/15 transition-colors hover:border-(--accent)"
                style={{ background: "var(--accent-tint)" }}
              >
                <MonoLabel className="!text-navy-600">Article · from the old site</MonoLabel>
                <h2 className="font-display font-bold text-xl text-navy-900 mt-1 flex items-center gap-2">
                  {doc.meta.title}
                  <ArrowUpRight size={18} className="text-navy-600 group-hover:text-(--accent) transition-colors" />
                </h2>
              </Link>
            );
          })}
          <p className="mono-label text-navy-600/70 mt-4">
            The old Blog shipped zero posts — News replaces it. Bulletins land here once
            the OS is live.
          </p>
        </div>
      </div>
    </main>
  );
}

export function NewsArticle() {
  const { slug } = useParams();
  const post = POSTS.find((p) => p.slug === slug);
  if (!post) {
    return (
      <main data-accent="blue" className="bg-light text-navy-900 grow">
        <div className="max-w-3xl mx-auto px-5 py-14">
          <p className="pixel text-3xl text-navy-900">404 — no such bulletin</p>
          <Link to="/news" className="mono-label text-(--accent) hover:underline">← back to News</Link>
        </div>
      </main>
    );
  }
  const doc = parseMd(post.raw);
  return (
    <main data-accent="blue" className="bg-light text-navy-900 grow">
      <article className="max-w-3xl mx-auto px-5 py-14">
        <Link to="/news" className="mono-label text-navy-600 hover:underline">← News</Link>
        <h1 className="font-display font-black text-[clamp(1.8rem,4vw,2.8rem)] leading-tight mt-3 mb-8 text-navy-900">
          {doc.meta.title}
        </h1>
        {doc.blocks.map((b, i) =>
          b.type === "h2" ? (
            <h2 key={i} className="font-display font-bold text-xl mt-8 mb-3 text-navy-900">
              {b.text}
            </h2>
          ) : (
            <p key={i} className="text-[15px] leading-relaxed text-navy-700 mb-4">
              {b.text}
            </p>
          ),
        )}
        <p className="mono-label text-navy-600/70 mt-10">
          Migrated from the old site (CSS_Website@a8fca55).
        </p>
      </article>
    </main>
  );
}
