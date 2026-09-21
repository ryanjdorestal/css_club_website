import { describe, expect, it } from "vitest";
import { osHeaders } from "./session";

describe("osHeaders", () => {
  it("sends nothing when signed out", () => {
    expect(osHeaders()).toEqual({});
  });
});
