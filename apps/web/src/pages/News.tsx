/** /news — bulletins and articles written in the OS. Reads /api/posts (list)
    and /api/posts/:slug (article) with data/posts.json as the fallback, and
    renders markdown with lib/md.ts — the same renderer the OS preview uses. */
import { Link, useParams } from "react-router-dom";
import postsData from "@data/posts.json";
import { parseMd } from "@/lib/md";
import { useApi } from "@/lib/useApi";
import { Band } from "@/components/Band";
import { PageHero } from "@/components/PageHero";
import { FinLine } from "@/components/FinLine";
import { IndexList } from "@/components/cards/IndexList";
import { Pullquote } from "@/components/Pullquote";
import { Reveal } from "@/motion/Reveal";
import * as Sg from "@/sigils";
import { Registration } from "@/components/frame";
import { Contour } from "@/textures";
import { Label } from "@/components/type/Label";

type Post = {
  id: string;
  slug: string;
  title: string;
  dek?: string;
  body_md?: string;
  author_name?: string;
  published_at?: string;
  tags?: string[];
  source?: string;
  cover_path?: string | null;
};
const FALLBACK = { posts: (postsData as { posts: Post[] }).posts };

function issue(i: number) {
  return String(i + 1).padStart(3, "0");
}
function dateLabel(p: Post) {
  return p.source === "legacy" ? `MIGRATED · ${(p.published_at ?? "").slice(0, 4)}` : (p.published_at ?? "").slice(0, 10).toUpperCase();
}

export function NewsIndex() {
  const { data } = useApi<{ posts: Post[] }>("/api/posts", FALLBACK);
  const posts = [...data.posts].sort((a, b) => (a.published_at ?? "").localeCompare(b.published_at ?? ""));
  return (
    <main>
      <PageHero
        kicker="NEWS · BULLETINS · ISSUE LOG"
        cubeFace="threeQuarter"
        lines={[{ text: "News.", stencil: true }]}
        dek="Bulletins and articles, written by the board in the OS. Issue 001 is the graduate-school guide migrated from the old site; everything after it is new."
        stats={[
          { v: posts.length, l: "ISSUES PUBLISHED" },
          { v: 0, l: "OLD BLOG POSTS (REALLY)" },
        ]}
      />
      <Band tone="light" accent="blue" index="01 — ISSUE LOG" sigil={<Sg.Eye size={16} />} code="ISSUES" rail="01 · NEWS · 01001110 · LOG">
        <IndexList
          rows={[
            ...posts.map((p, i) => ({ index: issue(i), title: p.title, dek: p.dek || " ", meta: dateLabel(p), href: `/news/${p.slug}` })),
            ...(posts.length < 2
              ? [{ index: issue(posts.length), title: "Fall 2026 kickoff bulletin", dek: "Pending — written by the board in the OS", chip: "PLANNED" }]
              : []),
          ]}
        />
      </Band>
      <FinLine n="08" next="/join" />
    </main>
  );
}

export function NewsArticle() {
  const { slug = "" } = useParams();
  const fallbackPost = FALLBACK.posts.find((p) => p.slug === slug) ?? null;
  const { data, source } = useApi<{ post: Post | null }>(`/api/posts/${slug}`, { post: fallbackPost });
  const post = data.post;
  if (!post || source === "loading") {
    return (
      <main className="pt-[120px]" data-tone="dark">
        <div className="max-w-[720px] mx-auto px-5 py-20 text-center">
          <p className="pixel text-teal text-4xl">{source === "loading" && !post ? "LOADING" : "NO SUCH BULLETIN"}</p>
          <Link to="/news" className="mono-label text-teal u-draw mt-6 inline-block">
            ← BACK TO THE ISSUE LOG
          </Link>
        </div>
      </main>
    );
  }
  const doc = parseMd(post.body_md ?? "");
  const idx = FALLBACK.posts.findIndex((p) => p.slug === slug);
  return (
    <main>
      <section data-tone="light" data-accent="blue" className="relative pt-[120px] pb-20">
        <Registration />
        <Contour opacity={0.04} />
        <article className="relative max-w-[720px] mx-auto px-5">
          <Reveal y={10}>
            <div className="flex items-center gap-4 mb-6">
              <Label pfx="/" className="raise text-(--accent-ink)">
                ISSUE_{issue(idx >= 0 ? idx : FALLBACK.posts.length)}
              </Label>
              <span className="h-px grow bg-(--tone-line)" />
              <span className="t-micro opacity-55 tnum">{dateLabel(post)}</span>
            </div>
            <div className="flex gap-6 mb-8 flex-wrap">
              <span className="t-micro opacity-55">_author {(post.author_name ?? "THE BOARD").toUpperCase().replace(/ /g, "_")}</span>
              <span className="t-micro opacity-55">_kind {(post.tags?.[0] ?? "article").toUpperCase()}</span>
              <span className="t-micro opacity-55 tnum">_read_time {Math.max(1, Math.round((post.body_md ?? "").split(/\s+/).length / 220))}_MIN</span>
            </div>
          </Reveal>
          {post.cover_path && (
            <img
              src={post.cover_path}
              alt=""
              width={1600}
              height={900}
              loading="eager"
              decoding="async"
              className="w-full h-auto mb-8 border border-(--tone-line)"
            />
          )}
          <Reveal>
            <h1 className="t-h1 !normal-case !text-[clamp(28px,4vw,48px)] !leading-[1.02] mb-10">{post.title}</h1>
          </Reveal>
          {doc.blocks.map((b, i) =>
            b.type === "h2" ? (
              <h2 key={i} className="font-display font-bold text-xl mt-10 mb-3">
                {b.text}
              </h2>
            ) : i === 2 && doc.blocks.length > 4 ? (
              <div key={i}>
                <Pullquote>{b.text.split(".")[0] + "."}</Pullquote>
                <p className="text-[17px] leading-[1.7] mb-5 mt-6" style={{ color: "var(--tone-muted)" }}>
                  {b.text}
                </p>
              </div>
            ) : (
              <p key={i} className="text-[17px] leading-[1.7] mb-5" style={{ color: "var(--tone-muted)" }}>
                {b.text}
              </p>
            ),
          )}
          <p className="mono-label mt-12 pt-6 border-t border-(--tone-line)" style={{ color: "var(--tone-muted)" }}>
            {post.source === "legacy" ? "MIGRATED FROM CSS_WEBSITE@A8FCA55 · " : "PUBLISHED FROM THE OS · "}
            <Link to="/news" className="text-(--accent) u-draw">
              ← ISSUE LOG
            </Link>
          </p>
        </article>
      </section>
      <FinLine n="08" next="/join" />
    </main>
  );
}
