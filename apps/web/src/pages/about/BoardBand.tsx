/** /about → THE BOARD: the most recent board with seats as folder cards with the dossier layout, and the
    term history as an accordion (run 9). Split out of About.tsx in run 11. */
import { useState } from "react";
import type boardData from "@data/board.json";
import { Band } from "@/components/Band";
import { FolderCard } from "@/components/cards/FolderCard";
import { MonoLabel } from "@/components/MonoLabel";
import { RevealGroup, RevealItem } from "@/motion/Reveal";
import * as Sg from "@/sigils";

type Term = (typeof boardData)["terms"][number];

export function BoardBand({ current, alumni, currentLabel }: { current: Term; alumni: Term[]; currentLabel: string }) {
  const [open, setOpen] = useState<string | null>(null);
  return (
    <>
      {/* 5 — The Board + term history */}
      <Band
        tone="light-2"
        accent="green"
        sigil={<Sg.Eye size={16} />}
        code="INHERITANCE"
        index="04 — THE BOARD"
        title={`${currentLabel}${current.term.toUpperCase()} · MOST RECENT ON RECORD`}
        rail="04 · BOARD · 01000010 · INHERITANCE"
      >
        <RevealGroup className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-14">
          {current.members.slice(0, 8).map((m) => (
            <RevealItem key={m.name}>
              {/* run 9: officer = a folder (T11) — tab = role, edge label = the board id, dossier layout inside */}
              <FolderCard
                as="article"
                tab={m.role.toUpperCase()}
                tone="paper"
                edgeLabel={`BRD-${current.term
                  .replace(/[^A-Z0-9]/gi, "")
                  .slice(0, 3)
                  .toUpperCase()}-${String(current.members.indexOf(m) + 1).padStart(2, "0")}`}
                className="h-full"
              >
                {m.photo && (
                  <img
                    src={`/${m.photo}`}
                    alt={m.name}
                    width={400}
                    height={400}
                    loading="lazy"
                    decoding="async"
                    className="w-full aspect-square object-cover object-top"
                  />
                )}
                {/* the dossier sheet (R9_05): micro caps keys over values */}
                <dl className="mt-3 grid grid-cols-[46px_1fr] gap-x-2 gap-y-0.5">
                  <dt className="t-micro opacity-60 pt-0.5">NAME</dt>
                  <dd className="t-h3 !text-[14px] !font-medium leading-tight">{m.name}</dd>
                  <dt className="t-micro opacity-60 pt-0.5">ROLE</dt>
                  <dd className="t-micro raise text-(--accent-ink)">{m.role.toUpperCase()}</dd>
                  <dt className="t-micro opacity-60 pt-0.5">TERM</dt>
                  <dd className="t-micro raise">{current.term.toUpperCase()}</dd>
                </dl>
              </FolderCard>
            </RevealItem>
          ))}
        </RevealGroup>
        <p className="mono-label mb-4" style={{ color: "var(--tone-muted)" }}>
          TERM HISTORY · FALL 2020 → · THE INHERITANCE
        </p>
        <div className="border-t border-(--tone-line)">
          {alumni.map((t) => (
            <div key={t.term} className="border-b border-(--tone-line)">
              <button
                onClick={() => setOpen(open === t.term ? null : t.term)}
                aria-expanded={open === t.term}
                className="w-full flex items-center gap-6 py-4 cursor-pointer group"
              >
                <span className="mono-label text-(--accent-ink) w-8 text-left">{open === t.term ? "−" : "+"}</span>
                <span className="font-display font-bold text-lg" style={{ fontStretch: "108%" }}>
                  {t.term}
                </span>
                <span className="mono-label ml-auto" style={{ color: "var(--tone-muted)" }}>
                  {t.members.length} MEMBERS
                </span>
              </button>
              {open === t.term && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 pb-6">
                  {t.members.map((m) => (
                    <div key={m.name} className="border border-(--tone-line) bg-paper p-3">
                      <p className="font-display font-bold text-sm leading-tight" style={{ fontStretch: "108%" }}>
                        {m.name}
                      </p>
                      <MonoLabel className="!text-(--accent)">{m.role}</MonoLabel>
                      {m.bio && (
                        <p className="text-xs mt-2 line-clamp-3" style={{ color: "var(--tone-muted)" }}>
                          {m.bio}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </Band>
    </>
  );
}
