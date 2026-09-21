/** The admin-only term rollover wizard on /os/board (run 8): confirm the next term's id and dates → tick who
    continues (cloned as inactive) → the result. The parent owns the wizard state; this file only renders the
    three steps and calls back. */
import { Button } from "@/components/Button";
import { MonoLabel } from "@/components/MonoLabel";
import { KeyVal, Notice, Panel } from "../ui/OsPage";
import type { Row } from "../ui/OsTable";

export type Rollover = {
  step: 1 | 2 | 3;
  next_id: string;
  next_label: string;
  starts_on: string;
  ends_on: string;
  continuing: string[];
  result?: Row;
};

const TERM_FIELDS: [keyof Rollover, string, string][] = [
  ["next_id", "NEXT TERM ID", "S27"],
  ["next_label", "NEXT TERM LABEL", "Spring 2027"],
  ["starts_on", "STARTS (YYYY-MM-DD)", "2027-01-25"],
  ["ends_on", "ENDS (YYYY-MM-DD)", "2027-05-20"],
];

type Props = { roll: Rollover; setRoll: (r: Rollover | null) => void; current?: Row; officers: Row[]; busy: boolean; onRun: () => void };

export function RolloverWizard(props: Props) {
  const { roll, setRoll } = props;
  return (
    <Panel title={`TERM ROLLOVER · STEP ${roll.step}/3`} onClose={() => setRoll(null)}>
      {roll.step === 1 && <StepDates {...props} />}
      {roll.step === 2 && <StepContinuing {...props} />}
      {roll.step === 3 && <StepDone {...props} />}
    </Panel>
  );
}

function StepDates({ roll, setRoll, current }: Props) {
  return (
    <div className="space-y-4">
      <KeyVal rows={[{ k: "CLOSING", v: `${current?.label ?? "—"} (${current?.id ?? "—"})` }]} />
      {TERM_FIELDS.map(([k, l, ph]) => (
        <label key={k} className="block">
          <span className="mono-label text-muted">{l}</span>
          <input
            className="w-full bg-transparent border-0 border-b border-line px-1 py-2 font-mono text-[13px] text-ink focus:border-teal outline-none"
            placeholder={ph}
            value={String(roll[k])}
            onChange={(e) => setRoll({ ...roll, [k]: e.target.value })}
          />
        </label>
      ))}
      <Button variant="ghost" disabled={!roll.next_id || !roll.next_label} onClick={() => setRoll({ ...roll, step: 2 })}>
        next: who continues →
      </Button>
    </div>
  );
}

function StepContinuing({ roll, setRoll, officers, busy, onRun }: Props) {
  const toggle = (id: string, on: boolean) => setRoll({ ...roll, continuing: on ? [...roll.continuing, id] : roll.continuing.filter((x) => x !== id) });
  return (
    <div className="space-y-3">
      <MonoLabel>Who continues into {roll.next_label}? (cloned as inactive — you confirm each after)</MonoLabel>
      {officers.map((o) => (
        <label key={String(o.id)} className="flex items-center gap-3 text-[13px] cursor-pointer">
          <input type="checkbox" checked={roll.continuing.includes(String(o.id))} onChange={(e) => toggle(String(o.id), e.target.checked)} />
          <span className="text-ink">{String(o.name)}</span>
          <span className="text-muted">{String(o.role_title ?? "")}</span>
        </label>
      ))}
      <div className="flex gap-2 pt-2">
        <Button variant="ghost" onClick={() => setRoll({ ...roll, step: 1 })}>
          ← back
        </Button>
        <Button variant="primary" disabled={busy} onClick={onRun}>
          {busy ? "rolling…" : "roll the term"}
        </Button>
      </div>
    </div>
  );
}

function StepDone({ roll, setRoll }: Props) {
  const cloned = (roll.result?.cloned as unknown[] | undefined)?.length ?? 0;
  return (
    <div className="space-y-3">
      <Notice kind="ok">
        Closed {String(roll.result?.closed)} · opened {roll.next_id} · {cloned} continuing · {String(roll.result?.handoff_stubs)} handoff stubs filed.
      </Notice>
      <p className="text-[13px] text-muted">
        Next: open each continuing officer and set ACTIVE on; add the new officers with their emails; ask everyone from the closed term to file their handoff on
        /os/inheritance.
      </p>
      <Button variant="ghost" onClick={() => setRoll(null)}>
        done
      </Button>
    </div>
  );
}
