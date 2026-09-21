// Run-5 targeted shots: Home fin (motion frames) + footer bottom, Cyberhounds hero + posters, mobile footer.
// node qa-scripts/shoot_run5.mjs [tag]
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";
const tag = process.argv[2] ?? "l0";
const base = `../../qa/loops/run5`;
mkdirSync(base, { recursive: true });
const browser = await chromium.launch();
const errors = [];
async function page(w, h = 900) {
  const p = await browser.newPage({ viewport: { width: w, height: h } });
  p.on("pageerror", (e) => errors.push(`${w}: ${e.message}`));
  p.on("console", (m) => m.type() === "error" && errors.push(`${w} console: ${m.text().slice(0, 160)}`));
  return p;
}
async function settle(p, route) {
  await p.goto(`http://localhost:5173${route}`, { waitUntil: "networkidle" });
  await p.waitForTimeout(1200);
  await p.evaluate(async () => {
    for (let y = 0; y <= document.body.scrollHeight; y += 700) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 30));
    }
    window.scrollTo(0, 0);
  });
  await p.waitForTimeout(500);
}
// --- Home: fin motion frames + footer bottom
{
  const p = await page(1440);
  await p.goto("http://localhost:5173/", { waitUntil: "networkidle" });
  await p.waitForTimeout(1200);
  const finY = await p.evaluate(() => {
    const el = document.querySelector('section[aria-label^="End of section"]');
    const r = el.getBoundingClientRect();
    return r.top + window.scrollY - 300;
  });
  await p.evaluate((y) => window.scrollTo({ top: y }), finY);
  for (const ms of [120, 420, 800, 1600]) {
    await p.waitForTimeout(ms === 120 ? 120 : ms - [120, 420, 800, 1600][[120, 420, 800, 1600].indexOf(ms) - 1]);
    const box = await p.evaluate(() => {
      const r = document.querySelector('section[aria-label^="End of section"]').getBoundingClientRect();
      return { x: 0, y: Math.max(0, r.top), width: 1440, height: Math.min(r.height, 900 - r.top) };
    });
    await p.screenshot({ path: `${base}/${tag}-home-fin-${ms}ms.png`, clip: box });
  }
  const done = await p.evaluate(() => !!document.querySelector("section[data-fin-done]"));
  console.log("fin done attr:", done);
  await p.evaluate(() => window.scrollTo({ top: document.body.scrollHeight }));
  await p.waitForTimeout(1400);
  await p.screenshot({ path: `${base}/${tag}-home-footer-bottom.png` });
  await p.close();
}
// --- Cyberhounds hero + posters
{
  const p = await page(1440);
  await settle(p, "/cyberhounds");
  await p.waitForTimeout(800);
  await p.screenshot({ path: `${base}/${tag}-cyber-vp0.png` });
  const y = await p.evaluate(() => {
    const el = [...document.querySelectorAll("section")].find((s) => s.textContent.includes("COMPETITIONS"));
    return el.getBoundingClientRect().top + window.scrollY - 40;
  });
  await p.evaluate((y) => window.scrollTo({ top: y }), y);
  await p.waitForTimeout(900);
  await p.screenshot({ path: `${base}/${tag}-cyber-posters.png` });
  await p.evaluate(() => window.scrollTo({ top: document.body.scrollHeight }));
  await p.waitForTimeout(1400);
  await p.screenshot({ path: `${base}/${tag}-cyber-footer.png` });
  await p.close();
}
// --- mobile footer
{
  const p = await page(390, 844);
  await settle(p, "/");
  await p.evaluate(() => window.scrollTo({ top: document.body.scrollHeight }));
  await p.waitForTimeout(1400);
  await p.screenshot({ path: `${base}/${tag}-home-footer-390.png` });
  await p.close();
}
await browser.close();
console.log(errors.length ? `ERRORS:\n${errors.join("\n")}` : "no page errors");
