import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { auditViaApi } from "../src/lib/api-client.js";
import type { AuditResponse } from "../src/types.js";

function makeFullResponse(
  overrides?: Partial<{ slug: string; overall_score: string }>,
): AuditResponse {
  return {
    result: {
      overall_score: (overrides?.overall_score ?? "safe") as AuditResponse["result"]["overall_score"],
      verdict: "Safe to use",
      summary: "Test summary",
      intent: "Test intent",
      categories: {
        hidden_logic: {
          score: "safe",
          finding: "None",
          detail: "No hidden logic",
          by_design: false,
        },
        data_access: {
          score: "safe",
          finding: "None",
          detail: "No data access",
          by_design: false,
        },
        action_risk: {
          score: "safe",
          finding: "None",
          detail: "No action risk",
          by_design: false,
        },
        permission_scope: {
          score: "safe",
          finding: "None",
          detail: "No permission scope",
          by_design: false,
        },
        override_attempts: {
          score: "safe",
          finding: "None",
          detail: "No override attempts",
          by_design: false,
        },
      },
      utility_analysis: {
        what_it_does: "Test",
        use_cases: [],
        not_for: [],
        trigger_behavior: "manual",
        dependencies: [],
      },
      recommendation: {
        verdict: "install",
        for_who: "everyone",
        caveats: [],
        alternatives: [],
      },
    },
    meta: {
      slug: overrides?.slug ?? "test",
      url: `https://skillgate.sh/report/${overrides?.slug ?? "test"}`,
      badge_url: `https://skillgate.sh/badge/${overrides?.slug ?? "test"}`,
      created_at: "2026-01-01T00:00:00Z",
      cached: false,
    },
  };
}

describe("auditViaApi", () => {
  const originalFetch = globalThis.fetch;
  const originalEnv = process.env.SKILLGATE_API_URL;

  beforeEach(() => {
    delete process.env.SKILLGATE_API_URL;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    if (originalEnv) {
      process.env.SKILLGATE_API_URL = originalEnv;
    } else {
      delete process.env.SKILLGATE_API_URL;
    }
  });

  it("sends POST to /api/audit with JSON body", async () => {
    const mockResponse = makeFullResponse();

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const result = await auditViaApi({ content: "skill content" });

    expect(globalThis.fetch).toHaveBeenCalledWith(
      "https://skillgate.sh/api/audit",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: "skill content" }),
      }),
    );
    expect(result).toEqual(mockResponse);
  });

  it("throws on non-ok response with error message from body", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: () =>
        Promise.resolve({
          error: { code: "VALIDATION_ERROR", message: "Invalid input" },
        }),
    });

    await expect(auditViaApi({ content: "bad" })).rejects.toThrow(
      "Invalid input",
    );
  });

  it("uses SKILLGATE_API_URL env var when set", async () => {
    process.env.SKILLGATE_API_URL = "https://custom.api.dev/api";

    const mockResponse = makeFullResponse();

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    await auditViaApi({ url: "https://example.com/SKILL.md" });

    expect(globalThis.fetch).toHaveBeenCalledWith(
      "https://custom.api.dev/api/audit",
      expect.anything(),
    );
  });
});
