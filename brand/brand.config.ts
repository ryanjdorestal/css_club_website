/**
 * brand.config.ts — the single source of club identity.
 * Components read from here; nothing club-specific is hardcoded anywhere else.
 * Values sourced from context/02 (old site), context/05 (design system), context/14 (links).
 */

export const brand = {
  name: "Computer Science Society",
  shortName: "CSS",
  college: "John Jay College of Criminal Justice",
  collegeShort: "John Jay College",
  cuny: "CUNY",
  campusAddress: "524 W 59th St, New York, NY 10019",
  // jjay.cuny.edu footer (run 6): address / phone / map query — the footer MapCard + address block read these
  campus: {
    street: "524 West 59th Street",
    city: "New York, NY 10019",
    phone: "212.237.8000",
    phoneHref: "+12122378000",
    mapsQuery: "524+W+59th+St,+New+York,+NY+10019",
    lat: 40.7706,
    lng: -73.9886,
  },
  email: "computersocjjay@gmail.com",
  githubOrg: "https://github.com/jjcss",
  site: "https://jjaycss.tech",

  taglines: {
    primary: "Debug Your Mind, Commit To Growth!",
    ticker: "Algorithm Thinking | Dev Journeys | Tech Motivation",
  },

  mascot: {
    name: "Hound",
    animal: "Bloodhound",
  },

  subclubs: {
    cyberhounds: {
      name: "Cyberhounds",
      tagline: "The CTF sub-club",
    },
  },

  logos: {
    svg: "/img/brand/cs_logo_sharp.svg",
    cubeGlb: "/cube/cs_cube.glb",
    cubeHeroPng: "/cube/hero_transparent.png",
  },

  // Section accent map — one accent per section (DESIGN.md).
  // Red C = Events, Green S = Projects (apps, tools, research), Blue S = Join/community.
  accents: {
    events: "red",
    cyberhounds: "red",
    projects: "green",
    join: "blue",
    about: "blue",
    resources: "blue",
    news: "blue",
  } as const,

  palette: {
    navy900: "#0C183C",
    navy800: "#12294A",
    navy700: "#183C60",
    navy600: "#1E4664",
    navy500: "#305484",
    ink: "#F4F7FB",
    muted: "#9DB0C4",
    line: "#2A4460",
    teal: "#6ED2E6",
    red: "#B3202A",
    redHi: "#E0242C",
    redDeep: "#7A1119",
    green: "#40A33F",
    blue: "#1E80F0",
    cubeRed: "#D82028",
    cubeGreen: "#70B840",
    cubeBlue: "#2058A0",
    light: "#F5F7FA",
    seam: "#1A1618",
  },

  kbPath: "/data/kb.json",

  source: {
    oldRepo: "https://github.com/jjcss/CSS_Website",
    commit: "a8fca55",
    license: "MIT © 2022 Computer Science Society Club at John Jay College",
  },
} as const;

export type Brand = typeof brand;
export type SectionAccent = "red" | "green" | "blue";
