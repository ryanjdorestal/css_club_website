// Cyberhounds hero with the live 3D bust (+ hover state), 1440 and 390.
import { chromium } from "@playwright/test";
const tag = process.argv[2] ?? "l1";
const base = `../../qa/loops/run5`;
const b = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
const errs = [];
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
p.on("pageerror", (e) => errs.push(e.message));
p.on("console", (m) => m.type() === "error" && errs.push(m.text().slice(0, 200)));
await p.goto("http://localhost:5173/cyberhounds", { waitUntil: "networkidle" });
await p.waitForTimeout(2500);
console.log(
  "mode:",
  await p.evaluate(() => document.querySelector("[data-cyberhound]")?.getAttribute("data-cyberhound")),
  "canvas:",
  await p.evaluate(() => !!document.querySelector("#cyberhound-slot canvas")),
);
await p.screenshot({ path: `${base}/${tag}-cyber-hero-3d.png` });
await p.mouse.move(1180, 420);
await p.waitForTimeout(700);
await p.screenshot({ path: `${base}/${tag}-cyber-hero-3d-hover.png`, clip: { x: 880, y: 140, width: 560, height: 560 } });
await p.mouse.move(200, 500);
await p.waitForTimeout(900);
await p.screenshot({ path: `${base}/${tag}-cyber-hero-3d-follow-left.png`, clip: { x: 880, y: 140, width: 560, height: 560 } });
await p.close();
const m = await b.newPage({ viewport: { width: 390, height: 844 } });
await m.goto("http://localhost:5173/cyberhounds", { waitUntil: "networkidle" });
await m.waitForTimeout(1500);
await m.screenshot({ path: `${base}/${tag}-cyber-hero-390.png` });
await m.close();
await b.close();
console.log(errs.length ? `ERRORS:\n${errs.join("\n")}` : "no page errors");
