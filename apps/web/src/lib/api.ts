/** Tier-1 write helper: try the API; when it's unreachable, store the payload
    in a local browser inbox and succeed honestly with stored:"local-browser".
    The site never shows a dead form. */

export type SubmitResult = { ok: boolean; stored: "api" | "local-browser"; error?: string };

export async function postWithFallback(path: string, payload: unknown): Promise<SubmitResult> {
  try {
    const res = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) return { ok: true, stored: "api" };
    throw new Error(`HTTP ${res.status}`);
  } catch {
    try {
      const key = "jjcss-inbox";
      const inbox = JSON.parse(localStorage.getItem(key) ?? "[]");
      inbox.push({ path, payload, ts: new Date().toISOString() });
      localStorage.setItem(key, JSON.stringify(inbox));
      return { ok: true, stored: "local-browser" };
    } catch (e) {
      return { ok: false, stored: "local-browser", error: String(e) };
    }
  }
}
