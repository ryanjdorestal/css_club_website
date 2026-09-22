// Playwright smoke (CI): every public route renders with no console errors, in Tier 1.
// Starts vite preview on the built dist; the API is not required (fallbacks answer).
import { chromium } from "@playwright/test";
import { spawn } from "node:child_process";
const ROUTES = [
  "/",
  "/events",
  "/projects",
  "/apps",
  "/cyberhounds",
  "/about",
  "/resources",
  "/news",
  "/news/grad-school-events",
  "/join",
  "/os/login",
  "/nope-404",
];
const server = spawn("npx", ["vite", "preview", "--port", "4173", "--strictPort"], { stdio: "ignore" });
await new Promise((r) => setTimeout(r, 2500));
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const errors = [];
page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
// the API is not running here: a 502 on /api/* is the fallback path working, not a render error
// (Chrome puts the failing URL in location(), not in the message text)
const fromApi = (m) => m.text().includes("/api/") || (m.location()?.url ?? "").includes("/api/");
page.on("console", (m) => m.type() === "error" && !fromApi(m) && errors.push(`console: ${m.text().slice(0, 160)}`));
let failed = 0;
for (const route of ROUTES) {
  const res = await page.goto(`http://localhost:4173${route}`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(600);
  const ok = res && res.status() === 200 && (await page.locator("#root *").count()) > 0;
  console.log(`${ok ? "ok  " : "FAIL"} ${route}`);
  if (!ok) failed++;
}
await browser.close();
server.kill();
if (errors.length) {
  console.log(errors.join("\n"));
}
process.exit(failed || errors.length ? 1 : 0);
