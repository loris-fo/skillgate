import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { auditViaApi } from "../src/lib/api-client.js";

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
    const mockResponse = {
      result: { overall_score: "safe" },
      meta: { slug: "test" },
    };

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const result = await auditViaApi({ content: "skill content" });

    expect(globalThis.fetch).toHaveBeenCalledWith(
      "https://skillgate.dev/api/audit",
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

    const mockResponse = {
      result: { overall_score: "safe" },
      meta: { slug: "test" },
    };

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
