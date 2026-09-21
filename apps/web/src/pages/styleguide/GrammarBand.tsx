/** /styleguide band: Grammar — one section of the component sheet (split out of Styleguide.tsx in run 11). */
import { Band } from "@/components/Band";
import { Marquee } from "@/components/Marquee";
import { Label } from "@/components/type/Label";
import * as S from "@/sigils";
import { COORDS } from "@/lib/readouts";

export function GrammarBand() {
  return (
    <>
      {/* ---- LABEL GRAMMAR + SIGILS (vs T04/T03) ---- */}
      <Band tone="dark-2" accent="red" index="01 — LABEL GRAMMAR · SIGILS" code="GRAMMAR" sigil={<S.Eye size={16} />} rail="01 · GRAMMAR · 01000111 · SPEC">
        <div className="grid md:grid-cols-2 gap-10">
          <div className="space-y-3">
            <Label pfx="/">01 WHAT THE CLUB IS ABOUT</Label>
            <br />
            <Label pfx="//">SCN_03 · EVT_S25-01</Label>
            <br />
            <Label pfx="_">
              status <span className="raise">ARCHIVED</span>
            </Label>
            <br />
            <Label pfx=">">
              RENDERING <span className="raise tnum">83%</span>
            </Label>
            <br />
            <Label n={1}>SHOW UP</Label>
            <br />
            <Label pfx="●">LIVE</Label> <Label pfx="○">IDLE</Label>
            <br />
            <Label pfx="↗">ALL EVENTS</Label>
            <br />
            <Label pfx="X_">
              <span className="tnum">{COORDS.x}</span>
            </Label>{" "}
            <Label pfx="Y_">
              <span className="tnum">{COORDS.y}</span>
            </Label>
          </div>
          <div>
            <div className="flex flex-wrap gap-5 items-end text-ink">
              {[
                S.CubeSigil,
                S.Flag,
                S.Terminal,
                S.Node,
                S.Shield,
                S.BracketSigil,
                S.Crosshair,
                S.Chevrons,
                S.Star4,
                S.Lambda,
                S.Eye,
                S.ArrowSq,
                S.PlusMark,
                S.Tick,
              ].map((Sig, i) => (
                <Sig key={i} size={i === 0 ? 48 : 24} />
              ))}
            </div>
            <div className="mt-6 flex items-end gap-8">
              <S.CSSKufic size={64} className="text-teal" />
              <S.HoundPixel size={64} />
            </div>
          </div>
        </div>
      </Band>

      <Marquee items={["ALGORITHM THINKING", "DEV JOURNEYS", "TECH MOTIVATION", "DEBUG YOUR MIND"]} />
    </>
  );
}
