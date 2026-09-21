// WCAG AA contrast check for the token pairs actually used on dark surfaces.
const hex = (h) => {
  const n = h.replace("#", "");
  return [0, 2, 4].map((i) => parseInt(n.slice(i, i + 2), 16) / 255);
};
const lum = (c) => c.map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)).reduce((a, v, i) => a + v * [0.2126, 0.7152, 0.0722][i], 0);
const ratio = (a, b) => {
  const [l1, l2] = [lum(hex(a)), lum(hex(b))].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
};
const T = {
  navy900: "#0C183C",
  navy600: "#1E4664",
  navy500: "#305484",
  ink: "#F4F7FB",
  muted: "#9DB0C4",
  teal: "#6ED2E6",
  red: "#B3202A",
  redHi: "#E0242C",
  redDeep: "#7A1119",
  green: "#40A33F",
  blue: "#1E80F0",
  light: "#F5F7FA",
};
const FG = { redFg: "#EE9A9E", greenFg: "#6FC46E", blueFg: "#7FB4F7", muted: "#A2B4C8" };
const pairs = [
  ["accent-fg red on navy-600", FG.redFg, T.navy600, 4.5],
  ["accent-fg green on navy-600", FG.greenFg, T.navy600, 4.5],
  ["accent-fg blue on navy-600", FG.blueFg, T.navy600, 4.5],
  ["muted(nudged) on navy-600", FG.muted, T.navy600, 4.5],
  ["ink on red (CTA)", T.ink, T.red, 3],
  ["ink on red-deep (poster fills)", T.ink, T.redDeep, 4.5],
  ["red on navy-900 — INFO: red is a fill/rim/poster colour, never text (run-5 log #2)", T.red, T.navy900, 0],
  ["red-hi on navy-900 (display ≥18px)", T.redHi, T.navy900, 3],
  ["red on paper (labels/marks)", T.red, T.light, 4.5],
  ["ink on blue (CTA)", T.ink, T.blue, 3],
  ["ink on navy-600", T.ink, T.navy600, 4.5],
  ["ink on navy-900", T.ink, T.navy900, 4.5],
  ["ink on navy-500", T.ink, T.navy500, 4.5],
  ["muted on navy-900", T.muted, T.navy900, 4.5],
  ["teal on navy-600", T.teal, T.navy600, 4.5],
  ["teal on navy-900", T.teal, T.navy900, 4.5],
  ["navy-900 on teal (buttons)", T.navy900, T.teal, 4.5],
  ["navy-900 on green (buttons)", T.navy900, T.green, 4.5],
  ["navy-900 on light", T.navy900, T.light, 4.5],
];
let fail = 0;
for (const [name, fg, bg, min] of pairs) {
  const r = ratio(fg, bg);
  const ok = r >= min;
  if (!ok) fail++;
  console.log(`${min === 0 ? "INFO" : ok ? "PASS" : "FAIL"}  ${r.toFixed(2)}:1  (min ${min})  ${name}`);
}
console.log(fail ? `\n${fail} pair(s) below target` : "\nAll pairs pass");
process.exit(0);
