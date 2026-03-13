import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock modules before importing scan command
vi.mock("glob", () => ({
  glob: vi.fn(),
}));

vi.mock("node:fs", async (importOriginal) => {
  const actual = await importOriginal<typeof import("node:fs")>();
  return {
    ...actual,
    default: {
      ...actual,
      readFileSync: vi.fn(),
      existsSync: vi.fn(),
    },
    readFileSync: vi.fn(),
    existsSync: vi.fn(),
  };
});

vi.mock("../../src/lib/api-client.js", () => ({
  auditViaApi: vi.fn(),
}));

vi.mock("../../src/lib/output.js", () => ({
  createOutputHandler: vi.fn(),
  printGroupedScanTable: vi.fn(),
  printScanTable: vi.fn(),
}));

vi.mock("../../src/lib/gating.js", () => ({
  isBlocked: vi.fn(),
}));

import { glob } from "glob";
import { readFileSync, existsSync } from "node:fs";
import { scanCommand } from "../../src/commands/scan.js";
import { auditViaApi } from "../../src/lib/api-client.js";
import { createOutputHandler, printGroupedScanTable } from "../../src/lib/output.js";
import { isBlocked } from "../../src/lib/gating.js";
import type { AuditResponse } from "../../src/types.js";

const mockGlob = vi.mocked(glob);
const mockReadFileSync = vi.mocked(readFileSync);
const mockExistsSync = vi.mocked(existsSync);
const mockAuditViaApi = vi.mocked(auditViaApi);
const mockCreateOutputHandler = vi.mocked(createOutputHandler);
const mockPrintGroupedScanTable = vi.mocked(printGroupedScanTable);
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
    isSpinning: boolean;
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
      isSpinning: true,
    };

    mockCreateOutputHandler.mockReturnValue({
      startSpinner: vi.fn().mockReturnValue(mockSpinner),
      printResult: vi.fn(),
      printError: vi.fn(),
    });

    // Default: existsSync returns false (no single-file agent configs exist)
    mockExistsSync.mockReturnValue(false);

    mockConsoleLog = vi.spyOn(console, "log").mockImplementation(() => {});
    mockConsoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    mockProcessExit = vi
      .spyOn(process, "exit")
      .mockImplementation(() => undefined as never);
    mockStdoutWrite = vi
      .spyOn(process.stdout, "write")
      .mockImplementation(() => true);
  });

  it("discovers files via AGENT_SCAN_MAP glob patterns", async () => {
    // Glob returns files for directory-based agent paths, empty for others
    mockGlob.mockResolvedValue(["deploy.md"] as any);
    mockReadFileSync.mockReturnValue("# Test skill");
    mockAuditViaApi.mockResolvedValue(makeAuditResponse("safe"));
    mockIsBlocked.mockReturnValue(false);

    await scanCommand({ fail: true, json: false });

    // Should call glob for each directory-based agent path in AGENT_SCAN_MAP
    expect(mockGlob).toHaveBeenCalled();
  });

  it("uses --path additively with agent scan map", async () => {
    // Default agent paths return nothing
    mockGlob.mockResolvedValue([] as any);
    // existsSync returns false for single-file paths
    mockExistsSync.mockReturnValue(false);

    // Override: when custom path is used, return a file
    mockGlob.mockImplementation(async (_pattern: any, opts: any) => {
      if (opts?.cwd?.includes("custom")) return ["SKILL.md"] as any;
      return [] as any;
    });
    mockReadFileSync.mockReturnValue("# Test skill");
    mockAuditViaApi.mockResolvedValue(makeAuditResponse("safe"));
    mockIsBlocked.mockReturnValue(false);

    await scanCommand({ path: "/custom/dir", fail: true, json: false });

    // Should have discovered the file from --path
    expect(mockAuditViaApi).toHaveBeenCalled();
  });

  it("prints grouped scan table for results", async () => {
    mockGlob.mockResolvedValue(["a.md", "b.md", "c.md"] as any);
    mockExistsSync.mockReturnValue(false);
    mockReadFileSync.mockReturnValue("# Skill");
    mockAuditViaApi.mockResolvedValue(makeAuditResponse("safe"));
    mockIsBlocked.mockReturnValue(false);

    await scanCommand({ path: "/test", fail: true, json: false });

    expect(mockPrintGroupedScanTable).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ file: expect.any(String), agent: expect.any(String) }),
      ]),
    );
    expect(mockProcessExit).not.toHaveBeenCalledWith(1);
  });

  it("exits 1 when a high score skill is found", async () => {
    mockGlob.mockResolvedValue(["safe.md", "high.md"] as any);
    mockExistsSync.mockReturnValue(false);
    mockReadFileSync.mockReturnValue("# Skill");
    mockAuditViaApi
      .mockResolvedValueOnce(makeAuditResponse("safe"))
      .mockResolvedValueOnce(makeAuditResponse("high", "avoid"));
    mockIsBlocked
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(true);

    await scanCommand({ path: "/test", fail: true, json: false });

    expect(mockProcessExit).toHaveBeenCalledWith(1);
  });

  it("exits 0 with --no-fail even when high score skill is found", async () => {
    mockGlob.mockResolvedValue(["safe.md", "high.md"] as any);
    mockExistsSync.mockReturnValue(false);
    mockReadFileSync.mockReturnValue("# Skill");
    mockAuditViaApi
      .mockResolvedValueOnce(makeAuditResponse("safe"))
      .mockResolvedValueOnce(makeAuditResponse("high", "avoid"));
    mockIsBlocked.mockReturnValueOnce(false).mockReturnValueOnce(true);

    await scanCommand({ path: "/test", fail: false, json: false });

    expect(mockProcessExit).not.toHaveBeenCalledWith(1);
  });

  it("outputs JSON when --json is specified", async () => {
    mockGlob.mockResolvedValue(["a.md"] as any);
    mockExistsSync.mockReturnValue(false);
    mockReadFileSync.mockReturnValue("# Skill");
    mockAuditViaApi.mockResolvedValue(makeAuditResponse("safe"));
    mockIsBlocked.mockReturnValue(false);

    await scanCommand({ path: "/test", fail: true, json: true });

    expect(mockStdoutWrite).toHaveBeenCalledWith(
      expect.stringContaining('"file"'),
    );
    expect(mockPrintGroupedScanTable).not.toHaveBeenCalled();
  });

  it("prints message and exits 0 when no files found", async () => {
    mockGlob.mockResolvedValue([] as any);
    mockExistsSync.mockReturnValue(false);

    await scanCommand({ fail: true, json: false });

    expect(mockConsoleLog).toHaveBeenCalledWith(
      expect.stringContaining("No agent skill files found"),
    );
    expect(mockProcessExit).not.toHaveBeenCalledWith(1);
  });

  it("limits concurrency to 5 parallel API calls", async () => {
    const files = Array.from({ length: 10 }, (_, i) => `file${i}.md`);
    // Return empty for default agent paths, only return files for --path
    mockGlob.mockImplementation(async (_pattern: any, opts: any) => {
      if (opts?.cwd?.includes("test-concurrency")) return files as any;
      return [] as any;
    });
    mockExistsSync.mockReturnValue(false);
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

    await scanCommand({ path: "/test-concurrency", fail: true, json: false });

    expect(maxConcurrent).toBeLessThanOrEqual(5);
    expect(mockAuditViaApi).toHaveBeenCalledTimes(10);
  });

  it("shows rate limit warning when file count exceeds 25", async () => {
    const files = Array.from({ length: 30 }, (_, i) => `file${i}.md`);
    mockGlob.mockResolvedValue(files as any);
    mockExistsSync.mockReturnValue(false);
    mockReadFileSync.mockReturnValue("# Skill");
    mockAuditViaApi.mockResolvedValue(makeAuditResponse("safe"));
    mockIsBlocked.mockReturnValue(false);

    await scanCommand({ path: "/test", fail: true, json: false });

    expect(mockConsoleLog).toHaveBeenCalledWith(
      expect.stringContaining("rate limit"),
    );
  });

  it("validates --agent flag rejects unknown agents", async () => {
    await scanCommand({ agent: "invalid", fail: true, json: false });

    expect(mockConsoleError).toHaveBeenCalledWith(
      expect.stringContaining('Invalid agent "invalid"'),
    );
  });
});
