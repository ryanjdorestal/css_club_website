// Copies the context/22 T-cells + secondary refs out of ~/Desktop/UI:UX INSPO/
// into ../jjay_css_refs/type/. Matches on the time fragment (macOS screenshot names
// contain U+202F before AM/PM, so we match loosely).
import { readdirSync, statSync, copyFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";

const ROOT = join(homedir(), "Desktop", "UI:UX INSPO");
const OUT = "../jjay_css_refs/type";
mkdirSync(OUT, { recursive: true });

const T = [
  ["T01", "2026-06-24", "7.57.03"],
  ["T02", "2026-05-10", "9.02.41"],
  ["T03", "2026-06-22", "10.16.52"],
  ["T04", "2026-05-27", "5.36.52"],
  ["T05", "2026-06-24", "10.20.42"],
  ["T06", "2026-06-24", "7.59.02"],
  ["T07", "2026-06-24", "7.57.48"],
  ["T08", "2026-05-10", "9.04.39"],
  ["T09", "2026-05-10", "9.03.44"],
  ["T10", null, "3.21.20"],
  ["T11", null, "3.22.28"],
  ["T12", "2026-06-19", "5.30.56"],
];
const S = [
  ["S01", "2026-06-24", "7.59.09"],
  ["S02", "2026-06-24", "7.59.17"],
  ["S03", "2026-06-24", "10.22.59"],
  ["S04", "2026-05-14", "1.19.40"],
  ["S05", "2026-05-06", "11.07.42"],
  ["S06", "2026-01-24", "8.26.01"],
  ["S07", "2026-01-10", "10.27.24"],
  ["S08", "2026-01-18", "1.20.58"],
  ["S09", "2025-12-19", "9.52.34"],
  ["S10", "2026-06-19", "5.40.45"],
  ["S11", "2026-06-19", "5.44.55"],
  ["S12", null, "3.19.38"],
  ["S13", null, "3.22.00"],
  ["S14", null, "3.22.53"],
];

const files = [];
(function walk(dir) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    try {
      const st = statSync(p);
      if (st.isDirectory()) walk(p);
      else if (/\.(png|jpe?g)$/i.test(e)) files.push(p);
    } catch {}
  }
})(ROOT);
console.log(`${files.length} images indexed`);

for (const [id, date, time] of [...T, ...S]) {
  const hits = files.filter((f) => f.includes(time) && (!date || f.includes(date)));
  if (hits.length === 0) {
    console.log(`${id}: NOT FOUND (${date ?? ""} ${time})`);
    continue;
  }
  // prefer non-contact-sheet originals
  const pick = hits.find((h) => !h.includes("_contact_sheets")) ?? hits[0];
  const ext = pick.match(/\.(png|jpe?g)$/i)[0].toLowerCase();
  copyFileSync(pick, join(OUT, `${id}${ext}`));
  console.log(`${id}: ${pick.replace(ROOT, "…")}`);
}
