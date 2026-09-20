import { chromium } from "@playwright/test";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("http://localhost:5173/os", { waitUntil: "networkidle" });
await page.waitForTimeout(400);
await page.screenshot({ path: "../../qa/shots/06-os-login-1440.png" });
await page.click("text=→ president");
await page.waitForTimeout(600);
await page.screenshot({ path: "../../qa/shots/06-os-today-1440.png" });
// seed a fake local submission so the queue shot shows a row
await page.evaluate(() => {
  localStorage.setItem("jjcss-inbox", JSON.stringify([{ path: "/api/onboarding/submit", payload: { name: "Test Student", email: "t@jjay.cuny.edu", major: "CS", interests: "CTF, iOS" }, ts: new Date().toISOString() }]));
});
await page.goto("http://localhost:5173/os/queue", { waitUntil: "networkidle" });
await page.waitForTimeout(400);
await page.screenshot({ path: "../../qa/shots/06-os-queue-1440.png" });
await page.evaluate(() => localStorage.removeItem("jjcss-inbox"));
console.log("os shots saved");
await browser.close();
