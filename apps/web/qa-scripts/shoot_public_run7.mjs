// Public pages after the Projects merge + API-first reads. node qa-scripts/shoot_public_run7.mjs
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";
const base = "../../qa/loops/run7"; mkdirSync(base, { recursive: true });
const ROUTES = [["home", "/"], ["projects", "/projects"], ["apps-redirect", "/apps"], ["news", "/news"], ["news-article", "/news/grad-school-events"], ["about", "/about"], ["events", "/events"], ["resources", "/resources"]];
const b = await chromium.launch(); const errors = []; const sources = [];
for (const [name, route] of ROUTES) {
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  p.on("pageerror", (e) => errors.push(`${route}: ${e.message}`));
  p.on("console", (m) => m.type() === "error" && errors.push(`${route} console: ${m.text().slice(0, 140)}`));
  p.on("response", (r) => { if (r.url().includes("/api/")) sources.push(`${route} ← ${r.url().split("/api/")[1]} ${r.status()}`); });
  await p.goto(`http://localhost:5173${route}`, { waitUntil: "networkidle" });
  await p.waitForTimeout(1000);
  await p.evaluate(async () => { for (let y = 0; y <= document.body.scrollHeight; y += 700) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 40)); } window.scrollTo(0, 0); });
  await p.waitForTimeout(800);
  await p.screenshot({ path: `${base}/pub-${name}-1440.png`, fullPage: true });
  console.log(name, p.url().replace("http://localhost:5173", ""));
  await p.close();
}
await b.close();
console.log(sources.join("\n"));
console.log(errors.length ? `ERRORS:\n${errors.join("\n")}` : "no page errors");
