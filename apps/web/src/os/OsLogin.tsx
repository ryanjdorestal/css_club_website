/** /os/login — the board gate on T03's layout (run 9 §4): the public nav (compact),
    then a full-bleed field split 48 / 52. Left: navy field, + registration marks, the
    //CSS_OS · BOARD_ACCESS micro-label, the 3D cube where T03 has the pixel eye, a 5-step
    readout (LOGIN → ROSTER → SESSION → OS → AUDIT) as the pager. Right: black panel with a
    chamfered bottom-right corner — BOARD / ACCESS in the OS face, the roster dek, [1][2][3],
    the email form, 01 / 05 giant pagination. Run-8 states (LINK_SENT, cooldown, reason chips,
    never revealing roster membership) are unchanged. LOCAL_DEV picker: a strip under the
    panel, dev builds only. */
import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { brand } from "@brand/brand.config";
import { MonoLabel } from "@/components/MonoLabel";
import { Button } from "@/components/Button";
import { Nav } from "@/components/Nav";
import { StatusBar } from "@/components/StatusBar";
import { CubeSpot } from "@/cube/CubeSpot";
import { DotGrid } from "@/textures";
import { ApiStateContext } from "@/lib/readouts";
import { OsSessionProvider, useSession, type Role, type Reason } from "./session";

const REASON: Record<Reason, string> = {
  not_signed_in: "○ NOT_SIGNED_IN",
  not_on_roster: "○ NOT_ON_ROSTER",
  session_expired: "○ SESSION_EXPIRED",
};
const STEPS = ["LOGIN", "ROSTER", "SESSION", "OS", "AUDIT"];
const LIST = ["ENTER_YOUR_SCHOOL_EMAIL", "OPEN_THE_LINK_WE_SEND", "YOU'RE_IN_IF_YOU'RE_ON_THE_ROSTER"];
const input =
  "w-full bg-transparent border-0 border-b border-ink/25 px-1 py-2.5 font-mono text-sm text-ink placeholder:text-ink/30 focus:border-teal outline-none";

function Plus({ className }: { className: string }) {
  return (
    <span aria-hidden className={`absolute w-3 h-3 ${className}`}>
      <span className="absolute left-1/2 top-0 bottom-0 w-px bg-ink/50 -translate-x-1/2" />
      <span className="absolute top-1/2 left-0 right-0 h-px bg-ink/50 -translate-y-1/2" />
    </span>
  );
}

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
  // the pager fills as the login progresses: link sent → 2 (roster is checked server-side on open)
  const step = sent ? 2 : 1;

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
    <div className="grid lg:grid-cols-[48fr_52fr] min-h-[calc(100dvh-56px-76px)]">
      {/* left — the field: + marks, micro-label, the cube, the 5-step readout */}
      <div className="relative bg-navy-700 overflow-hidden max-lg:h-[42vh] flex items-center justify-center">
        <DotGrid opacity={0.06} />
        <Plus className="top-6 left-6" />
        <Plus className="top-6 right-6" />
        <Plus className="bottom-6 left-6" />
        <Plus className="bottom-6 right-6" />
        <p className="absolute top-6 left-1/2 -translate-x-1/2 t-micro raise opacity-70 whitespace-nowrap">{"//"}CSS_OS · BOARD_ACCESS</p>
        <div className="relative w-[min(60vw,420px)] max-lg:w-[min(50vw,260px)] aspect-square">
          <CubeSpot size={420} face="threeQuarter" glow={brand.palette.teal} />
        </div>
        <ol className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 t-micro raise whitespace-nowrap" aria-label="Login steps">
          {STEPS.map((s, i) => (
            <li key={s} className={`flex items-center gap-1.5 ${i < step ? "text-teal" : "opacity-60"}`}>
              <span aria-hidden className={i === step - 1 && sent ? "animate-pulse" : ""}>
                {i < step ? "●" : "○"}
              </span>
              {s}
            </li>
          ))}
        </ol>
      </div>

      {/* right — the black panel, chamfered bottom-right */}
      <div className="relative bg-navy-700 lg:pl-0 lg:pr-3 lg:pt-3 lg:pb-3 p-3 flex flex-col">
        <div
          data-tone="dark-3"
          className="relative grow flex flex-col px-7 md:px-10 pt-9 pb-4"
          style={{
            background: "var(--color-seam)",
            clipPath: "polygon(0 0, 100% 0, 100% calc(100% - min(15%, 120px)), calc(100% - min(15%, 120px)) 100%, 0 100%)",
          }}
        >
          <h1 className="t-os-display text-[clamp(40px,4.2vw,60px)] leading-[0.92]" data-testid="login-title">
            BOARD
            <br />
            ACCESS
          </h1>
          <p className="text-[15px] leading-relaxed text-muted max-w-[60ch] mt-4">
            Current {brand.shortName} board only. Access is granted by the roster: the president or webmaster adds your school email on{" "}
            <span className="text-ink">/os/board</span>.
          </p>
          <ol className="mt-6 border-t border-ink/15">
            {LIST.map((t, i) => (
              <li key={t} className="grid grid-cols-[40px_1fr] gap-3 py-2.5 border-b border-ink/15 t-label raise">
                <span className="opacity-60 tnum">[{i + 1}]</span>
                <span>{t}</span>
              </li>
            ))}
          </ol>

          {/* the form sits between the list and the pagination */}
          <div className="mt-6 max-w-[440px]">
            {shownReason && (
              <p className="mb-5 flex items-center gap-3 flex-wrap">
                <span className="t-micro raise border border-(--color-red-hi)/60 text-(--color-red-hi) px-2.5 py-1" data-testid="reason-chip">
                  {REASON[shownReason]}
                </span>
                {shownReason === "not_on_roster" && (
                  <span className="t-micro opacity-70">{actor?.email} is signed in but not an active officer this term — ask the president.</span>
                )}
              </p>
            )}
            {mode === "supabase" && (
              <form onSubmit={submit} data-testid="login-form">
                <MonoLabel accent>_school_email</MonoLabel>
                <input
                  className={input}
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@jjay.cuny.edu"
                  disabled={sent}
                  aria-label="School email"
                />
                {sent && (
                  <label className="block mt-5">
                    <MonoLabel accent>_6_digit_code (or click the link in the email)</MonoLabel>
                    <input
                      className={input}
                      inputMode="numeric"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="123456"
                      aria-label="Login code"
                    />
                  </label>
                )}
                <div className="mt-6 flex items-center gap-4 flex-wrap">
                  <Button type="submit" variant="ghost" disabled={busy}>
                    {busy ? "…" : sent ? ">_VERIFY_CODE" : ">_SEND_LOGIN_LINK"}
                  </Button>
                  {sent && (
                    <button
                      type="button"
                      disabled={cooldown > 0}
                      onClick={() => {
                        setSent(false);
                        setCode("");
                      }}
                      className="t-micro text-muted hover:text-ink disabled:opacity-40 cursor-pointer"
                    >
                      resend{cooldown > 0 ? ` in ${cooldown}s` : ""}
                    </button>
                  )}
                </div>
                {sent && !msg && (
                  <p className="t-micro text-teal mt-5" data-testid="link-sent">
                    &gt; LINK_SENT · CHECK_YOUR_INBOX
                  </p>
                )}
                {msg && <p className="t-micro text-(--color-red-hi) mt-5">{msg}</p>}
              </form>
            )}
            {mode === "unconfigured" && (
              <div>
                <MonoLabel accent>OS NOT CONFIGURED</MonoLabel>
                <p className="text-[13px] text-muted mt-2 leading-relaxed">
                  This deployment has no Supabase Auth env vars, so there is no way to sign in yet. The public site works regardless. SETUP.md turns this on in
                  8 steps.
                </p>
              </div>
            )}
            {mode === "local" && (
              <div>
                <MonoLabel accent>_school_email</MonoLabel>
                <input className={input} type="email" placeholder="you@jjay.cuny.edu" disabled aria-label="School email (disabled: no auth configured)" />
                <p className="t-micro opacity-50 mt-3">
                  Email login turns on with the Supabase env vars (SETUP.md). In this dev build use the LOCAL_DEV strip below.
                </p>
              </div>
            )}
          </div>

          <p className="t-micro opacity-40 mt-6">
            Every change made in the OS is audited.{" "}
            <Link to="/" className="text-teal u-draw">
              ← back to the site
            </Link>
          </p>
          {/* giant pagination — step of 5, flush at the bottom like T03's 1 /5 */}
          <div className="mt-auto pt-6 flex items-end justify-between t-os-display text-[clamp(40px,4.2vw,58px)] leading-none tnum">
            <span>{String(step).padStart(2, "0")}</span>
            <span className="mr-[min(15%,120px)]">/05</span>
          </div>
        </div>

        {mode === "local" && !import.meta.env.PROD && (
          <div className="mt-3 flex items-center gap-3 flex-wrap px-1 t-micro raise" data-testid="local-dev">
            <span className="text-teal">LOCAL_DEV</span>
            <span className="opacity-60">· no auth configured · dev build only · pick a role →</span>
            {(["officer", "admin"] as Role[]).map((r) => (
              <button
                key={r}
                data-testid={`local-${r}`}
                onClick={() => void loginLocal(r).then(() => navigate(next.startsWith("/os") ? next : "/os"))}
                className="t-micro raise px-3 py-1.5 border border-line text-muted hover:text-ink hover:border-teal transition-colors cursor-pointer"
              >
                {r.toUpperCase()}
              </button>
            ))}
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
        <Nav compact />
        <main data-accent="teal" data-tone="dark-2" className="relative min-h-dvh bg-navy-700 text-ink pt-14 pb-10">
          <Gate />
          <StatusBar />
        </main>
      </ApiStateContext.Provider>
    </OsSessionProvider>
  );
}
