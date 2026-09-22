// Bento overlay gate (run 9 §5 gate): at 1120×788-equivalent, measure every tile's bounding box
// as a fraction of the grid box and compare with R9_06 (measured in docs/archive/context/39_OS_GRID.md).
// Passes when every edge is within ±2 % of the ref. Run from apps/web with make dev up:
//   node qa-scripts/bento_overlay.mjs [/os /os/members ...]
import { launchChrome } from "./browser.mjs";
import { mkdirSync } from "node:fs";

// ref tiles at 1120×788: x0,y0,x1,y1 in px; the grid box is x 17–1098, y 75–771
const GRID = { x0: 17, y0: 75, x1: 1098, y1: 771 };
const REF = {
  a: [17, 75, 280, 203],
  b: [17, 214, 280, 340],
  c: [290, 75, 553, 340],
  d: [563, 75, 1098, 340],
  e: [17, 352, 280, 771],
  f: [290, 352, 553, 771],
  g: [563, 352, 825, 613],
  h: [836, 352, 1098, 613],
  i: [563, 624, 1098, 771],
};
const frac = ([x0, y0, x1, y1], g) => [(x0 - g.x0) / (g.x1 - g.x0), (y0 - g.y0) / (g.y1 - g.y0), (x1 - g.x0) / (g.x1 - g.x0), (y1 - g.y0) / (g.y1 - g.y0)];
const routes = process.argv.slice(2).length ? process.argv.slice(2) : ["/os", "/os/members", "/os/audit"];
mkdirSync("../../qa/loops/run9", { recursive: true });
const b = await launchChrome();
const ctx = await b.newContext({ viewport: { width: 1120 + 56, height: 900 } }); // + the 56 px rail: the grid keeps the ref's width
await ctx.addInitScript(() => sessionStorage.setItem("jjcss-os-role", "admin"));
let fail = 0;
for (const route of routes) {
  const p = await ctx.newPage();
  await p.goto(`http://localhost:5173${route}`, { waitUntil: "networkidle" });
  await p.waitForTimeout(1200);
  const boxes = await p.evaluate(() => {
    const g = document.querySelector('[data-testid="bento"]').getBoundingClientRect();
    const out = { grid: [g.left, g.top, g.right, g.bottom] };
    for (const el of document.querySelectorAll(".bento-slot")) {
      const r = el.getBoundingClientRect();
      out[el.dataset.slot] = [r.left, r.top, r.right, r.bottom];
    }
    return out;
  });
  const g = { x0: boxes.grid[0], y0: boxes.grid[1], x1: boxes.grid[2], y1: boxes.grid[3] };
  let worst = 0;
  const rows = [];
  for (const k of Object.keys(REF)) {
    const r = frac(REF[k], GRID);
    const o = frac(boxes[k], g);
    const d = Math.max(...r.map((v, i) => Math.abs(v - o[i])));
    worst = Math.max(worst, d);
    rows.push(`${k} Δ${(d * 100).toFixed(1)}%`);
  }
  const ok = worst <= 0.02;
  if (!ok) fail++;
  console.log(
    `${route.padEnd(14)} ${ok ? "ok  " : "FAIL"} worst edge Δ ${(worst * 100).toFixed(2)}%  [${rows.join(" ")}]  grid ${Math.round(g.x1 - g.x0)}×${Math.round(g.y1 - g.y0)}`,
  );
  // overlay sheet: the ref tiles' outlines (red) over the shot, in the grid's frame
  await p.evaluate(
    ({ REF, GRID, g }) => {
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("style", `position:fixed;left:${g.x0}px;top:${g.y0}px;width:${g.x1 - g.x0}px;height:${g.y1 - g.y0}px;z-index:9999;pointer-events:none`);
      svg.setAttribute("viewBox", `0 0 ${GRID.x1 - GRID.x0} ${GRID.y1 - GRID.y0}`);
      svg.setAttribute("preserveAspectRatio", "none");
      for (const [k, [x0, y0, x1, y1]] of Object.entries(REF)) {
        const r = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        r.setAttribute("x", x0 - GRID.x0);
        r.setAttribute("y", y0 - GRID.y0);
        r.setAttribute("width", x1 - x0);
        r.setAttribute("height", y1 - y0);
        r.setAttribute("fill", "none");
        r.setAttribute("stroke", "#E0242C");
        r.setAttribute("stroke-width", "2");
        r.setAttribute("vector-effect", "non-scaling-stroke");
        svg.appendChild(r);
        const t = document.createElementNS("http://www.w3.org/2000/svg", "text");
        t.setAttribute("x", x1 - GRID.x0 - 14);
        t.setAttribute("y", y0 - GRID.y0 + 14);
        t.setAttribute("fill", "#E0242C");
        t.setAttribute("font-size", "11");
        t.textContent = k.toUpperCase();
        svg.appendChild(t);
      }
      document.body.appendChild(svg);
    },
    { REF, GRID, g },
  );
  await p.screenshot({ path: `../../qa/loops/run9/overlay-${route.replace(/\//g, "_").replace(/^_/, "")}.png` });
  await p.close();
}
await b.close();
process.exit(fail ? 1 : 0);
