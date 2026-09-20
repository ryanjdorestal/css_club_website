// CI smoke: serve the built dist, load home, fail on console/page errors.
import { chromium } from "@playwright/test";
import { createServer } from "node:http";
import { readFileSync, existsSync } from "node:fs";
import { join, extname } from "node:path";

const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".png": "image/png", ".webp": "image/webp", ".glb": "model/gltf-binary", ".json": "application/json" };
const server = createServer((req, res) => {
  let p = join("dist", req.url.split("?")[0]);
  if (!existsSync(p) || p === "dist/") p = "dist/index.html";
  try {
    res.setHeader("content-type", MIME[extname(p)] ?? "application/octet-stream");
    res.end(readFileSync(p));
  } catch {
    res.statusCode = 404;
    res.end();
  }
}).listen(4173);

const browser = await chromium.launch();
const page = await browser.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
await page.goto("http://localhost:4173/", { waitUntil: "networkidle" });
const title = await page.title();
const hasHero = await page.evaluate(() => document.body.innerText.includes("Computer"));
await browser.close();
server.close();
if (!hasHero || errors.length) {
  console.error("SMOKE FAIL", { title, hasHero, errors });
  process.exit(1);
}
console.log("smoke ok:", title);
