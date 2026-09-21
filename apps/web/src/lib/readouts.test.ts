import { describe, expect, it } from "vitest";
import { hexId, nyTime, COORDS, counts, version } from "./readouts";

describe("readouts (status-bar helpers)", () => {
  it("hexId is stable and hex", () => {
    expect(hexId("abc")).toBe(hexId("abc"));
    expect(hexId("abc")).not.toBe(hexId("abd"));
    expect(hexId("x")).toMatch(/^0x[0-9A-F]+$/i);
  });
  it("nyTime returns hh:mm:ss and a UTC offset label", () => {
    const t = nyTime();
    expect(t.hms).toMatch(/^\d{2}:\d{2}:\d{2}$/);
    expect(t.utc).toMatch(/UTC/);
  });
  it("coordinates are John Jay's", () => {
    expect(COORDS.x).toBe("40.7706");
    expect(COORDS.y).toBe("-73.9886");
  });
  it("counts come from the committed data", () => {
    expect(Object.values(counts).every((n) => typeof n === "number" && n >= 0)).toBe(true);
  });
  it("version is a semver-ish string", () => {
    expect(version()).toMatch(/^\d+\.\d+\.\d+/);
  });
});
