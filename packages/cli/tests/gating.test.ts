import { describe, it, expect } from "vitest";
import { isBlocked } from "../src/lib/gating.js";

describe("isBlocked", () => {
  it("blocks high score", () => {
    expect(isBlocked("high")).toBe(true);
  });

  it("blocks critical score", () => {
    expect(isBlocked("critical")).toBe(true);
  });

  it("passes safe score", () => {
    expect(isBlocked("safe")).toBe(false);
  });

  it("passes low score", () => {
    expect(isBlocked("low")).toBe(false);
  });

  it("passes moderate score", () => {
    expect(isBlocked("moderate")).toBe(false);
  });
});
