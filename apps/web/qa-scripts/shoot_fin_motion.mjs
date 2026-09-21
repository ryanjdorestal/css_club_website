// Fin-line motion frames with ?finslow=6 (QA param) so the typing is capturable in headless.
import { chromium } from "@playwright/test";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto("http://localhost:5173/events?finslow=6", { waitUntil: "networkidle" });
await p.waitForTimeout(1200);
const y = await p.evaluate(() => {
  const el = document.querySelector('section[aria-label^="End of section"]');
  return el.getBoundingClientRect().top + window.scrollY - 330;
});
await p.evaluate((y) => window.scrollTo({ top: y }), y);
const t0 = Date.now();
const frames = [];
for (let i = 0; i < 8; i++) {
  const box = await p.evaluate(() => {
    const r = document.querySelector('section[aria-label^="End of section"]').getBoundingClientRect();
    return { x: 360, y: Math.max(0, r.top), width: 720, height: Math.min(r.height, 900 - r.top) };
  });
  await p.screenshot({ path: `../../qa/loops/run5/fin-motion-${i}.png`, clip: box });
  frames.push(`${i}: ${Date.now() - t0}ms`);
  await p.waitForTimeout(450);
}
console.log(frames.join(" | "), "done:", await p.evaluate(() => !!document.querySelector("section[data-fin-done]")));
await b.close();
