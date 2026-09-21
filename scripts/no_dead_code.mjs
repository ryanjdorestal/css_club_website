// no_dead_code.mjs — commented-out code is deleted, not kept (docs/CODE_STANDARDS.md § Comments). Three or
// more consecutive `//` (or `#` in Python) lines that each read as a statement fail `make check`. Prose comments — sentences without code punctuation — are fine at any length.
// (Deferred-work markers are scripts/repo_audit.mjs's job: none allowed; deferred work goes on an issue.)
import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const walk = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((d) =>
    d.isDirectory() ? (d.name === "node_modules" ? [] : walk(join(dir, d.name))) : [join(dir, d.name)],
  );
const files = ["apps/web/src", "api/_core", "scripts"].flatMap((d) => walk(join(ROOT, d))).filter((f) => /\.(ts|tsx|mjs|py|css)$/.test(f));
// a line is "code" when it ends like a statement, starts with a keyword, assigns, or is a bare call
const CODE_LIKE =
  /[;{}]\s*$|^(?:const|let|var|return|import|export|from|def|class|if|for|while|await|function|elif|else|try|except)\b|^[\w.[\]]+\s*=[^=]|^[\w.]+\(.*\)\s*;?$/;

const findings = [];
for (const file of files) {
  const py = file.endsWith(".py");
  const lines = readFileSync(file, "utf8").split("\n");
  let run = 0;
  lines.forEach((line, i) => {
    const t = line.trim();
    const isComment = py ? t.startsWith("#") && !t.startsWith("#!") : t.startsWith("//");
    const looksLikeCode = isComment && CODE_LIKE.test(t.replace(/^(\/\/|#)\s?/, ""));
    run = looksLikeCode ? run + 1 : 0;
    if (run === 3) findings.push(`${relative(ROOT, file)}:${i - 1}: commented-out code (3+ lines) — delete it; git remembers`);
  });
}
for (const f of findings) console.log("FAIL", f);
console.log(`no-dead-code: ${findings.length} finding(s)`);
process.exit(findings.length ? 1 : 0);
