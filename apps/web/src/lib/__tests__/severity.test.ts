import { describe, it, expect } from "vitest";
import { SEVERITY_CONFIG, VERDICT_CONFIG } from "@/lib/severity";

describe("SEVERITY_CONFIG", () => {
  it("has entries for all five score levels", () => {
    const scores = ["safe", "low", "moderate", "high", "critical"];
    for (const score of scores) {
      expect(SEVERITY_CONFIG[score as keyof typeof SEVERITY_CONFIG]).toBeDefined();
    }
  });

  it("percent increases with severity", () => {
    const ordered = ["safe", "low", "moderate", "high", "critical"] as const;
    for (let i = 1; i < ordered.length; i++) {
      expect(SEVERITY_CONFIG[ordered[i]].percent).toBeGreaterThan(
        SEVERITY_CONFIG[ordered[i - 1]].percent
      );
    }
  });

  it("each entry has color, bg, percent, and label", () => {
    for (const config of Object.values(SEVERITY_CONFIG)) {
      expect(config.color).toMatch(/^text-/);
      expect(config.bg).toMatch(/^bg-/);
      expect(config.percent).toBeGreaterThanOrEqual(0);
      expect(config.label).toBeTruthy();
    }
  });
});

describe("VERDICT_CONFIG", () => {
  it("has entries for all four verdict types", () => {
    const verdicts = ["install", "install_with_caution", "review_first", "avoid"];
    for (const v of verdicts) {
      expect(VERDICT_CONFIG[v]).toBeDefined();
    }
  });

  it("each entry has color, bg, and label", () => {
    for (const config of Object.values(VERDICT_CONFIG)) {
      expect(config.color).toMatch(/^text-/);
      expect(config.bg).toMatch(/^bg-/);
      expect(config.label).toBeTruthy();
    }
  });
});
