import { chromium } from "@playwright/test";
const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
await ctx.addInitScript(() => sessionStorage.setItem("jjcss-os-role", "admin"));
const errs = [];
for (const [name, route] of [["os-inheritance", "/os/inheritance"], ["os-system", "/os/system"]]) {
  const p = await ctx.newPage(); p.on("pageerror", (e) => errs.push(`${route}: ${e.message}`));
  await p.goto(`http://localhost:5173${route}`, { waitUntil: "networkidle" }); await p.waitForTimeout(1200);
  await p.screenshot({ path: `../../qa/loops/run8/${name}-1440.png`, fullPage: true });
  if (name === "os-inheritance") {
    await p.locator("text=Adopt the new site").first().click(); await p.waitForTimeout(1200);
    await p.screenshot({ path: `../../qa/loops/run8/os-inheritance-record-1440.png` });
    console.log("panel:", await p.locator("aside").count(), "buttons:", await p.getByRole("button").allTextContents().then((a) => a.filter((t) => /edit/i.test(t))));
    await p.getByRole("button", { name: /EDIT_RECORD/i }).click(); await p.waitForTimeout(600);
    await p.screenshot({ path: `../../qa/loops/run8/os-inheritance-editor-1440.png`, fullPage: true });
    await p.setViewportSize({ width: 390, height: 844 }); await p.reload({ waitUntil: "networkidle" }); await p.waitForTimeout(800);
    await p.screenshot({ path: `../../qa/loops/run8/os-inheritance-390.png`, fullPage: true });
  }
  await p.close();
}
await b.close(); console.log(errs.length ? errs.join("\n") : "no page errors");
