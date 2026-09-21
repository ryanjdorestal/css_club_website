import { describe, expect, it } from "vitest";
import { brand } from "@brand/brand.config";
import projects from "@data/projects.json";
import terms from "@data/terms.json";

describe("Tier-1 fallback contract (what useApi starts from)", () => {
  it("projects.json has published rows with a kind", () => {
    expect(projects.projects.length).toBeGreaterThan(0);
    expect(projects.projects.every((p) => ["app", "project", "research", "tool"].includes(p.kind))).toBe(true);
  });
  it("exactly one current term", () => {
    expect(terms.terms.filter((t) => t.is_current)).toHaveLength(1);
  });
  it("brand config carries the campus + palette the OS reads", () => {
    expect(brand.campus.mapsQuery).toContain("59th");
    expect(brand.palette.red).toMatch(/^#[0-9A-F]{6}$/i);
    expect(brand.accents.projects).toBe("green");
  });
});
