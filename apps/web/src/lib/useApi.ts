/** The one data-fetch hook for public pages: API first, the committed JSON
    second. `data` is never undefined — it starts as the fallback and swaps to
    the API payload when it arrives with the same shape. `source` tells the
    status bar where it came from. Used by News, Events, Resources, About,
    Projects, Home. */
import { useEffect, useState } from "react";

type ApiSource = "static" | "local" | "db" | "loading";

export function useApi<T>(path: string, fallback: T, enabled = true): { data: T; source: ApiSource } {
  const [state, setState] = useState<{ data: T; source: ApiSource }>({ data: fallback, source: enabled ? "loading" : "static" });
  useEffect(() => {
    if (!enabled) return;
    let alive = true;
    fetch(path, { signal: AbortSignal.timeout(3500) })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((json: T & { ok?: boolean; source?: ApiSource }) => {
        if (!alive || json.ok === false) throw new Error("bad payload");
        setState({ data: json, source: json.source ?? "db" });
      })
      .catch(() => alive && setState({ data: fallback, source: "static" }));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, enabled]);
  return state;
}
