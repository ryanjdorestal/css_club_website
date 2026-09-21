import { describe, expect, it } from "vitest";
import { parseMd } from "./md";

describe("parseMd (the one markdown renderer)", () => {
  it("reads frontmatter", () => {
    expect(parseMd("---\ntitle: Hi\ndate: 2026-01-01\n---\n\nbody").meta).toEqual({ title: "Hi", date: "2026-01-01" });
  });
  it("splits headings and paragraphs", () => {
    const d = parseMd("## One\n\npara one\n\n## Two\n\npara two");
    expect(d.blocks.map((b) => b.type)).toEqual(["h2", "p", "h2", "p"]);
    expect(d.blocks[0].text).toBe("One");
  });
  it("joins soft line breaks inside a paragraph", () => {
    expect(parseMd("a\nb\nc").blocks[0].text).toBe("a b c");
  });
  it("handles an empty body", () => {
    expect(parseMd("").blocks).toEqual([]);
    expect(parseMd("---\ntitle: x\n---\n").blocks).toEqual([]);
  });
  it("keeps a colon inside a frontmatter value", () => {
    expect(parseMd("---\nsource: repo@a8fca55 file.html\n---\n").meta.source).toBe("repo@a8fca55 file.html");
  });
  it("ignores blank chunks", () => {
    expect(parseMd("\n\n\npara\n\n\n").blocks).toHaveLength(1);
  });
});
