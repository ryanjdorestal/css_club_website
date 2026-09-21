/** /styleguide band: Cards — one section of the component sheet (split out of Styleguide.tsx in run 11). */
import { Band } from "@/components/Band";
import { TicketCard } from "@/components/cards/TicketCard";
import { SpecSheet, BigStat, MiniChart } from "@/components/cards/SpecSheet";
import { PosterCard } from "@/components/cards/PosterCard";
import { IndexList } from "@/components/cards/IndexList";
import { SlotCard } from "@/components/cards/SlotCard";
import { Readout } from "@/components/cards/StatChip";
import { StatusChip } from "@/components/cards/StatusChip";
import { Tag } from "@/components/cards/Tag";
import { Button } from "@/components/Button";
import * as S from "@/sigils";

const rows = [
  { k: "PLATFORM", v: "web · ios" },
  { k: "STACK", v: "React · Swift" },
  { k: "STATUS", v: "EXAMPLE" },
];

export function CardsBand() {
  return (
    <>
      {/* ---- CARDS ON DARK (vs T05/T08/T11/T12) ---- */}
      <Band tone="dark" accent="green" index="02 — CARDS · DARK" code="CARDS_D" sigil={<S.Terminal size={16} />} rail="02 · CARDS · 01000011 · DARK">
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <TicketCard model="EVT-S25-01" title="Ticket card v2" rows={rows} href="#" body="Tab · chamfer+stub · hash · barcode · hover OPEN_TICKET." />
          <PosterCard word={"CYBER\nHOUNDS"} index="CTF_01" meta="2026" sub="PICOCTF · SPRING" />
          <SpecSheet tag="SPEC" title="Spec sheet v2" rows={rows} meter={{ label: "review", value: 66 }}>
            <BigStat value={95} suffix="%" label="jj_11 telemetry" />
            <div className="px-5 pb-4">
              <MiniChart points={[3, 5, 4, 8, 7, 9, 12]} />
            </div>
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
            <div className="flex gap-2 mt-2">
              <Tag>EXAMPLE</Tag>
              <Tag variant="hatch">INACTIVE</Tag>
            </div>
          </div>
          <div className="space-y-3">
            <Button>Join the society</Button>
            <Button variant="ghost">what is ctf</Button>
          </div>
        </div>
      </Band>
    </>
  );
}
