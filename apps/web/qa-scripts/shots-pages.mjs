import { chromium } from "@playwright/test";
const ROUTES = [
  ["home", "/"],
  ["events", "/events"],
  ["apps", "/apps"],
  ["cyberhounds", "/cyberhounds"],
  ["about", "/about"],
  ["resources", "/resources"],
  ["news", "/news"],
  ["news-article", "/news/grad-school-events"],
  ["join", "/join"],
  ["404", "/definitely-not-a-page"],
];
const WIDTHS = [1440, 1024, 768, 390];
const browser = await chromium.launch();
const errors = [];
for (const [name, route] of ROUTES) {
  for (const w of WIDTHS) {
    const page = await browser.newPage({ viewport: { width: w, height: 900 } });
    page.on("pageerror", (e) => errors.push(`${route}@${w}: ${e.message}`));
    page.on("console", (m) => {
      if (m.type() === "error") errors.push(`${route}@${w} console: ${m.text()}`);
    });
    await page.goto(`http://localhost:5173${route}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(350);
    await page.screenshot({ path: `../../qa/shots/03-${name}-${w}.png`, fullPage: true });
    await page.close();
  }
  console.log(`shot 03-${name} at ${WIDTHS.join("/")}`);
}
if (errors.length) {
  console.log("\nERRORS:");
  errors.forEach((e) => console.log(" -", e));
} else console.log("\nno page errors");
await browser.close();
