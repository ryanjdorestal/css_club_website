// OS pages at 1440 + 390 as a local admin (Tier 1). node qa-scripts/shoot_os.mjs [tag]
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";
const tag = process.argv[2] ?? "os";
const base = "../../qa/loops/run7";
mkdirSync(base, { recursive: true });
const ROUTES = [
  "/os/login",
  "/os",
  "/os/projects",
  "/os/posts",
  "/os/events",
  "/os/resources",
  "/os/members",
  "/os/board",
  "/os/site",
  "/os/inheritance",
  "/os/audit",
];
const b = await chromium.launch();
const errors = [];
for (const w of [1440, 390]) {
  const ctx = await b.newContext({ viewport: { width: w, height: w === 1440 ? 900 : 844 } });
  await ctx.addInitScript(() => sessionStorage.setItem("jjcss-os-role", "admin"));
  for (const route of w === 1440 ? ROUTES : ["/os", "/os/projects", "/os/members"]) {
    const p = await ctx.newPage();
    p.on("pageerror", (e) => errors.push(`${route}@${w}: ${e.message}`));
    p.on("console", (m) => m.type() === "error" && errors.push(`${route}@${w} console: ${m.text().slice(0, 160)}`));
    if (route === "/os/login") await p.addInitScript(() => sessionStorage.removeItem("jjcss-os-role"));
    await p.goto(`http://localhost:5173${route}`, { waitUntil: "networkidle" });
    await p.waitForTimeout(900);
    await p.screenshot({ path: `${base}/${tag}-${route.replace(/\//g, "_").replace(/^_/, "")}-${w}.png`, fullPage: true });
    await p.close();
  }
  await ctx.close();
}
await b.close();
console.log(errors.length ? `ERRORS:\n${errors.join("\n")}` : "no page errors");
