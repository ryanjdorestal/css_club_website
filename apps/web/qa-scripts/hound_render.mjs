// cd apps/web && node qa-scripts/hound_render.mjs [tag] [extra-query]  — needs `python3 -m http.server 8787` at the repo root
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";
const tag = process.argv[2] ?? "v";
const extra = process.argv[3] ?? "";
mkdirSync("/Users/ryandorestal/Desktop/jjay_css/assets/hound3d/renders", { recursive: true });
const b = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
for (const view of ["front", "three", "side"]) {
  const p = await b.newPage({ viewport: { width: 900, height: 900 } });
  const errs = []; p.on("pageerror", (e) => errs.push(e.message)); p.on("console", (m) => m.type() === "error" && errs.push(m.text()));
  await p.goto(`http://localhost:8787/assets/hound3d/viewer.html?view=${view}&${extra}`);
  await p.waitForFunction(() => window.__ready === true, null, { timeout: 30000 }).catch(() => console.log("timeout", view, errs));
  await p.waitForTimeout(300);
  await p.screenshot({ path: `/Users/ryandorestal/Desktop/jjay_css/assets/hound3d/renders/${tag}-${view}.png` });
  if (errs.length) console.log(view, errs.join("\n"));
  await p.close();
}
await b.close();
console.log("rendered", tag);
