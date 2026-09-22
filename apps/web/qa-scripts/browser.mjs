/** The one place a QA script opens a browser.
 *
 *  Every gate used to call `chromium.launch()` itself, which meant no gate could run on a machine
 *  where Playwright's download is blocked — a real situation behind a university proxy. Set
 *  CHROME_PATH to any Chromium build (`npx playwright install chromium` prints one) and every gate
 *  uses it. Lighthouse reads the same variable, so one export covers the whole suite.
 */
import { chromium } from "@playwright/test";

export function launchChrome(options = {}) {
  const executablePath = process.env.CHROME_PATH;
  return chromium.launch(executablePath ? { ...options, executablePath } : options);
}
