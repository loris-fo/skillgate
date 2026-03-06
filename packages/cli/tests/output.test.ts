import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { AuditResponse } from "../src/types.js";

// Disable chalk colors for predictable assertions
process.env.FORCE_COLOR = "0";

const mockResponse: AuditResponse = {
  result: {
    overall_score: "low",
    verdict: "Generally safe with minor considerations",
    summary: "A helpful commit message generator",
    intent: "Generate commit messages",
    categories: {
      hidden_logic: {
        score: "safe",
        finding: "No hidden logic",
        detail: "Clean implementation",
        by_design: false,
      },
      data_access: {
        score: "low",
        finding: "Reads git diff",
        detail: "Accesses local git data",
        by_design: true,
      },
      action_risk: {
        score: "safe",
        finding: "No risky actions",
        detail: "Only generates text",
        by_design: false,
      },
      permission_scope: {
        score: "moderate",
        finding: "Git access",
        detail: "Needs git repository access",
        by_design: true,
      },
      override_attempts: {
        score: "safe",
        finding: "No overrides",
        detail: "Follows standard patterns",
        by_design: false,
      },
    },
    utility_analysis: {
      what_it_does: "Generates commit messages",
      use_cases: ["Quick commits"],
      not_for: ["Complex merges"],
      trigger_behavior: "On command",
      dependencies: ["git"],
    },
    recommendation: {
      verdict: "install",
      for_who: "All developers",
      caveats: [],
      alternatives: [],
    },
  },
  meta: {
    slug: "test-skill",
    url: "https://skillgate.sh/report/test-skill",
    badge_url: "https://skillgate.sh/badge/test-skill",
    created_at: "2026-01-01T00:00:00Z",
    cached: false,
  },
};

describe("output module", () => {
  let stdoutWrite: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    stdoutWrite = vi
      .spyOn(process.stdout, "write")
      .mockImplementation(() => true);
  });

  afterEach(() => {
    stdoutWrite.mockRestore();
  });

  describe("JSON mode", () => {
    it("outputs valid parseable JSON", async () => {
      const { createOutputHandler } = await import("../src/lib/output.js");
      const handler = createOutputHandler(true);
      handler.printResult(mockResponse);

      const output = stdoutWrite.mock.calls.map((c) => c[0]).join("");
      const parsed = JSON.parse(output);
      expect(parsed.result.overall_score).toBe("low");
      expect(parsed.meta.slug).toBe("test-skill");
    });

    it("startSpinner returns no-op object with all methods", async () => {
      const { createOutputHandler } = await import("../src/lib/output.js");
      const handler = createOutputHandler(true);
      const spinner = handler.startSpinner("Loading...");
      // Should not throw
      spinner.stop();
      spinner.fail("error");
      spinner.succeed("done");
      // isSpinning should be false in JSON mode
      expect(spinner.isSpinning).toBe(false);
      // text property should be writable without error
      spinner.text = "updated";
      // No output written for spinner in JSON mode
    });
  });

  describe("colored mode", () => {
    it("startSpinner returns real ora instance", async () => {
      const fakeOraInstance = {
        start: vi.fn().mockReturnThis(),
        stop: vi.fn(),
        fail: vi.fn(),
        succeed: vi.fn(),
        isSpinning: true,
        text: "",
      };
      const oraFactory = vi.fn().mockReturnValue(fakeOraInstance);

      vi.doMock("ora", () => ({ default: oraFactory }));
      // Reset module registry so output.ts re-imports the mocked ora
      vi.resetModules();
      const { createOutputHandler } = await import("../src/lib/output.js");
      const handler = createOutputHandler(false);
      const spinner = handler.startSpinner("Auditing...");

      expect(oraFactory).toHaveBeenCalledWith({
        text: "Auditing...",
        stream: process.stderr,
      });
      expect(fakeOraInstance.start).toHaveBeenCalled();
      expect(spinner).toBe(fakeOraInstance);

      vi.doUnmock("ora");
      vi.resetModules();
    });

    it("includes category names in output", async () => {
      const consoleSpy = vi
        .spyOn(console, "log")
        .mockImplementation(() => { });
      const { printCompactResult } = await import("../src/lib/output.js");
      printCompactResult(mockResponse);

      const output = consoleSpy.mock.calls.map((c) => c[0]).join("\n");
      expect(output).toContain("Hidden Logic");
      expect(output).toContain("Data Access");
      expect(output).toContain("Action Risk");
      expect(output).toContain("Permission Scope");
      expect(output).toContain("Override Attempts");
      consoleSpy.mockRestore();
    });

    it("includes report link in output", async () => {
      const consoleSpy = vi
        .spyOn(console, "log")
        .mockImplementation(() => { });
      const { printCompactResult } = await import("../src/lib/output.js");
      printCompactResult(mockResponse);

      const output = consoleSpy.mock.calls.map((c) => c[0]).join("\n");
      expect(output).toContain(
        "Full report: https://skillgate.sh/report/test-skill",
      );
      consoleSpy.mockRestore();
    });
  });

  describe("printScanTable", () => {
    it("renders table rows and pass/fail summary", async () => {
      const consoleSpy = vi
        .spyOn(console, "log")
        .mockImplementation(() => { });
      const { printScanTable } = await import("../src/lib/output.js");

      printScanTable([
        { file: "skill-a.md", response: mockResponse },
        {
          file: "skill-b.md",
          error: "Network error",
        },
      ]);

      const output = consoleSpy.mock.calls.map((c) => c[0]).join("\n");
      expect(output).toContain("skill-a.md");
      expect(output).toContain("skill-b.md");
      // Should have summary with pass/fail counts
      expect(output).toMatch(/1.*passed/i);
      expect(output).toMatch(/1.*failed/i);
      consoleSpy.mockRestore();
    });
  });
});
