import { describe, it, expect, vi, beforeEach } from "vitest";
import type { AuditResult } from "@skillgate/audit-engine";

// --- Mocks ---

const store = new Map<string, unknown>();

vi.mock("@/lib/kv", () => ({
  redis: {
    get: (key: string) => Promise.resolve(store.get(key) ?? null),
    set: (key: string, value: unknown) => {
      store.set(key, value);
      return Promise.resolve("OK");
    },
  },
}));

// --- Fixtures ---

const MOCK_RESULT: AuditResult = {
  overall_score: "low",
  verdict: "Low risk - appears safe for general use",
  summary: "A simple commit helper skill.",
  intent: "Automates git commit messages",
  categories: {
    hidden_logic: { score: "safe", finding: "None", detail: "Clean", by_design: false },
    data_access: { score: "safe", finding: "None", detail: "Local only", by_design: false },
    action_risk: { score: "low", finding: "Creates commits", detail: "Local git", by_design: true },
    permission_scope: { score: "safe", finding: "Minimal", detail: "None", by_design: false },
    override_attempts: { score: "safe", finding: "None", detail: "None", by_design: false },
  },
  utility_analysis: {
    what_it_does: "Generates commit messages",
    use_cases: ["Quick commits"],
    not_for: ["Complex merges"],
    trigger_behavior: "Manual",
    dependencies: ["git"],
  },
  recommendation: {
    verdict: "install",
    for_who: "Developers",
    caveats: ["Review messages"],
    alternatives: ["commitizen"],
  },
};

const SLUG = "commit-helper-abc123";
const CONTENT_HASH = "abc123def456";

// --- Tests ---

describe("GET /api/report/[id]", () => {
  beforeEach(() => {
    store.clear();
    store.set(`slug:${SLUG}`, { contentHash: CONTENT_HASH, createdAt: "2026-01-01T00:00:00Z" });
    store.set(`audit:${CONTENT_HASH}`, MOCK_RESULT);
    store.set(`hash-to-slug:${CONTENT_HASH}`, SLUG);
  });

  it("returns 200 with AuditResponse for known slug", async () => {
    const { GET } = await import("../../[id]/route");
    const request = new Request(`http://localhost:3000/api/report/${SLUG}`);
    const response = await GET(request as any, { params: Promise.resolve({ id: SLUG }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.result).toEqual(MOCK_RESULT);
    expect(data.meta.slug).toBe(SLUG);
    expect(data.meta.cached).toBe(true);
    expect(data.meta.url).toBe(`/api/report/${SLUG}`);
    expect(data.meta.badge_url).toBe(`/api/badge/${SLUG}.svg`);
  });

  it("returns 200 with AuditResponse for content hash lookup", async () => {
    const { GET } = await import("../../[id]/route");
    const request = new Request(`http://localhost:3000/api/report/${CONTENT_HASH}`);
    const response = await GET(request as any, { params: Promise.resolve({ id: CONTENT_HASH }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.result).toEqual(MOCK_RESULT);
    expect(data.meta.slug).toBe(SLUG);
    expect(data.meta.cached).toBe(true);
  });

  it("returns 404 NOT_FOUND for unknown id", async () => {
    const { GET } = await import("../../[id]/route");
    const request = new Request("http://localhost:3000/api/report/unknown-slug");
    const response = await GET(request as any, { params: Promise.resolve({ id: "unknown-slug" }) });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error.code).toBe("NOT_FOUND");
  });
});
