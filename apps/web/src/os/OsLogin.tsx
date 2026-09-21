/** /os/login — Supabase email OTP / magic link when configured; the
    LOCAL_DEV role picker otherwise (never in production builds). A login
    only succeeds if the email is on the current term's roster — the API
    decides; this screen just reports what /api/whoami said. */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { brand } from "@brand/brand.config";
import { MonoLabel } from "@/components/MonoLabel";
import { BinaryRings } from "@/components/BinaryRings";
import { Button } from "@/components/Button";
import { OsSessionProvider, useSession, type Role } from "./session";

const input = "w-full bg-transparent border-0 border-b border-line px-1 py-2.5 font-mono text-sm text-ink placeholder:text-muted/40 focus:border-teal outline-none";

function LoginCard() {
  const navigate = useNavigate();
  const { actor, mode, loading, loginLocal, sendMagicLink, verifyOtp, refresh } = useSession();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!loading && actor && actor.role !== "guest") navigate("/os", { replace: true });
  }, [actor, loading, navigate]);

  return (
    <div className="relative w-[min(92vw,440px)] border border-line bg-navy-800 p-8">
      <div className="flex items-center gap-3 mb-6">
        <img src={brand.logos.svg} alt="" className="w-9 h-9" />
        <div>
          <p className="font-display font-extrabold uppercase text-sm">{brand.shortName} OS</p>
          <MonoLabel>{brand.name} · board platform</MonoLabel>
        </div>
      </div>

      {mode === "supabase" && (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            setMsg(null);
            if (!sent) {
              const err = await sendMagicLink(email.trim());
              setMsg(err ?? "Check your inbox — a 6-digit code and a magic link are on the way.");
              if (!err) setSent(true);
            } else {
              const err = await verifyOtp(email.trim(), code.trim());
              if (err) setMsg(err);
              else {
                await refresh();
                setMsg("Signed in — checking the roster…");
              }
            }
            setBusy(false);
          }}
        >
          <label className="block mb-4">
            <span className="mono-label text-muted">CLUB / SCHOOL EMAIL</span>
            <input className={input} type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@jjay.cuny.edu" disabled={sent} />
          </label>
          {sent && (
            <label className="block mb-4">
              <span className="mono-label text-muted">6-DIGIT CODE (or click the link)</span>
              <input className={input} inputMode="numeric" value={code} onChange={(e) => setCode(e.target.value)} placeholder="123456" />
            </label>
          )}
          <Button type="submit" variant="ghost" disabled={busy}>
            {busy ? "…" : sent ? ">_verify_code" : ">_send_magic_link"}
          </Button>
          {actor?.role === "guest" && actor.email && <p className="t-micro text-(--color-red-hi) mt-4">{actor.email} is signed in but not on this term's roster. Ask an admin to add you on /os/board.</p>}
        </form>
      )}

      {mode === "local" && (
        <>
          <div className="border border-teal/40 bg-teal/5 px-3 py-2 mb-5">
            <MonoLabel accent>LOCAL_DEV — no auth configured</MonoLabel>
            <p className="text-xs text-muted mt-1 leading-relaxed">Pick a role to explore the OS. Real login (email code) turns on with the Supabase env vars — see SETUP.md. This picker never ships in production builds.</p>
          </div>
          <div className="grid gap-2">
            {(["officer", "admin"] as Role[]).map((r) => (
              <button key={r} onClick={() => void loginLocal(r).then(() => navigate("/os"))} className="mono-label text-left px-4 py-3 border border-line text-muted hover:text-ink hover:border-teal transition-colors cursor-pointer">
                → {r}
              </button>
            ))}
          </div>
        </>
      )}

      {mode === "unconfigured" && (
        <div className="border border-line px-3 py-3">
          <MonoLabel accent>OS NOT CONFIGURED</MonoLabel>
          <p className="text-xs text-muted mt-1 leading-relaxed">This deployment has no Supabase Auth env vars, so there is no way to sign in. The public site works regardless. SETUP.md §2 turns this on.</p>
        </div>
      )}

      {msg && <p className="t-micro text-teal mt-4">{msg}</p>}
      <p className="t-micro opacity-40 mt-6">Board members only. Everything you change here is audited.</p>
    </div>
  );
}

export default function OsLogin() {
  return (
    <OsSessionProvider>
      <main data-accent="teal" className="relative min-h-dvh flex items-center justify-center bg-navy-900 overflow-hidden text-ink">
        <BinaryRings opacity={0.06} />
        <LoginCard />
      </main>
    </OsSessionProvider>
  );
}
