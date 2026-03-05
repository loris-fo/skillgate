import { describe, it, expect, vi, beforeEach } from "vitest";
import { createEngine } from "../src/engine.js";
import { AuditError } from "../src/types.js";
import type { AuditResult } from "../src/types.js";
import type { Cache } from "../src/cache.js";

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

function createMockAnthropicClient() {
  return {
    messages: {
      create: vi.fn(async () => ({
        id: "msg_mock",
        type: "message" as const,
        role: "assistant" as const,
        model: "claude-sonnet-4-20250514",
        content: [
          {
            type: "tool_use" as const,
            id: "toolu_mock",
            name: "record_audit",
            input: VALID_AUDIT_RESULT,
          },
        ],
        stop_reason: "tool_use" as const,
        usage: { input_tokens: 100, output_tokens: 200 },
      })),
    },
  };
}

function createMockCache(): Cache & { getCached: ReturnType<typeof vi.fn>; setCached: ReturnType<typeof vi.fn> } {
  return {
    getCached: vi.fn(async () => null),
    setCached: vi.fn(async () => {}),
  };
}

describe("engine", () => {
  let mockClient: ReturnType<typeof createMockAnthropicClient>;
  let mockCache: ReturnType<typeof createMockCache>;
  let auditSkill: (content: string) => Promise<AuditResult>;

  beforeEach(() => {
    mockClient = createMockAnthropicClient();
    mockCache = createMockCache();
    const engine = createEngine({
      anthropicClient: mockClient as never,
      cache: mockCache,
    });
    auditSkill = engine.auditSkill;
  });

  it("returns valid AuditResult with all 5 categories", async () => {
    const result = await auditSkill("# My Skill\nDoes something useful.");

    expect(result).toEqual(VALID_AUDIT_RESULT);
    expect(result.categories.hidden_logic).toBeDefined();
    expect(result.categories.data_access).toBeDefined();
    expect(result.categories.action_risk).toBeDefined();
    expect(result.categories.permission_scope).toBeDefined();
    expect(result.categories.override_attempts).toBeDefined();
  });

  it("throws AuditError with code INPUT_TOO_LARGE for content over 100KB", async () => {
    const largeContent = "x".repeat(100_001);

    await expect(auditSkill(largeContent)).rejects.toThrow(AuditError);
    await expect(auditSkill(largeContent)).rejects.toMatchObject({
      code: "INPUT_TOO_LARGE",
    });
    expect(mockClient.messages.create).not.toHaveBeenCalled();
  });

  it("throws AuditError for empty/whitespace-only content", async () => {
    await expect(auditSkill("")).rejects.toThrow(AuditError);
    await expect(auditSkill("   \n\t  ")).rejects.toThrow(AuditError);
  });

  it("returns cached result without second API call", async () => {
    mockCache.getCached.mockResolvedValueOnce(VALID_AUDIT_RESULT);

    const result = await auditSkill("# Cached Skill\nAlready audited.");

    expect(result).toEqual(VALID_AUDIT_RESULT);
    expect(mockClient.messages.create).not.toHaveBeenCalled();
    expect(mockCache.getCached).toHaveBeenCalled();
  });

  it("throws AuditError with code API_ERROR on API failure", async () => {
    mockClient.messages.create.mockRejectedValueOnce(
      new Error("Connection timeout")
    );

    await expect(
      auditSkill("# Failing Skill\nThis will fail.")
    ).rejects.toThrow(AuditError);
    await expect(
      auditSkill("# Failing Skill\nThis will fail.")
    ).rejects.toMatchObject({ code: "API_ERROR" });
    // Errors should not be cached
    expect(mockCache.setCached).not.toHaveBeenCalled();
  });

  it("throws AuditError with code VALIDATION_ERROR on malformed Claude response", async () => {
    mockClient.messages.create.mockResolvedValueOnce({
      id: "msg_mock",
      type: "message" as const,
      role: "assistant" as const,
      model: "claude-sonnet-4-20250514",
      content: [
        {
          type: "tool_use" as const,
          id: "toolu_mock",
          name: "record_audit",
          input: { broken: true }, // Invalid structure
        },
      ],
      stop_reason: "tool_use" as const,
      usage: { input_tokens: 100, output_tokens: 200 },
    });

    await expect(
      auditSkill("# Bad Response\nWill get malformed result.")
    ).rejects.toThrow(AuditError);
    await expect(
      auditSkill("# Bad Response\nWill get malformed result.")
    ).rejects.toMatchObject({ code: "VALIDATION_ERROR" });
    expect(mockCache.setCached).not.toHaveBeenCalled();
  });

  it("includes XML fence in user message (prompt injection defense)", async () => {
    await auditSkill("# Test Skill\nContent here.");

    const call = mockClient.messages.create.mock.calls[0]![0];
    const userMessage = (call as { messages: Array<{ content: string }> }).messages[0]!.content;
    expect(userMessage).toContain("<skill_content>");
    expect(userMessage).toContain("</skill_content>");
    expect(userMessage).toContain("UNTRUSTED user input");
  });

  it("does not throw when no tool_use block in response", async () => {
    mockClient.messages.create.mockResolvedValueOnce({
      id: "msg_mock",
      type: "message" as const,
      role: "assistant" as const,
      model: "claude-sonnet-4-20250514",
      content: [
        {
          type: "text" as const,
          text: "I cannot use tools right now.",
        },
      ],
      stop_reason: "end_turn" as const,
      usage: { input_tokens: 100, output_tokens: 50 },
    });

    await expect(
      auditSkill("# No Tool\nResponse without tool use.")
    ).rejects.toMatchObject({ code: "VALIDATION_ERROR" });
  });
});
