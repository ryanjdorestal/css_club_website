// axe (skills/accessibility/axe-runner via @axe-core/playwright): WCAG 2 AA on every public
// route + every OS route as LOCAL_DEV admin. Serious/critical violations fail. node qa-scripts/axe.mjs
import { chromium } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
const BASE = process.env.BASE_URL ?? "http://localhost:5173";
const PUBLIC = ["/", "/events", "/projects", "/cyberhounds", "/about", "/resources", "/news", "/news/grad-school-events", "/join", "/os/login"];
const OS = [
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
];
const b = await chromium.launch();
let total = 0,
  serious = 0;
for (const [routes, admin] of [
  [PUBLIC, false],
  [OS, true],
]) {
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
  if (admin) await ctx.addInitScript(() => sessionStorage.setItem("jjcss-os-role", "admin"));
  for (const r of routes) {
    const p = await ctx.newPage();
    await p.goto(`${BASE}${r}`, { waitUntil: "networkidle" });
    await p.waitForTimeout(900);
    const res = await new AxeBuilder({ page: p }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).exclude("canvas").exclude("iframe").analyze();
    for (const v of res.violations) {
      total += v.nodes.length;
      const bad = ["serious", "critical"].includes(v.impact ?? "");
      if (bad) serious += v.nodes.length;
      console.log(`${bad ? "✗" : "·"} ${r} ${v.id} (${v.impact}) ×${v.nodes.length} — ${v.help} — ${v.nodes[0]?.target?.[0] ?? ""}`);
    }
    await p.close();
  }
  await ctx.close();
}
await b.close();
console.log(`axe: ${total} violation node(s), ${serious} serious/critical`);
process.exit(serious ? 1 : 0);
