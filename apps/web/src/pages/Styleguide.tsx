import { Band } from "@/components/Band";
import { Marquee } from "@/components/Marquee";
import { FinLine } from "@/components/FinLine";
import { Pullquote } from "@/components/Pullquote";
import { PhotoFrame } from "@/components/PhotoFrame";
import { TicketCard } from "@/components/cards/TicketCard";
import { SpecSheet, BigStat, MiniChart } from "@/components/cards/SpecSheet";
import { Meter } from "@/components/cards/Meter";
import { PosterCard } from "@/components/cards/PosterCard";
import { IndexList } from "@/components/cards/IndexList";
import { SlotCard } from "@/components/cards/SlotCard";
import { Readout } from "@/components/cards/StatChip";
import { StatusChip } from "@/components/cards/StatusChip";
import { Tag } from "@/components/cards/Tag";
import { Button, ButtonLink } from "@/components/Button";
import { Label } from "@/components/type/Label";
import { Decode } from "@/components/type/Decode";
import { Stencil } from "@/components/type/Stencil";
import { Outline, Ghost } from "@/components/type/Outline";
import { SplitFill } from "@/components/type/SplitFill";
import { EdgeCrop } from "@/components/type/EdgeCrop";
import { Wireframe } from "@/components/type/Wireframe";
import { DotGrid, HairGrid, Contour, Halftone, Hatch, Scanlines, CodeRain } from "@/textures";
import * as S from "@/sigils";
import { COORDS, hexId, version, buildHash } from "@/lib/readouts";
import { Brackets, Registration, Perforation, Tab, chamferStyle, ChamferStub } from "@/components/frame";

const rows = [
  { k: "PLATFORM", v: "web · ios" },
  { k: "STACK", v: "React · Swift" },
  { k: "STATUS", v: "EXAMPLE" },
];

/** /styleguide — run 3 type specimen + component sheet, compared to T01–T12. */
export default function Styleguide() {
  return (
    <main className="pt-[72px]">
      {/* ---- SPECIMEN: faces + treatments (vs T01/T02/T06/T07) ---- */}
      <Band tone="dark" accent="teal" index="00 — TYPE SPECIMEN" code="SPEC_V2" sigil={<S.CubeSigil size={16} />} rail="00 · SPECIMEN · 01010100 · V2">
        <HairGrid />
        <CodeRain className="!left-2/3" />
        <div className="relative flex justify-between items-start mb-8">
          <Label pfx="//">SCN_00 · CHAKRA / MICHROMA / SILKSCREEN / SPACE_GROTESK / JB_MONO</Label>
          <div className="text-right space-y-1">
            <p className="t-micro raise tnum">X_{COORDS.x} / Y_{COORDS.y}</p>
            <p className="t-micro opacity-55">{COORDS.place}</p>
          </div>
        </div>
        <h1 className="t-hero relative">
          <Stencil bars={[0.4, 0.64]} barColor="var(--color-navy-600)">DEBUG</Stencil>{" "}
          <Outline>YOUR MIND,</Outline>
        </h1>
        <p className="t-hero mt-2" style={{ fontSize: "clamp(44px, 7.4vw, 124px)" }}>
          COMMIT TO <SplitFill word="GROWTH." at={3} className="text-teal" />
        </p>
        <div className="mt-8 max-w-[540px]">
          <Wireframe className="t-h2 uppercase">Wireframe through type</Wireframe>
        </div>
        <div className="t-poster mt-10 text-ink/90">
          <EdgeCrop side="right"><Ghost dx={5} dy={5}>SOCIETY</Ghost></EdgeCrop>
        </div>
        <p className="t-pixel text-teal mt-8"><Decode text="1 /5 · 104 : 0768 · PIXEL COUNTERS" /></p>
        <p className="t-micro raise mt-6 tnum opacity-70">VERSION {version()}-{buildHash().toUpperCase()}</p>
      </Band>

      {/* ---- LABEL GRAMMAR + SIGILS (vs T04/T03) ---- */}
      <Band tone="dark-2" accent="red" index="01 — LABEL GRAMMAR · SIGILS" code="GRAMMAR" sigil={<S.Eye size={16} />} rail="01 · GRAMMAR · 01000111 · SPEC">
        <div className="grid md:grid-cols-2 gap-10">
          <div className="space-y-3">
            <Label pfx="/">01 WHAT THE CLUB IS ABOUT</Label><br />
            <Label pfx="//">SCN_03 · EVT_S25-01</Label><br />
            <Label pfx="_">status <span className="raise">ARCHIVED</span></Label><br />
            <Label pfx=">">RENDERING <span className="raise tnum">83%</span></Label><br />
            <Label n={1}>SHOW UP</Label><br />
            <Label pfx="●">LIVE</Label> <Label pfx="○">IDLE</Label><br />
            <Label pfx="↗">ALL EVENTS</Label><br />
            <Label pfx="X_"><span className="tnum">{COORDS.x}</span></Label> <Label pfx="Y_"><span className="tnum">{COORDS.y}</span></Label>
          </div>
          <div>
            <div className="flex flex-wrap gap-5 items-end text-ink">
              {[S.CubeSigil, S.Flag, S.Terminal, S.Node, S.Shield, S.BracketSigil, S.Crosshair, S.Chevrons, S.Star4, S.Lambda, S.Eye, S.ArrowSq, S.PlusMark, S.Tick].map((Sig, i) => (
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

      {/* ---- CARDS ON DARK (vs T05/T08/T11/T12) ---- */}
      <Band tone="dark" accent="green" index="02 — CARDS · DARK" code="CARDS_D" sigil={<S.Terminal size={16} />} rail="02 · CARDS · 01000011 · DARK">
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <TicketCard model="EVT-S25-01" title="Ticket card v2" rows={rows} href="#" body="Tab · chamfer+stub · hash · barcode · hover OPEN_TICKET." />
          <PosterCard word={"CYBER\nHOUNDS"} index="CTF_01" meta="2026" sub="PICOCTF · SPRING" />
          <SpecSheet tag="SPEC" title="Spec sheet v2" rows={rows} meter={{ label: "review", value: 66 }}>
            <BigStat value={95} suffix="%" label="jj_11 telemetry" />
            <div className="px-5 pb-4"><MiniChart points={[3, 5, 4, 8, 7, 9, 12]} /></div>
          </SpecSheet>
        </div>
        <IndexList
          rows={[
            { title: "First General Meeting", dek: "Plans and upcoming events of the semester", meta: "SEP 18", chip: "ARCHIVED", sigil: <S.Flag size={14} /> },
            { title: "Intro to AI (ChatGPT)", dek: "How chatbots work", meta: "SEP 25", sigil: <S.Node size={14} /> },
            { title: "Movie Day — Halloween", dek: "Friday the 13th + refreshments", meta: "OCT 30", chip: "PLANNED", sigil: <S.Star4 size={14} /> },
          ]}
        />
        <div className="grid md:grid-cols-4 gap-4 mt-8 items-start">
          <SlotCard n="02" label="Open" action="propose ↗" />
          <Readout value={13} suffix="+" label="workshops run" meter={72} />
          <div className="space-y-2">
            <StatusChip state="live" /> <StatusChip state="idle" /> <StatusChip state="archived" label="ARCHIVED" />
            <div className="flex gap-2 mt-2"><Tag>EXAMPLE</Tag><Tag variant="hatch">INACTIVE</Tag></div>
          </div>
          <div className="space-y-3">
            <Button>Join the society</Button>
            <Button variant="ghost">what is ctf</Button>
          </div>
        </div>
      </Band>

      {/* ---- PAPER REGISTER (vs T04 white) ---- */}
      <Band tone="light" accent="blue" index="03 — PAPER REGISTER" code="PAPER" sigil={<S.PlusMark size={16} />} rail="03 · PAPER · 01010000 · T04">
        <HairGrid opacity={0.05} />
        <div className="grid md:grid-cols-2 gap-10 items-start relative">
          <div>
            <h2 className="t-h1 !text-[clamp(32px,4.5vw,64px)]">
              PAPER, <Outline>NOT CREAM.</Outline>
            </h2>
            <p className="text-[15px] leading-[1.6] max-w-[52ch] mt-4" style={{ color: "var(--color-muted-on-paper)" }}>
              The same register on white: registration marks, hair grid, hatch strip,
              /0N indices, notched CTAs, ↗ on every card. Space Grotesk body.
            </p>
            <Pullquote cite="_source · THE_ABOUT_PAGE">Let's grow together!</Pullquote>
            <div className="flex gap-3 mt-4">
              <ButtonLink to="#" variant="primary">Explore work</ButtonLink>
              <ButtonLink to="#" variant="ghost">view manifesto</ButtonLink>
            </div>
            <Hatch className="mt-8 text-navy-900" />
          </div>
          <div className="space-y-5">
            <PhotoFrame
              src="/img/photos/club2.webp"
              alt="Club members at a general meeting"
              tag="//IMG_003"
              meta="FRAME · 003"
              caption="GENERAL_MEETING · SPRING"
              track={{ x: "12%", y: "18%", w: "30%", h: "46%", label: "SUBJ_01 · 0.92" }}
            />
            <SpecSheet tag="OK" title="Spec on paper" rows={rows} registration meter={{ label: "capacity", value: 41 }} />
          </div>
        </div>
      </Band>

      {/* ---- TEXTURES + FRAME TREATMENTS ---- */}
      <Band tone="dark-3" accent="red" index="04 — TEXTURES · FRAMES" code="TEX" sigil={<S.Crosshair size={16} />} rail="04 · TEX · 01010100 · ≤10%">
        <Scanlines />
        <Halftone corner="100% 0" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {[
            ["DotGrid", <DotGrid key="d" opacity={0.12} />],
            ["HairGrid", <HairGrid key="h" opacity={0.12} />],
            ["Contour", <Contour key="c" opacity={0.12} lines={12} />],
            ["Halftone", <Halftone key="x" opacity={0.16} corner="80% 20%" />],
          ].map(([name, tex]) => (
            <div key={name as string} className="relative h-36 border border-line overflow-hidden">
              {tex}
              <span className="absolute bottom-2 left-2 t-micro opacity-55">_{(name as string).toLowerCase()}</span>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mt-5">
          <div className="group relative h-28 border border-line"><Brackets size={12} inset={6} /><span className="absolute bottom-2 left-2 t-micro opacity-55">_brackets (hover)</span></div>
          <div className="relative h-28 border border-line"><Registration inset={8} /><span className="absolute bottom-2 left-2 t-micro opacity-55">_registration</span></div>
          <div className="relative h-28 border border-line bg-navy-800" style={chamferStyle(20)}><ChamferStub px={20} /><span className="absolute bottom-4 left-2 t-micro opacity-55">_chamfer+stub</span></div>
          <div className="relative h-28 border border-line pl-[18px]"><Tab label="EVT-S25-01" /><Perforation className="absolute top-1 left-6 right-2" /><span className="absolute bottom-2 left-7 t-micro opacity-55">_tab+perforation</span></div>
        </div>
        <p className="t-micro opacity-55 mt-6 tnum">HASH: {hexId("styleguide")} · METER ↓</p>
        <Meter label="loading sequence" value={83} className="max-w-[320px] mt-2" />
      </Band>
      <FinLine n="00" next="/" binary="01010100 01011001 01010000 01000101" />
    </main>
  );
}
