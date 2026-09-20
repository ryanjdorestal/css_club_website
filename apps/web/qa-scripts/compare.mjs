// npm run compare -- --page <name>
// Builds qa/loops/<name>/compare_<n>.png from qa/loops/<name>/plan.json:
// [{section, refImage, refCrop:[x,y,w,h], ourShot, ourCrop:[x,y,w,h], note}]
import sharp from "sharp";
import { readFileSync, existsSync, readdirSync } from "node:fs";

const args = process.argv.slice(2);
const name = args[args.indexOf("--page") + 1];
const base = `../../qa/loops/${name}`;
const plan = JSON.parse(readFileSync(`${base}/plan.json`, "utf8"));
const n = readdirSync(base).filter((f) => f.startsWith("compare_")).length + 1;

const CW = 560, PAD = 16, NOTEW = 420;
const rows = [];
for (const item of plan) {
  const cells = [];
  for (const [img, crop] of [[`../../${item.refImage}`, item.refCrop], [`${base}/${item.ourShot}`, item.ourCrop]]) {
    if (!existsSync(img)) { cells.push(await sharp({ create: { width: CW, height: 200, channels: 3, background: "#333" } }).png().toBuffer()); continue; }
    let s = sharp(img);
    if (crop) {
      const meta = await s.metadata();
      const left = Math.max(0, Math.min(crop[0], meta.width - 10));
      const top = Math.max(0, Math.min(crop[1], meta.height - 10));
      const width = Math.min(crop[2], meta.width - left);
      const height = Math.min(crop[3], meta.height - top);
      s = s.extract({ left, top, width, height });
    }
    cells.push(await s.resize({ width: CW }).png().toBuffer());
  }
  const hs = await Promise.all(cells.map((b) => sharp(b).metadata()));
  const h = Math.max(...hs.map((m) => m.height), 160);
  const esc = (t) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  const words = `${item.section} — ${item.note ?? ""}`.split(" ");
  const lines = [];
  let cur = "";
  for (const w of words) {
    if ((cur + " " + w).length > 52) { lines.push(cur); cur = w; } else cur = cur ? cur + " " + w : w;
  }
  if (cur) lines.push(cur);
  const noteSvg = Buffer.from(`<svg width="${NOTEW}" height="${h}"><rect width="100%" height="100%" fill="#0C183C"/>${lines.slice(0, Math.floor((h - 20) / 16)).map((l, i) => `<text x="12" y="${24 + i * 16}" fill="#F4F7FB" font-family="monospace" font-size="12">${esc(l)}</text>`).join("")}</svg>`);
  const row = await sharp({ create: { width: CW * 2 + NOTEW + PAD * 4, height: h + PAD, channels: 3, background: "#1A1618" } })
    .composite([
      { input: cells[0], left: PAD, top: PAD / 2 },
      { input: cells[1], left: CW + PAD * 2, top: PAD / 2 },
      { input: await sharp(noteSvg).png().toBuffer(), left: CW * 2 + PAD * 3, top: PAD / 2 },
    ]).png().toBuffer();
  rows.push(row);
}
const metas = await Promise.all(rows.map((r) => sharp(r).metadata()));
const totalH = metas.reduce((a, m) => a + m.height, 0);
const W = CW * 2 + NOTEW + PAD * 4;
let y = 0;
const composites = rows.map((r, i) => {
  const c = { input: r, left: 0, top: y };
  y += metas[i].height;
  return c;
});
await sharp({ create: { width: W, height: totalH, channels: 3, background: "#1A1618" } })
  .composite(composites).png().toFile(`${base}/compare_${n}.png`);
console.log(`${base}/compare_${n}.png (${plan.length} sections)`);
