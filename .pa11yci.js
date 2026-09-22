// pa11y-ci: WCAG 2 AA over the public routes of the SHIPPED bundle. scripts/a11y.sh serves the
// build on 4173 and says why the dev server is the wrong target. Keep the OS routes out of here —
// they need the LOCAL_DEV admin picker, which only a dev build has; axe covers them instead.
const base = process.env.A11Y_BASE_URL || "http://localhost:4173";

const routes = ["/", "/events", "/projects", "/cyberhounds", "/about", "/resources", "/news", "/news/grad-school-events", "/join", "/os/login"];

module.exports = {
  defaults: {
    standard: "WCAG2AA",
    // A static build answers in milliseconds; 45 s means "something is wrong", not "the runner is busy".
    timeout: 45000,
    wait: 800,
    concurrency: 2,
    viewport: { width: 1280, height: 900 },
    chromeLaunchConfig: { args: ["--no-sandbox", "--disable-dev-shm-usage"] },
    hideElements: "canvas, iframe",
  },
  urls: routes.map((route) => `${base}${route}`),
};
