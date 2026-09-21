import { chromium } from "@playwright/test";
const browser = await chromium.launch();
for (const [name, width, height] of [
  ["1440", 1440, 900],
  ["390", 390, 844],
]) {
  const page = await browser.newPage({ viewport: { width: Number(width), height: Number(height) } });
  await page.goto("http://localhost:5173/styleguide", { waitUntil: "networkidle" });
  await page.waitForTimeout(600);
  await page.screenshot({ path: `../../qa/shots/02-styleguide-${name}.png`, fullPage: true });
  await page.close();
  console.log(`02-styleguide-${name}.png`);
}
await browser.close();
