// Turns the Lighthouse reports lhci wrote into a markdown table for the job summary, so the real
// numbers are readable without downloading an artifact. Scores the gate only warns on still show
// here — that is the point: recorded, not hidden. Never fails the job.
import { readdirSync, readFileSync } from "node:fs";

const DIR = ".lighthouseci-report";
const CATEGORIES = ["performance", "accessibility", "best-practices", "seo"];

const reports = (() => {
  try {
    return readdirSync(DIR)
      .filter((name) => name.endsWith(".json") && !name.includes("manifest"))
      .map((name) => JSON.parse(readFileSync(`${DIR}/${name}`, "utf8")))
      .filter((report) => report.categories);
  } catch {
    return [];
  }
})();

if (reports.length === 0) {
  console.log("### Lighthouse\n\nNo report was produced — the collect step did not finish.");
  process.exit(0);
}

const pct = (score) => (score == null ? "—" : Math.round(score * 100));
const ms = (audit) => (audit?.numericValue == null ? "—" : `${Math.round(audit.numericValue)} ms`);

console.log("### Lighthouse (desktop, GitHub runner)\n");
console.log("Timing numbers on a shared 2-vCPU runner are not comparable to a laptop; they are recorded, not gated.\n");
console.log(`| URL | ${CATEGORIES.map((c) => c.replace("-", " ")).join(" | ")} | LCP | CLS |`);
console.log(`|---|${CATEGORIES.map(() => "---").join("|")}|---|---|`);
for (const report of reports) {
  const scores = CATEGORIES.map((c) => pct(report.categories[c]?.score));
  const cls = report.audits["cumulative-layout-shift"]?.numericValue;
  console.log(
    `| ${report.finalDisplayedUrl ?? report.finalUrl} | ${scores.join(" | ")} | ${ms(report.audits["largest-contentful-paint"])} | ${cls == null ? "—" : cls.toFixed(3)} |`,
  );
}
