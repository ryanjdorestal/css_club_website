// type_match.mjs — empirical face identification (run 9 §2.1–§2.3). For one role
// (display | mono | pixel) it renders the reference word in every candidate face at the
// reference crop's cap height, binarizes both, aligns by bounding box, fits tracking, and
// scores IoU (overall + per glyph), stroke ratio and corner fill. Prints a ranked table and
// writes qa/loops/run9/type_match_<role>.{png,json}.
// Run from the repo root:  node scripts/type_match.mjs display [--fonts <node_modules>] [--refs <dir>]
import { createRequire } from "node:module";
import { launchChrome } from "../apps/web/qa-scripts/browser.mjs";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const args = process.argv.slice(2);
const role = args.find((a) => !a.startsWith("--")) ?? "display";
const opt = (k, d) => (args.includes(k) ? args[args.indexOf(k) + 1] : d);
const FONTS = resolve(opt("--fonts", "apps/web/node_modules"));
const REFS = resolve(opt("--refs", `${process.env.HOME}/Desktop/jjay_css_refs/run9`));
const OUT = resolve(opt("--out", "qa/loops/run9"));
mkdirSync(OUT, { recursive: true });

// candidates: [family name as fontsource registers it, package, weight]
const DISPLAY = [
  ["Unbounded", "unbounded", 900],
  ["Unbounded", "unbounded", 800],
  ["Michroma", "michroma", 400],
  ["Bruno Ace", "bruno-ace", 400],
  ["Audiowide", "audiowide", 400],
  ["Orbitron", "orbitron", 700],
  ["Orbitron", "orbitron", 900],
  ["Zen Dots", "zen-dots", 400],
  ["Krona One", "krona-one", 400],
  ["Chakra Petch", "chakra-petch", 700],
  ["Syncopate", "syncopate", 700],
  ["Exo 2", "exo-2", 800],
  ["Russo One", "russo-one", 400],
  ["Goldman", "goldman", 700],
  ["Sarpanch", "sarpanch", 800],
  ["Sarpanch", "sarpanch", 900],
  ["Tektur", "tektur", 800],
  ["Tektur", "tektur", 900],
  ["Oxanium", "oxanium", 800],
  ["Share Tech", "share-tech", 400],
  ["Tomorrow", "tomorrow", 900],
  ["Days One", "days-one", 400],
  ["Aldrich", "aldrich", 400],
  ["Quantico", "quantico", 700],
  ["Titillium Web", "titillium-web", 900],
  ["Genos", "genos", 900],
  ["Saira", "saira", 900],
  // second batch — Neue-Machina-like (rounded outer, squared counters, medium stroke, wide M)
  ["Anta", "anta", 400],
  ["Unica One", "unica-one", 400],
  ["Metrophobic", "metrophobic", 400],
  ["Doppio One", "doppio-one", 400],
  ["Bakbak One", "bakbak-one", 400],
  ["Kdam Thmor Pro", "kdam-thmor-pro", 400],
  ["Nova Square", "nova-square", 400],
  ["Nova Flat", "nova-flat", 400],
  ["Familjen Grotesk", "familjen-grotesk", 700],
  ["Jura", "jura", 700],
  ["Lexend Zetta", "lexend-zetta", 700],
  ["Space Grotesk", "space-grotesk", 700],
  ["Kanit", "kanit", 700],
  ["Bai Jamjuree", "bai-jamjuree", 700],
  ["Play", "play", 700],
  ["Iceberg", "iceberg", 400],
];
const MONO = [
  ["JetBrains Mono", "jetbrains-mono", 600],
  ["JetBrains Mono", "jetbrains-mono", 400],
  ["Kode Mono", "kode-mono", 600],
  ["Kode Mono", "kode-mono", 500],
  ["Share Tech Mono", "share-tech-mono", 400],
  ["Martian Mono", "martian-mono", 600],
  ["Space Mono", "space-mono", 700],
  ["Space Mono", "space-mono", 400],
  ["Sometype Mono", "sometype-mono", 600],
  ["Chivo Mono", "chivo-mono", 600],
  ["Azeret Mono", "azeret-mono", 600],
  ["IBM Plex Mono", "ibm-plex-mono", 600],
  ["Major Mono Display", "major-mono-display", 400],
  ["DM Mono", "dm-mono", 500],
  ["Fira Mono", "fira-mono", 700],
  ["Geist Mono", "geist-mono", 600],
  ["Red Hat Mono", "red-hat-mono", 600],
  ["Roboto Mono", "roboto-mono", 600],
  ["Ubuntu Mono", "ubuntu-mono", 700],
  ["B612 Mono", "b612-mono", 700],
  ["Nova Mono", "nova-mono", 400],
];
const PIXEL = [
  ["VT323", "vt323", 400],
  ["Silkscreen", "silkscreen", 700],
  ["Silkscreen", "silkscreen", 400],
  ["Pixelify Sans", "pixelify-sans", 700],
  ["Press Start 2P", "press-start-2p", 400],
  ["DotGothic16", "dotgothic16", 400],
  ["Tiny5", "tiny5", 400],
  ["Jersey 20", "jersey-20", 400],
  ["Jersey 25", "jersey-25", 400],
  ["Micro 5", "micro-5", 400],
  ["Workbench", "workbench", 400],
];
const ROLES = {
  // the D sits under a halftone block in the crop (occluded) — it is segmented, then dropped; EMON is scored
  display: {
    ref: "R9_01a_demon_wordmark_crop.png",
    text: "EMON",
    refGlyphs: 5,
    drop: 1,
    bin: "paper",
    cands: DISPLAY,
    track: [-0.06, 0.12],
    glyphs: 4,
    cornerGlyph: 2,
    line: 0,
  },
  mono: {
    ref: "R9_01b_demon_body_mono_crop.png",
    text: "BRUTAL AND RELENTLESS, THE ONI CLASS EMBODIES RAW",
    bin: "light",
    cands: MONO,
    cap: 40,
    track: [-0.15, 0.25],
    glyphs: 0,
    cornerGlyph: -1,
    line: 0,
    chars: 49,
    ofChars: 68,
  },
  pixel: {
    ref: "R9_02_permitify_T03_login_layout.png",
    crop: { x: 855, y: 130, w: 520, h: 80 },
    text: "AI-POWERED",
    bin: "light",
    cands: PIXEL,
    cap: 60,
    track: [-0.06, 0.2],
    glyphs: 0,
    cornerGlyph: -1,
    line: 0,
  },
};
const R = ROLES[role];
if (!R) throw new Error(`role must be display|mono|pixel, got ${role}`);

const b64 = (p) => readFileSync(p).toString("base64");
const fonts = R.cands
  .map(([fam, pkg, w]) => {
    const f = `${FONTS}/@fontsource/${pkg}/files/${pkg}-latin-${w}-normal.woff2`;
    if (!existsSync(f)) {
      console.log(`skip ${fam} ${w}: ${f} missing`);
      return null;
    }
    return { fam, pkg, w, data: b64(f) };
  })
  .filter(Boolean);
const refData = b64(`${REFS}/${R.ref}`);

const browser = await launchChrome();
const page = await browser.newPage({ viewport: { width: 1700, height: 1200 } });
await page.goto("about:blank");
const result = await page.evaluate(
  async ({ R, fonts, refData }) => {
    const CAP = R.cap ?? 140; // working cap height, px (mono renders 49 chars — smaller)
    const log = [];
    const bin = (img, mode) => {
      const out = new Uint8Array(img.width * img.height);
      const d = img.data;
      for (let i = 0, j = 0; i < d.length; i += 4, j++) {
        const r = d[i],
          g = d[i + 1],
          b = d[i + 2];
        const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        // "paper": the S01 letter cream (235,229,207) — tighter than the halftone blocks' tan (206–221)
        out[j] = mode === "paper" ? (r >= 224 && g >= 218 && b >= 192 && Math.max(r, g, b) - Math.min(r, g, b) < 50 ? 1 : 0) : lum > 150 ? 1 : 0;
      }
      return { m: out, w: img.width, h: img.height };
    };
    const bbox = (M) => {
      let x0 = M.w,
        y0 = M.h,
        x1 = -1,
        y1 = -1;
      for (let y = 0; y < M.h; y++)
        for (let x = 0; x < M.w; x++)
          if (M.m[y * M.w + x]) {
            if (x < x0) x0 = x;
            if (x > x1) x1 = x;
            if (y < y0) y0 = y;
            if (y > y1) y1 = y;
          }
      return { x0, y0, x1, y1, w: x1 - x0 + 1, h: y1 - y0 + 1 };
    };
    const crop = (M, bb) => {
      const out = new Uint8Array(bb.w * bb.h);
      for (let y = 0; y < bb.h; y++) for (let x = 0; x < bb.w; x++) out[y * bb.w + x] = M.m[(bb.y0 + y) * M.w + bb.x0 + x];
      return { m: out, w: bb.w, h: bb.h };
    };
    const rowsOfLine = (M, line) => {
      // rows with ink, grouped into lines by empty-row gaps; returns [y0,y1] of the requested line
      const has = [];
      for (let y = 0; y < M.h; y++) {
        let s = 0;
        for (let x = 0; x < M.w; x++) s += M.m[y * M.w + x];
        has.push(s > M.w * 0.004);
      }
      const lines = [];
      let start = -1;
      for (let y = 0; y <= M.h; y++) {
        const on = y < M.h && has[y];
        if (on && start < 0) start = y;
        if (!on && start >= 0) {
          if (y - start > 6) lines.push([start, y - 1]);
          start = -1;
        }
      }
      return lines[line] ?? [0, M.h - 1];
    };
    const iou = (A, B) => {
      // both aligned at (0,0); union canvas
      const w = Math.max(A.w, B.w),
        h = Math.max(A.h, B.h);
      let inter = 0,
        uni = 0;
      for (let y = 0; y < h; y++)
        for (let x = 0; x < w; x++) {
          const a = y < A.h && x < A.w ? A.m[y * A.w + x] : 0;
          const b = y < B.h && x < B.w ? B.m[y * B.w + x] : 0;
          inter += a & b;
          uni += a | b;
        }
      return uni ? inter / uni : 0;
    };
    const segmentsX = (M, minW) => {
      // a column is "ink" only above 8 % of the height: thin crossing lines and the SEC-01 chip read as gaps
      const col = new Array(M.w).fill(0);
      for (let y = 0; y < M.h; y++) for (let x = 0; x < M.w; x++) col[x] += M.m[y * M.w + x];
      const minInk = M.h * 0.08;
      const segs = [];
      let s = -1;
      for (let x = 0; x <= M.w; x++) {
        const on = x < M.w && col[x] > minInk;
        if (on && s < 0) s = x;
        if (!on && s >= 0) {
          segs.push([s, x - 1]);
          s = -1;
        }
      }
      for (let i = segs.length - 1; i >= 0; i--) {
        if (segs[i][1] - segs[i][0] < minW && segs.length > 1) {
          if (i > 0) {
            segs[i - 1][1] = segs[i][1];
            segs.splice(i, 1);
          } else {
            segs[1][0] = segs[0][0];
            segs.splice(0, 1);
          }
        }
      }
      return segs;
    };
    const segments = (M, minW) =>
      segmentsX(M, minW).map(([x0, x1]) => {
        const t = crop(M, { x0, y0: 0, w: x1 - x0 + 1, h: M.h });
        return crop(t, bbox(t));
      });
    const erode = (M) => {
      const out = new Uint8Array(M.w * M.h);
      for (let y = 1; y < M.h - 1; y++)
        for (let x = 1; x < M.w - 1; x++) {
          const i = y * M.w + x;
          out[i] = M.m[i] & M.m[i - 1] & M.m[i + 1] & M.m[i - M.w] & M.m[i + M.w] ? 1 : 0;
        }
      return { m: out, w: M.w, h: M.h };
    };
    const area = (M) => M.m.reduce((a, v) => a + v, 0);
    const pad = (M, p) => {
      const w = M.w + 2 * p,
        h = M.h + 2 * p,
        out = new Uint8Array(w * h);
      for (let y = 0; y < M.h; y++) for (let x = 0; x < M.w; x++) out[(y + p) * w + x + p] = M.m[y * M.w + x];
      return { m: out, w, h };
    };
    const strokeWidth = (M0) => {
      const M = pad(M0, 4);
      const a0 = area(M);
      let cur = M,
        prev = 1,
        k = 0;
      while (k < 60) {
        cur = erode(cur);
        k++;
        const f = area(cur) / a0;
        if (f < 0.5) {
          const t = (prev - 0.5) / (prev - f);
          return 4 * (k - 1 + t);
        }
        prev = f;
      }
      return 4 * k;
    };
    const cornerFill = (G, s) => {
      const side = Math.max(2, Math.round(s));
      const q = [
        [0, 0],
        [G.w - side, 0],
        [0, G.h - side],
        [G.w - side, G.h - side],
      ];
      let tot = 0;
      for (const [cx, cy] of q) {
        let c = 0;
        for (let y = 0; y < side; y++) for (let x = 0; x < side; x++) c += G.m[(cy + y) * G.w + cx + x] ?? 0;
        tot += c / (side * side);
      }
      return tot / 4;
    };
    const scaleMask = (M, f) => {
      // nearest-neighbour rescale by factor f (used to bring the reference to CAP)
      const w = Math.round(M.w * f),
        h = Math.round(M.h * f),
        out = new Uint8Array(w * h);
      for (let y = 0; y < h; y++)
        for (let x = 0; x < w; x++) out[y * w + x] = M.m[Math.min(M.h - 1, Math.floor(y / f)) * M.w + Math.min(M.w - 1, Math.floor(x / f))];
      return { m: out, w, h };
    };

    // ---- reference ----
    const img = new Image();
    img.src = "data:image/png;base64," + refData;
    await img.decode();
    const rc = document.createElement("canvas");
    const cr = R.crop ?? { x: 0, y: 0, w: img.naturalWidth, h: img.naturalHeight };
    rc.width = cr.w;
    rc.height = cr.h;
    rc.getContext("2d").drawImage(img, cr.x, cr.y, cr.w, cr.h, 0, 0, cr.w, cr.h);
    let refM = bin(rc.getContext("2d").getImageData(0, 0, cr.w, cr.h), R.bin);
    const [ly0, ly1] = rowsOfLine(refM, R.line);
    refM = crop(refM, { x0: 0, y0: ly0, w: refM.w, h: ly1 - ly0 + 1 });
    let rb = bbox(refM);
    if (R.chars) {
      // mono: keep the first `chars` of `ofChars` advances
      const adv = rb.w / (R.ofChars - 0.4);
      rb = { ...rb, w: Math.round(adv * R.chars), x1: rb.x0 + Math.round(adv * R.chars) - 1 };
    }
    let ref = crop(refM, rb);
    if (R.drop) {
      // drop the occluded leading glyph(s): segment on the raw ref, keep from the next glyph's left edge
      const raw = segmentsX(ref, ref.h * 0.15);
      log.push(`ref ${ref.w}x${ref.h} rb=${JSON.stringify(rb)} line=${ly0}-${ly1} segs=${JSON.stringify(raw)}`);
      if (raw.length >= R.refGlyphs) {
        const x0 = raw[R.drop][0],
          x1 = raw[raw.length - 1][1];
        const t = crop(ref, { x0, y0: 0, w: x1 - x0 + 1, h: ref.h });
        ref = crop(t, bbox(t));
      } else log.push(`drop: expected ${R.refGlyphs} segments, got ${raw.length}`);
    }
    const refCapPx = ref.h;
    ref = scaleMask(ref, CAP / refCapPx);
    ref = crop(ref, bbox(ref));
    const refStroke = strokeWidth(ref);
    const refSegs = R.glyphs ? segments(ref, CAP * 0.15) : [];
    const refCorner = R.cornerGlyph >= 0 && refSegs[R.cornerGlyph] ? cornerFill(refSegs[R.cornerGlyph], refStroke) : null;

    // ---- candidates ----
    const c = document.createElement("canvas");
    c.width = 2400;
    c.height = 400;
    const ctx = c.getContext("2d", { willReadFrequently: true });
    const render = (fam, w, size, trackEm) => {
      ctx.clearRect(0, 0, c.width, c.height);
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, c.width, c.height);
      ctx.fillStyle = "#fff";
      ctx.font = `${w} ${size}px "${fam}"`;
      ctx.letterSpacing = `${trackEm * size}px`;
      ctx.textBaseline = "alphabetic";
      ctx.fillText(R.text, 20, 300);
      const M = bin(ctx.getImageData(0, 0, c.width, c.height), "light");
      return crop(M, bbox(M));
    };
    const out = [];
    for (const f of fonts) {
      const face = new FontFace(f.fam, `url(data:font/woff2;base64,${f.data})`, { weight: String(f.w) });
      await face.load();
      document.fonts.add(face);
      // find the size whose rendered cap height is CAP
      let size = CAP;
      let m = render(f.fam, f.w, size, 0);
      size = (CAP / m.h) * size;
      let best = { iou: 0, track: 0, M: null };
      for (let t = R.track[0]; t <= R.track[1] + 1e-9; t += 0.01) {
        const M = render(f.fam, f.w, size, t);
        const s = iou(ref, M);
        if (s > best.iou) best = { iou: s, track: +t.toFixed(2), M };
      }
      const M = best.M;
      const stroke = strokeWidth(M);
      const segs = R.glyphs ? segments(M, CAP * 0.15) : [];
      const per = R.glyphs && segs.length === refSegs.length ? segs.map((g, i) => iou(refSegs[i], g)) : null;
      const corner = R.cornerGlyph >= 0 && segs[R.cornerGlyph] ? cornerFill(segs[R.cornerGlyph], stroke) : null;
      out.push({
        fam: f.fam,
        w: f.w,
        pkg: f.pkg,
        iou: +best.iou.toFixed(3),
        track: best.track,
        widthRatio: +(M.w / ref.w).toFixed(3),
        strokeRatio: +(stroke / CAP).toFixed(3),
        perGlyph: per ? per.map((v) => +v.toFixed(2)) : null,
        glyphMean: per ? +(per.reduce((a, v) => a + v, 0) / per.length).toFixed(3) : null,
        corner: corner === null ? null : +corner.toFixed(2),
        mask: { w: M.w, h: M.h, m: Array.from(M.m) },
        dbg: segs.map((g) => ({ w: g.w, h: g.h, m: Array.from(g.m) })),
      });
    }
    const dbgSegs = { ref: refSegs.map((g) => ({ w: g.w, h: g.h, m: Array.from(g.m) })), cand: out[0] ? out[0].dbg : [] };
    return {
      dbgSegs,
      log,
      refRaw: { w: refM.w, h: refM.h, m: Array.from(refM.m) },
      ref: {
        w: ref.w,
        h: ref.h,
        m: Array.from(ref.m),
        stroke: +(refStroke / CAP).toFixed(3),
        corner: refCorner === null ? null : +refCorner.toFixed(2),
        segs: refSegs.length,
      },
      out,
    };
  },
  { R, fonts, refData },
);

result.log.forEach((l) => console.log(l));
const ranked = result.out.slice().sort((a, b) => b.iou - a.iou);
if (process.env.DEBUG_MASK) {
  const sharp = createRequire(new URL("../apps/web/package.json", import.meta.url))("sharp");
  const segsList = [
    ["raw", result.refRaw],
    ["ref", result.ref],
    ...result.dbgSegs.ref.map((g, i) => [`refseg${i}`, g]),
    ...result.dbgSegs.cand.map((g, i) => [`candseg${i}`, g]),
  ];
  for (const [name, M] of segsList) {
    const buf = Buffer.from(M.m.map((v) => (v ? 255 : 0)));
    await sharp(buf, { raw: { width: M.w, height: M.h, channels: 1 } })
      .png()
      .toFile(`${OUT}/debug_${role}_${name}.png`);
  }
}
console.log(
  `\n${role.toUpperCase()} — ref "${R.text}" · ref stroke ${result.ref.stroke} of cap · ref corner fill ${result.ref.corner ?? "—"} · ${result.ref.segs} glyphs segmented`,
);
console.log("rank  face                    wt   IoU    glyphs  width  stroke  corner  track");
ranked.forEach((r, i) =>
  console.log(
    `${String(i + 1).padStart(2)}    ${r.fam.padEnd(22)} ${String(r.w).padStart(3)}  ${r.iou.toFixed(3)}  ${(r.glyphMean ?? "—").toString().padEnd(6)}  ${r.widthRatio.toFixed(2).padEnd(5)}  ${r.strokeRatio.toFixed(3)}   ${(r.corner ?? "—").toString().padEnd(5)}  ${r.track >= 0 ? "+" : ""}${r.track.toFixed(2)}em`,
  ),
);

// ---- sheet: reference (paper) over candidate (accent) per row, ranked ----
const CAPH = result.ref.h;
const rowH = CAPH + 40;
const sheetW = 1700;
const sheetH = 120 + rowH * ranked.length;
await page.setViewportSize({ width: sheetW, height: Math.min(sheetH, 12000) });
await page.setContent(`<body style="margin:0;background:#0E1116"><canvas id=c width=${sheetW} height=${sheetH}></canvas></body>`);
await page.evaluate(
  ({ ref, ranked, rowH, role, text }) => {
    const c = document.getElementById("c");
    const ctx = c.getContext("2d");
    ctx.fillStyle = "#0E1116";
    ctx.fillRect(0, 0, c.width, c.height);
    const draw = (M, x, y, color) => {
      const id = ctx.createImageData(M.w, M.h);
      const [r, g, b] = color;
      for (let i = 0; i < M.m.length; i++)
        if (M.m[i]) {
          id.data[i * 4] = r;
          id.data[i * 4 + 1] = g;
          id.data[i * 4 + 2] = b;
          id.data[i * 4 + 3] = 150;
        }
      const t = document.createElement("canvas");
      t.width = M.w;
      t.height = M.h;
      t.getContext("2d").putImageData(id, 0, 0);
      ctx.drawImage(t, x, y);
    };
    ctx.fillStyle = "#E8E4D8";
    ctx.font = "600 22px monospace";
    ctx.fillText(`TYPE MATCH · ${role.toUpperCase()} · reference "${text}" in paper, candidate in red, overlap = pink · ranked by IoU`, 24, 40);
    ctx.font = "14px monospace";
    ctx.fillStyle = "#9DB0C4";
    ctx.fillText(`ref stroke ${ref.stroke} of cap · ref corner fill ${ref.corner ?? "—"}`, 24, 70);
    ranked.forEach((r, i) => {
      const y = 110 + i * rowH;
      ctx.fillStyle = "#1A1D22";
      ctx.fillRect(0, y - 8, c.width, rowH - 8);
      draw(ref, 420, y, [232, 228, 216]);
      draw(r.mask, 420, y, [230, 60, 46]);
      ctx.fillStyle = "#E8E4D8";
      ctx.font = "600 18px monospace";
      ctx.fillText(`${String(i + 1).padStart(2, "0")}  ${r.fam} ${r.w}`, 24, y + 30);
      ctx.fillStyle = "#9DB0C4";
      ctx.font = "13px monospace";
      ctx.fillText(`IoU ${r.iou.toFixed(3)}${r.glyphMean != null ? `  glyphs ${r.glyphMean.toFixed(3)}` : ""}`, 24, y + 56);
      ctx.fillText(
        `width ×${r.widthRatio.toFixed(2)}  stroke ${r.strokeRatio.toFixed(3)}${r.corner != null ? `  corner ${r.corner.toFixed(2)}` : ""}`,
        24,
        y + 76,
      );
      ctx.fillText(`tracking ${r.track >= 0 ? "+" : ""}${r.track.toFixed(2)}em${r.perGlyph ? "  [" + r.perGlyph.join(" ") + "]" : ""}`, 24, y + 96);
    });
  },
  { ref: result.ref, ranked, rowH, role, text: R.text },
);
const png = `${OUT}/type_match_${role}.png`;
await page.locator("#c").screenshot({ path: png });
writeFileSync(
  `${OUT}/type_match_${role}.json`,
  JSON.stringify({ role, text: R.text, ref: { stroke: result.ref.stroke, corner: result.ref.corner }, ranked: ranked.map(({ mask, ...r }) => r) }, null, 2),
);
console.log(`sheet → ${png}`);
await browser.close();
