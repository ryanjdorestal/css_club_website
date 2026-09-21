// Route validator (adapted from skills/auditing/route-validator for a React SPA):
// every internal `to="…"` / `href="/…"` in src/ and every internal link in content/**/*.md
// resolves to a declared route (App.tsx) or a file in public/. Exit 1 on a miss.
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";
const ROOT = new URL("../../../", import.meta.url).pathname;
const walk = (d, ext) =>
  readdirSync(d).flatMap((f) => {
    const p = join(d, f);
    return statSync(p).isDirectory() ? (f === "node_modules" ? [] : walk(p, ext)) : ext.some((e) => p.endsWith(e)) ? [p] : [];
  });
const app = readFileSync(join(ROOT, "apps/web/src/App.tsx"), "utf8");
const routes = [...app.matchAll(/path="([^"]+)"/g)].map((m) => m[1]);
const dyn = routes.filter((r) => r.includes(":")).map((r) => new RegExp("^/" + r.replace(/:[^/]+/g, "[^/]+") + "$"));
const statics = new Set([
  "/",
  ...routes.filter((r) => !r.includes(":") && r !== "*").map((r) => "/" + r),
  "/os",
  "/os/projects",
  "/os/posts",
  "/os/events",
  "/os/resources",
  "/os/members",
  "/os/board",
  "/os/site",
  "/os/inheritance",
  "/os/system",
  "/os/audit",
  "/os/login",
  "/os/queue",
]);
const ok = (path) => {
  const clean = path.split(/[#?]/)[0];
  if (statics.has(clean) || dyn.some((r) => r.test(clean))) return true;
  return existsSync(join(ROOT, "apps/web/public", clean));
};
let bad = 0,
  n = 0;
for (const f of [
  ...walk(join(ROOT, "apps/web/src"), [".tsx", ".ts"]),
  ...walk(join(ROOT, "content"), [".md"]),
  ...walk(join(ROOT, "docs"), [".md"]).filter((p) => !p.includes("/archive/")),
]) {
  const s = readFileSync(f, "utf8");
  const links = f.endsWith(".md")
    ? [...s.matchAll(/\]\((\/[^)\s]+)\)/g)].map((m) => m[1])
    : [...s.matchAll(/(?:to|href)=["'`](\/[^"'`{}$]*)["'`]/g)].map((m) => m[1]);
  for (const l of links) {
    n++;
    if (!ok(l)) {
      bad++;
      console.log(`✗ ${f.replace(ROOT, "")}: ${l}`);
    }
  }
}
console.log(`route-validator: ${n} internal links, ${bad} unresolved`);
process.exit(bad ? 1 : 0);
