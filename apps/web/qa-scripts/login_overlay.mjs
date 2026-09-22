// T03 login overlay gate (run 9 §4): at the ref's aspect (1665×1032 → 1440×892 viewport) measure the
// field split, the panel chamfer, the headline / list / pagination blocks as fractions of the page and
// compare with R9_02. Pass = every measure within ±3 %. Run from apps/web with make dev up.
import { launchChrome } from "./browser.mjs";

// R9_02 measured (1665×1032, the outer frame is 30 px): nav 30–75, field 85–1000, left 35–820, panel 830–1630 / 108–990,
// headline 145–265 at x 865, list 408–530, giant "1" 895–960 at x 880, "/5" x 1360–1445, chamfer ≈ 130 px of the panel's 800
const REF = {
  split: (820 - 35) / (1630 - 35), // left field share of the width
  panelTop: (108 - 85) / (1000 - 85),
  headlineTop: (145 - 108) / (990 - 108),
  headlineH: (265 - 145) / (990 - 108),
  listTop: (408 - 108) / (990 - 108),
  pageTop: (895 - 108) / (990 - 108),
  chamfer: 130 / 800,
};
const b = await launchChrome();
const p = await b.newPage({ viewport: { width: 1440, height: 892 } });
await p.goto("http://localhost:5173/os/login", { waitUntil: "networkidle" });
await p.waitForTimeout(1500);
const m = await p.evaluate(() => {
  const r = (sel) => document.querySelector(sel)?.getBoundingClientRect();
  const left = r("main > div > div:first-child");
  const panel = r('[data-tone="dark-3"]');
  const h1 = r('[data-testid="login-title"]');
  const list = r("ol.mt-6");
  const page = r("main .tnum.t-os-display");
  const chamfer = getComputedStyle(document.querySelector('[data-tone="dark-3"]')).clipPath;
  return {
    left: [left.left, left.top, left.right, left.bottom],
    panel: [panel.left, panel.top, panel.right, panel.bottom],
    h1: [h1.top, h1.bottom],
    list: [list.top],
    page: [page.top],
    W: innerWidth,
    H: innerHeight,
    chamfer,
  };
});
const fieldTop = m.left[1],
  fieldBottom = m.left[3];
const ours = {
  split: (m.left[2] - m.left[0]) / (m.panel[2] - m.left[0]),
  panelTop: (m.panel[1] - fieldTop) / (fieldBottom - fieldTop),
  headlineTop: (m.h1[0] - m.panel[1]) / (m.panel[3] - m.panel[1]),
  headlineH: (m.h1[1] - m.h1[0]) / (m.panel[3] - m.panel[1]),
  listTop: (m.list[0] - m.panel[1]) / (m.panel[3] - m.panel[1]),
  pageTop: (m.page[0] - m.panel[1]) / (m.panel[3] - m.panel[1]),
  chamfer: Math.min(0.15, 120 / (m.panel[2] - m.panel[0])),
};
let worst = 0;
for (const k of Object.keys(REF)) {
  const d = Math.abs(REF[k] - ours[k]);
  worst = Math.max(worst, d);
  console.log(`${k.padEnd(12)} ref ${(REF[k] * 100).toFixed(1)}%  ours ${(ours[k] * 100).toFixed(1)}%  Δ ${(d * 100).toFixed(1)}%`);
}
console.log(`worst Δ ${(worst * 100).toFixed(1)}% → ${worst <= 0.03 ? "ok (±3 %)" : "FAIL"}`);
await p.screenshot({ path: "../../qa/loops/run9/login-overlay-1440.png" });
await b.close();
process.exit(worst <= 0.03 ? 0 : 1);
