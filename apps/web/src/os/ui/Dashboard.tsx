/** The dashboard face every OS module wears (run 9 §5.2): one `Spec` → the nine R9_06
    slots (same positions, same roles; content per module). Numbers come from the module's
    own rows; a metric with no data shows — / n and NO_DATA_YET, never a fake.
    `series()` buckets rows by a date field into five bars for the range selector. */
import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Bar, Bento, Histogram, Kpi, Range, Ring, Tile } from "./Bento";
import type { Row } from "./OsTable";

type Kv = { k: string; v: ReactNode };
export type Spec = {
  a: { title: string; value: string | number | null; denom?: string; note?: string };
  b: { title: string; value: string | number | null; denom?: string; note?: string };
  c: { title: string; value: string | number | null; denom?: string; rows?: Kv[] };
  d: { title: string; rows: Row[]; field: string; total?: string | number | null; unit?: string; background?: ReactNode };
  e: {
    title: string;
    value: string | number | null;
    denom?: string;
    thumbsLabel: string;
    thumbs: { key: string; src?: string; text?: string; href?: string }[];
    href?: string;
    /** replaces the 2×3 thumbnail grid (Members: the DossierStack) */
    custom?: ReactNode;
  };
  f: { title: string; pages: string[]; cta?: { label: string; href: string } };
  g: { title: string; value: string | number | null; denom?: string; progress: { value: number; max: number } | null };
  h: { value: number | null; max?: number; label: string };
  i: { title: string; meta: string; href: string };
};

const RANGE_DAYS: Record<string, number> = { "7D": 7, "30D": 30, "3M": 90, "12M": 365 };

/** Five equal buckets over the range, counted by `field` (an ISO date on each row). */
function series(rows: Row[], field: string, range: string): { bars: { label: string; value: number }[]; total: number } {
  const days = RANGE_DAYS[range] ?? 7;
  const now = Date.now();
  const span = (days * 86400000) / 5;
  const bars = Array.from({ length: 5 }, (_, i) => {
    const start = now - (5 - i) * span;
    const label = new Date(start).toLocaleDateString("en-US", { month: "short", day: "numeric" }).toUpperCase();
    return { label, value: 0, start };
  });
  let total = 0;
  for (const r of rows) {
    const raw = r[field];
    // store timestamps are epoch seconds; ISO strings elsewhere
    const t =
      typeof raw === "number"
        ? raw < 1e12
          ? raw * 1000
          : raw
        : typeof raw === "string"
          ? /^\d+(\.\d+)?$/.test(raw)
            ? Number(raw) * 1000
            : new Date(raw).getTime()
          : NaN;
    if (Number.isNaN(t) || t < now - days * 86400000 || t > now) continue;
    const idx = Math.min(4, Math.floor((t - (now - days * 86400000)) / span));
    bars[idx].value++;
    total++;
  }
  return { bars: bars.map(({ label, value }) => ({ label, value })), total };
}

function DTile({ d }: { d: Spec["d"] }) {
  const [range, setRange] = useState("30D");
  const s = series(d.rows, d.field, range);
  const top = s.bars.reduce((m, b, i) => (b.value > s.bars[m].value ? i : m), 0);
  const total = d.total ?? (d.rows.length ? s.total : null);
  return (
    <Tile title={d.title}>
      <div className="absolute top-5 right-5">
        <Range value={range} onChange={setRange} />
      </div>
      {d.background}
      <div className="relative grow grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-6 items-end min-h-0">
        <Kpi value={total} denom={d.unit} size="xl" />
        <div className="h-[62%] pt-8">
          <Histogram bars={s.bars} callout={s.total ? { index: top, text: String(s.bars[top].value) } : undefined} />
        </div>
      </div>
    </Tile>
  );
}

function FTile({ f }: { f: Spec["f"] }) {
  const [page, setPage] = useState(0);
  return (
    <Tile tone="accent">
      <svg aria-hidden viewBox="0 0 100 100" className="w-full max-h-[38%] text-ink/70" preserveAspectRatio="xMaxYMin meet">
        <path d="M100 0 A100 100 0 0 1 0 100" fill="none" stroke="currentColor" strokeWidth="0.6" />
        <path d="M100 0 L0 100 M100 0 L0 62 M100 0 L60 100 M100 0 L100 100 M100 0 L0 0" fill="none" stroke="currentColor" strokeWidth="0.6" />
      </svg>
      <div className="mt-auto">
        <p className="t-os-display text-[clamp(24px,2.2vw,34px)] leading-[0.95] max-w-[14ch]">{f.title}</p>
        <p className="t-label !normal-case leading-relaxed mt-3 opacity-85 !tracking-[0.04em] max-w-[36ch]" style={{ fontSize: 11 }}>
          {f.pages[page]}
        </p>
        {f.cta && (
          <Link to={f.cta.href} className="t-micro raise text-ink u-draw inline-block mt-3">
            {f.cta.label} ↗
          </Link>
        )}
        <ol className="flex gap-1.5 mt-4" aria-label="Pages">
          {f.pages.map((_, i) => (
            <li key={i}>
              <button
                onClick={() => setPage(i)}
                aria-label={`Page ${i + 1}`}
                aria-pressed={i === page}
                className={`w-2 h-2 rounded-full border border-ink cursor-pointer ${i === page ? "bg-ink" : ""}`}
              />
            </li>
          ))}
        </ol>
      </div>
    </Tile>
  );
}

export function Dashboard({ spec }: { spec: Spec }) {
  const { a, b, c, e, g, h, i } = spec;
  return (
    <Bento
      slots={{
        a: (
          <Tile title={a.title} menu="dots" tone="accent">
            <Kpi value={a.value} denom={a.denom} note={a.note} />
          </Tile>
        ),
        b: (
          <Tile title={b.title} menu="dots">
            <Kpi value={b.value} denom={b.denom} note={b.note} />
          </Tile>
        ),
        c: (
          <Tile title={c.title} menu="dots">
            <Kpi value={c.value} denom={c.denom} size="xl" />
            {c.rows?.length ? (
              <dl className="mt-4 pt-3 border-t border-ink/15 space-y-1.5">
                {c.rows.map((r) => (
                  <div key={r.k} className="flex justify-between gap-3 t-micro">
                    <dt className="opacity-50">{r.k}</dt>
                    <dd className="tnum text-right truncate">{r.v}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
          </Tile>
        ),
        d: <DTile d={spec.d} />,
        e: (
          <Tile title={e.title} menu="arrow" href={e.href}>
            <Kpi value={e.value} denom={e.denom} size="xl" className="!mt-6" />
            <p className="t-micro opacity-50 mt-4 pt-3 border-t border-ink/15">{e.thumbsLabel}</p>
            {/* Only the thumbs that exist. Padding the grid out to six left rows of empty boxes
                holding a "·", which reads as broken images rather than as an empty shelf. */}
            {e.custom ??
              (e.thumbs.length === 0 ? (
                <p className="t-micro opacity-50 mt-2">NO_DATA_YET</p>
              ) : (
                <ul className="grid grid-cols-3 gap-1.5 mt-2 grow content-start">
                  {e.thumbs.slice(0, 6).map((t) => (
                    <li key={t.key} className="aspect-square bg-navy-900/60 overflow-hidden relative min-w-0">
                      {t.src ? (
                        <img src={t.src} alt="" width={160} height={160} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                      ) : (
                        <span className="absolute inset-0 flex items-center justify-center t-micro text-center px-1 opacity-70 break-words">{t.text}</span>
                      )}
                      {t.href && <Link to={t.href} className="absolute inset-0" aria-label={t.text ?? "open"} tabIndex={-1} />}
                    </li>
                  ))}
                </ul>
              ))}
          </Tile>
        ),
        f: <FTile f={spec.f} />,
        g: (
          <Tile title={g.title}>
            <Kpi value={g.value} denom={g.denom} size="xl" />
            {g.progress ? (
              <Bar value={g.progress.value} max={g.progress.max} label={g.title} className="mt-4" />
            ) : (
              <p className="t-micro opacity-50 mt-4">NO_DATA_YET</p>
            )}
          </Tile>
        ),
        h: (
          <Tile>
            <Ring value={h.value} max={h.max} label={h.label} />
          </Tile>
        ),
        i: (
          <Tile tone="paper" menu="arrow" href={i.href}>
            <div className="mt-auto flex items-end justify-between gap-4">
              <Link to={i.href} className="t-os-display text-[clamp(22px,2.4vw,36px)] leading-[0.95] max-w-[12ch]">
                {i.title}
              </Link>
              <span className="t-label raise tnum opacity-80 whitespace-nowrap">{i.meta}</span>
            </div>
          </Tile>
        ),
      }}
    />
  );
}
