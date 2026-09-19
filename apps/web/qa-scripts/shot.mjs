import { chromium } from "@playwright/test";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("http://localhost:5173/", { waitUntil: "networkidle" });
await page.screenshot({ path: "/Users/ryandorestal/Desktop/jjay_css/qa/shots/00-scaffold.png", fullPage: true });
await browser.close();
console.log("shot saved");
