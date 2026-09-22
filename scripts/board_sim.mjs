// board_sim.mjs — a whole semester as the board (run 10 §8): 25 steps from an EMPTY Tier-1 store,
// every action through the UI a human would use, every step asserting the PUBLIC consequence.
// Run:  make sim   (= cd apps/web && node ../../scripts/board_sim.mjs; needs `make dev` up)
// Screenshots → qa/loops/run10/sim/NN-*.png. Exit 1 on any failed step; never deletes a step.
import { createRequire } from "node:module";
import { launchChrome } from "../apps/web/qa-scripts/browser.mjs";
import { mkdirSync, existsSync, readdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import zlib from "node:zlib";

const ROOT = new URL("../", import.meta.url).pathname;
const BASE = process.env.BASE_URL ?? "http://localhost:5173";
const OUT = join(ROOT, "qa/loops/run10/sim");
mkdirSync(OUT, { recursive: true });

// ---- an empty store (make restore-empty, in-process so CI needs no make). Spine files the sim writes
// land in content/inheritance/ like a real board's; only UNTRACKED files there are removed (never a
// committed record), at the start (leftovers) and at the end (the repo is left as it was found).
const { execFileSync } = createRequire(import.meta.url)("node:child_process");
const untrackedSpine = () => execFileSync("git", ["ls-files", "--others", "content/inheritance"], { cwd: ROOT, encoding: "utf8" }).split("\n").filter(Boolean);
const cleanSpine = () => {
  for (const f of untrackedSpine()) rmSync(join(ROOT, f), { force: true });
  for (const d of ["F26/handoffs", "F26/meetings", "S27/handoffs", "S27"]) {
    const p = join(ROOT, "content/inheritance", d);
    if (existsSync(p) && readdirSync(p).length === 0) rmSync(p, { recursive: true, force: true });
  }
};
for (const f of readdirSync(join(ROOT, "data"))) if (/\.local\.json(\.bak)?$/.test(f)) rmSync(join(ROOT, "data", f));
rmSync(join(ROOT, ".cache/inbox"), { recursive: true, force: true });
rmSync(join(ROOT, ".cache/uploads"), { recursive: true, force: true });
cleanSpine();

let step = 0,
  failed = 0;
const say = (ok, label) => {
  console.log(`${ok ? "ok  " : "FAIL"} ${String(step).padStart(2, "0")} ${label}`);
  if (!ok) failed++;
};
const shot = (p, name) => p.screenshot({ path: join(OUT, `${String(step).padStart(2, "0")}-${name}.png`), fullPage: false }).catch(() => {});
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const b = await launchChrome();
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
const os = await ctx.newPage();
const site = await ctx.newPage();
const goto = async (p, path) => {
  await p.goto(`${BASE}${path}`, { waitUntil: "networkidle" });
  await wait(600);
};
const api = (p, path, init = {}) =>
  p.evaluate(
    async ({ path, init }) => {
      const role = sessionStorage.getItem("jjcss-os-role");
      const r = await fetch(path, {
        ...init,
        headers: { "Content-Type": "application/json", ...(role ? { "X-Local-Role": role } : {}), ...(init.headers ?? {}) },
      });
      return { status: r.status, body: await r.json().catch(() => ({})) };
    },
    { path, init },
  );
const fill = async (p, label, value) => {
  const el = p.getByLabel(new RegExp(`^${label}( \\*)?$`, "i")).first();
  await el.fill(String(value));
};
const btn = (p, name) => p.getByRole("button", { name }).first();
const abtn = (p, name) => p.locator("aside").getByRole("button", { name }).first(); // inside the open panel
const closePanels = async (p) => {
  for (const x of await p.locator('aside button:has-text("close")').all()) await x.click().catch(() => {});
  await wait(250);
};
const rowMenu = async (p, rowText, item) => {
  const row = p.locator("tr", { hasText: new RegExp(rowText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")) }).first(); // RegExp = case-sensitive
  await row.locator('[data-testid="row-menu"]').click();
  await p.getByRole("menuitem", { name: item, exact: true }).click();
  await wait(700);
};
const bodyHas = async (p, path, text, tries = 10) => {
  await goto(p, path);
  for (let i = 0; i < tries; i++) {
    if (((await p.locator("body").textContent()) ?? "").includes(text)) return true;
    await wait(500);
  }
  return false;
};
const png = (w = 64, h = 64) => {
  // a valid RGB PNG without a library (for the flyer / photos)
  const crc = (buf) => {
    let c = ~0;
    for (const x of buf) {
      c ^= x;
      for (let k = 0; k < 8; k++) c = c & 1 ? (c >>> 1) ^ 0xedb88320 : c >>> 1;
    }
    return ~c >>> 0;
  };
  const chunk = (type, data) => {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    const td = Buffer.concat([Buffer.from(type), data]);
    const c = Buffer.alloc(4);
    c.writeUInt32BE(crc(td));
    return Buffer.concat([len, td, c]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;
  const raw = Buffer.alloc((w * 3 + 1) * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) raw.set([30, 70, 100], y * (w * 3 + 1) + 1 + x * 3);
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", zlib.deflateSync(raw)),
    chunk("IEND", Buffer.alloc(0)),
  ]);
};
const stamp = Date.now().toString().slice(-4);
let OFFICERS = [];
let q13 = null;
const record = async (type, title, body, role) => {
  await goto(os, "/os/inheritance");
  await os.locator(`button:has-text("+ ${type}")`).first().click();
  await wait(500);
  await fill(os, "TITLE", title);
  await fill(os, "DATE", new Date().toISOString().slice(0, 10));
  await fill(os, "OWNERS", role ?? "the board");
  await os
    .getByLabel(/^STATUS/i)
    .first()
    .selectOption("final");
  await os.locator("#f-body_md").fill(body);
  await abtn(os, />_(save|write_file)/i).click({ force: true });
  await wait(1200);
  const t = (await os.locator("body").textContent()) ?? "";
  await closePanels(os);
  return !/NEED ATTENTION|✗/.test(t);
};

/** poll an API count until it stops changing (long loops of writes finish server-side) */
const settled = async (p, path) => {
  let last = -1;
  for (let i = 0; i < 30; i++) {
    const n = (await api(p, path)).body.count;
    if (n === last) return n;
    last = n;
    await wait(500);
  }
  return last;
};
/** a step that throws is a FAIL with a screenshot, never an aborted run */
const STOP = Number(process.env.SIM_STOP || 99);
const guard = async (fn) => {
  if (step > STOP) return;
  try {
    await fn();
  } catch (e) {
    const lines = String(e?.message ?? e)
      .split("\n")
      .filter((l) => /waiting for|Timeout|Error|expected/.test(l));
    say(false, `threw: ${lines.slice(0, 2).join(" · ").slice(0, 220)}`);
    await shot(os, "error");
    await closePanels(os).catch(() => {});
  }
};

// ====================================================== ACT 1 — TAKING OVER
step = 1;
await guard(async () => {
  await goto(os, "/os/login");
  await os.locator('[data-testid="local-admin"]').click();
  await wait(1200);
  const ticker = (await os.locator('[data-testid="top-strip"]').textContent()) ?? "";
  say(new URL(os.url()).pathname === "/os" && /TERM/.test(ticker), "sign in (LOCAL_DEV admin) → /os renders; ticker shows TERM");
  await shot(os, "signin");
});

step = 2;
await guard(async () => {
  await goto(os, "/os/board");
  // the committed seed already lists F26 (run 7) — a board would EDIT its dates; a brand-new term is created the same way (+ new term)
  const existing = (await api(os, "/api/os/terms")).body.rows.some((t) => t.id === "F26");
  if (existing) {
    await rowMenu(os, "F26", "EDIT DATES");
  } else {
    await btn(os, /NEW_TERM/i).click();
    await wait(300);
    await fill(os, "ID", "F26");
  }
  await fill(os, "LABEL", "Fall 2026");
  await fill(os, "STARTS", "2026-08-25");
  await fill(os, "ENDS", "2026-12-22");
  if ((await os.getByRole("switch").getAttribute("aria-checked")) !== "true") await os.getByRole("switch").click();
  await btn(os, />_save(?!_)/i).click();
  await wait(1000);
  await closePanels(os);
  const t2 = await api(os, "/api/os/terms");
  const f26 = t2.body.rows.find((t) => t.id === "F26");
  const about2 = await bodyHas(site, "/about", "FALL_2026"); // the band index prints spaces as underscores
  await shot(site, "about");
  say(
    t2.body.current?.id === "F26" && f26?.ends_on === "2026-12-22" && about2,
    `${existing ? "edit" : "create"} term F26 with dates, set current → /about shows F26 [current ${t2.body.current?.id} ends ${f26?.ends_on} about ${about2}]`,
  );
  await shot(os, "term");
});

step = 3;
await guard(async () => {
  OFFICERS = [
    ["Ava Ortiz", "President", "ava@jjay.cuny.edu", "admin", true],
    ["Ben Lee", "Vice President", "ben@jjay.cuny.edu", "officer", true],
    ["Cara Diaz", "Secretary", "cara@jjay.cuny.edu", "officer", false],
    ["Dev Patel", "Treasurer", "dev@jjay.cuny.edu", "officer", false],
    ["Eli Nwosu", "Events Chair", "eli@jjay.cuny.edu", "officer", false],
    ["Fay Chen", "Webmaster", "fay@jjay.cuny.edu", "officer", false],
  ];
  await goto(os, "/os/board");
  for (const [name, role, email, osRole, photo] of OFFICERS) {
    await btn(os, /ADD_OFFICER/i).click();
    await wait(300);
    await fill(os, "NAME", name === "Cara Diaz" ? "Cara Daiz" : name); // one typo, corrected below
    await os
      .getByLabel(/^ROLE( \*)?$/i)
      .first()
      .fill(role);
    await fill(os, "EMAIL", email);
    const roleSel = os.getByLabel(/^OS ROLE/i).first();
    if (await roleSel.count()) await roleSel.selectOption(osRole);
    if (photo)
      await os
        .locator('input[type="file"]')
        .first()
        .setInputFiles({ name: "photo.png", mimeType: "image/png", buffer: png(64, 64) })
        .catch(() => {});
    await wait(photo ? 900 : 100);
    await btn(os, />_save(?!_)/i).click();
    await wait(900);
    await closePanels(os);
  }
  // the typo: fix it through the row's EDIT
  await rowMenu(os, "Cara Daiz", "EDIT");
  await fill(os, "NAME", "Cara Diaz");
  await btn(os, />_save(?!_)/i).click();
  await wait(900);
  await closePanels(os);
  const b3 = await api(os, "/api/os/board?term=F26");
  const withPhoto = b3.body.rows.filter((r) => r.photo_path).length;
  say(
    b3.body.rows.length === 6 && b3.body.rows.some((r) => r.name === "Cara Diaz") && withPhoto >= 1 && (await bodyHas(site, "/about", "Cara Diaz")),
    `add 6 officers (${withPhoto} with photos, 1 admin, 1 typo'd then corrected) → /about lists them`,
  );
  await shot(os, "officers");
});

step = 4;
await guard(async () => {
  await goto(os, "/os/system");
  await btn(os, /EDIT/).click();
  await wait(300);
  const inputs = os.locator('input[aria-label$="owner email"]');
  const n4 = await inputs.count();
  for (let i = 0; i < n4; i++) await inputs.nth(i).fill("ava@jjay.cuny.edu");
  const second = os.locator('input[aria-label$="second owner email"]');
  for (let i = 0; i < (await second.count()); i++) await second.nth(i).fill("fay@jjay.cuny.edu");
  const verified = os.locator('input[aria-label$="last verified"]');
  for (let i = 0; i < (await verified.count()); i++) await verified.nth(i).fill("2026-08-25");
  await btn(os, /^save/i).click();
  await wait(1000);
  await goto(os, "/os/system");
  const redOwners = await os
    .locator(".ownership")
    .getByText("not a current officer")
    .count()
    .catch(() => 0);
  const own = await api(os, "/api/os/site-settings");
  const accounts = own.body.rows.find((r) => r.key === "ownership")?.value?.accounts ?? [];
  say(
    accounts.length >= 9 && accounts.every((a) => a.owner_email === "ava@jjay.cuny.edu") && redOwners === 0,
    `fill the ${accounts.length}-row ownership sheet → no owner is red`,
  );
  await shot(os, "ownership");
});

step = 5;
await guard(async () => {
  const officerCtx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const off = await officerCtx.newPage();
  await goto(off, "/os/login");
  await off.locator('[data-testid="local-officer"]').click();
  await wait(1000);
  await goto(off, "/os/board");
  const noAdd = (await off.getByRole("button", { name: /ADD_OFFICER/i }).count()) === 0;
  const noRoll = (await off.getByRole("button", { name: /ROLLOVER/i }).count()) === 0;
  const codes = [];
  for (const [m, p, body] of [
    ["POST", "/api/os/board", { name: "X", term: "F26" }],
    ["POST", "/api/os/terms", { id: "S99", label: "x" }],
    ["POST", "/api/os/terms/rollover", { next_id: "S99", next_label: "x" }],
    ["PATCH", "/api/os/site-settings/taglines", { value: {} }],
    ["POST", "/api/os/inbox/replay", { client_ids: [] }],
    ["DELETE", "/api/os/posts/anything", null],
  ])
    codes.push((await api(off, p, { method: m, body: body ? JSON.stringify(body) : undefined })).status);
  say(noAdd && noRoll && codes.every((c) => c === 403), `sign in as OFFICER → admin controls absent AND API 403 on each (${codes.join(",")})`);
  await shot(off, "officer");
  await officerCtx.close();

  // ====================================================== ACT 2 — THE SEMESTER RUNS
});

step = 6;
await guard(async () => {
  await goto(os, "/os/posts");
  await btn(os, /NEW_POST/i).click();
  await wait(300);
  await fill(os, "TITLE", "WELCOME BACK");
  await fill(os, "DEK", "the fall kickoff bulletin");
  await os.locator('label:has-text("BODY (MARKDOWN)") + div textarea, #f-body_md').first().fill("## Welcome back\n\nFirst general meeting is next week.");
  await btn(os, /SAVE_DRAFT/i).click();
  await wait(900);
  await closePanels(os);
  await rowMenu(os, "WELCOME BACK", "PUBLISH");
  const okNews = await bodyHas(site, "/news", "WELCOME BACK");
  const okSlug = await bodyHas(site, "/news/welcome-back", "First general meeting");
  say(okNews && okSlug, "publish post WELCOME BACK → /news lists it; /news/welcome-back renders");
  await shot(site, "news");
});

step = 7;
await guard(async () => {
  await goto(os, "/os/events");
  await btn(os, /NEW_EVENT/i).click();
  await wait(300);
  await fill(os, "TITLE", `FIRST GENERAL MEETING ${stamp}`);
  await fill(os, "SEMESTER", "Fall 2026");
  const soon = new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10);
  await fill(os, "DATE", soon);
  await fill(os, "TIME", "13:40");
  await fill(os, "LOCATION", "L2.85 New Building");
  await os
    .locator('input[type="file"]')
    .first()
    .setInputFiles({ name: "flyer.png", mimeType: "image/png", buffer: png(200, 120) });
  await wait(1000);
  await btn(os, />_save(?!_)/i).click();
  await wait(900);
  await closePanels(os);
  await rowMenu(os, `FIRST GENERAL MEETING ${stamp}`, "PUBLISH");
  const ev = await api(os, "/api/events");
  const evRow = (ev.body.semesters ?? []).flatMap((s) => s.events ?? []).find((e) => e.title === `FIRST GENERAL MEETING ${stamp}`);
  say(
    !!evRow?.flyer && (await bodyHas(site, "/events", `FIRST GENERAL MEETING ${stamp}`)) && (await bodyHas(site, "/", `FIRST GENERAL MEETING ${stamp}`)),
    "create event FIRST GENERAL MEETING + flyer → /events upcoming + Home band show it",
  );
  await shot(site, "events");
});

step = 8;
await guard(async () => {
  await goto(os, "/os/workshops");
  for (const n of [1, 2, 3]) {
    await btn(os, /NEW_SESSION/i).click();
    await wait(300);
    await fill(os, "TITLE", `Intro to Git — session ${n}`);
    await fill(os, "SERIES", "INTRO TO GIT");
    await fill(os, "SESSION #", String(n));
    await fill(os, "DATE", new Date(Date.now() + (7 * n + 3) * 86400000).toISOString().slice(0, 10));
    await btn(os, />_save(?!_)/i).click();
    await wait(900);
    await closePanels(os);
    await rowMenu(os, `Intro to Git — session ${n}`, "PUBLISH");
  }
  const ws = await api(os, "/api/workshops");
  const git = (ws.body.series ?? []).find((s) => s.series === "INTRO TO GIT");
  say(
    git?.sessions?.length === 3 && (await bodyHas(site, "/events", "INTRO TO GIT")),
    "create workshop series INTRO TO GIT, 3 sessions → /events workshops section groups all three",
  );
  await shot(site, "workshops");
});

step = 9;
await guard(async () => {
  await goto(os, "/os/resources");
  await os
    .locator("dl > div", { has: os.locator("dt", { hasText: /^DISCORD$/ }) })
    .locator('button:has-text("edit")')
    .first()
    .click();
  await wait(300);
  const newInvite = `https://discord.gg/jjcss-${stamp}`;
  await fill(os, "URL", newInvite);
  await btn(os, />_save(?!_)/i).click();
  await wait(900);
  await closePanels(os);
  await goto(site, "/");
  const footerOk = (await site.locator(`a[href="${newInvite}"]`).count()) > 0;
  await goto(site, "/join");
  const joinOk = (await site.locator(`a[href="${newInvite}"]`).count()) > 0;
  say(footerOk && joinOk, "change the Discord invite → public footer AND /join show the new URL");
  await shot(site, "discord");
});

step = 10;
await guard(async () => {
  await goto(os, "/os/resources");
  for (const [t, u] of [
    ["Sim Link One", "https://example.org/one"],
    ["Sim Link Two", "https://example.org/two"],
  ]) {
    await btn(os, /ADD_LINK/i).click();
    await wait(300);
    await fill(os, "GROUP", "Sim Category");
    await fill(os, "TITLE", t);
    await fill(os, "URL", u);
    await btn(os, />_save(?!_)/i).click();
    await wait(900);
    await closePanels(os);
  }
  os.once("dialog", (d) => d.accept("Renamed Category"));
  await os.locator('[data-testid="category-Sim Category"] button:has-text("rename")').click();
  await wait(900);
  await os.locator('[data-testid="category-Renamed Category"] button[aria-label="Move Renamed Category up"]').click();
  await wait(900);
  const res10 = await api(os, "/api/resources");
  const groups = res10.body.groups ?? [];
  const renamed = groups.find((g) => g.group === "Renamed Category");
  const pos = groups.findIndex((g) => g.group === "Renamed Category");
  say(
    !!renamed && renamed.links.length === 2 && pos >= 0 && pos < groups.length - 1 && (await bodyHas(site, "/resources", "RENAMED_CATEGORY")),
    `add 2 resource links, rename a category, reorder → /resources reflects all three (position ${pos + 1}/${groups.length})`,
  );
  await shot(site, "resources");
});

step = 11;
await guard(async () => {
  const CSV =
    "display_name,discord_handle,email,status,joined_term\n" +
    Array.from({ length: 40 }, (_, i) => `Member ${i + 1},m${i + 1}#0001,m${i + 1}@jjay.cuny.edu,interested,F26`).join("\n");
  await goto(os, "/os/members");
  await btn(os, /IMPORT_CSV/i).click();
  await wait(300);
  await os.locator("aside textarea").first().fill(CSV);
  await btn(os, /DRY_RUN/i).click();
  await wait(1200);
  const dryCount = (await api(os, "/api/os/members")).body.count;
  await btn(os, /commit import/i).click();
  await wait(1500);
  await closePanels(os);
  const afterCommit = await settled(os, "/api/os/members");
  os.once("dialog", (d) => d.accept());
  await goto(os, "/os/members");
  await btn(os, /UNDO_LAST_IMPORT/i).click();
  await wait(1500);
  const afterUndo = await settled(os, "/api/os/members");
  await btn(os, /IMPORT_CSV/i).click();
  await wait(300);
  await os.locator("aside textarea").first().fill(CSV);
  await btn(os, /DRY_RUN/i).click();
  await wait(1200);
  await btn(os, /commit import/i).click();
  await wait(1500);
  await closePanels(os);
  const afterRe = await settled(os, "/api/os/members");
  say(
    dryCount === 0 && afterCommit === 40 && afterUndo === 0 && afterRe === 40,
    `import 40 members (dry-run ${dryCount} → commit ${afterCommit}); undo-last-import → ${afterUndo}; re-import → ${afterRe}`,
  );
  await shot(os, "import");
});

step = 12;
await guard(async () => {
  await goto(os, "/os/members");
  const boxes = os.locator('input[type="checkbox"][aria-label^="Pick"]');
  for (let i = 0; i < 6; i++) await boxes.nth(i).check();
  await os.locator('[data-testid="bulk-bar"] button:has-text("→ member")').click();
  await wait(1500);
  const m12 = await api(os, "/api/os/members?status=member");
  const rec12 = (await api(os, "/api/os/records?table=members&limit=100")).body.rows.filter((r) => r.action === "transition:member");
  const meter = (await os.locator("body").textContent()) ?? "";
  say(
    m12.body.count === 6 && rec12.length >= 6 && /MEMBER/.test(meter),
    `transition 6 members interested → member → status meters update; ${rec12.length} audit rows exist`,
  );
  await shot(os, "members");

  // ====================================================== ACT 3 — A STUDENT SHIPS SOMETHING
});

step = 13;
await guard(async () => {
  await goto(site, "/projects");
  await site.locator('input[name="title"]').fill(`Study Buddy ${stamp}`);
  await site.locator('select[name="kind"]').selectOption("app");
  await site.locator('input[name="author"]').fill("Jay Bloodhound");
  await site.locator('input[name="email"]').fill("jay@jjay.cuny.edu");
  await site.locator('input[name="link"]').fill("https://github.com/jjcss/study-buddy");
  await site.locator('textarea[name="summary"]').fill("Pairs students for study sessions.");
  await site.locator("form button[type=submit]").first().click({ force: true });
  await wait(1200);
  await goto(os, "/os/projects");
  q13 = (await api(os, "/api/os/projects?status=submitted")).body.rows.find((r) => r.title === `Study Buddy ${stamp}`);
  say(
    !!q13 && ((await os.locator("body").textContent()) ?? "").includes(`Study Buddy ${stamp}`),
    "submit a project from the PUBLIC form → appears in /os/projects as submitted",
  );
  await shot(os, "queue");
});

step = 14;
await guard(async () => {
  await os
    .locator("tr", { hasText: new RegExp(`Study Buddy ${stamp}`) })
    .first()
    .click();
  await wait(500);
  await abtn(os, /START_REVIEW/i).click({ force: true });
  await wait(900);
  await os
    .locator("tr", { hasText: new RegExp(`Study Buddy ${stamp}`) })
    .first()
    .click();
  await wait(500);
  await os.locator("aside textarea").first().fill("Add two screenshots and a live link.");
  await abtn(os, /REQUEST_CHANGES/i).click({ force: true });
  await wait(900);
  const p14 = (await api(os, `/api/os/projects/${q13.id}`)).body.row;
  const pub14 = await api(site, `/api/projects/submission/${q13.id}`);
  say(
    p14.status === "changes_requested" && pub14.body.reviewer_note === "Add two screenshots and a live link.",
    "request changes with a note → status changes_requested; the note is visible to the student",
  );
  await shot(os, "changes");
});

step = 15;
await guard(async () => {
  await goto(site, "/projects");
  await site.locator('input[name="title"]').fill(`Study Buddy ${stamp}`);
  await site.locator('select[name="kind"]').selectOption("app");
  await site.locator('input[name="author"]').fill("Jay Bloodhound");
  await site.locator('input[name="email"]').fill("jay@jjay.cuny.edu");
  await site.locator('input[name="link"]').fill("https://github.com/jjcss/study-buddy");
  await site.locator('textarea[name="summary"]').fill("Pairs students for study sessions — now with screenshots and a live link.");
  await site.locator("form button[type=submit]").first().click({ force: true });
  await wait(1200);
  const p15 = (await api(os, `/api/os/projects/${q13.id}`)).body.row;
  const all15 = (await api(os, "/api/os/projects")).body.rows.filter((r) => r.title === `Study Buddy ${stamp}`);
  say(
    p15.status === "submitted" &&
      all15.length === 1 &&
      (p15.history ?? [])
        .map((h) => h.to)
        .join(">")
        .includes("changes_requested>submitted"),
    "resubmit from the public form, same slug → back to submitted; history preserved; no duplicate",
  );
});

step = 16;
await guard(async () => {
  await goto(os, "/os/projects");
  await os
    .locator("tr", { hasText: new RegExp(`Study Buddy ${stamp}`) })
    .first()
    .click();
  await wait(500);
  await abtn(os, /START_REVIEW/i).click({ force: true });
  await wait(900);
  await os
    .locator("tr", { hasText: new RegExp(`Study Buddy ${stamp}`) })
    .first()
    .click();
  await wait(500);
  await abtn(os, /\[ APPROVE \]/).click({ force: true });
  await wait(900);
  await os
    .locator("tr", { hasText: new RegExp(`Study Buddy ${stamp}`) })
    .first()
    .click();
  await wait(500);
  await abtn(os, /^publish/i).click({ force: true });
  await wait(900);
  await os.locator('button:has-text("published")').first().click();
  await wait(500);
  await os
    .locator("tr", { hasText: new RegExp(`Study Buddy ${stamp}`) })
    .first()
    .click();
  await wait(500);
  await abtn(os, /\[ FEATURE \]/).click({ force: true });
  await wait(900);
  // fill the three seats, then the 4th must be refused
  const feats = (await api(os, "/api/os/projects")).body.rows.filter((r) => r.featured);
  const extras = [];
  for (let i = feats.length; i < 3; i++) {
    const c = await api(os, "/api/os/projects", {
      method: "POST",
      body: JSON.stringify({ title: `Filler ${i} ${stamp}`, kind: "tool", summary: "x", status: "approved" }),
    });
    await api(os, `/api/os/projects/${c.body.row.id}/publish`, { method: "POST" });
    await api(os, `/api/os/projects/${c.body.row.id}/feature`, { method: "POST" });
    extras.push(c.body.row.id);
  }
  const fourth = await api(os, "/api/os/projects", {
    method: "POST",
    body: JSON.stringify({ title: `Fourth ${stamp}`, kind: "tool", summary: "x", status: "approved" }),
  });
  await api(os, `/api/os/projects/${fourth.body.row.id}/publish`, { method: "POST" });
  await goto(os, "/os/projects");
  await os.locator('button:has-text("published")').first().click();
  await wait(500);
  await os
    .locator("tr", { hasText: new RegExp(`Fourth ${stamp}`) })
    .first()
    .click();
  await wait(500);
  await abtn(os, /\[ FEATURE \]/).click({ force: true });
  await wait(900);
  const refusedText = (await os.locator("body").textContent()) ?? "";
  const featured = (await api(site, "/api/projects")).body.projects.filter((p) => p.featured);
  say(
    featured.some((p) => p.title === `Study Buddy ${stamp}`) &&
      featured.length === 3 &&
      /already featured/i.test(refusedText) &&
      (await bodyHas(site, "/projects", `Study Buddy ${stamp}`)),
    "approve → publish → feature → /projects Featured shows it; a 4th feature refused, naming the three",
  );
  await shot(os, "featured");

  // ====================================================== ACT 4 — THINGS GO WRONG
});

step = 17;
await guard(async () => {
  await goto(os, "/os/resources");
  await btn(os, /ADD_LINK/i).click();
  await wait(300);
  await fill(os, "GROUP", "Renamed Category");
  await fill(os, "TITLE", "Dead Link");
  await fill(os, "URL", "https://nonexistent.invalid/gone");
  await btn(os, />_save(?!_)/i).click();
  await wait(900);
  await closePanels(os);
  await rowMenu(os, "Dead Link", "RE-CHECK");
  await wait(1500);
  const dead1 = (await api(os, "/api/os/resources")).body.rows.find((r) => r.title === "Dead Link");
  await rowMenu(os, "Dead Link", "EDIT");
  await fill(os, "URL", "http://localhost:8000/api/health");
  await btn(os, />_save(?!_)/i).click();
  await wait(900);
  await closePanels(os);
  await rowMenu(os, "Dead Link", "RE-CHECK");
  await wait(1500);
  const dead2 = (await api(os, "/api/os/resources")).body.rows.find((r) => r.title === "Dead Link");
  say(
    dead1?.dead === true && dead2?.dead === false,
    `link-check with one dead URL → dead chip (${dead1?.last_status ?? "no response"}); fix; re-check clears (${dead2?.last_status})`,
  );
  await shot(os, "deadlink");
});

step = 18;
await guard(async () => {
  await goto(os, "/os/posts");
  await rowMenu(os, "WELCOME BACK", "EDIT");
  await fill(os, "DEK", "the fall kickoff bulletin — edited");
  await btn(os, /SAVE_DRAFT/i).click();
  await wait(900);
  await closePanels(os);
  await rowMenu(os, "WELCOME BACK", "UNPUBLISH");
  const gone = !(await bodyHas(site, "/news", "WELCOME BACK", 3));
  await goto(os, "/os/posts");
  await rowMenu(os, "WELCOME BACK", "PUBLISH");
  const back = await bodyHas(site, "/news", "WELCOME BACK");
  const edited = ((await site.locator("body").textContent()) ?? "").includes("edited"); // /news lists the dek
  say(
    gone && back && edited,
    `edit a published post → unpublish → re-publish → /news removes then restores it (with the edit) [gone ${gone} back ${back} edited ${edited}]`,
  );
});

step = 19;
await guard(async () => {
  await goto(os, "/os/events");
  await rowMenu(os, `FIRST GENERAL MEETING ${stamp}`, "ARCHIVE");
  await os.locator('[data-testid="confirm-word"]').fill("ARCHIVE");
  await os.locator('[data-testid="confirm-yes"]').click();
  for (let i = 0; i < 20; i++) {
    const st = (await api(os, "/api/os/events")).body.rows.find((r) => r.title === `FIRST GENERAL MEETING ${stamp}`)?.status;
    if (st === "archived") break;
    await wait(500);
  }
  const hidden = !(await bodyHas(site, "/events", `FIRST GENERAL MEETING ${stamp}`, 3));
  await goto(os, "/os/events");
  await os.locator('button:has-text("archived")').first().click();
  await wait(400);
  await rowMenu(os, `FIRST GENERAL MEETING ${stamp}`, "UNARCHIVE");
  const ev19 = (await api(os, "/api/os/events")).body.rows.find((r) => r.title === `FIRST GENERAL MEETING ${stamp}`);
  const restored = await bodyHas(site, "/events", `FIRST GENERAL MEETING ${stamp}`);
  say(hidden && restored, `archive an event → unarchive → /events hides then restores it [hidden ${hidden} status ${ev19?.status} restored ${restored}]`);
});

step = 20;
await guard(async () => {
  const tab2 = await ctx.newPage();
  await goto(tab2, "/os/login");
  await tab2.evaluate(() => sessionStorage.setItem("jjcss-os-role", "admin")); // sessionStorage is per tab
  await goto(os, "/os/posts");
  await goto(tab2, "/os/posts");
  await rowMenu(os, "WELCOME BACK", "EDIT");
  await rowMenu(tab2, "WELCOME BACK", "EDIT");
  await fill(os, "DEK", "tab one wins");
  await btn(os, /SAVE_DRAFT/i).click();
  await wait(1000);
  await fill(tab2, "DEK", "tab two tries");
  await btn(tab2, /SAVE_DRAFT/i).click();
  await wait(1000);
  const conflictShown = (await tab2.locator('[data-testid="conflict"]').count()) === 1;
  const p20 = (await api(os, "/api/os/posts")).body.rows.find((r) => r.title === "WELCOME BACK");
  say(conflictShown && p20.dek === "tab one wins", "two tabs edit the same post; second saves → 409 CHANGED_ELSEWHERE; no clobber");
  await shot(tab2, "conflict");
  await tab2.close();
});

step = 21;
await guard(async () => {
  const d21 = await record(
    "decision",
    "Adopt the platform for Fall 2026",
    "## Decision\n\nThe board runs on CSS OS this term.\n\n## Why\n\nOne place for the site and the spine.",
  );
  const m21 = await record("minutes", "Board meeting — kickoff", "## Present\n\nEverybody.\n\n## Decisions\n\nSee the decision record.");
  const idx21 = await api(os, "/api/os/inheritance?term=F26");
  const types21 = idx21.body.rows.map((r) => r.type);
  const files21 = existsSync(join(ROOT, "content/inheritance/F26/decisions")) && existsSync(join(ROOT, "content/inheritance/F26/meetings"));
  let valid21 = true;
  try {
    createRequire(import.meta.url)("node:child_process").execFileSync(
      join(ROOT, ".venv/bin/python"),
      [join(ROOT, "scripts/validate_inheritance.py"), "--quiet"],
      { cwd: ROOT, stdio: "pipe" },
    );
  } catch {
    valid21 = false;
  }
  say(
    d21 && m21 && types21.includes("decision") && types21.includes("minutes") && files21 && valid21,
    "write a decision record + meeting minutes → both list on /os/inheritance; files exist; validate_inheritance passes",
  );
  await shot(os, "records");
});

step = 22;
await guard(async () => {
  let filed = 0;
  for (const [name, role] of OFFICERS) {
    const ok = await record(
      "handoff",
      `Handoff — ${role}`,
      `## What I ran\n\n${role} duties.\n\n## Where things are\n\nDrive → Board → F26.\n\n## What's unfinished\n\nNothing.\n\n## Who to call\n\n${name}.\n\n## Advice for whoever is next\n\nStart early.`,
      role,
    );
    if (ok) filed++;
  }
  await goto(os, "/os");
  const today22 = (await os.locator("body").textContent()) ?? "";
  const spine22 = (await api(os, "/api/os/inheritance?term=F26")).body.stats;
  say(
    filed === 6 && spine22.handoffs_filed === 6 && /HANDOFFS FILED/.test(today22) && /6\s*\/\s*6/.test(today22.replace(/\s+/g, " ")),
    `all 6 officers file a handoff → Today shows handoffs ${spine22.handoffs_filed}/6`,
  );
  await shot(os, "today");
});

step = 23;
await guard(async () => {
  const zip = await os.evaluate(async () => {
    const r = await fetch("/api/os/inheritance/export.zip", { headers: { "X-Local-Role": "admin" } });
    const buf = new Uint8Array(await r.arrayBuffer());
    const txt = new TextDecoder("latin1").decode(buf);
    return {
      size: buf.length,
      pk: buf[0] === 0x50 && buf[1] === 0x4b,
      handoffs: (txt.match(/handoffs\//g) ?? []).length,
      decisions: (txt.match(/decisions\//g) ?? []).length,
      meetings: (txt.match(/meetings\//g) ?? []).length,
    };
  });
  say(
    zip.pk && zip.handoffs >= 6 && zip.decisions >= 1 && zip.meetings >= 1,
    `export the spine zip → ${zip.size} bytes; contains ${zip.handoffs} handoffs, ${zip.decisions} decisions, ${zip.meetings} minutes written this run`,
  );
});

step = 24;
await guard(async () => {
  await goto(os, "/os/board");
  await btn(os, /TERM_ROLLOVER/i).click();
  await wait(400);
  await os.locator('label:has-text("NEXT TERM ID") input').fill("S27");
  await os.locator('label:has-text("NEXT TERM LABEL") input').fill("Spring 2027");
  await os.locator('label:has-text("STARTS") input').fill("2027-01-25");
  await os.locator('label:has-text("ENDS") input').fill("2027-05-20");
  await abtn(os, /next/i).click({ force: true });
  await wait(400);
  const cont = os.locator('aside input[type="checkbox"]');
  await cont.nth(0).check();
  await cont.nth(1).check();
  await abtn(os, /roll the term/i).click({ force: true });
  await wait(2000);
  const terms24 = (await api(os, "/api/os/terms")).body;
  const s27 = (await api(os, "/api/os/board?term=S27")).body.rows;
  const rosterFile = existsSync(join(ROOT, "content/inheritance/S27/roster.md"));
  const about24 = await bodyHas(site, "/about", "SPRING 2027");
  const hist24 = ((await site.locator("body").textContent()) ?? "").includes("Fall 2026");
  say(
    terms24.current?.id === "S27" && s27.length === 2 && rosterFile && about24 && hist24,
    `rollover F26 → S27 → S27 roster exists (${s27.length} continuing); handoff stubs created; /about shows S27 current, F26 in history`,
  );
  await shot(os, "rollover");
});

step = 25;
await guard(async () => {
  await goto(os, "/os");
  await os.getByRole("button", { name: /sign out/i }).click();
  await wait(800);
  await goto(os, "/os");
  say(
    os.url().includes("/os/login") && os.url().includes("NOT_SIGNED_IN".toLowerCase()),
    `sign out → /os redirects to login with NOT_SIGNED_IN (${new URL(os.url()).pathname}${new URL(os.url()).search})`,
  );
  await shot(os, "signout");
});
await b.close();
cleanSpine();
for (const f of readdirSync(join(ROOT, "data"))) if (/\.local\.json(\.bak)?$/.test(f)) rmSync(join(ROOT, "data", f));
rmSync(join(ROOT, ".cache/inbox"), { recursive: true, force: true });
console.log(`board sim: ${25 - failed}/25 steps passed`);
process.exit(failed ? 1 : 0);
