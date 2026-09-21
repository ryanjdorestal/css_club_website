// Font-consistency gate (context/26 §2, run 9 §2.4: two realms). Buckets every rendered
// text node by size and prints the font-family set per bucket per page. Fails on extras.
// Run from apps/web: node qa-scripts/font_audit.mjs [route ...]   (OS routes = the os realm)
import { chromium } from "@playwright/test";

const routes = process.argv.slice(2).length
  ? process.argv.slice(2)
  : ["/", "/events", "/projects", "/cyberhounds", "/about", "/resources", "/news", "/join", "/styleguide", "/os/login", "/os", "/os/members", "/os/audit"];

// Public realm: hero + poster words are the drawn S01 alphabet (SVG, no font); Unbounded stays the
// H1/H2 face (§2.1 fallback path, logged in 38_RUN9_LOG). Space Mono = --font-mono-display (deks, ticker,
// readouts, labels ≥ 12 px). Unbounded at small sizes is still sanctioned for buttons / logotype / units.
// OS realm: VT323 = --font-os-display (titles, login headline), Space Mono numerals + readouts.
const REALMS = {
  public: {
    display: new Set(["Unbounded", "Space Mono"]),
    mid: new Set(["Unbounded", "Space Grotesk", "JetBrains Mono", "Space Mono"]),
    micro: new Set(["JetBrains Mono"]),
  },
  os: {
    display: new Set(["VT323", "Space Mono", "Unbounded"]),
    mid: new Set(["Space Mono", "JetBrains Mono", "Space Grotesk", "Unbounded", "VT323"]),
    micro: new Set(["JetBrains Mono"]),
  },
};
// VT323 is exempt wherever it appears (rings/ticker digits only, decorative)
const EXEMPT = new Set(["VT323"]);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
let fail = 0;
for (const route of routes) {
  const ALLOW = REALMS[route.startsWith("/os") ? "os" : "public"];
  if (route.startsWith("/os") && route !== "/os/login") await page.context().addInitScript(() => sessionStorage.setItem("jjcss-os-role", "admin"));
  await page.goto(`http://localhost:5173${route}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
  await page.evaluate(async () => {
    for (let y = 0; y <= document.body.scrollHeight; y += 800) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 30));
    }
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
      if (
        (bucket === "micro" && fam !== "JetBrains Mono" && fam !== "VT323") ||
        (bucket === "display" && !["Unbounded", "Space Mono", "VT323"].includes(fam))
      ) {
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
    if (extra.length) {
      pageFail = true;
      fail++;
    }
    console.log(
      `${route.padEnd(14)} ${bucket.padEnd(8)} { ${Object.entries(fams)
        .map(([f, c]) => `${f}:${c}`)
        .join(", ")} }${extra.length ? "  ✗ EXTRA: " + extra.join(",") : ""}`,
    );
  }
  offenders.slice(0, 6).forEach((o) => console.log(`   ↳ ${o}`));
  if (!pageFail) console.log(`${route.padEnd(14)} OK`);
}
await browser.close();
process.exit(fail ? 1 : 0);
