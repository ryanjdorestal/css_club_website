/** DossierCard (run 9 §6.3, R9_05): a subject card — portrait tile (photo or initials on a
    dot grid) left, a key/value sheet right in micro caps labels, bracket corners, a 1 px
    accent frame, a SUBJECT 0N tag top-left, an ID code bottom-right. Slides in 12 px from
    the right (static under reduced motion). DossierStack: overlapping ID cards (photo ·
    name · code) for the Members "recent" tile. Used on Members rows, Board officers, the
    public About §5 (inside a FolderCard) and the Audit "who" hover. */
import { motion, useReducedMotion } from "motion/react";
import { Brackets } from "@/components/frame";
import { DotGrid } from "@/textures";

type DossierRow = { k: string; v: React.ReactNode };

export function DossierCard({
  n,
  name,
  photo,
  rows,
  code,
  accent = "teal",
  className = "",
  compact = false,
}: {
  n: number;
  name: string;
  photo?: string | null;
  rows: DossierRow[];
  code: string;
  accent?: "teal" | "red";
  className?: string;
  compact?: boolean;
}) {
  const reduced = useReducedMotion();
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? "")
    .join("");
  const frame = accent === "red" ? "border-(--color-red)" : "border-teal/70";
  return (
    <motion.article
      initial={{ x: reduced ? 0 : 12, opacity: reduced ? 1 : 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className={`group relative border ${frame} bg-navy-900/70 ${compact ? "p-2.5" : "p-3.5"} ${className}`}
      data-testid="dossier"
    >
      <Brackets size={10} inset={-1} accent={accent === "teal"} />
      <span className="absolute -top-2 left-3 px-1.5 bg-navy-900 t-micro raise tnum">SUBJECT {String(n).padStart(2, "0")}</span>
      <div className={`grid ${compact ? "grid-cols-[56px_1fr] gap-3" : "grid-cols-[88px_1fr] gap-4"} items-start`}>
        <div className={`relative ${compact ? "w-14 h-14" : "w-22 h-22"} border border-line overflow-hidden bg-navy-800`}>
          <DotGrid opacity={0.25} />
          {photo ? (
            <img
              src={photo.startsWith("/") || photo.startsWith("http") ? photo : `/${photo}`}
              alt=""
              width={400}
              height={400}
              loading="lazy"
              decoding="async"
              className="relative w-full h-full object-cover object-top"
            />
          ) : (
            <span className="relative w-full h-full flex items-center justify-center t-kpi text-[22px] text-teal">{initials || "?"}</span>
          )}
        </div>
        <dl className="min-w-0 grid grid-cols-[62px_1fr] gap-x-2 gap-y-1">
          <dt className="t-micro opacity-50 pt-0.5">NAME</dt>
          <dd className="text-[13px] text-ink truncate font-medium">{name}</dd>
          {rows.map((r) => (
            <Fragment2 key={r.k} k={r.k} v={r.v} />
          ))}
        </dl>
      </div>
      <span className="absolute bottom-1.5 right-2.5 t-micro opacity-50 tnum">{code}</span>
    </motion.article>
  );
}

function Fragment2({ k, v }: DossierRow) {
  return (
    <>
      <dt className="t-micro opacity-50 pt-0.5">{k}</dt>
      <dd className="t-micro raise text-ink truncate">{v ?? "—"}</dd>
    </>
  );
}

/** Stacked / overlapping ID cards (R9_05 bottom-right). */
export function DossierStack({ people, className = "" }: { people: { name: string; photo?: string | null; code: string }[]; className?: string }) {
  return (
    <div className={`relative ${className}`} style={{ height: 40 + people.length * 26 }} aria-label={`${people.length} recent`}>
      {people.map((p, i) => (
        <div
          key={p.code}
          className="absolute left-0 right-0 border border-teal/50 bg-navy-900 flex items-center gap-3 px-2.5 py-1.5"
          style={{ top: i * 26, marginLeft: i * 10, zIndex: i }}
        >
          <span className="w-6 h-6 border border-line bg-navy-800 flex items-center justify-center t-micro overflow-hidden">
            {p.photo ? (
              <img
                src={p.photo.startsWith("/") ? p.photo : `/${p.photo}`}
                alt=""
                width={40}
                height={40}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover"
              />
            ) : (
              p.name[0]?.toUpperCase()
            )}
          </span>
          <span className="t-label raise truncate grow">{p.name}</span>
          <span className="t-micro opacity-50 tnum">{p.code}</span>
        </div>
      ))}
    </div>
  );
}
