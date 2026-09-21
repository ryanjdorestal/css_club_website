// Font-consistency gate (context/26 §2, run 9 §2.4: two realms). Buckets every rendered
// text node by size and prints the font-family set per bucket per page. Fails on extras.
// Run from apps/web: node qa-scripts/font_audit.mjs [route ...]   (OS routes = the os realm)
import { chromium } from "@playwright/test";

const routes = process.argv.slice(2).length
  ? process.argv.slice(2)
  : ["/", "/events", "/projects", "/cyberhounds", "/about", "/resources", "/news", "/join", "/styleguide", "/os/login", "/os", "/os/members", "/os/audit"];

// Type v5 (run 10 §3.6): nothing ≥ 28 px in any face but Turret Road (Michroma where §2 assigns it);
// deks / ticker / readouts / labels ≥ 11 px are Martian Mono; long prose is Space Grotesk; < 12 px is
// JetBrains Mono (labels at exactly 11 px are Martian Mono by §3.3, so micro allows both).
// OS realm: Silkscreen titles, Turret Road KPIs, Martian Mono labels.
// VT323 is exempt wherever it appears (rings/ticker digits only, decorative)
const EXEMPT = new Set(["VT323"]);
const REALMS = {
  public: {
    display: new Set(["Turret Road", "Michroma"]),
    mid: new Set(["Turret Road", "Michroma", "Martian Mono", "Space Grotesk", "JetBrains Mono"]),
    micro: new Set(["JetBrains Mono", "Martian Mono"]),
  },
  os: {
    display: new Set(["Silkscreen", "Turret Road", "Martian Mono"]),
    mid: new Set(["Silkscreen", "Turret Road", "Martian Mono", "JetBrains Mono", "Space Grotesk", "Michroma"]), // Michroma: the public nav logotype on /os/login
    micro: new Set(["JetBrains Mono", "Martian Mono"]),
  },
};
// /styleguide shows the OS face in its specimen — the one public page allowed Silkscreen ≥ 28 px
const STYLEGUIDE_EXTRA = new Set(["Silkscreen"]);
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
    const extra = Object.keys(fams).filter((f) => !ALLOW[bucket].has(f) && !EXEMPT.has(f) && !(route === "/styleguide" && STYLEGUIDE_EXTRA.has(f)));
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
