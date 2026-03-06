import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock modules before importing scan command
vi.mock("glob", () => ({
  glob: vi.fn(),
}));

vi.mock("node:fs", () => ({
  readFileSync: vi.fn(),
}));

vi.mock("../../src/lib/api-client.js", () => ({
  auditViaApi: vi.fn(),
}));

vi.mock("../../src/lib/output.js", () => ({
  createOutputHandler: vi.fn(),
  printScanTable: vi.fn(),
}));

vi.mock("../../src/lib/gating.js", () => ({
  isBlocked: vi.fn(),
}));

import { glob } from "glob";
import { readFileSync } from "node:fs";
import { scanCommand } from "../../src/commands/scan.js";
import { auditViaApi } from "../../src/lib/api-client.js";
import { createOutputHandler, printScanTable } from "../../src/lib/output.js";
import { isBlocked } from "../../src/lib/gating.js";
import type { AuditResponse } from "../../src/types.js";

const mockGlob = vi.mocked(glob);
const mockReadFileSync = vi.mocked(readFileSync);
const mockAuditViaApi = vi.mocked(auditViaApi);
const mockCreateOutputHandler = vi.mocked(createOutputHandler);
const mockPrintScanTable = vi.mocked(printScanTable);
const mockIsBlocked = vi.mocked(isBlocked);

function makeAuditResponse(
  score: string,
  verdict: string = "install",
): AuditResponse {
  return {
    result: {
      overall_score: score as AuditResponse["result"]["overall_score"],
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
        verdict: verdict as AuditResponse["result"]["recommendation"]["verdict"],
        for_who: "everyone",
        caveats: [],
        alternatives: [],
      },
    },
    meta: {
      slug: "test",
      url: "https://skillgate.sh/report/test",
      badge_url: "https://skillgate.sh/badge/test",
      created_at: "2026-01-01T00:00:00Z",
      cached: false,
    },
  };
}

describe("scanCommand", () => {
  let mockSpinner: {
    stop: ReturnType<typeof vi.fn>;
    fail: ReturnType<typeof vi.fn>;
    succeed: ReturnType<typeof vi.fn>;
    text: string;
  };
  let mockConsoleLog: ReturnType<typeof vi.fn>;
  let mockConsoleError: ReturnType<typeof vi.fn>;
  let mockProcessExit: ReturnType<typeof vi.fn>;
  let mockStdoutWrite: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();

    mockSpinner = {
      stop: vi.fn(),
      fail: vi.fn(),
      succeed: vi.fn(),
      text: "",
    };

    mockCreateOutputHandler.mockReturnValue({
      startSpinner: vi.fn().mockReturnValue(mockSpinner),
      printResult: vi.fn(),
      printError: vi.fn(),
    });

    mockConsoleLog = vi.spyOn(console, "log").mockImplementation(() => { });
    mockConsoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => { });
    mockProcessExit = vi
      .spyOn(process, "exit")
      .mockImplementation(() => undefined as never);
    mockStdoutWrite = vi
      .spyOn(process.stdout, "write")
      .mockImplementation(() => true);
  });

  it("discovers .md files in .claude/ and .claude/skills/ by default", async () => {
    // Default scan calls glob twice: once for .claude/, once for .claude/skills/
    mockGlob
      .mockResolvedValueOnce(["SKILL.md"] as any)
      .mockResolvedValueOnce(["test/SKILL.md"] as any);
    mockReadFileSync.mockReturnValue("# Test skill");
    mockAuditViaApi.mockResolvedValue(makeAuditResponse("safe"));
    mockIsBlocked.mockReturnValue(false);

    await scanCommand({ fail: true, json: false });

    // Should call glob twice - once per default directory
    expect(mockGlob).toHaveBeenCalledTimes(2);
    expect(mockGlob).toHaveBeenCalledWith(
      "**/*.md",
      expect.objectContaining({
        cwd: expect.stringContaining(".claude"),
      }),
    );
  });

  it("uses custom path when --path is provided", async () => {
    mockGlob.mockResolvedValue(["SKILL.md"] as any);
    mockReadFileSync.mockReturnValue("# Test skill");
    mockAuditViaApi.mockResolvedValue(makeAuditResponse("safe"));
    mockIsBlocked.mockReturnValue(false);

    await scanCommand({ path: "/custom/dir", fail: true, json: false });

    // Should call glob once with the custom path
    expect(mockGlob).toHaveBeenCalledTimes(1);
    expect(mockGlob).toHaveBeenCalledWith(
      "**/*.md",
      expect.objectContaining({
        cwd: "/custom/dir",
      }),
    );
  });

  it("prints table with 3 rows for 3 passing skills and exits 0", async () => {
    // Use --path to avoid double-glob
    mockGlob.mockResolvedValue(["a.md", "b.md", "c.md"] as any);
    mockReadFileSync.mockReturnValue("# Skill");
    mockAuditViaApi.mockResolvedValue(makeAuditResponse("safe"));
    mockIsBlocked.mockReturnValue(false);

    await scanCommand({ path: "/test", fail: true, json: false });

    expect(mockPrintScanTable).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ file: expect.stringContaining("a.md") }),
        expect.objectContaining({ file: expect.stringContaining("b.md") }),
        expect.objectContaining({ file: expect.stringContaining("c.md") }),
      ]),
    );
    expect(mockProcessExit).not.toHaveBeenCalledWith(1);
  });

  it("exits 1 when a High score skill is found", async () => {
    mockGlob.mockResolvedValue(["safe.md", "high.md", "low.md"] as any);
    mockReadFileSync.mockReturnValue("# Skill");
    mockAuditViaApi
      .mockResolvedValueOnce(makeAuditResponse("safe"))
      .mockResolvedValueOnce(makeAuditResponse("high", "avoid"))
      .mockResolvedValueOnce(makeAuditResponse("low"));
    mockIsBlocked
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false);

    await scanCommand({ path: "/test", fail: true, json: false });

    expect(mockProcessExit).toHaveBeenCalledWith(1);
  });

  it("exits 0 with --no-fail even when High score skill is found", async () => {
    mockGlob.mockResolvedValue(["safe.md", "high.md"] as any);
    mockReadFileSync.mockReturnValue("# Skill");
    mockAuditViaApi
      .mockResolvedValueOnce(makeAuditResponse("safe"))
      .mockResolvedValueOnce(makeAuditResponse("high", "avoid"));
    mockIsBlocked.mockReturnValueOnce(false).mockReturnValueOnce(true);

    await scanCommand({ path: "/test", fail: false, json: false });

    expect(mockProcessExit).not.toHaveBeenCalledWith(1);
  });

  it("outputs JSON array when --json is specified", async () => {
    mockGlob.mockResolvedValue(["a.md"] as any);
    mockReadFileSync.mockReturnValue("# Skill");
    const response = makeAuditResponse("safe");
    mockAuditViaApi.mockResolvedValue(response);
    mockIsBlocked.mockReturnValue(false);

    await scanCommand({ path: "/test", fail: true, json: true });

    expect(mockStdoutWrite).toHaveBeenCalledWith(
      expect.stringContaining('"file"'),
    );
    expect(mockPrintScanTable).not.toHaveBeenCalled();
  });

  it("prints message and exits 0 when no files found", async () => {
    mockGlob.mockResolvedValue([] as any);

    await scanCommand({ fail: true, json: false });

    expect(mockConsoleLog).toHaveBeenCalledWith(
      expect.stringContaining("No skill files found"),
    );
    expect(mockProcessExit).not.toHaveBeenCalledWith(1);
  });

  it("limits concurrency to 5 parallel API calls", async () => {
    const files = Array.from({ length: 10 }, (_, i) => `file${i}.md`);
    mockGlob.mockResolvedValue(files as any);
    mockReadFileSync.mockReturnValue("# Skill");
    mockIsBlocked.mockReturnValue(false);

    let concurrent = 0;
    let maxConcurrent = 0;

    mockAuditViaApi.mockImplementation(async () => {
      concurrent++;
      maxConcurrent = Math.max(maxConcurrent, concurrent);
      await new Promise((r) => setTimeout(r, 50));
      concurrent--;
      return makeAuditResponse("safe");
    });

    await scanCommand({ path: "/test", fail: true, json: false });

    expect(maxConcurrent).toBeLessThanOrEqual(5);
    expect(mockAuditViaApi).toHaveBeenCalledTimes(10);
  });

  it("shows rate limit warning when file count exceeds 25", async () => {
    const files = Array.from({ length: 30 }, (_, i) => `file${i}.md`);
    mockGlob.mockResolvedValue(files as any);
    mockReadFileSync.mockReturnValue("# Skill");
    mockAuditViaApi.mockResolvedValue(makeAuditResponse("safe"));
    mockIsBlocked.mockReturnValue(false);

    await scanCommand({ path: "/test", fail: true, json: false });

    expect(mockConsoleLog).toHaveBeenCalledWith(
      expect.stringContaining("rate limit"),
    );
  });

  it("updates spinner progress during auditing", async () => {
    const files = ["a.md", "b.md", "c.md"];
    mockGlob.mockResolvedValue(files as any);
    mockReadFileSync.mockReturnValue("# Skill");
    mockAuditViaApi.mockResolvedValue(makeAuditResponse("safe"));
    mockIsBlocked.mockReturnValue(false);

    await scanCommand({ path: "/test", fail: true, json: false });

    const outputHandler = mockCreateOutputHandler.mock.results[0]?.value;
    expect(outputHandler?.startSpinner).toHaveBeenCalledWith(
      expect.stringContaining("0/3"),
    );
  });
});
