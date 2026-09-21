// Run-5 sweep: full-page 1440 for every route (+ 390 for home/cyberhounds), page errors collected.
import { chromium } from "@playwright/test";
const ROUTES = [["home","/"],["events","/events"],["apps","/apps"],["cyberhounds","/cyberhounds"],["about","/about"],["resources","/resources"],["news","/news"],["join","/join"],["styleguide","/styleguide"]];
const base = "../../qa/loops/run5/sweep";
import { mkdirSync } from "node:fs"; mkdirSync(base, { recursive: true });
const b = await chromium.launch();
const errors = [];
for (const [name, route] of ROUTES) {
  for (const w of (name === "home" || name === "cyberhounds") ? [1440, 390] : [1440]) {
    const p = await b.newPage({ viewport: { width: w, height: 900 } });
    p.on("pageerror", (e) => errors.push(`${route}@${w}: ${e.message}`));
    p.on("console", (m) => m.type() === "error" && errors.push(`${route}@${w} console: ${m.text().slice(0, 160)}`));
    await p.goto(`http://localhost:5173${route}`, { waitUntil: "networkidle" });
    await p.waitForTimeout(1200);
    await p.evaluate(async () => { for (let y = 0; y <= document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); } window.scrollTo(0, 0); });
    await p.waitForTimeout(1500);
    await p.screenshot({ path: `${base}/${name}-${w}.png`, fullPage: true });
    await p.close();
    console.log(`${name}-${w}`);
  }
}
await b.close();
console.log(errors.length ? `ERRORS:\n${errors.join("\n")}` : "no page errors");
