import { describe, it, expect, vi, beforeEach } from "vitest";
import type { AuditResult } from "@skillgate/audit-engine";

// --- Mocks ---

const mockLimit = vi.fn();
vi.mock("@/lib/rate-limit", () => ({
  auditRateLimiter: { limit: (...args: unknown[]) => mockLimit(...args) },
}));

const mockRedis = {
  get: vi.fn(),
  set: vi.fn(),
};
vi.mock("@/lib/kv", () => ({
  redis: {
    get: (...args: unknown[]) => mockRedis.get(...args),
    set: (...args: unknown[]) => mockRedis.set(...args),
  },
}));

const mockAuditSkill = vi.fn();
vi.mock("@skillgate/audit-engine", () => ({
  auditSkill: (...args: unknown[]) => mockAuditSkill(...args),
  AuditError: class AuditError extends Error {
    readonly code: string;
    constructor(message: string, code: string) {
      super(message);
      this.name = "AuditError";
      this.code = code;
    }
  },
  buildCacheKey: (content: string) => {
    const { createHash } = require("node:crypto");
    return createHash("sha256").update(content.trim()).digest("hex") + ":v1";
  },
}));

// --- Fixtures ---

const MOCK_RESULT: AuditResult = {
  overall_score: "low",
  verdict: "Low risk - appears safe for general use",
  summary: "A simple commit helper skill.",
  intent: "Automates git commit messages",
  categories: {
    hidden_logic: {
      score: "safe",
      finding: "No hidden logic detected",
      detail: "Clean implementation",
      by_design: false,
    },
    data_access: {
      score: "safe",
      finding: "No data access beyond git",
      detail: "Only accesses local git repo",
      by_design: false,
    },
    action_risk: {
      score: "low",
      finding: "Creates git commits",
      detail: "Only writes to local git repository",
      by_design: true,
    },
    permission_scope: {
      score: "safe",
      finding: "Minimal scope",
      detail: "No external permissions required",
      by_design: false,
    },
    override_attempts: {
      score: "safe",
      finding: "No override attempts",
      detail: "Does not attempt to override system prompts",
      by_design: false,
    },
  },
  utility_analysis: {
    what_it_does: "Generates commit messages from staged changes",
    use_cases: ["Quick commits", "Consistent messages"],
    not_for: ["Complex merge commits"],
    trigger_behavior: "Manual invocation only",
    dependencies: ["git"],
  },
  recommendation: {
    verdict: "install",
    for_who: "Developers who want automated commit messages",
    caveats: ["Review generated messages before pushing"],
    alternatives: ["commitizen"],
  },
};

const VALID_CONTENT = "# Commit Helper\n\nA skill that helps write commit messages.";

function makeRequest(body: unknown, headers?: Record<string, string>) {
  return new Request("http://localhost:3000/api/audit", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}

// --- Tests ---

describe("POST /api/audit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLimit.mockResolvedValue({ success: true, reset: 0 });
    mockRedis.get.mockResolvedValue(null);
    mockRedis.set.mockResolvedValue("OK");
    mockAuditSkill.mockResolvedValue(MOCK_RESULT);
  });

  it("returns 200 with AuditResponse for valid content", async () => {
    const { POST } = await import("../route");
    const request = makeRequest({ content: VALID_CONTENT });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.result).toBeDefined();
    expect(data.meta).toBeDefined();
    expect(data.meta.slug).toMatch(/^commit-helper-[a-f0-9]{6}$/);
    expect(data.meta.url).toMatch(/^\/api\/report\/.+$/);
    expect(data.meta.badge_url).toMatch(/^\/api\/badge\/.+\.svg$/);
    expect(data.meta.created_at).toBeDefined();
    expect(data.meta.cached).toBe(false);
  });

  it("returns 422 VALIDATION_ERROR for empty content", async () => {
    const { POST } = await import("../route");
    const request = makeRequest({ content: "" });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(422);
    expect(data.error.code).toBe("VALIDATION_ERROR");
  });

  it("returns 422 VALIDATION_ERROR for missing content field", async () => {
    const { POST } = await import("../route");
    const request = makeRequest({ foo: "bar" });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(422);
    expect(data.error.code).toBe("VALIDATION_ERROR");
  });

  it("returns 413 INPUT_TOO_LARGE for content exceeding 100KB", async () => {
    const { POST } = await import("../route");
    const largeContent = "# Big Skill\n" + "x".repeat(101_000);
    const request = makeRequest({ content: largeContent });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(413);
    expect(data.error.code).toBe("INPUT_TOO_LARGE");
  });

  it("returns 429 RATE_LIMITED with Retry-After header", async () => {
    const resetTime = Date.now() + 60_000;
    mockLimit.mockResolvedValue({ success: false, reset: resetTime });

    const { POST } = await import("../route");
    const request = makeRequest({ content: VALID_CONTENT });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(429);
    expect(data.error.code).toBe("RATE_LIMITED");
    expect(response.headers.get("Retry-After")).toBeDefined();
  });

  it("returns cached: true and same slug for repeated content", async () => {
    const existingSlug = "commit-helper-abc123";
    // hash-to-slug lookup returns existing slug
    mockRedis.get.mockImplementation((key: string) => {
      if (key.startsWith("hash-to-slug:")) return Promise.resolve(existingSlug);
      if (key === `slug:${existingSlug}`)
        return Promise.resolve({ contentHash: "abc123", createdAt: "2026-01-01T00:00:00Z" });
      if (key.startsWith("audit:"))
        return Promise.resolve(MOCK_RESULT);
      return Promise.resolve(null);
    });

    const { POST } = await import("../route");
    const request = makeRequest({ content: VALID_CONTENT });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.meta.cached).toBe(true);
    expect(data.meta.slug).toBe(existingSlug);
    // Should NOT have called auditSkill since it was cached
    expect(mockAuditSkill).not.toHaveBeenCalled();
  });

  it("meta.url matches /api/report/{slug}", async () => {
    const { POST } = await import("../route");
    const request = makeRequest({ content: VALID_CONTENT });

    const response = await POST(request as any);
    const data = await response.json();

    expect(data.meta.url).toBe(`/api/report/${data.meta.slug}`);
  });

  it("meta.badge_url matches /api/badge/{slug}.svg", async () => {
    const { POST } = await import("../route");
    const request = makeRequest({ content: VALID_CONTENT });

    const response = await POST(request as any);
    const data = await response.json();

    expect(data.meta.badge_url).toBe(`/api/badge/${data.meta.slug}.svg`);
  });

  it("handles cached result with string-encoded nested fields", async () => {
    const existingSlug = "commit-helper-abc123";
    // Simulate Upstash returning nested fields as JSON strings (the double-serialization bug)
    const stringifiedResult = {
      ...MOCK_RESULT,
      categories: JSON.stringify(MOCK_RESULT.categories),
      utility_analysis: JSON.stringify(MOCK_RESULT.utility_analysis),
      recommendation: JSON.stringify(MOCK_RESULT.recommendation),
    };

    mockRedis.get.mockImplementation((key: string) => {
      if (key.startsWith("hash-to-slug:")) return Promise.resolve(existingSlug);
      if (key === `slug:${existingSlug}`)
        return Promise.resolve({ contentHash: "abc123", createdAt: "2026-01-01T00:00:00Z" });
      if (key.startsWith("audit:"))
        return Promise.resolve(stringifiedResult);
      return Promise.resolve(null);
    });

    const { POST } = await import("../route");
    const request = makeRequest({ content: VALID_CONTENT });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    // These must be objects, not strings
    expect(typeof data.result.categories).toBe("object");
    expect(typeof data.result.utility_analysis).toBe("object");
    expect(typeof data.result.recommendation).toBe("object");
    // Verify deep structure is intact
    expect(data.result.categories.hidden_logic.score).toBe("safe");
    expect(data.result.utility_analysis.what_it_does).toBe("Generates commit messages from staged changes");
    expect(data.result.recommendation.verdict).toBe("install");
  });
});
