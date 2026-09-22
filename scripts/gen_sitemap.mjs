// Writes apps/web/public/sitemap.xml from the public routes plus every published post, so the
// crawlers that read robots.txt find the news articles too. `make check` runs it and fails if the
// committed file drifts — the same contract gen_api_docs.py uses for docs/API.md.
import { readFileSync, writeFileSync } from "node:fs";

// brand.config.ts is TypeScript; read the one value out of it rather than pulling in a compiler.
const SITE = /site:\s*"([^"]+)"/.exec(readFileSync("brand/brand.config.ts", "utf8"))?.[1];
if (!SITE) throw new Error("brand/brand.config.ts has no site url — the sitemap needs one");

// /os and /styleguide are left out on purpose: robots.txt disallows both.
const STATIC_ROUTES = ["/", "/events", "/projects", "/cyberhounds", "/about", "/resources", "/news", "/join"];

const posts = JSON.parse(readFileSync("data/posts.json", "utf8")).posts ?? [];
const postRoutes = posts.filter((post) => post.slug).map((post) => `/news/${post.slug}`);

const urls = [...STATIC_ROUTES, ...postRoutes].map((route) => `  <url><loc>${SITE}${route}</loc></url>`).join("\n");

writeFileSync(
  "apps/web/public/sitemap.xml",
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
);
console.log(`sitemap: ${STATIC_ROUTES.length + postRoutes.length} urls`);
