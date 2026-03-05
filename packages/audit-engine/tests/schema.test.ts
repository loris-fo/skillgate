import { describe, it, expect } from "vitest";
import { auditResultSchema } from "../src/schema.js";

const mockCategory = {
  score: "low" as const,
  finding: "No hidden logic detected",
  detail: "The skill file contains straightforward instructions with no obfuscated code.",
  by_design: false,
};

const mockAuditResult = {
  overall_score: "low" as const,
  verdict: "This skill is generally safe with minor concerns.",
  summary: "A simple coding assistant skill with no significant security risks.",
  intent: "Provides code review suggestions based on best practices.",
  categories: {
    hidden_logic: { ...mockCategory },
    data_access: { ...mockCategory, score: "safe" as const },
    action_risk: { ...mockCategory, score: "safe" as const },
    permission_scope: { ...mockCategory, score: "low" as const },
    override_attempts: { ...mockCategory, score: "safe" as const },
  },
  utility_analysis: {
    what_it_does: "Reviews code and suggests improvements",
    use_cases: ["Code review", "Best practice enforcement"],
    not_for: ["Production deployments", "Security auditing"],
    trigger_behavior: "Activates when user asks for code review",
    dependencies: ["None"],
  },
  recommendation: {
    verdict: "install" as const,
    for_who: "Developers wanting automated code review suggestions",
    caveats: ["May suggest opinionated style changes"],
    alternatives: ["ESLint", "Prettier"],
  },
};

describe("auditResultSchema", () => {
  it("validates a valid audit result", () => {
    const result = auditResultSchema.parse(mockAuditResult);
    expect(result).toEqual(mockAuditResult);
  });

  it("rejects missing required field (no categories)", () => {
    const { categories, ...withoutCategories } = mockAuditResult;
    expect(() => auditResultSchema.parse(withoutCategories)).toThrow();
  });

  it("rejects invalid score enum value", () => {
    const invalid = {
      ...mockAuditResult,
      overall_score: "unknown",
    };
    expect(() => auditResultSchema.parse(invalid)).toThrow();
  });

  it("requires all 5 category names", () => {
    const { hidden_logic, ...missingOne } = mockAuditResult.categories;
    const invalid = {
      ...mockAuditResult,
      categories: missingOne,
    };
    expect(() => auditResultSchema.parse(invalid)).toThrow();
  });

  it("requires by_design boolean per category", () => {
    const invalid = {
      ...mockAuditResult,
      categories: {
        ...mockAuditResult.categories,
        hidden_logic: {
          score: "low",
          finding: "test",
          detail: "test",
          // by_design missing
        },
      },
    };
    expect(() => auditResultSchema.parse(invalid)).toThrow();
  });

  it("validates utility_analysis fields", () => {
    const invalid = {
      ...mockAuditResult,
      utility_analysis: {
        what_it_does: 123, // should be string
      },
    };
    expect(() => auditResultSchema.parse(invalid)).toThrow();
  });

  it("enforces recommendation verdict enum", () => {
    const invalid = {
      ...mockAuditResult,
      recommendation: {
        ...mockAuditResult.recommendation,
        verdict: "maybe",
      },
    };
    expect(() => auditResultSchema.parse(invalid)).toThrow();
  });
});
