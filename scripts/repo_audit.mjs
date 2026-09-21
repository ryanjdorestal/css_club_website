// Repo audit (adapted from skills/auditing/repo-audit): oversize files in public/ (> 400 KB),
// TODO/FIXME/XXX markers (none allowed — docs/LATER.md is the list), orphan public images.
// node scripts/repo_audit.mjs   (exit 1 on any finding)
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
const ROOT = new URL("../", import.meta.url).pathname;
const walk = (d) =>
  readdirSync(d).flatMap((f) => {
    const p = join(d, f);
    return statSync(p).isDirectory() ? (["node_modules", ".git", ".venv", "dist", "archive", ".cache"].includes(f) ? [] : walk(p)) : [p];
  });
let bad = 0;
for (const f of walk(join(ROOT, "apps/web/public"))) {
  const kilobytes = statSync(f).size / 1024;
  if (kilobytes > 400 && !f.endsWith(".glb") /* 3D assets are budgeted by Lighthouse, not the image rule */) {
    bad++;
    console.log(`✗ oversize (${kilobytes.toFixed(0)} KB): ${f.replace(ROOT, "")}`);
  }
}
const src = [...walk(join(ROOT, "apps/web/src")), ...walk(join(ROOT, "api")), ...walk(join(ROOT, "scripts"))].filter((f) => /\.(tsx?|py|mjs|css)$/.test(f));
for (const f of src) {
  const s = readFileSync(f, "utf8");
  const m = s.match(/\b(TODO|FIXME|XXX)\b/);
  if (m && !f.endsWith("repo_audit.mjs")) {
    bad++;
    console.log(`✗ ${m[1]} marker: ${f.replace(ROOT, "")} — move it to docs/LATER.md`);
  }
}
const hay = [...walk(join(ROOT, "apps/web/src")), ...walk(join(ROOT, "data")), ...walk(join(ROOT, "brand")), join(ROOT, "apps/web/index.html")]
  .filter((f) => /\.(tsx?|json|html)$/.test(f))
  .map((f) => readFileSync(f, "utf8"))
  .join("\n");
for (const f of walk(join(ROOT, "apps/web/public")).filter((p) => /\.(png|webp|jpg|svg|glb)$/.test(p))) {
  const name = f.split("/").pop();
  if (!hay.includes(name)) {
    bad++;
    console.log(`✗ orphan public file: ${f.replace(ROOT, "")}`);
  }
}
console.log(`repo-audit: ${bad} finding(s)`);
process.exit(bad ? 1 : 0);
