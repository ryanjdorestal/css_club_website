/** /styleguide band: Folder — one section of the component sheet (split out of Styleguide.tsx in run 11). */
import { Band } from "@/components/Band";
import * as S from "@/sigils";
import { FolderCard } from "@/components/cards/FolderCard";

export function FolderBand() {
  return (
    <>
      {/* ---- FOLDER CARDS (run 9 §3, vs T11) ---- */}
      <Band tone="dark-2" accent="blue" index="00b — FOLDER CARDS · T11" code="FOLDER" sigil={<S.Node size={16} />} rail="00b · FOLDER · 01000110 · T11">
        <div className="grid md:grid-cols-4 gap-6 items-stretch">
          <FolderCard tab="INH · F26" tone="navy" edgeLabel="//ROSTER_001" barcode="roster-f26" className="min-h-[260px]">
            <p className="text-[17px] font-medium leading-tight">Roster — Fall 2026</p>
            <p className="t-micro opacity-60 mt-2">OWNERS · THE BOARD · 2026-09-21</p>
            <p className="text-[13px] text-(--tone-muted) mt-3 leading-relaxed">Who held which seat, with the emails that get OS access.</p>
          </FolderCard>
          <FolderCard
            tab="CMD™ · MODEL S21Y4"
            tone="paper"
            split={0.55}
            edgeLabel="//PRJ_0719"
            lower={<p className="t-label raise">UMC · MODEL E15W8</p>}
            className="min-h-[260px]"
          >
            <p className="t-label raise">PERFORMANCE</p>
            <p className="t-kpi text-[40px] mt-2">0.719</p>
          </FolderCard>
          <FolderCard tab="PRESIDENT" tone="red" mirrorTab edgeLabel="BRD-F26-01" className="min-h-[260px]">
            <div className="w-16 h-16 bg-navy-900/40 mb-3" />
            <p className="text-[17px] font-medium leading-tight">Officer Name</p>
            <p className="t-micro opacity-70 mt-1">F26 · PRESIDENT</p>
          </FolderCard>
          <FolderCard tab="DISCORD" tone="teal" mirrorTab chamfer="bl" edgeLabel="//JOIN_01" className="min-h-[260px]">
            <p className="text-[17px] font-medium leading-tight">The club Discord</p>
            <p className="text-[13px] mt-2 opacity-80 leading-relaxed">Where everything is announced first. Ask anything in #general.</p>
          </FolderCard>
        </div>
      </Band>
    </>
  );
}
