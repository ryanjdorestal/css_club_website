// OS gate (Tier 1, dev server): anonymous /os → /os/login with a reason chip;
// LOCAL_DEV admin → /os renders; guest (signed in, not on roster) → NOT_ON_ROSTER.
// node qa-scripts/os_gate.mjs   (exit 1 on any failure; shots → qa/loops/run8/)
import { launchChrome } from "./browser.mjs";
import { mkdirSync } from "node:fs";
const base = "../../qa/loops/run8";
mkdirSync(base, { recursive: true });
const BASE = process.env.BASE_URL ?? "http://localhost:5173";
const b = await launchChrome();
let failed = 0;
const check = (ok, label) => {
  console.log(`${ok ? "ok  " : "FAIL"} ${label}`);
  if (!ok) failed++;
};

// 1. anonymous
{
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  await p.goto(`${BASE}/os/projects`, { waitUntil: "networkidle" });
  await p.waitForTimeout(800);
  check(p.url().includes("/os/login"), `anonymous /os/projects → ${new URL(p.url()).pathname}${new URL(p.url()).search}`);
  check(p.url().includes("reason=not_signed_in") && p.url().includes("next=%2Fos%2Fprojects"), "redirect carries next + reason");
  check((await p.locator('[data-testid="reason-chip"]').textContent())?.includes("NOT_SIGNED_IN") ?? false, "reason chip visible");
  check((await p.locator('[data-testid="local-dev"]').count()) === 1, "LOCAL_DEV panel present in dev build, below the real form");
  await p.screenshot({ path: `${base}/os-login-1440.png`, fullPage: true });
  await p.setViewportSize({ width: 390, height: 844 });
  await p.waitForTimeout(300);
  await p.screenshot({ path: `${base}/os-login-390.png`, fullPage: true });
  await ctx.close();
}
// 2. guest = signed in but not on the roster
{
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.addInitScript(() => sessionStorage.setItem("jjcss-os-role", "guest"));
  const p = await ctx.newPage();
  await p.goto(`${BASE}/os`, { waitUntil: "networkidle" });
  await p.waitForTimeout(800);
  check(p.url().includes("/os/login") && p.url().includes("reason=not_on_roster"), "guest → login with not_on_roster");
  check((await p.locator('[data-testid="reason-chip"]').textContent())?.includes("NOT_ON_ROSTER") ?? false, "NOT_ON_ROSTER chip + ask-the-president line");
  await p.screenshot({ path: `${base}/os-login-guest-1440.png` });
  await ctx.close();
}
// 3. LOCAL_DEV admin via the picker
{
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  await p.goto(`${BASE}/os/login?next=%2Fos%2Fboard`, { waitUntil: "networkidle" });
  await p.waitForTimeout(500);
  await p.locator('[data-testid="local-admin"]').click();
  await p.waitForTimeout(1200);
  check(new URL(p.url()).pathname === "/os/board", `admin picker honours next → ${new URL(p.url()).pathname}`);
  // the module is a lazy chunk; on a slow runner give it time to arrive rather than reading the DOM at 1.2 s
  const boardTitle = await p
    .locator("text=Board")
    .first()
    .waitFor({ timeout: 15000 })
    .then(() => true)
    .catch(() => false);
  check(boardTitle, "/os/board renders for admin");
  await ctx.close();
}
// 4. public nav shows the button; signed-in nav shows the name
{
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  await p.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await p.waitForTimeout(800);
  const t = await p.locator('[data-testid="nav-os"]').textContent();
  check(t?.includes("CSS_OS") && t?.includes("BOARD"), `nav button anonymous: ${t?.trim()}`);
  await p.screenshot({ path: `${base}/home-nav-os-1440.png`, clip: { x: 0, y: 0, width: 1440, height: 80 } });
  await p.evaluate(() => sessionStorage.setItem("jjcss-os-role", "admin"));
  await p.reload({ waitUntil: "networkidle" });
  await p.waitForTimeout(800);
  const t2 = await p.locator('[data-testid="nav-os"]').textContent();
  check(t2?.includes("CSS_OS · ") && !t2?.includes("BOARD"), `nav button signed in: ${t2?.trim()}`);
  check((await p.locator('[data-testid="nav-os"]').getAttribute("href")) === "/os", "signed-in button links to /os");
  await p.setViewportSize({ width: 390, height: 844 });
  await p.click('button[aria-label="Open menu"]');
  await p.waitForTimeout(600);
  check((await p.locator("text=CSS_OS · BOARD LOGIN").count()) > 0, "mobile overlay lists /09 CSS_OS · BOARD LOGIN");
  await p.screenshot({ path: `${base}/home-overlay-os-390.png` });
  await ctx.close();
}
await b.close();
console.log(failed ? `${failed} check(s) failed` : "OS gate: all checks passed");
process.exit(failed ? 1 : 0);
