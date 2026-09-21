/** /os/login — the board gate. Left: who this is for and how access works.
    Right: the email login (Supabase OTP / magic link). A non-roster email
    gets the same "link sent" message (the API audits a login_denied row
    instead). LOCAL_DEV role picker sits BELOW the real form, dev builds only.
    ?reason= shows why /os bounced; ?next= is where to go after. */
import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { brand } from "@brand/brand.config";
import { MonoLabel } from "@/components/MonoLabel";
import { BinaryRings } from "@/components/BinaryRings";
import { Button } from "@/components/Button";
import { Brackets } from "@/components/frame";
import { Stencil } from "@/components/type/Stencil";
import { Outline } from "@/components/type/Outline";
import { Label } from "@/components/type/Label";
import { StatusBar } from "@/components/StatusBar";
import { ApiStateContext } from "@/lib/readouts";
import { OsSessionProvider, useSession, type Role, type Reason } from "./session";

const REASON: Record<Reason, string> = {
  not_signed_in: "○ NOT_SIGNED_IN",
  not_on_roster: "○ NOT_ON_ROSTER",
  session_expired: "○ SESSION_EXPIRED",
};
const input = "w-full bg-transparent border-0 border-b border-line px-1 py-2.5 font-mono text-sm text-ink placeholder:text-muted/40 focus:border-teal outline-none";
const MODULES = "posts, projects, events, resources, members, the board roster and the inheritance spine";

function Gate() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = params.get("next") || "/os";
  const reason = (params.get("reason") as Reason | null) ?? null;
  const { actor, mode, loading, loginLocal, sendMagicLink, verifyOtp, refresh } = useSession();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && actor && actor.role !== "guest") navigate(next.startsWith("/os") ? next : "/os", { replace: true });
  }, [actor, loading, navigate, next]);
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const onRoster = actor?.role === "guest" && !!actor.email;
  const shownReason = onRoster ? "not_on_roster" : reason;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    if (!sent) {
      const err = await sendMagicLink(email.trim());
      // never reveal roster membership: the message is identical for every email
      if (err && !/rate|429/i.test(err)) setMsg(err);
      setSent(true);
      setCooldown(60);
    } else {
      const err = await verifyOtp(email.trim(), code.trim());
      if (err) setMsg(err);
      else await refresh();
    }
    setBusy(false);
  }

  return (
    <div className="relative max-w-[1180px] w-[92vw] grid lg:grid-cols-[6fr_5fr] gap-10 lg:gap-16 items-center">
      {/* left — who this is for */}
      <div>
        <Label pfx="//">CSS_OS · {brand.shortName}_BOARD_PLATFORM</Label>
        <h1 className="t-h1 !text-[clamp(44px,7vw,96px)] !leading-[0.92] mt-4">
          <span className="block"><Stencil bars={[0.5]} barColor="var(--color-navy-900)">BOARD</Stencil></span>
          <span className="block"><Outline>ACCESS.</Outline></span>
        </h1>
        <p className="text-[16px] leading-relaxed text-muted max-w-[52ch] mt-6">
          For the current {brand.name} board only. CSS OS is where the board writes {MODULES} — everything the public site
          shows, plus what the next board needs to know. Access is granted by the roster: if you're on the board and can't
          get in, the president or webmaster adds your school email on <span className="text-ink">/os/board</span>.
        </p>
        {shownReason && (
          <p className="mt-6 inline-flex items-center gap-3">
            <span className="t-micro raise border border-(--color-red-hi)/60 text-(--color-red-hi) px-2.5 py-1" data-testid="reason-chip">{REASON[shownReason]}</span>
            {shownReason === "not_on_roster" && <span className="t-micro opacity-70">{actor?.email} is signed in but not an active officer this term — ask the president.</span>}
          </p>
        )}
        <p className="t-micro opacity-40 mt-8">Every change made in the OS is audited. <Link to="/" className="text-teal u-draw">← back to the site</Link></p>
      </div>

      {/* right — the gate */}
      <div className="relative">
        <div className="group relative border border-line bg-navy-800/60 p-6 md:p-8">
          <Brackets size={16} inset={-1} />
          {mode === "supabase" && (
            <form onSubmit={submit} data-testid="login-form">
              <MonoLabel accent>_school_email</MonoLabel>
              <input className={input} type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@jjay.cuny.edu" disabled={sent} aria-label="School email" />
              {sent && (
                <label className="block mt-5">
                  <MonoLabel accent>_6_digit_code (or click the link in the email)</MonoLabel>
                  <input className={input} inputMode="numeric" value={code} onChange={(e) => setCode(e.target.value)} placeholder="123456" aria-label="Login code" />
                </label>
              )}
              <div className="mt-6 flex items-center gap-4 flex-wrap">
                <Button type="submit" variant="ghost" disabled={busy}>{busy ? "…" : sent ? ">_VERIFY_CODE" : ">_SEND_LOGIN_LINK"}</Button>
                {sent && (
                  <button type="button" disabled={cooldown > 0} onClick={() => { setSent(false); setCode(""); }} className="t-micro text-muted hover:text-ink disabled:opacity-40 cursor-pointer">
                    resend{cooldown > 0 ? ` in ${cooldown}s` : ""}
                  </button>
                )}
              </div>
              {sent && !msg && <p className="t-micro text-teal mt-5" data-testid="link-sent">&gt; LINK_SENT · CHECK_YOUR_INBOX</p>}
              {msg && <p className="t-micro text-(--color-red-hi) mt-5">{msg}</p>}
            </form>
          )}
          {mode === "unconfigured" && (
            <div>
              <MonoLabel accent>OS NOT CONFIGURED</MonoLabel>
              <p className="text-[13px] text-muted mt-2 leading-relaxed">This deployment has no Supabase Auth env vars, so there is no way to sign in yet. The public site works regardless. SETUP.md turns this on in 8 steps.</p>
            </div>
          )}
          {mode === "local" && (
            <div>
              <MonoLabel accent>_school_email</MonoLabel>
              <input className={input} type="email" placeholder="you@jjay.cuny.edu" disabled aria-label="School email (disabled: no auth configured)" />
              <p className="t-micro opacity-50 mt-3">Email login turns on with the Supabase env vars (SETUP.md). In this dev build use the LOCAL_DEV panel below.</p>
            </div>
          )}
        </div>

        {mode === "local" && !import.meta.env.PROD && (
          <div className="mt-4 border border-teal/40 bg-teal/5 p-5" data-testid="local-dev">
            <MonoLabel accent>LOCAL_DEV — no auth configured · dev build only</MonoLabel>
            <p className="t-micro opacity-60 mt-1">Pick a role to explore the OS. This panel never ships in production.</p>
            <div className="flex gap-2 mt-3">
              {(["officer", "admin"] as Role[]).map((r) => (
                <button key={r} data-testid={`local-${r}`} onClick={() => void loginLocal(r).then(() => navigate(next.startsWith("/os") ? next : "/os"))} className="mono-label px-4 py-2.5 border border-line text-muted hover:text-ink hover:border-teal transition-colors cursor-pointer">
                  → {r}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function OsLogin() {
  return (
    <OsSessionProvider>
      <ApiStateContext.Provider value={{ live: true, ms: null }}>
        <main data-accent="teal" data-tone="dark-3" className="relative min-h-dvh flex items-center justify-center bg-navy-900 overflow-hidden text-ink py-24">
          <BinaryRings opacity={0.05} />
          <Gate />
          <StatusBar />
        </main>
      </ApiStateContext.Provider>
    </OsSessionProvider>
  );
}
