import { describe, it, expect, vi, afterEach } from "vitest";
import { fetchWithRetry } from "../src/lib/retry.js";

describe("fetchWithRetry", () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("returns response on first successful attempt", async () => {
    const mockResponse = { ok: true, status: 200 };
    globalThis.fetch = vi.fn().mockResolvedValue(mockResponse);

    const result = await fetchWithRetry("https://api.test/audit", {
      method: "POST",
    });

    expect(result).toBe(mockResponse);
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
  });

  it("retries on network error up to maxRetries", async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error("network error"));

    await expect(
      fetchWithRetry("https://api.test/audit", { method: "POST" }, 2),
    ).rejects.toThrow("network error");

    expect(globalThis.fetch).toHaveBeenCalledTimes(2);
  }, 15_000);

  it("succeeds on retry after initial failure", async () => {
    const mockResponse = { ok: true, status: 200 };
    globalThis.fetch = vi
      .fn()
      .mockRejectedValueOnce(new Error("network error"))
      .mockResolvedValue(mockResponse);

    const result = await fetchWithRetry(
      "https://api.test/audit",
      { method: "POST" },
      3,
    );

    expect(result).toBe(mockResponse);
    expect(globalThis.fetch).toHaveBeenCalledTimes(2);
  }, 15_000);
});
