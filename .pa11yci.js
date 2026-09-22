// pa11y-ci: WCAG 2 AA over the public routes of the SHIPPED bundle, with reduced motion forced on.
//
// Both of those are deliberate. scripts/a11y.sh serves the build on 4173 so this grades what
// visitors actually download rather than Vite's dev output. `--force-prefers-reduced-motion` makes
// useLazy3d keep the cube and the Cyberhound unmounted, which is the path a visitor who asks for
// less motion gets — and the only path pa11y can survive: two headless tabs compositing WebGL
// through SwiftShader on a two-core runner crash the tab ("Target.closeTarget: No target with
// given id found") or blow the navigation timeout. axe grades the full-motion build separately,
// so between them both paths are covered.
//
// The OS routes stay out of here — they need the LOCAL_DEV admin picker, which only a dev build
// has. axe covers them, and refuses to grade a login screen standing in for one.
const base = process.env.A11Y_BASE_URL || "http://localhost:4173";

const routes = ["/", "/events", "/projects", "/cyberhounds", "/about", "/resources", "/news", "/news/grad-school-events", "/join", "/os/login"];

module.exports = {
  defaults: {
    standard: "WCAG2AA",
    // A static build with no WebGL answers in milliseconds; 45 s means something is wrong, not busy.
    timeout: 45000,
    wait: 800,
    // One at a time. pa11y-ci shares a single browser across concurrent runs and races its own
    // teardown ("Target.closeTarget: No target with given id found") — which page loses the race
    // moved between runs, so a retry looks like a flake and a red build looks like a broken site.
    // Ten static pages take well under a minute in series.
    concurrency: 1,
    viewport: { width: 1280, height: 900 },
    chromeLaunchConfig: {
      args: ["--no-sandbox", "--disable-dev-shm-usage", "--force-prefers-reduced-motion", "--disable-gpu"],
      // pa11y brings its own Chrome. Point A11Y_CHROME_PATH at an existing one when that download
      // is blocked — `npx playwright install chromium` already puts a usable browser on the machine.
      ...(process.env.A11Y_CHROME_PATH ? { executablePath: process.env.A11Y_CHROME_PATH } : {}),
    },
    hideElements: "canvas, iframe",
  },
  urls: routes.map((route) => `${base}${route}`),
};
