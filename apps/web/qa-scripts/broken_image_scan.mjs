// Broken-image scan (adapted from skills/auditing/broken-image-scan): every `src="/…"`,
// `src={"/…"}` and CSS `url(/…)` in src/, index.html and data/*.json points at a file in public/.
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";
const ROOT = new URL("../../../", import.meta.url).pathname;
const walk = (d, ext) =>
  readdirSync(d).flatMap((f) => {
    const p = join(d, f);
    return statSync(p).isDirectory() ? (f === "node_modules" ? [] : walk(p, ext)) : ext.some((e) => p.endsWith(e)) ? [p] : [];
  });
const files = [
  ...walk(join(ROOT, "apps/web/src"), [".tsx", ".ts", ".css"]),
  join(ROOT, "apps/web/index.html"),
  ...walk(join(ROOT, "data"), [".json"]),
  join(ROOT, "brand/brand.config.ts"),
];
let bad = 0,
  n = 0;
for (const f of files) {
  const s = readFileSync(f, "utf8");
  const refs = [
    ...s.matchAll(
      /(?:src|href|url|svg|photo|flyer|cover_path|photo_path|flyer_path)["']?\s*[:=(]\s*["'`]?(\/?(?:img|cube|hound|fonts|icons|favicon)[^"'`)\s]+\.(?:png|webp|jpg|jpeg|svg|glb|ico))/gi,
    ),
  ].map((m) => m[1]);
  for (const r of refs) {
    n++;
    const p = join(ROOT, "apps/web/public", r.startsWith("/") ? r : "/" + r);
    if (!existsSync(p)) {
      bad++;
      console.log(`✗ ${f.replace(ROOT, "")}: ${r}`);
    }
  }
}
console.log(`broken-image-scan: ${n} references, ${bad} missing`);
process.exit(bad ? 1 : 0);
