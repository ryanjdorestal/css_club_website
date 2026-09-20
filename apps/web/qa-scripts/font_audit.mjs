// Font-consistency gate (context/26 §2). Buckets every rendered text node by
// size and prints the font-family set per bucket per page. Fails on extras.
// Run from apps/web: node ../../scripts/font_audit.mjs [route ...]
import { chromium } from "@playwright/test";

const routes = process.argv.slice(2).length
  ? process.argv.slice(2)
  : ["/", "/events", "/apps", "/cyberhounds", "/about", "/resources", "/news", "/join", "/styleguide"];

// §2 table sanctions Unbounded at small sizes for buttons, the nav logotype,
// the footer tagline and stat units — so mid allows it (logged, 27_RUN4_LOG).
const ALLOW = {
  display: new Set(["Unbounded"]),
  mid: new Set(["Unbounded", "Space Grotesk", "JetBrains Mono"]),
  micro: new Set(["JetBrains Mono"]),
};
// VT323 is exempt wherever it appears (rings/ticker digits only, decorative)
const EXEMPT = new Set(["VT323"]);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
let fail = 0;
for (const route of routes) {
  await page.goto(`http://localhost:5173${route}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
  await page.evaluate(async () => {
    for (let y = 0; y <= document.body.scrollHeight; y += 800) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 30)); }
  });
  const buckets = await page.evaluate(() => {
    const out = { display: {}, mid: {}, micro: {} };
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const n = walker.currentNode;
      if (!n.textContent.trim()) continue;
      const el = n.parentElement;
      if (!el || el.closest("script,style,noscript")) continue;
      const cs = getComputedStyle(el);
      if (cs.display === "none" || cs.visibility === "hidden") continue;
      const size = parseFloat(cs.fontSize);
      const fam = cs.fontFamily.split(",")[0].replace(/['"]/g, "").trim();
      if (el.classList.contains("unit")) continue; // stat units ride the display face
      const bucket = size >= 28 ? "display" : size >= 12 ? "mid" : "micro";
      out[bucket][fam] = (out[bucket][fam] ?? 0) + 1;
      if ((bucket === "micro" && fam !== "JetBrains Mono" && fam !== "VT323") || (bucket === "display" && fam !== "Unbounded")) {
        (out.__offenders ??= []).push(`${bucket} ${fam} ${Math.round(size)}px "${n.textContent.trim().slice(0, 40)}"`);
      }
    }
    return out;
  });
  const offenders = buckets.__offenders ?? [];
  delete buckets.__offenders;
  let pageFail = false;
  for (const [bucket, fams] of Object.entries(buckets)) {
    const extra = Object.keys(fams).filter((f) => !ALLOW[bucket].has(f) && !EXEMPT.has(f));
    if (extra.length) { pageFail = true; fail++; }
    console.log(`${route.padEnd(14)} ${bucket.padEnd(8)} { ${Object.entries(fams).map(([f, c]) => `${f}:${c}`).join(", ")} }${extra.length ? "  ✗ EXTRA: " + extra.join(",") : ""}`);
  }
  offenders.slice(0, 6).forEach((o) => console.log(`   ↳ ${o}`));
  if (!pageFail) console.log(`${route.padEnd(14)} OK`);
}
await browser.close();
process.exit(fail ? 1 : 0);
