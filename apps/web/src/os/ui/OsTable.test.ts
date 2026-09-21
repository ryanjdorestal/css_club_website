import { describe, expect, it } from "vitest";
import { ago, fmt } from "./OsTable";

describe("OsTable helpers", () => {
  it("ago: today / 1 d / n d", () => {
    const now = Date.now() / 1000;
    expect(ago(now)).toBe("today");
    expect(ago(now - 86400 * 1.2)).toBe("1 d ago");
    expect(ago(now - 86400 * 5)).toBe("5 d ago");
  });
  it("ago: ISO dates and garbage", () => {
    expect(ago("2000-01-01")).toMatch(/d ago$/);
    expect(ago("nope")).toBe("—");
    expect(ago(null)).toBe("—");
  });
  it("fmt joins arrays and prints booleans", () => {
    expect(fmt(["a", "b"])).toBe("a · b");
    expect(fmt(true)).toBe("yes");
    expect(fmt(false)).toBe("no");
    expect(fmt({ k: 1 })).toBe('{"k":1}');
  });
  it("fmt renders a dash element for empty values", () => {
    expect(typeof fmt(null)).toBe("object");
    expect(typeof fmt("")).toBe("object");
  });
});
