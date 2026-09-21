/** /styleguide band: Type — one section of the component sheet (split out of Styleguide.tsx in run 11). */
import { Band } from "@/components/Band";
import { Label } from "@/components/type/Label";
import { Stencil } from "@/components/type/Stencil";
import { Outline } from "@/components/type/Outline";
import { SplitFill } from "@/components/type/SplitFill";
import { HairGrid } from "@/textures";
import * as S from "@/sigils";

export function TypeBand() {
  return (
    <>
      {/* ---- TYPE v5 (run 10): Turret Road · Michroma · Martian Mono · Silkscreen — every role at its size ---- */}
      <Band
        tone="dark-3"
        accent="teal"
        index="00 — TYPE V5 · THE GAME FACE"
        code="TYPE_V5"
        sigil={<S.CubeSigil size={16} />}
        rail="00 · TYPE_V5 · 01010100 · TURRET"
      >
        <HairGrid />
        <Label pfx="//" className="block mb-6">
          TURRET_ROAD 800 · MICHROMA 400 · MARTIAN_MONO 500 · SILKSCREEN 700 · EVIDENCE ~/Desktop/jjay_css_refs/run10/{"{"}mock_turret, demon_compare,
          spec_sheet, mono_sheet{"}"}.png
        </Label>
        <div className="grid lg:grid-cols-2 gap-10 items-start">
          <div>
            <h1 className="t-hero" style={{ fontSize: "clamp(40px, 5.6vw, 84px)" }}>
              <span className="block">
                <Stencil bars={[0.38, 0.64]} barColor="var(--color-navy-900)">
                  DEBUG
                </Stencil>
              </span>
              <span className="block">
                <Outline>YOUR MIND,</Outline>
              </span>
              <span className="block">COMMIT TO</span>
              <span className="block text-teal">
                <SplitFill word="GROWTH." at={3} />
              </span>
            </h1>
            <p className="t-dek text-muted mt-5 !max-w-[50ch] !text-[15px]">
              A community driven club with the aim of helping computer science students succeed in their career. Every semester we make it our goal to have
              unique events.
            </p>
            <p className="t-poster mt-8" style={{ fontSize: "clamp(48px, 7vw, 112px)" }}>
              <span className="block">CYBER</span>
              <span className="block text-red-hi">HOUNDS</span>
            </p>
          </div>
          <div className="space-y-6">
            {[
              ["t-hero", "HERO · 800 · clamp(52, 8.8vw, 148)", "DEBUG"],
              ["t-h1", "H1 · 800 · clamp(40, 6vw, 96)", "Projects. Built."],
              ["t-h2", "H2 · 700 · clamp(28, 3.6vw, 48)", "What the club is about"],
              ["t-h3", "H3 · 700 · clamp(19, 2vw, 26)", "Git / GitHub"],
              ["t-stat tnum", "STAT · 800 · tabular slashed-zero", "0.719 / 1,592"],
            ].map(([cls, l, t]) => (
              <div key={cls}>
                <p className="t-micro opacity-55 mb-1">{l}</p>
                <p className={cls}>{t}</p>
              </div>
            ))}
            <div>
              <p className="t-micro opacity-55 mb-1">WIDE · MICHROMA 400 · fin lines, brandmark</p>
              <p className="t-wide text-[22px] tracking-[0.2em]">END_OF_SECTION · 01</p>
            </div>
            <div>
              <p className="t-micro opacity-55 mb-1">DEK · MARTIAN MONO 500 · 17/1.6 · +.03em</p>
              <p className="t-dek">Brutal and relentless, the dek line is the S01 body register.</p>
            </div>
            <div>
              <p className="t-micro opacity-55 mb-1">LABEL 11 · MARTIAN MONO 500 · MICRO 9 · JETBRAINS MONO</p>
              <p className="t-label">
                <span className="pfx">//</span> SCN_01 · X_40.7706 · <span className="pfx">●</span> LIVE
              </p>
              <p className="t-micro mt-1">_status ARCHIVED · &gt; RENDERING 83% · [1] SHOW UP</p>
            </div>
            <div>
              <p className="t-micro opacity-55 mb-1">OS DISPLAY · SILKSCREEN 700 · ≥ 20 px</p>
              <p className="t-os-display text-[40px]">BOARD ACCESS</p>
            </div>
            <div>
              <p className="t-micro opacity-55 mb-1">BODY · SPACE GROTESK 400 · 16/1.65 · paragraphs over 3 lines only</p>
              <p className="text-[16px] leading-[1.65] text-muted max-w-[52ch]">
                The Computer Science Society meets and hosts events that provide opportunities for networking, educational, and professional development related
                to computer science and technology.
              </p>
            </div>
          </div>
        </div>
      </Band>
    </>
  );
}
