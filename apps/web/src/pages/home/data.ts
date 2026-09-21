/** Shared data for the Home sections (parsed once at module load). Composed by pages/Home.tsx. */
import events from "@data/events.json";
import resources from "@data/resources.json";
import projectsData from "@data/projects.json";
import links from "@data/links.json";
import collaborate from "@data/collaborate.json";
import homeRaw from "@content/home.md?raw";
import { parseMd } from "@/lib/md";

const home = parseMd(homeRaw);
export function bandCopy(title: string): string {
  const i = home.blocks.findIndex((b) => b.type === "h2" && b.text === title);
  return i >= 0 && home.blocks[i + 1]?.type === "p" ? home.blocks[i + 1].text : "";
}
export const heroDek = home.blocks.find((b) => b.type === "p")?.text ?? "";
export const exampleApps = projectsData.projects;

export const GALLERY = [
  { src: "/img/photos/club2.webp", cap: "GENERAL_MEETING · SPRING" },
  { src: "/img/photos/intro-cyb-group-pic.webp", cap: "INTRO_TO_CYBERSECURITY" },
  { src: "/img/photos/involvement-fair-fall-2022.webp", cap: "INVOLVEMENT_FAIR · FALL_2022" },
  { src: "/img/photos/shirt-event.webp", cap: "CLUB_MERCH_DAY" },
  { src: "/img/photos/invol-fair.webp", cap: "TABLING · ATRIUM" },
  { src: "/img/photos/cybersecurity.webp", cap: "SECURITY_WORKSHOP" },
];

export { events, resources, links, collaborate };
