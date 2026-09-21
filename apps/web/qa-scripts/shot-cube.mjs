import { chromium } from "@playwright/test";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errs = [];
page.on("pageerror", (e) => errs.push(e.message));
page.on("console", (m) => {
  if (m.type() === "error") errs.push(m.text());
});
await page.goto("http://localhost:5173/", { waitUntil: "networkidle" });
await page.waitForTimeout(2500); // let the lazy Three chunk + GLB land
await page.screenshot({ path: "../../qa/shots/04-cube-hero-1440.png", clip: { x: 620, y: 60, width: 820, height: 640 } });
if (errs.length) {
  console.log("ERRORS:");
  errs.forEach((e) => console.log(" -", e.slice(0, 300)));
} else console.log("cube shot, no errors");
await browser.close();
