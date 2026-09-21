// banned_names.mjs — the naming rule with teeth (docs/CODE_STANDARDS.md § Naming). A declared identifier
// from the list below fails `make check`: it tells the reader nothing. Rename it for what it holds.
// Checked: `const|let|var|function|type|class|interface <name>` in TS/JS and `def <name>` / `<name> =` at
// column 0 in Python, over apps/web/src, api/_core, scripts. Property names and JSON keys are not checked
// (they are the API's contract).
import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const BANNED = [
  "data",
  "info",
  "temp",
  "tmp",
  "misc",
  "stuff",
  "foo",
  "bar",
  "baz",
  "obj",
  "val",
  "kb",
  "thing",
  "things",
  "handleStuff",
  "doStuff",
  "util",
  "utils",
  "helper",
  "helpers",
  "manager",
  "res2",
  "data2",
  "newData",
  "oldData",
];
const DECL = new RegExp(`\\b(?:const|let|var|function|type|class|interface)\\s+(${BANNED.join("|")})\\b`);
const PY_DECL = new RegExp(`^(?:def\\s+(${BANNED.join("|")})\\s*\\(|(${BANNED.join("|")})\\s*=)`);
const walk = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((d) =>
    d.isDirectory() ? (d.name === "node_modules" ? [] : walk(join(dir, d.name))) : [join(dir, d.name)],
  );
const files = ["apps/web/src", "api/_core", "scripts"]
  .flatMap((d) => walk(join(ROOT, d)))
  .filter((f) => /\.(ts|tsx|mjs|py)$/.test(f) && !f.endsWith("api.types.ts"));

const findings = [];
for (const file of files) {
  const py = file.endsWith(".py");
  readFileSync(file, "utf8")
    .split("\n")
    .forEach((line, i) => {
      const m = py ? PY_DECL.exec(line) : DECL.exec(line);
      if (m) findings.push(`${relative(ROOT, file)}:${i + 1}: "${m[1] ?? m[2]}" says nothing — name it for what it holds`);
    });
}
for (const f of findings) console.log("FAIL", f);
console.log(`banned-names: ${findings.length} finding(s)`);
process.exit(findings.length ? 1 : 0);
