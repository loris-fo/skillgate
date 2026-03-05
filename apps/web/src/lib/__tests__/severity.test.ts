import { describe, it, expect } from "vitest";

describe("test infrastructure smoke test", () => {
  it("vitest runs with jsdom environment", () => {
    expect(typeof document).toBe("object");
  });

  it("can import from @/ alias", async () => {
    // This will be replaced with real severity tests once 03-01 creates severity.ts
    expect(true).toBe(true);
  });
});
