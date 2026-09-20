import { chromium } from "@playwright/test";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("http://localhost:5173/styleguide", { waitUntil: "networkidle" });
await page.waitForTimeout(400);
const strip = page.locator("text=The Hound · six emotes").locator("..");
await strip.screenshot({ path: "../../qa/shots/04-mascot-emotes.png" });
// chat widget open on home
await page.goto("http://localhost:5173/", { waitUntil: "networkidle" });
await page.click('button[aria-label="Open the Hound chat"]');
await page.waitForTimeout(600);
await page.click('text=How do I join?');
await page.waitForTimeout(900);
await page.screenshot({ path: "../../qa/shots/04-chat-widget.png", clip: { x: 1000, y: 300, width: 440, height: 600 } });
console.log("mascot + chat shots saved");
await browser.close();
