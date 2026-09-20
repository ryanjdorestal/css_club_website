// npm run shoot -- --page /events [--name events]
// Full-page 1440+390, viewport shots at 0/25/50/75/100% scroll, nav-after-200px,
// and a 6s scroll video → 6 frames via ffmpeg. Output: qa/loops/<name>/
import { chromium } from "@playwright/test";
import { execSync } from "node:child_process";
import { mkdirSync, rmSync, readdirSync, renameSync } from "node:fs";

const args = process.argv.slice(2);
const page_ = args[args.indexOf("--page") + 1] ?? "/";
const name = args.includes("--name") ? args[args.indexOf("--name") + 1] : (page_ === "/" ? "home" : page_.replaceAll("/", "-").replace(/^-/, ""));
const base = `../../qa/loops/${name}`;
mkdirSync(`${base}/motion`, { recursive: true });

const browser = await chromium.launch();

// full pages
for (const w of [1440, 390]) {
  const p = await browser.newPage({ viewport: { width: w, height: 900 } });
  await p.goto(`http://localhost:5173${page_}`, { waitUntil: "networkidle" });
  await p.waitForTimeout(1800);
  await p.waitForFunction(() => ![...document.querySelectorAll('[aria-label]')].some((el) => el.textContent && el.getAttribute('data-decode-done') === null && el.className.includes && false), {}, { timeout: 2000 }).catch(() => {});
  // force all reveals: scroll through, then back
  await p.evaluate(async () => {
    for (let y = 0; y <= document.body.scrollHeight; y += 600) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 40));
    }
    window.scrollTo(0, 0);
  });
  await p.waitForTimeout(800);
  await p.screenshot({ path: `${base}/full-${w}.png`, fullPage: true });
  await p.close();
  console.log(`full-${w}.png`);
}

// viewport waypoints + nav morph
const p = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto(`http://localhost:5173${page_}`, { waitUntil: "networkidle" });
await p.waitForTimeout(1500);
const H = await p.evaluate(() => document.body.scrollHeight - innerHeight);
for (const f of [0, 0.25, 0.5, 0.75, 1]) {
  await p.evaluate((y) => window.scrollTo({ top: y }), Math.round(H * f));
  await p.waitForTimeout(1100);
  await p.screenshot({ path: `${base}/vp-${Math.round(f * 100)}.png` });
}
await p.evaluate(() => window.scrollTo({ top: 200 }));
await p.waitForTimeout(700);
await p.screenshot({ path: `${base}/nav-200.png`, clip: { x: 0, y: 0, width: 1440, height: 90 } });
await p.close();
console.log("viewport + nav shots done");

// scroll video → 6 frames
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  recordVideo: { dir: `${base}/video`, size: { width: 1440, height: 900 } },
});
const vp = await ctx.newPage();
await vp.goto(`http://localhost:5173${page_}`, { waitUntil: "networkidle" });
await vp.waitForTimeout(1200);
await vp.evaluate(async () => {
  const H = document.body.scrollHeight - innerHeight;
  const t0 = performance.now();
  const DUR = 6000;
  await new Promise((done) => {
    function step(t) {
      const k = Math.min(1, (t - t0) / DUR);
      window.scrollTo(0, H * k);
      k < 1 ? requestAnimationFrame(step) : done();
    }
    requestAnimationFrame(step);
  });
});
await vp.close();
await ctx.close();
await browser.close();
const vid = readdirSync(`${base}/video`).find((f) => f.endsWith(".webm"));
renameSync(`${base}/video/${vid}`, `${base}/scroll.webm`);
rmSync(`${base}/video`, { recursive: true, force: true });
execSync(`ffmpeg -y -i ${base}/scroll.webm -vf fps=1 ${base}/motion/frame-%d.png -loglevel error`);
console.log("motion frames extracted");
