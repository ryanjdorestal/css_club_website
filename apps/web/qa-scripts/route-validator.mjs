// Every internal link on every page must resolve to a real route (no 404 render).
import { chromium } from "@playwright/test";
const START = ["/", "/events", "/apps", "/cyberhounds", "/about", "/resources", "/news", "/news/grad-school-events", "/join", "/styleguide"];
const browser = await chromium.launch();
const page = await browser.newPage();
const internal = new Set(START);
for (const r of START) {
  await page.goto(`http://localhost:5173${r}`, { waitUntil: "networkidle" });
  const hrefs = await page.$$eval("a[href]", (as) => as.map((a) => a.getAttribute("href")));
  hrefs.filter((h) => h && h.startsWith("/") && !h.startsWith("//")).forEach((h) => internal.add(h.split("#")[0]));
}
let fail = 0;
for (const r of [...internal].sort()) {
  await page.goto(`http://localhost:5173${r}`, { waitUntil: "networkidle" });
  const is404 = await page.evaluate(() => document.body.innerText.includes("SEGMENTATION FAULT"));
  console.log(`${is404 ? "FAIL" : "OK  "} ${r}`);
  if (is404) fail++;
}
console.log(fail ? `\n${fail} broken internal link(s)` : `\nall ${internal.size} internal routes resolve`);
await browser.close();
process.exit(fail ? 1 : 0);
