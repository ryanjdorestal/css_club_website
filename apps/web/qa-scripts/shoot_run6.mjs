// Run-6 shots: Cyberhounds §1 pennant (1440), footer bottom at 1024/1280/1440/1920/390, map hover, hound edge 100 %.
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";
const base = "../../qa/loops/run6";
mkdirSync(base, { recursive: true });
const b = await chromium.launch();
const errs = [];
const mk = async (w, h = 900) => {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  p.on("pageerror", (e) => errs.push(`${w}: ${e.message}`));
  p.on("console", (m) => m.type() === "error" && errs.push(`${w} console: ${m.text().slice(0, 160)}`));
  return p;
};
// pennant
{
  const p = await mk(1440);
  await p.goto("http://localhost:5173/cyberhounds", { waitUntil: "networkidle" });
  await p.waitForTimeout(1000);
  const y = await p.evaluate(() => {
    const el = document.querySelector("figure svg[aria-label='Cyberhounds pennant']");
    const r = el.getBoundingClientRect();
    return r.top + window.scrollY - 200;
  });
  await p.evaluate((y) => window.scrollTo({ top: y }), y);
  await p.waitForTimeout(300);
  await p.screenshot({ path: `${base}/cyber-s1-pennant-drawing.png` });
  await p.waitForTimeout(1800);
  await p.screenshot({ path: `${base}/cyber-s1-pennant.png` });
  const box = await p.evaluate(() => {
    const r = document.querySelector("figure svg[aria-label='Cyberhounds pennant']").getBoundingClientRect();
    return { x: r.left - 30, y: r.top - 60, width: r.width + 60, height: r.height + 100 };
  });
  await p.screenshot({ path: `${base}/cyber-s1-pennant-crop.png`, clip: box });
  // posters with the vector head mark
  const y2 = await p.evaluate(() => {
    const el = [...document.querySelectorAll("section")].find((s) => s.textContent.includes("COMPETITIONS"));
    return el.getBoundingClientRect().top + window.scrollY - 40;
  });
  await p.evaluate((y) => window.scrollTo({ top: y }), y2);
  await p.waitForTimeout(900);
  await p.screenshot({ path: `${base}/cyber-posters.png` });
  await p.close();
}
// footer at widths
for (const w of [1024, 1280, 1440, 1920]) {
  const p = await mk(w);
  await p.goto("http://localhost:5173/about", { waitUntil: "networkidle" });
  await p.waitForTimeout(800);
  await p.evaluate(() => window.scrollTo({ top: document.body.scrollHeight }));
  await p.waitForTimeout(2500);
  await p.screenshot({ path: `${base}/footer-${w}.png` });
  console.log(w, "map state:", await p.evaluate(() => document.querySelector("[data-map]")?.getAttribute("data-map")));
  if (w === 1440) {
    const r = await p.evaluate(() => {
      const el = document.querySelector("[data-map] .group, [data-map]");
      const q = document.querySelector("[data-map] iframe, [data-map] > div:nth-child(2)");
      const rr = (q ?? el).getBoundingClientRect();
      return { x: rr.left + rr.width / 2, y: rr.top + rr.height / 2 };
    });
    await p.mouse.move(r.x, r.y);
    await p.waitForTimeout(700);
    await p.screenshot({ path: `${base}/footer-1440-map-hover.png` });
    // 100 % crop of the hound's left edge
    const img = await p.evaluate(() => {
      const i = document.querySelector("footer img[src*='jj_bloodhound']");
      const rr = i.getBoundingClientRect();
      return { x: rr.left, y: rr.top, w: rr.width, h: rr.height };
    });
    await p.screenshot({
      path: `${base}/footer-1440-hound-edge-100pct.png`,
      clip: { x: Math.max(0, img.x + img.w * 0.08), y: Math.max(0, img.y + img.h * 0.3), width: 420, height: 420 },
    });
  }
  await p.close();
}
{
  const p = await mk(390, 844);
  await p.goto("http://localhost:5173/about", { waitUntil: "networkidle" });
  await p.waitForTimeout(800);
  await p.evaluate(() => window.scrollTo({ top: document.body.scrollHeight - 1400 }));
  await p.waitForTimeout(1500);
  await p.screenshot({ path: `${base}/footer-390-a.png` });
  await p.evaluate(() => window.scrollTo({ top: document.body.scrollHeight }));
  await p.waitForTimeout(1500);
  await p.screenshot({ path: `${base}/footer-390-b.png` });
  await p.close();
}
await b.close();
console.log(errs.length ? `ERRORS:\n${errs.join("\n")}` : "no page errors");
