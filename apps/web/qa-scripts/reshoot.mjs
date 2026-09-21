import { chromium } from "@playwright/test";
const browser = await chromium.launch();
for (const [name, route, w] of [
  ["home", "/", 1440],
  ["home", "/", 390],
  ["events", "/events", 1440],
  ["about", "/about", 1440],
]) {
  const page = await browser.newPage({ viewport: { width: w, height: 900 } });
  await page.goto(`http://localhost:5173${route}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(350);
  await page.screenshot({ path: `../../qa/shots/03-${name}-${w}.png`, fullPage: true });
  await page.close();
}
await browser.close();
console.log("reshot");
