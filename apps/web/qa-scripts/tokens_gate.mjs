// Design-tokens gate (skills/ui/design-tokens as an audit): hex colours and font-family names
// may appear only in tokens.css, type.css, brand.config.ts and the two 3D material files.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
const ROOT = new URL("../", import.meta.url).pathname;
const ALLOW = [
  "src/tokens.css",
  "src/type.css",
  "src/mascot/CyberhoundCanvas.tsx",
  "src/cube/cubeCommon.ts",
  "src/cube/CubeSpotCanvas.tsx",
  "src/cube/CubeRailCanvas.tsx",
  "src/components/Pennant.tsx",
  "src/mascot/Bloodhound.tsx", // mascot artwork: fur colours are not tokens
];
const walk = (d) =>
  readdirSync(d).flatMap((f) => {
    const p = join(d, f);
    return statSync(p).isDirectory() ? walk(p) : /\.(tsx?|css)$/.test(p) && !p.endsWith(".test.ts") ? [p] : [];
  });
let bad = 0;
for (const f of walk(join(ROOT, "src"))) {
  const rel = f.replace(ROOT, "");
  if (ALLOW.includes(rel) || rel.endsWith("cyberhoundHeadPath.ts")) continue;
  const s = readFileSync(f, "utf8");
  for (const m of s.matchAll(/#[0-9a-fA-F]{6}\b|font-family\s*:|["'](Unbounded|Space Grotesk|JetBrains Mono|VT323)["']/g)) {
    bad++;
    console.log(`✗ ${rel}: ${m[0]}`);
  }
}
console.log(`tokens-gate: ${bad} stray colour/font literal(s)`);
process.exit(bad ? 1 : 0);
