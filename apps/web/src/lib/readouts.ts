/** §4 the readout layer — real data only, never invented. */
import { createContext, useContext } from "react";
import pkg from "../../package.json";
import board from "@data/board.json";
import events from "@data/events.json";
import resources from "@data/resources.json";
import projects from "@data/projects.json";
import workshops from "@data/workshops.json";
import kb from "@data/kb.json";

export const version = () => pkg.version as string;
export const buildHash = () => (import.meta.env.VITE_GIT_SHA as string) ?? "dev";
export const buildTime = () => (import.meta.env.VITE_BUILD_TIME as string) ?? "";

/** John Jay College, 524 W 59th St, New York NY 10019.
    Coordinates: 40.7706 N, -73.9886 W — cross-checked against the campus
    address block on 59th St between 10th/11th Ave (logged, context/25 §coords). */
export const COORDS = { x: "40.7706", y: "-73.9886", place: "NEW YORK, NY" };

export const counts = {
  officers: board.terms.reduce((a, t) => a + t.members.length, 0),
  terms: board.terms.length,
  events: events.semesters.reduce((a, s) => a + s.events.length, 0),
  resources: resources.count,
  apps: projects.projects.filter((a) => a.status !== "example").length,
  examples: projects.projects.length,
  workshops: workshops.workshops.length,
  kb: kb.entries.length,
  semesters: board.terms.length * 2,
};

export const node = () => "NODE: JJ_CSS_01";

/** 0x + first 6 hex of a stable FNV hash. */
export function hexId(str: string): string {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619);
  return "0x" + (h >>> 0).toString(16).toUpperCase().padStart(8, "0").slice(0, 6);
}

export function nyTime(): { hms: string; utc: string } {
  const now = new Date();
  const hms = now.toLocaleTimeString("en-GB", { timeZone: "America/New_York", hour12: false });
  // NY offset via Intl (UTC-4 EDT / UTC-5 EST)
  const fmt = new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", timeZoneName: "shortOffset" });
  const tz = fmt.formatToParts(now).find((p) => p.type === "timeZoneName")?.value ?? "GMT-4";
  return { hms, utc: tz.replace("GMT", "UTC") };
}

/** API liveness — set once by whoever fetches /api/health; read by nav + status bar. */
export type ApiState = { live: boolean | null; ms: number | null };
export const ApiStateContext = createContext<ApiState>({ live: null, ms: null });
export const useApiState = () => useContext(ApiStateContext);
