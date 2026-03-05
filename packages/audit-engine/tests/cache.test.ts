import { describe, it, expect, vi, beforeEach } from "vitest";
import { createCache } from "../src/cache.js";
import type { AuditResult } from "../src/types.js";

const VALID_AUDIT_RESULT: AuditResult = {
  overall_score: "low",
  verdict: "Generally safe with minor concerns",
  summary: "This skill performs file operations within its stated scope.",
  intent: "Helps organize project files by type.",
  categories: {
    hidden_logic: {
      score: "safe",
      finding: "No hidden logic detected",
      detail: "All operations are transparent and match the skill description.",
      by_design: false,
    },
    data_access: {
      score: "low",
      finding: "Reads project files",
      detail: "Accesses files in the current directory only.",
      by_design: true,
    },
    action_risk: {
      score: "low",
      finding: "Moves files between directories",
      detail: "File move operations could cause issues if interrupted.",
      by_design: true,
    },
    permission_scope: {
      score: "safe",
      finding: "Stays within project directory",
      detail: "No access to files outside the working directory.",
      by_design: false,
    },
    override_attempts: {
      score: "safe",
      finding: "No override attempts",
      detail: "Does not attempt to modify Claude's behavior.",
      by_design: false,
    },
  },
  utility_analysis: {
    what_it_does: "Organizes project files into directories by file type.",
    use_cases: ["Cleaning up messy project directories", "Sorting downloads"],
    not_for: ["Production deployment", "System-wide file management"],
    trigger_behavior: "Runs when asked to organize or sort files.",
    dependencies: ["Node.js fs module"],
  },
  recommendation: {
    verdict: "install",
    for_who: "Developers who want automated file organization.",
    caveats: ["Back up files before first use"],
    alternatives: ["Manual file sorting", "OS-level file organizers"],
  },
};

function createMockRedis() {
  const store = new Map<string, unknown>();
  return {
    get: vi.fn(async (key: string) => store.get(key) ?? null),
    set: vi.fn(async (key: string, value: unknown) => {
      store.set(key, value);
      return "OK";
    }),
    _store: store,
  };
}

describe("cache", () => {
  let mockRedis: ReturnType<typeof createMockRedis>;
  let cache: ReturnType<typeof createCache>;

  beforeEach(() => {
    mockRedis = createMockRedis();
    // createCache accepts a Redis instance; our mock is compatible enough
    cache = createCache(mockRedis as never);
  });

  it("getCached returns null on cache miss", async () => {
    const result = await cache.getCached("nonexistent-key");
    expect(result).toBeNull();
    expect(mockRedis.get).toHaveBeenCalledWith("nonexistent-key");
  });

  it("getCached returns AuditResult on cache hit with valid data", async () => {
    mockRedis._store.set("valid-key", VALID_AUDIT_RESULT);

    const result = await cache.getCached("valid-key");
    expect(result).toEqual(VALID_AUDIT_RESULT);
  });

  it("getCached returns null when cached data fails Zod validation (schema mismatch)", async () => {
    const invalidData = { overall_score: "unknown_value", broken: true };
    mockRedis._store.set("invalid-key", invalidData);

    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const result = await cache.getCached("invalid-key");
    expect(result).toBeNull();
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("Cache validation failed")
    );

    warnSpy.mockRestore();
  });

  it("setCached stores value in Redis", async () => {
    await cache.setCached("store-key", VALID_AUDIT_RESULT);

    expect(mockRedis.set).toHaveBeenCalledWith("store-key", VALID_AUDIT_RESULT);
    expect(mockRedis._store.get("store-key")).toEqual(VALID_AUDIT_RESULT);
  });
});
