// check_assets.mjs — the asset policy that protects the Vercel image-transformation and transfer budgets
// (docs/HOSTING_LIMITS.md §3.2). Runs in `make check`. Rules: every file under apps/web/public/img is a
// .webp or .svg, ≤ 400 KB, and referenced from src/, data/, content/ or brand/ (an unreferenced file is
// dead weight in every deploy); every <img> in src/ carries width, height, loading and decoding so the
// browser can reserve the box (no layout shift) and defer what is below the fold.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const IMG = join(ROOT, "apps/web/public/img");
const MAX_BYTES = 400 * 1024;
const ALLOWED = new Set([".webp", ".svg"]);

const walk = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((d) => (d.isDirectory() ? walk(join(dir, d.name)) : [join(dir, d.name)]));
const textFiles = (dir, exts) => walk(dir).filter((f) => exts.some((e) => f.endsWith(e)));

const corpus = [
  ...textFiles(join(ROOT, "apps/web/src"), [".ts", ".tsx", ".css", ".json"]),
  ...textFiles(join(ROOT, "data"), [".json"]),
  ...textFiles(join(ROOT, "content"), [".md", ".json"]),
  ...textFiles(join(ROOT, "brand"), [".ts"]),
  join(ROOT, "apps/web/index.html"),
]
  .map((f) => readFileSync(f, "utf8"))
  .join("\n");

const findings = [];
for (const file of walk(IMG)) {
  const rel = relative(join(ROOT, "apps/web/public"), file);
  const ext = file.slice(file.lastIndexOf(".")).toLowerCase();
  const size = statSync(file).size;
  if (!ALLOWED.has(ext)) findings.push(`${rel}: ${ext} is not allowed — convert to .webp (scripts/images.py) or .svg`);
  if (size > MAX_BYTES) findings.push(`${rel}: ${(size / 1024).toFixed(0)} KB > 400 KB — resize or recompress`);
  const base = rel.replace(/^img\//, "");
  if (!corpus.includes(base)) findings.push(`${rel}: referenced nowhere (src, data, content, brand) — delete it or use it`);
}

const IMG_TAG = /<img\b[^>]*?(\/>|>)/gs;
for (const file of textFiles(join(ROOT, "apps/web/src"), [".tsx"])) {
  const text = readFileSync(file, "utf8");
  for (const m of text.matchAll(IMG_TAG)) {
    const tag = m[0];
    const line = text.slice(0, m.index).split("\n").length;
    for (const attr of ["width", "height", "loading", "decoding"]) {
      if (!new RegExp(`\\b${attr}=`).test(tag)) findings.push(`${relative(ROOT, file)}:${line}: <img> without ${attr}`);
    }
  }
}

for (const f of findings) console.log("FAIL", f);
console.log(`check-assets: ${findings.length} finding(s)`);
process.exit(findings.length ? 1 : 0);
