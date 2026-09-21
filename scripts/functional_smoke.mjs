// functional_smoke.mjs — what a board member does, end to end, in Tier 1 (dev server + API).
// Asserts the PUBLIC site changed after each OS action. Every step screenshots to qa/loops/smoke/.
// Run:  cd apps/web && node ../../scripts/functional_smoke.mjs   (BASE_URL, API_URL overridable)
import { createRequire } from "node:module";
const { chromium } = createRequire(new URL("../apps/web/package.json", import.meta.url))("@playwright/test");
import { mkdirSync, existsSync, readFileSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join } from "node:path";

const ROOT = new URL("../", import.meta.url).pathname;
const BASE = process.env.BASE_URL ?? "http://localhost:5173";
const OUT = join(ROOT, "qa/loops/smoke");
mkdirSync(OUT, { recursive: true });
const stamp = Date.now().toString().slice(-5);
let step = 0,
  failed = 0;
const say = (ok, label) => {
  console.log(`${ok ? "ok  " : "FAIL"} ${String(step).padStart(2, "0")} ${label}`);
  if (!ok) failed++;
};
const shot = (p, name) => p.screenshot({ path: join(OUT, `${String(step).padStart(2, "0")}-${name}.png`), fullPage: false });

const b = await chromium.launch();
const admin = await b.newContext({ viewport: { width: 1440, height: 900 } });
const pub = await b.newContext({ viewport: { width: 1440, height: 900 } });
const os = await admin.newPage();
const site = await pub.newPage();
const goto = async (p, path) => {
  await p.goto(`${BASE}${path}`, { waitUntil: "networkidle" });
  await p.waitForTimeout(700);
};
const fill = async (p, label, value) => {
  // run 10: OsForm labels point at their inputs with htmlFor (getByLabel); legacy nested labels still work
  const byFor = p.getByLabel(new RegExp("^" + label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "( \\*)?$", "i")).first();
  if (await byFor.count()) return byFor.fill(value);
  const el = p.locator(`label:has-text("${label}") input, label:has-text("${label}") textarea, label:has-text("${label}") select`).first();
  await el.fill(value);
};
const closePanels = async (p) => {
  for (const b of await p.locator('aside button:has-text("close")').all()) await b.click().catch(() => {});
  await p.waitForTimeout(200);
};
const contains = async (p, path, text) => {
  await goto(p, path);
  for (let i = 0; i < 10; i++) {
    if (((await p.locator("body").textContent()) ?? "").includes(text)) return true;
    await p.waitForTimeout(500);
  }
  return false;
};

// 1 — login (LOCAL_DEV admin)
step = 1;
await goto(os, "/os/login");
await os.locator('[data-testid="local-admin"]').click();
await os.waitForTimeout(1000);
say(new URL(os.url()).pathname === "/os", "login as LOCAL_DEV admin → /os");
await shot(os, "login");

// 2 — create a post, publish → /news
step = 2;
await goto(os, "/os/posts");
await os.getByRole("button", { name: /NEW_POST/i }).click({ force: true });
await os.waitForTimeout(400);
await fill(os, "TITLE", `Smoke bulletin ${stamp}`);
await fill(os, "DEK", "written by the functional smoke");
await os.locator("#f-body_md").fill("## Hello\n\nThis post was published by scripts/functional_smoke.mjs.");
await os.getByRole("button", { name: /SAVE_DRAFT/i }).click({ force: true });
await os.waitForTimeout(900);
await closePanels(os);
await os.locator(`text=Smoke bulletin ${stamp}`).first().click();
await os.waitForTimeout(500);
await os
  .getByRole("button", { name: /^publish\s*↗?$/i })
  .first()
  .click({ force: true });
await os.waitForTimeout(900);
say(await contains(site, "/news", `Smoke bulletin ${stamp}`), "post published → appears on /news");
await shot(site, "news");

// 3 — add a project on behalf of a student, publish, feature → /projects Featured
step = 3;
await goto(os, "/os/projects");
await os.locator('button:has-text("add")').first().click();
await os.waitForTimeout(400);
await fill(os, "TITLE", `Smoke Project ${stamp}`);
await os.locator("#f-kind").selectOption("project");
await fill(os, "SUMMARY", "A project added on behalf of a student by the smoke test.");
await fill(os, "AUTHORS", "Jay Bloodhound");
await os.getByRole("button", { name: /ADD_PROJECT/i }).click({ force: true });
await os.waitForTimeout(900);
await closePanels(os);
await os.locator(`text=Smoke Project ${stamp}`).first().click();
await os.waitForTimeout(500);
await os
  .getByRole("button", { name: /^publish\s*↗?$/i })
  .first()
  .click({ force: true });
await os.waitForTimeout(900);
await closePanels(os);
await os.locator('button:has-text("published")').first().click();
await os.waitForTimeout(400);
await closePanels(os);
await os.locator(`text=Smoke Project ${stamp}`).first().click();
await os.waitForTimeout(500);
await os
  .getByRole("button", { name: /^\[?\s*feature\s*\]?$/i })
  .first()
  .click({ force: true });
await os.waitForTimeout(900);
await goto(site, "/projects");
const pageText = (await site.locator("body").textContent()) ?? "";
// run 10: up to three projects are featured (the seed's example stays); ours must be among them
const featuredTitles = await site.evaluate(async () => (await (await fetch("/api/projects")).json()).projects.filter((p) => p.featured).map((p) => p.title));
say(
  pageText.includes(`Smoke Project ${stamp}`) && featuredTitles.includes(`Smoke Project ${stamp}`),
  `project published + featured → /projects (featured = ${featuredTitles.join(" · ")})`,
);
await shot(site, "projects");

// 4 — create an event, publish → /events + Home
step = 4;
await goto(os, "/os/events");
await os.getByRole("button", { name: /NEW_EVENT/i }).click({ force: true });
await os.waitForTimeout(400);
await fill(os, "TITLE", `Smoke Kickoff ${stamp}`);
await fill(os, "SEMESTER", "Fall 2026");
await fill(os, "DATE", "2026-10-01"); // run 10: a real date (upcoming/past derives from it)
await fill(os, "DATE (AS PRINTED)", "Thursday, October 1st, 2026");
await os
  .getByRole("button", { name: /^\[?\s*>_save\s*\]?$/i })
  .first()
  .click({ force: true });
await os.waitForTimeout(900);
await closePanels(os);
await os.locator(`text=Smoke Kickoff ${stamp}`).first().click();
await os.waitForTimeout(500);
await os
  .getByRole("button", { name: /^publish\s*↗?$/i })
  .first()
  .click({ force: true });
await os.waitForTimeout(900);
say((await contains(site, "/events", `Smoke Kickoff ${stamp}`)) && (await contains(site, "/", `Smoke Kickoff ${stamp}`)), "event published → /events + Home");
await shot(site, "events");

// 5 — add a resource, change the Discord invite → public site
step = 5;
await goto(os, "/os/resources");
await os.getByRole("button", { name: /ADD_LINK/i }).click({ force: true });
await os.waitForTimeout(400);
await fill(os, "GROUP", "General Knowledge");
await fill(os, "TITLE", `Smoke Resource ${stamp}`);
await fill(os, "URL", "https://example.org/smoke");
await os
  .getByRole("button", { name: /^\[?\s*>_save\s*\]?$/i })
  .first()
  .click({ force: true });
await os.waitForTimeout(900);
await closePanels(os);
await os.locator('dt:has-text("DISCORD") + dd button:has-text("edit")').first().click();
await os.waitForTimeout(400);
await fill(os, "URL", `https://discord.gg/smoke${stamp}`);
await os
  .getByRole("button", { name: /^\[?\s*>_save\s*\]?$/i })
  .first()
  .click({ force: true });
await os.waitForTimeout(900);
const resOk = await contains(site, "/resources", `Smoke Resource ${stamp}`);
const invite = (await site.locator(`a[href*="discord.gg/smoke${stamp}"]`).count()) > 0;
say(resOk && invite, "resource + Discord invite → /resources shows both");
await shot(site, "resources");

// 6 — add an officer → About
step = 6;
await goto(os, "/os/board");
await os.getByRole("button", { name: /ADD_OFFICER/i }).click({ force: true });
await os.waitForTimeout(400);
await fill(os, "NAME", `Smoke Officer ${stamp}`);
await fill(os, "ROLE", "Secretary");
await fill(os, "EMAIL", `smoke${stamp}@jjay.cuny.edu`);
await os
  .getByRole("button", { name: /^\[?\s*>_save\s*\]?$/i })
  .first()
  .click({ force: true });
await os.waitForTimeout(900);
say(await contains(site, "/about", `Smoke Officer ${stamp}`), "officer added → About shows them");
await shot(site, "about");

// 7 — file a handoff + a decision record → listed on /os/inheritance, files exist, validator passes
step = 7;
await goto(os, "/os/inheritance");
for (const [type, title] of [
  ["handoff", `Handoff — Secretary ${stamp}`],
  ["decision", `Smoke decision ${stamp}`],
]) {
  await os.locator(`button:has-text("+ ${type}")`).click();
  await os.waitForTimeout(500);
  await fill(os, "TITLE", title);
  await fill(os, "OWNERS", "the board");
  await os.locator("#f-status").selectOption("final");
  await os.locator("#f-body_md").fill("## What I ran\n\nThe smoke test.\n\n## Where things are\n\nIn the repo.");
  await os.getByRole("button", { name: /WRITE_FILE/i }).click({ force: true });
  await os.waitForTimeout(1000);
}
await goto(os, "/os/inheritance");
const { readdirSync } = await import("node:fs");
const onDisk = ["handoffs", "decisions"].every(
  (d) =>
    existsSync(join(ROOT, "content/inheritance/F26", d)) &&
    readdirSync(join(ROOT, "content/inheritance/F26", d)).some((n) => n.includes(stamp.toLowerCase()) || n.includes(stamp)),
);
const listed = ((await os.locator("body").textContent()) ?? "").includes(`Smoke decision ${stamp}`);
let validator = false;
try {
  execFileSync(join(ROOT, ".venv/bin/python"), [join(ROOT, "scripts/validate_inheritance.py"), "--quiet"], { stdio: "pipe" });
  validator = true;
} catch {
  validator = false;
}
say(listed && onDisk && validator, `handoff + decision records → listed (${listed}), on disk (${onDisk}), validator ${validator ? "passes" : "FAILS"}`);
await shot(os, "inheritance");

// 8 — sign out → /os redirects with the reason chip
step = 8;
await goto(os, "/os");
await os.getByRole("button", { name: /sign out/i }).click({ force: true });
await os.waitForTimeout(800);
await goto(os, "/os/projects");
say(os.url().includes("/os/login") && os.url().includes("reason=not_signed_in"), `signed out → /os bounces with a reason chip (${os.url().replace(BASE, "")})`);
await shot(os, "signed-out");

// 9 — export spine zip has the files
step = 9;
const adminPage = await admin.newPage();
await goto(adminPage, "/os/login");
const zip = await adminPage.evaluate(async () => {
  const r = await fetch("/api/os/inheritance/export.zip", { headers: { "X-Local-Role": "admin" } });
  const buf = new Uint8Array(await r.arrayBuffer());
  return { ok: r.ok, size: buf.length, head: String.fromCharCode(...buf.slice(0, 2)) };
});
say(zip.ok && zip.head === "PK" && zip.size > 2000, `export spine zip (${zip.size} bytes, PK header)`);

// cleanup: the smoke's inheritance files (local tables are wiped by make clean)
for (const f of ["decisions", "handoffs"]) {
  const d = join(ROOT, "content/inheritance/F26", f);
  if (existsSync(d)) for (const n of (await import("node:fs")).readdirSync(d)) if (n.includes(stamp) || n.includes("smoke")) rmSync(join(d, n));
}
await b.close();
console.log(failed ? `${failed} step(s) failed` : "functional smoke: 9/9 steps passed");
process.exit(failed ? 1 : 0);
