/** OS session: who is signed in and how to call the API as them.
    Supabase Auth (email OTP / magic link) when VITE_SUPABASE_URL + ANON_KEY are
    set; otherwise the LOCAL_DEV role picker — never in production builds.
    The API decides the role (roster lookup); this only carries the token.
    Used by OsLayout, OsLogin and every OS page (via osFetch). */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type Role = "guest" | "officer" | "admin";
export type Actor = { email: string; role: Role; name: string; profile_id: string | null; term: string | null; source: string };
export type Mode = "supabase" | "local" | "unconfigured";

const URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const ANON = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
const LOCAL_KEY = "jjcss-os-role";

let supabase: SupabaseClient | null = null;
function client(): SupabaseClient | null {
  if (!URL || !ANON) return null;
  return (supabase ??= createClient(URL, ANON, { auth: { persistSession: true, autoRefreshToken: true } }));
}

/** Module-level credentials so osFetch works outside React. */
const creds: { token: string | null; localRole: string | null } = { token: null, localRole: null };

export function osHeaders(): Record<string, string> {
  if (creds.token) return { Authorization: `Bearer ${creds.token}` };
  if (creds.localRole) return { "X-Local-Role": creds.localRole };
  return {};
}

/** The one OS request helper: JSON in/out, auth headers, errors as values. */
export async function osFetch<T = Record<string, unknown>>(
  path: string,
  init: { method?: string; body?: unknown; form?: FormData } = {},
): Promise<{ ok: boolean; status: number; data: T; error?: string }> {
  try {
    const res = await fetch(path, {
      method: init.method ?? (init.body || init.form ? "POST" : "GET"),
      headers: { ...(init.form ? {} : { "Content-Type": "application/json" }), ...osHeaders() },
      body: init.form ?? (init.body !== undefined ? JSON.stringify(init.body) : undefined),
      signal: AbortSignal.timeout(12000),
    });
    const data = (await res.json().catch(() => ({}))) as T & { detail?: unknown };
    const detail = data.detail;
    const error = typeof detail === "string" ? detail : detail ? JSON.stringify(detail) : undefined;
    return { ok: res.ok, status: res.status, data, error: res.ok ? undefined : (error ?? `HTTP ${res.status}`) };
  } catch (e) {
    return { ok: false, status: 0, data: {} as T, error: `API unreachable (${String(e).slice(0, 60)})` };
  }
}

type Session = {
  actor: Actor | null;
  mode: Mode;
  loading: boolean;
  loginLocal: (role: Role) => Promise<void>;
  sendMagicLink: (email: string) => Promise<string | null>;
  verifyOtp: (email: string, token: string) => Promise<string | null>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const Ctx = createContext<Session | null>(null);

export function OsSessionProvider({ children }: { children: ReactNode }) {
  const sb = client();
  const mode: Mode = sb ? "supabase" : import.meta.env.PROD ? "unconfigured" : "local";
  const [actor, setActor] = useState<Actor | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const r = await osFetch<Actor & { ok: boolean }>("/api/whoami");
    setActor(r.ok ? r.data : null);
    setLoading(false);
  }, []);

  useEffect(() => {
    (async () => {
      if (sb) {
        const { data } = await sb.auth.getSession();
        creds.token = data.session?.access_token ?? null;
        sb.auth.onAuthStateChange((_e, s) => {
          creds.token = s?.access_token ?? null;
          void refresh();
        });
      } else if (mode === "local") {
        creds.localRole = sessionStorage.getItem(LOCAL_KEY);
      }
      await refresh();
    })();
  }, [sb, mode, refresh]);

  const value = useMemo<Session>(
    () => ({
      actor,
      mode,
      loading,
      loginLocal: async (role) => {
        sessionStorage.setItem(LOCAL_KEY, role);
        creds.localRole = role;
        await refresh();
      },
      sendMagicLink: async (email) => {
        if (!sb) return "auth not configured";
        const { error } = await sb.auth.signInWithOtp({ email, options: { emailRedirectTo: `${location.origin}/os` } });
        return error?.message ?? null;
      },
      verifyOtp: async (email, token) => {
        if (!sb) return "auth not configured";
        const { error } = await sb.auth.verifyOtp({ email, token, type: "email" });
        return error?.message ?? null;
      },
      logout: async () => {
        await sb?.auth.signOut();
        sessionStorage.removeItem(LOCAL_KEY);
        creds.token = null;
        creds.localRole = null;
        setActor(null);
      },
      refresh,
    }),
    [actor, mode, loading, sb, refresh],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSession(): Session {
  const s = useContext(Ctx);
  if (!s) throw new Error("useSession outside OsSessionProvider");
  return s;
}
