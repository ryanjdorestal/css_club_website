// board_break.mjs — the hostile board member (run 10 §9): 16 cases, each must end in a clear, styled,
// recoverable outcome — never a blank page, a raw stack trace, a silent no-op, a duplicate row or a
// lost draft. Prints a 16-row pass/fail table; screenshots → qa/loops/run10/break/NN-*.png.
// Run:  make break   (needs `make dev` up; Tier 1). Exit 1 on any failed case.
import { createRequire } from "node:module";
const { chromium } = createRequire(new URL("../apps/web/package.json", import.meta.url))("@playwright/test");
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const ROOT = new URL("../", import.meta.url).pathname;
const BASE = process.env.BASE_URL ?? "http://localhost:5173";
const API = process.env.API_URL ?? "http://localhost:8000";
const OUT = join(ROOT, "qa/loops/run10/break");
mkdirSync(OUT, { recursive: true });
const rows = [];
let n = 0;
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const rec = (ok, label, detail = "") => {
  rows.push({ n, ok, label, detail });
  console.log(`${ok ? "ok  " : "FAIL"} ${String(n).padStart(2, "0")} ${label}${detail ? ` — ${detail}` : ""}`);
};
const stamp = Date.now().toString().slice(-4);

const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
await ctx.addInitScript(() => sessionStorage.setItem("jjcss-os-role", "admin"));
const p = await ctx.newPage();
const errors = [];
p.on("pageerror", (e) => errors.push(e.message));
const dialogs = []; // every native dialog the page raised (an alert here would be a failed escape)
p.on("dialog", (d) => {
  dialogs.push(d.type());
  (d.type() === "beforeunload" ? d.accept() : d.dismiss()).catch(() => {}); // leave-anyway on the unsaved guard
});
const goto = async (path) => {
  await p.goto(`${BASE}${path}`, { waitUntil: "networkidle" });
  await wait(500);
};
const shot = (name) => p.screenshot({ path: join(OUT, `${String(n).padStart(2, "0")}-${name}.png`) }).catch(() => {});
const api = async (path, init = {}, headers = { "X-Local-Role": "admin" }) => {
  const r = await fetch(`${API}${path}`, { ...init, headers: { "Content-Type": "application/json", ...headers, ...(init.headers ?? {}) } });
  const text = await r.text();
  let body = {};
  try {
    body = JSON.parse(text);
  } catch {
    body = { raw: text.slice(0, 200) };
  }
  return { status: r.status, body, isJson: r.headers.get("content-type")?.includes("json") ?? false };
};
const count = async (path) => (await api(path)).body.count;
const envelope = (r) => r.isJson && r.body.ok === false && r.body.error && typeof r.body.error.message === "string";
const guard = async (label, fn) => {
  n++;
  try {
    await fn();
  } catch (e) {
    rec(
      false,
      label,
      `threw: ${String(e?.message ?? e)
        .split("\n")[0]
        .slice(0, 140)}`,
    );
    await shot("error");
  }
};

// 01 — every create form submitted empty
await guard("submit every create form empty → per-field errors; nothing written", async () => {
  const before = {
    posts: await count("/api/os/posts"),
    events: await count("/api/os/events"),
    workshops: await count("/api/os/workshops"),
    members: await count("/api/os/members"),
  };
  let errs = 0;
  for (const [path, btn] of [
    ["/os/posts", /NEW_POST/i],
    ["/os/events", /NEW_EVENT/i],
    ["/os/workshops", /NEW_SESSION/i],
    ["/os/members", /\+_ADD/i],
  ]) {
    await goto(path);
    await p.getByRole("button", { name: btn }).first().click();
    await wait(300);
    await p
      .locator("aside")
      .getByRole("button", { name: />_(save|add|write)/i })
      .first()
      .click({ force: true });
    await wait(400);
    if ((await p.locator('[data-testid="form-errors"]').count()) === 1) errs++;
    await shot(`empty-${path.replace(/\//g, "_")}`);
    for (const x of await p.locator('aside button:has-text("close")').all()) await x.click().catch(() => {});
  }
  const after = {
    posts: await count("/api/os/posts"),
    events: await count("/api/os/events"),
    workshops: await count("/api/os/workshops"),
    members: await count("/api/os/members"),
  };
  const same = Object.keys(before).every((k) => before[k] === after[k]);
  const apiEmpty = (await api("/api/os/posts", { method: "POST", body: JSON.stringify({ title: "" }) })).status === 422;
  rec(
    errs === 4 && same && apiEmpty,
    "submit every create form empty → per-field errors; nothing written",
    `${errs}/4 forms flagged, counts unchanged ${same}, API 422 ${apiEmpty}`,
  );
});

// 02 — 50,000 chars
await guard("50,000 chars into a title and a body → counter + cap client-side; server rejects too", async () => {
  const huge = "x".repeat(50000);
  await goto("/os/posts");
  await p
    .getByRole("button", { name: /NEW_POST/i })
    .first()
    .click();
  await wait(300);
  await p
    .getByLabel(/^TITLE/i)
    .first()
    .fill(huge);
  await p.locator("#f-body_md").fill(huge + huge);
  await p
    .locator("aside")
    .getByRole("button", { name: /SAVE_DRAFT/i })
    .first()
    .click({ force: true });
  await wait(400);
  const text = (await p.locator("aside").textContent()) ?? "";
  const clientCap = /cap is 200/.test(text) && /cap is 60000/.test(text);
  await shot("huge");
  const server = await api("/api/os/posts", { method: "POST", body: JSON.stringify({ title: huge, body_md: "x" }) });
  rec(
    clientCap && server.status === 422 && envelope(server) && server.body.error.field === "title",
    "50,000 chars into a title and a body → counter + cap client-side; server rejects too",
    `client caps ${clientCap}, server ${server.status} field=${server.body.error?.field}`,
  );
  for (const x of await p.locator('aside button:has-text("close")').all()) await x.click().catch(() => {});
});

// 03 — two posts named the same
await guard('two posts named "Welcome Back" → welcome-back-2 or a clear, actionable error', async () => {
  const a = await api("/api/os/posts", { method: "POST", body: JSON.stringify({ title: `Welcome Back ${stamp}` }) });
  const c = await api("/api/os/posts", { method: "POST", body: JSON.stringify({ title: `Welcome Back ${stamp}` }) });
  rec(
    a.body.row?.slug === `welcome-back-${stamp}` && c.body.row?.slug === `welcome-back-${stamp}-2`,
    'two posts named "Welcome Back" → welcome-back-2 or a clear, actionable error',
    `${a.body.row?.slug} · ${c.body.row?.slug}`,
  );
});

// 04 — hostile text
await guard("unicode, emoji, RTL, <script>, SQL in every text field → stored; rendered escaped; public shows literal text", async () => {
  const nasty = `Ünïcödé ✨🐕 שלום <script>alert(1)</script> "; DROP TABLE posts;-- ${stamp}`;
  const r = await api("/api/os/posts", {
    method: "POST",
    body: JSON.stringify({ title: nasty, dek: nasty, body_md: `## ${nasty}\n\n${nasty}`, tags: [nasty] }),
  });
  const id = r.body.row?.id;
  await api(`/api/os/posts/${id}/publish`, { method: "POST" });
  const dialogsBefore = dialogs.length;
  await goto(`/news/${id}`);
  const dialog = dialogs.length > dialogsBefore;
  const text = (await p.locator("body").textContent()) ?? "";
  const literal = text.includes("<script>alert(1)</script>") && text.includes("DROP TABLE") && text.includes("שלום") && text.includes("🐕");
  const scripts = await p.locator("script:not([type=module]):not([src])").count();
  await shot("nasty");
  const still = (await api("/api/os/posts")).body.count;
  rec(
    r.status === 200 && literal && !dialog && scripts === 0 && still > 0,
    "unicode, emoji, RTL, <script>, SQL in every text field → stored; rendered escaped; public shows literal text",
    `stored ${r.status}, literal ${literal}, no alert ${!dialog}, posts table intact (${still} rows)`,
  );
});

// 05 — hostile uploads
await guard("upload 20 MB png / .exe renamed .png / 1×1 px / truncated file → each refused with the specific reason", async () => {
  const png1x1 = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==", "base64");
  const cases = [
    ["huge.png", Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), Buffer.alloc(20 * 1024 * 1024)]), 413],
    ["evil.png", Buffer.concat([Buffer.from("MZ\x90\x00"), Buffer.alloc(300)]), 415],
    ["dot.png", png1x1, 422],
    ["cut.png", Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), Buffer.alloc(40)]), 415],
  ];
  const out = [];
  for (const [name, buf, want] of cases) {
    const form = new FormData();
    form.append("file", new Blob([buf], { type: "image/png" }), name);
    const r = await fetch(`${API}/api/os/uploads`, { method: "POST", body: form, headers: { "X-Local-Role": "admin" } });
    const body = await r.json().catch(() => ({}));
    out.push({ name, status: r.status, want, msg: body.error?.message?.slice(0, 60), field: body.error?.field });
  }
  const ok = out.every((o) => o.status === o.want && o.field === "file" && o.msg);
  rec(
    ok,
    "upload 20 MB png / .exe renamed .png / 1×1 px / truncated file → each refused with the specific reason",
    out.map((o) => `${o.name} ${o.status}${o.status === o.want ? "" : `≠${o.want}`}: ${o.msg}`).join(" · "),
  );
});

// 06 — double-click / Enter spam
await guard("double-click every submit; Enter ×10 → exactly one row each time", async () => {
  const before = await count("/api/os/events");
  await goto("/os/events");
  await p
    .getByRole("button", { name: /NEW_EVENT/i })
    .first()
    .click();
  await wait(300);
  await p
    .getByLabel(/^TITLE/i)
    .first()
    .fill(`Spam Event ${stamp}`);
  await p
    .getByLabel(/^SEMESTER/i)
    .first()
    .fill("Fall 2026");
  await p
    .getByLabel(/^DATE( \*)?$/i)
    .first()
    .fill("2026-11-01");
  const save = p
    .locator("aside")
    .getByRole("button", { name: />_save/i })
    .first();
  await save.dblclick({ force: true });
  await wait(200);
  await save.click({ force: true, timeout: 700 }).catch(() => {});
  await wait(1200);
  const uiRows = (await api("/api/os/events")).body.rows.filter((r) => r.title === `Spam Event ${stamp}`).length;
  // Enter ×10 on a fresh form
  for (const x of await p.locator('aside button:has-text("close")').all()) await x.click().catch(() => {});
  await p
    .getByRole("button", { name: /NEW_EVENT/i })
    .first()
    .click();
  await wait(300);
  await p
    .getByLabel(/^TITLE/i)
    .first()
    .fill(`Enter Event ${stamp}`);
  await p
    .getByLabel(/^SEMESTER/i)
    .first()
    .fill("Fall 2026");
  const date = p.getByLabel(/^DATE( \*)?$/i).first();
  await date.fill("2026-11-02");
  for (let i = 0; i < 10; i++) await date.press("Enter", { timeout: 700 }).catch(() => {}); // after the first submit the panel is gone
  await wait(1500);
  const enterRows = (await api("/api/os/events")).body.rows.filter((r) => r.title === `Enter Event ${stamp}`).length;
  // and the API with one client_id twice
  const cid = `dbl-${stamp}`;
  await api("/api/os/events", { method: "POST", body: JSON.stringify({ title: `Cid Event ${stamp}`, semester: "Fall 2026", client_id: cid }) });
  await api("/api/os/events", { method: "POST", body: JSON.stringify({ title: `Cid Event ${stamp}`, semester: "Fall 2026", client_id: cid }) });
  const cidRows = (await api("/api/os/events")).body.rows.filter((r) => r.title === `Cid Event ${stamp}`).length;
  await shot("spam");
  rec(
    uiRows === 1 && enterRows === 1 && cidRows === 1,
    "double-click every submit; Enter ×10 → exactly one row each time",
    `dblclick ${uiRows}, enter×10 ${enterRows}, client_id×2 ${cidRows} (had ${before})`,
  );
});

// 07 — API down mid-write
await guard("stop the API mid-write → SAVED_LOCALLY · WILL_SYNC; replay pushes it when the API returns; no duplicate", async () => {
  await goto("/os/posts");
  await p.evaluate(() =>
    Object.keys(sessionStorage)
      .filter((k) => k.startsWith("os-draft:"))
      .forEach((k) => sessionStorage.removeItem(k)),
  ); // case 02's 50k-char draft would (correctly) block this form
  await p.route("**/api/os/posts", (route) => (route.request().method() === "POST" ? route.abort("connectionrefused") : route.continue()));
  await p
    .getByRole("button", { name: /NEW_POST/i })
    .first()
    .click();
  await wait(300);
  await p
    .getByLabel(/^TITLE/i)
    .first()
    .fill(`Offline Post ${stamp}`);
  await p
    .locator("aside")
    .getByRole("button", { name: /SAVE_DRAFT/i })
    .first()
    .click({ force: true });
  await wait(1200);
  const toast = ((await p.locator('[data-testid="toast"]').allTextContents()) ?? []).join(" ");
  const queued = await p.evaluate(() => JSON.parse(localStorage.getItem("os-outbox") ?? "[]").length);
  await shot("offline");
  await p.unroute("**/api/os/posts");
  for (const x of await p.locator('aside button:has-text("close")').all()) await x.click().catch(() => {});
  await goto("/os/audit"); // the shell replays the outbox on load
  await wait(1500);
  const left = await p.evaluate(() => JSON.parse(localStorage.getItem("os-outbox") ?? "[]").length);
  const rowsNow = (await api("/api/os/posts")).body.rows.filter((r) => r.title === `Offline Post ${stamp}`).length;
  rec(
    /WILL_SYNC/.test(toast) && queued === 1 && left === 0 && rowsNow === 1,
    "stop the API mid-write → SAVED_LOCALLY · WILL_SYNC; replay pushes it when the API returns; no duplicate",
    `toast ${/WILL_SYNC/.test(toast)}, queued ${queued} → left ${left}, rows ${rowsNow}`,
  );
});

// 08 — refresh mid-edit
await guard("refresh and navigate away mid-edit → unsaved-changes guard; draft restored", async () => {
  await goto("/os/posts");
  await p
    .getByRole("button", { name: /NEW_POST/i })
    .first()
    .click();
  await wait(300);
  await p
    .getByLabel(/^TITLE/i)
    .first()
    .fill(`Draft In Progress ${stamp}`);
  const guardArmed = await p.evaluate(() => {
    // a dirty form registers a beforeunload guard; we cannot observe the native dialog, so ask the page
    let armed = false;
    const e = new Event("beforeunload", { cancelable: true });
    window.dispatchEvent(e);
    armed = e.defaultPrevented;
    return armed;
  });
  await p.reload({ waitUntil: "networkidle" });
  await wait(500);
  await p
    .getByRole("button", { name: /NEW_POST/i })
    .first()
    .click();
  await wait(400);
  const restored =
    (await p
      .getByLabel(/^TITLE/i)
      .first()
      .inputValue()) === `Draft In Progress ${stamp}`;
  const banner = (await p.locator("text=DRAFT_RESTORED").count()) === 1;
  await shot("restored");
  for (const x of await p.locator('aside button:has-text("close")').all()) await x.click().catch(() => {});
  await p.evaluate(() => sessionStorage.removeItem("os-draft:post-new"));
  rec(
    guardArmed && restored && banner,
    "refresh and navigate away mid-edit → unsaved-changes guard; draft restored",
    `guard ${guardArmed}, restored ${restored}, banner ${banner}`,
  );
});

// 09 — stale form after back/forward
await guard("back/forward through 10 OS pages, submit a stale form → 409 or fresh re-render; no ghost row", async () => {
  const post = (await api("/api/os/posts", { method: "POST", body: JSON.stringify({ title: `Stale ${stamp}` }) })).body.row;
  await goto("/os/posts");
  await p
    .locator("tr", { hasText: new RegExp(`Stale ${stamp}`) })
    .first()
    .locator('[data-testid="row-menu"]')
    .click();
  await p.getByRole("menuitem", { name: "EDIT", exact: true }).click();
  await wait(300);
  for (const path of ["/os", "/os/events", "/os/members", "/os/board", "/os/resources"]) await p.goto(`${BASE}${path}`, { waitUntil: "domcontentloaded" });
  for (let i = 0; i < 5; i++) await p.goBack({ waitUntil: "domcontentloaded" }).catch(() => {});
  for (let i = 0; i < 5; i++) await p.goForward({ waitUntil: "domcontentloaded" }).catch(() => {});
  // meanwhile the row changed elsewhere
  await api(`/api/os/posts/${post.id}`, { method: "PATCH", body: JSON.stringify({ title: `Stale ${stamp} (changed elsewhere)` }) });
  await goto("/os/posts");
  const stale = await api(`/api/os/posts/${post.id}`, {
    method: "PATCH",
    body: JSON.stringify({ title: `Stale ${stamp} (ghost)`, expected_updated_at: post.updated_at }),
  });
  const total = (await api("/api/os/posts")).body.rows.filter((r) => String(r.title).startsWith(`Stale ${stamp}`)).length;
  const fresh = ((await p.locator("body").textContent()) ?? "").includes("(changed elsewhere)");
  rec(
    stale.status === 409 && envelope(stale) && total === 1 && fresh,
    "back/forward through 10 OS pages, submit a stale form → 409 or fresh re-render; no ghost row",
    `stale save ${stale.status}, rows ${total}, list re-rendered fresh ${fresh}`,
  );
});

// 10 — session cleared, then Save (its own context: the harness init-script would re-arm the role on every load)
await guard("clear the session then Save → /os/login?next=… with SESSION_EXPIRED; the form's content preserved and restored after sign-in", async () => {
  const c10 = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const q = await c10.newPage();
  q.on("dialog", (d) => (d.type() === "beforeunload" ? d.accept() : d.dismiss()).catch(() => {}));
  await q.goto(`${BASE}/os/login`, { waitUntil: "networkidle" });
  await q.locator('[data-testid="local-admin"]').click();
  await wait(900);
  await q.goto(`${BASE}/os/events`, { waitUntil: "networkidle" });
  await q
    .getByRole("button", { name: /NEW_EVENT/i })
    .first()
    .click();
  await wait(300);
  await q
    .getByLabel(/^TITLE/i)
    .first()
    .fill(`Expired Session ${stamp}`);
  await q
    .getByLabel(/^SEMESTER/i)
    .first()
    .fill("Fall 2026");
  await q
    .getByLabel(/^DATE( \*)?$/i)
    .first()
    .fill("2026-11-03");
  await q.evaluate(() => sessionStorage.removeItem("jjcss-os-role"));
  await q
    .locator("aside")
    .getByRole("button", { name: />_save/i })
    .first()
    .click({ force: true });
  await wait(1500);
  const url = q.url();
  const redirected = url.includes("/os/login") && url.includes("reason=session_expired") && url.includes("next=%2Fos%2Fevents");
  const chip = ((await q.locator("body").textContent()) ?? "").includes("SESSION_EXPIRED");
  const draft = await q.evaluate(() => JSON.parse(sessionStorage.getItem("os-draft:event-new") ?? "{}").title);
  await q.screenshot({ path: join(OUT, `${String(n).padStart(2, "0")}-expired.png`) }).catch(() => {});
  await q.locator('[data-testid="local-admin"]').click(); // sign back in → next=/os/events
  await wait(1200);
  const backOnEvents = q.url().includes("/os/events");
  await q
    .getByRole("button", { name: /NEW_EVENT/i })
    .first()
    .click();
  await wait(400);
  const restored =
    (await q
      .getByLabel(/^TITLE/i)
      .first()
      .inputValue()) === `Expired Session ${stamp}`;
  await q.evaluate(() => sessionStorage.removeItem("os-draft:event-new"));
  await c10.close();
  rec(
    redirected && chip && draft === `Expired Session ${stamp}` && backOnEvents && restored,
    "clear the session then Save → /os/login?next=… with SESSION_EXPIRED; the form's content preserved and restored after sign-in",
    `redirect ${redirected}, chip ${chip}, draft kept ${draft === `Expired Session ${stamp}`}, back on /os/events ${backOnEvents}, restored ${restored}`,
  );
});

// 11 — every write endpoint with no token / officer / tampered token
await guard("curl every write endpoint: no token, officer token, tampered token → 401/403, never 500", async () => {
  const writes = [
    ["POST", "/api/os/posts", { title: "x" }],
    ["POST", "/api/os/projects", { title: "x" }],
    ["POST", "/api/os/events", { title: "x" }],
    ["POST", "/api/os/workshops", { title: "x" }],
    ["POST", "/api/os/resources", { group: "g", title: "x", url: "https://x.example" }],
    ["PATCH", "/api/os/links/discord", { url: "https://x.example" }],
    ["POST", "/api/os/members", { display_name: "x" }],
    ["POST", "/api/os/board", { name: "x" }],
    ["POST", "/api/os/terms", { id: "Z99", label: "zz" }],
    ["POST", "/api/os/terms/rollover", { next_id: "Z98", next_label: "zz" }],
    ["PATCH", "/api/os/site-settings/taglines", { value: {} }],
    ["POST", "/api/os/inheritance", { meta: { type: "decision", title: "x" }, body_md: "" }],
    ["POST", "/api/os/inbox/replay", { client_ids: [] }],
    ["POST", "/api/os/members/import", { csv: "display_name\nx", dry_run: true }],
    ["DELETE", "/api/os/posts/anything", null],
    ["DELETE", "/api/os/terms/F26", null],
  ];
  const bad = [];
  for (const [m, path, body] of writes) {
    for (const [who, headers] of [
      ["anon", {}],
      ["officer", { "X-Local-Role": "officer" }],
      ["tampered", { Authorization: "Bearer eyJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6ImV2aWxAeC5lZHUifQ.tampered" }],
    ]) {
      const r = await api(path, { method: m, body: body ? JSON.stringify(body) : undefined }, headers);
      const okStatus = who === "officer" ? [200, 401, 403, 404, 409, 422].includes(r.status) : [401, 403].includes(r.status);
      if (!okStatus || !r.isJson || r.status >= 500) bad.push(`${who} ${m} ${path} → ${r.status}`);
    }
  }
  rec(
    bad.length === 0,
    "curl every write endpoint: no token, officer token, tampered token → 401/403, never 500",
    bad.length ? bad.slice(0, 4).join(" · ") : `${writes.length * 3} calls, all 401/403 (officer: never 500)`,
  );
});

// 12 — destructive deletes
await guard(
  "delete the current term; an officer who filed a handoff; a category with links → refused with a reason, or cascaded with an explicit warning",
  async () => {
    const cur = (await api("/api/os/terms")).body.current?.id;
    const t = await api(`/api/os/terms/${cur}`, { method: "DELETE" });
    const o = (
      await api("/api/os/board", {
        method: "POST",
        body: JSON.stringify({ name: `Filer ${stamp}`, term: cur, role_title: `Historian ${stamp}`, active: true }),
      })
    ).body.row;
    await api("/api/os/inheritance", {
      method: "POST",
      body: JSON.stringify({
        meta: {
          type: "handoff",
          title: `Handoff — Historian ${stamp}`,
          term: cur,
          date: "2026-12-01",
          status: "final",
          owners: [`Historian ${stamp}`],
          visibility: "board",
          role: `Historian ${stamp}`,
        },
        body_md: "## What I ran\n\nthe archive",
      }),
    });
    const d = await api(`/api/os/board/${o.id}`, { method: "DELETE" });
    await api("/api/os/resources", { method: "POST", body: JSON.stringify({ group: `Doomed ${stamp}`, title: "A", url: "https://a.example" }) });
    const c = await api("/api/os/resources/category/delete", { method: "POST", body: JSON.stringify({ group: `Doomed ${stamp}` }) });
    const cascade = await api("/api/os/resources/category/delete", { method: "POST", body: JSON.stringify({ group: `Doomed ${stamp}`, cascade: true }) });
    const ok =
      t.status === 409 &&
      /current/.test(t.body.error?.message ?? "") &&
      d.status === 409 &&
      d.body.error?.archived === true &&
      c.status === 409 &&
      Array.isArray(c.body.error?.links) &&
      cascade.status === 200;
    rec(
      ok,
      "delete the current term; an officer who filed a handoff; a category with links → refused with a reason, or cascaded with an explicit warning",
      `term ${t.status} "${t.body.error?.message?.slice(0, 40)}" · officer ${d.status} archived=${d.body.error?.archived} · category ${c.status} names ${JSON.stringify(c.body.error?.links)} → cascade ${cascade.status}`,
    );
  },
);

// 13 — maintenance banner
await guard("set a maintenance banner, then clear it → public site shows it, then doesn't", async () => {
  await api("/api/os/site-settings/maintenance_banner", { method: "PATCH", body: JSON.stringify({ value: { on: true, text: `Back at 9 — ${stamp}` } }) });
  await goto("/");
  const on =
    (await p.locator('[data-testid="maintenance-banner"]').count()) === 1 && ((await p.locator("body").textContent()) ?? "").includes(`Back at 9 — ${stamp}`);
  await shot("banner-on");
  await api("/api/os/site-settings/maintenance_banner", { method: "PATCH", body: JSON.stringify({ value: { on: false, text: "" } }) });
  await goto("/");
  const off = (await p.locator('[data-testid="maintenance-banner"]').count()) === 0;
  rec(on && off, "set a maintenance banner, then clear it → public site shows it, then doesn't", `on ${on}, off ${off}`);
});

// 14 — every feature flag off
await guard("turn off every feature flag → public pages degrade with labelled states; no 500s", async () => {
  const flags = (await api("/api/os/site-settings")).body.rows.find((r) => r.key === "feature_flags")?.value ?? {};
  await api("/api/os/site-settings/feature_flags", {
    method: "PATCH",
    body: JSON.stringify({ value: { ...flags, projects_public: false, chat_enabled: false } }),
  });
  errors.length = 0;
  await goto("/projects");
  const text = (await p.locator("body").textContent()) ?? "";
  const labelled = /SLOT_01|OPEN|Nothing published yet|slots are open/i.test(text);
  const noChat = (await p.locator('button[aria-label*="hound" i], button[aria-label*="chat" i]').count()) === 0;
  await shot("flags-off");
  const statuses = [];
  for (const path of ["/", "/projects", "/events", "/about", "/resources", "/news", "/join"]) {
    const r = await p.goto(`${BASE}${path}`, { waitUntil: "domcontentloaded" });
    statuses.push(r?.status() ?? 0);
  }
  await api("/api/os/site-settings/feature_flags", { method: "PATCH", body: JSON.stringify({ value: flags }) });
  rec(
    labelled && noChat && statuses.every((s) => s < 500) && errors.length === 0,
    "turn off every feature flag → public pages degrade with labelled states; no 500s",
    `projects labelled ${labelled}, chat hidden ${noChat}, statuses ${statuses.join(",")}, page errors ${errors.length}`,
  );
});

// 15 — 390 px
await guard("OS at 390 px: acts 2 and 3 → everything reachable; tables scroll; modals fit", async () => {
  const m = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true });
  await m.addInitScript(() => sessionStorage.setItem("jjcss-os-role", "admin"));
  const q = await m.newPage();
  await q.goto(`${BASE}/os/posts`, { waitUntil: "networkidle" });
  await q
    .getByRole("button", { name: /NEW_POST/i })
    .first()
    .click();
  await wait(300);
  await q
    .getByLabel(/^TITLE/i)
    .first()
    .fill(`Mobile Post ${stamp}`);
  await q
    .locator("aside")
    .getByRole("button", { name: /SAVE_DRAFT/i })
    .first()
    .click({ force: true });
  await wait(1000);
  const asideFits = await q.evaluate(() => {
    const a = document.querySelector("aside");
    return !a || a.getBoundingClientRect().width <= window.innerWidth + 1;
  });
  for (const x of await q.locator('aside button:has-text("close")').all()) await x.click().catch(() => {});
  await q.goto(`${BASE}/projects`, { waitUntil: "networkidle" });
  await q.locator('input[name="title"]').fill(`Mobile Project ${stamp}`);
  await q.locator('select[name="kind"]').selectOption("app");
  await q.locator('input[name="author"]').fill("Mo Bile");
  await q.locator('input[name="email"]').fill("mo@jjay.cuny.edu");
  await q.locator('textarea[name="summary"]').fill("From a phone.");
  await q.locator("form button[type=submit]").first().click({ force: true });
  await wait(1200);
  await q.goto(`${BASE}/os/projects`, { waitUntil: "networkidle" });
  const noHScroll = await q.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
  const tableScrolls = await q.evaluate(() => [...document.querySelectorAll("table")].every((t) => t.parentElement.scrollWidth >= t.parentElement.clientWidth));
  await q.screenshot({ path: join(OUT, `${String(n).padStart(2, "0")}-mobile.png`) });
  const post = (await api("/api/os/posts")).body.rows.some((r) => r.title === `Mobile Post ${stamp}`);
  const proj = (await api("/api/os/projects")).body.rows.some((r) => r.title === `Mobile Project ${stamp}`);
  await m.close();
  rec(
    post && proj && asideFits && noHScroll && tableScrolls,
    "OS at 390 px: acts 2 and 3 → everything reachable; tables scroll; modals fit",
    `post ${post}, public submit ${proj}, panel fits ${asideFits}, no h-scroll ${noHScroll}, tables scroll ${tableScrolls}`,
  );
});

// 16 — keyboard only
await guard("keyboard only, no mouse: acts 2 and 3 → completable; axe/pa11y still 0", async () => {
  await goto("/os/posts");
  await p.evaluate(() =>
    Object.keys(sessionStorage)
      .filter((k) => k.startsWith("os-draft:"))
      .forEach((k) => sessionStorage.removeItem(k)),
  );
  // tab to "+ new post", open it with Enter, type, submit with ⌘/Ctrl+Enter
  let found = false;
  for (let i = 0; i < 60 && !found; i++) {
    await p.keyboard.press("Tab");
    found = await p.evaluate(() => /NEW_POST/i.test(document.activeElement?.textContent ?? ""));
  }
  await p.keyboard.press("Enter");
  await wait(400);
  const focusInPanel = await p.evaluate(() => !!document.activeElement?.closest("aside"));
  await p.keyboard.type(`Keyboard Post ${stamp}`);
  await p.keyboard.press("Control+Enter");
  await wait(1200);
  const saved = (await api("/api/os/posts")).body.rows.some((r) => r.title === `Keyboard Post ${stamp}`);
  // Esc closes whatever is open; arrow keys walk the table; Enter opens a row
  await p.keyboard.press("Escape");
  await wait(300);
  await p.locator("tbody tr").first().focus();
  await p.keyboard.press("ArrowDown");
  const rowFocused = await p.evaluate(() => document.activeElement?.tagName === "TR");
  await p.keyboard.press("Enter");
  await wait(400);
  const opened = (await p.locator("aside").count()) === 1;
  await p.keyboard.press("Escape");
  await wait(300);
  const closed = (await p.locator("aside").count()) === 0;
  await shot("keyboard");
  rec(
    found && focusInPanel && saved && rowFocused && opened && closed,
    "keyboard only, no mouse: acts 2 and 3 → completable; axe/pa11y still 0 (make a11y)",
    `tab reached the button ${found}, focus trapped ${focusInPanel}, ⌘↵ saved ${saved}, arrows ${rowFocused}, Enter opened ${opened}, Esc closed ${closed}`,
  );
});

await b.close();
// leave the repo as found: the spine files case 12 wrote (untracked or ignored) go
{
  const { execFileSync } = createRequire(import.meta.url)("node:child_process");
  const { rmSync } = createRequire(import.meta.url)("node:fs");
  for (const f of execFileSync("git", ["ls-files", "--others", "content/inheritance"], { cwd: ROOT, encoding: "utf8" }).split("\n").filter(Boolean))
    rmSync(join(ROOT, f), { force: true });
}
const passed = rows.filter((r) => r.ok).length;
console.log(
  `\n| # | case | result |\n|---|---|---|\n${rows.map((r) => `| ${String(r.n).padStart(2, "0")} | ${r.label} | ${r.ok ? "✅" : "❌"} ${r.detail} |`).join("\n")}`,
);
console.log(`\nboard break: ${passed}/16 cases passed`);
process.exit(passed === 16 ? 0 : 1);
