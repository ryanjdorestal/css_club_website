/** Dashboard specs — resources · site settings (run 9 §5.2): every number derives from the rows the page already
    loads; nothing is invented (null → "—" + NO_DATA_YET). One builder per module; the tile texts are the
    module's rules. Used by the matching os/Os*.tsx page. */
import type { Spec } from "../Dashboard";
import type { Row } from "../OsTable";
import { n, last, pct } from "./shared";

export function resourcesSpec(rows: Row[], links: Row[], loaded: boolean): Spec {
  const all = [...rows, ...links];
  const dead = all.filter((r) => r.dead);
  const cats = [...new Set(rows.map((r) => String(r.category ?? r.group ?? "")))].filter(Boolean);
  const checked = all.filter((r) => r.last_checked);
  return {
    a: { title: "DEAD LINKS", value: n(dead.length, loaded), denom: `${all.length}` },
    b: { title: "CATEGORIES", value: n(cats.length, loaded), denom: `${rows.length} links` },
    c: {
      title: "CHECK AGE",
      value: loaded ? (checked.length ? last(checked, "last_checked") : "never") : null,
      denom: "last run",
      rows: [{ k: "SITE LINKS", v: links.length }],
    },
    d: { title: "LINK CHECKS", rows: checked, field: "last_checked", unit: "checked" },
    e: {
      title: "LINKS",
      value: n(rows.length, loaded),
      denom: "curated",
      thumbsLabel: "CATEGORIES",
      thumbs: cats.slice(0, 6).map((c) => ({ key: c, text: c.toUpperCase().slice(0, 22), href: "/resources" })),
      href: "/resources",
    },
    f: {
      title: "LINK POLICY",
      pages: [
        "Every link is checked with a 6 s HEAD/GET. Dead ones are flagged, never silently removed.",
        "The Discord invite and the join form live here as site links — edit them without a deploy.",
        "Categories mirror the public index; reorder within a category, keep titles short.",
      ],
    },
    g: {
      title: "CHECK COVERAGE",
      value: pct(checked.length, all.length) === null ? null : `${pct(checked.length, all.length)}%`,
      denom: "checked",
      progress: all.length ? { value: checked.length, max: all.length } : null,
    },
    h: { value: all.length ? pct(all.length - dead.length, all.length) : null, label: "ALIVE" },
    i: { title: "CHECK ALL LINKS", meta: `${all.length} LINKS`, href: "/os/resources#check" },
  };
}

export function siteSpec(rows: Row[], loaded: boolean): Spec {
  const flags = rows.find((r) => r.key === "feature_flags")?.value as Record<string, unknown> | undefined;
  const on = flags ? Object.values(flags).filter((v) => v === true).length : 0;
  const total = flags ? Object.values(flags).filter((v) => typeof v === "boolean").length : 0;
  const banner = rows.find((r) => r.key === "maintenance_banner")?.value as { on?: boolean } | undefined;
  const ticker = (flags?.ticker_items as unknown[] | undefined)?.length ?? null;
  return {
    a: { title: "FLAGS ON", value: n(on, loaded), denom: `${total}` },
    b: { title: "BANNER", value: loaded ? (banner?.on ? "ON" : "OFF") : null, denom: "maintenance" },
    c: { title: "TICKER ITEMS", value: loaded ? (ticker ?? "—") : null, denom: "in the marquee", rows: [{ k: "KEYS", v: rows.length }] },
    d: { title: "SETTINGS CHANGES", rows, field: "updated_at", unit: "changes" },
    e: {
      title: "PAGES",
      value: n(rows.length, loaded),
      denom: "setting groups",
      thumbsLabel: "GROUPS",
      thumbs: rows.slice(0, 6).map((r) => ({ key: String(r.key), text: String(r.key).toUpperCase().slice(0, 22), href: "/os/site" })),
      href: "/",
    },
    f: {
      title: "WHAT SITE CONTROLS",
      pages: [
        "Taglines, hero copy, the about blurbs, the collaborate openings — the public site reads them with a fallback.",
        "The maintenance banner and feature flags flip without a deploy. Tier 1 snapshots keep them in the repo.",
        "Ownership (who holds which account) lives on /os/system, never credentials.",
      ],
    },
    g: { title: "FLAGS", value: n(on, loaded), denom: `${total}`, progress: total ? { value: on, max: total } : null },
    h: { value: rows.length ? pct(rows.filter((r) => r.value !== null && r.value !== undefined).length, rows.length) : null, label: "COMPLETENESS" },
    i: { title: "EDIT SETTINGS", meta: `${rows.length} KEYS`, href: "/os/site#edit" },
  };
}
