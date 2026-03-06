import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { AuditResponse, Score } from "../../src/types.js";

// Mock modules before imports
vi.mock("../../src/lib/input-resolver.js", () => ({
  resolveInput: vi.fn(),
}));

vi.mock("../../src/lib/api-client.js", () => ({
  auditViaApi: vi.fn(),
}));

vi.mock("../../src/lib/gating.js", () => ({
  isBlocked: vi.fn(),
}));

vi.mock("../../src/lib/output.js", () => ({
  createOutputHandler: vi.fn(),
}));

vi.mock("node:fs", async () => {
  const actual = await vi.importActual<typeof import("node:fs")>("node:fs");
  return {
    ...actual,
    default: {
      ...actual,
      mkdirSync: vi.fn(),
      writeFileSync: vi.fn(),
    },
    mkdirSync: vi.fn(),
    writeFileSync: vi.fn(),
  };
});

import { resolveInput } from "../../src/lib/input-resolver.js";
import { auditViaApi } from "../../src/lib/api-client.js";
import { isBlocked } from "../../src/lib/gating.js";
import { createOutputHandler } from "../../src/lib/output.js";
import fs from "node:fs";

function makeResponse(
  score: Score = "safe",
  content?: string,
): AuditResponse {
  return {
    result: {
      overall_score: score,
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
      slug: "abc123",
      url: "https://skillgate.dev/report/abc123",
      badge_url: "https://skillgate.dev/badge/abc123",
      created_at: "2026-01-01T00:00:00Z",
      cached: false,
    },
  };
}

function setupOutputMock() {
  const spinner = {
    stop: vi.fn(),
    fail: vi.fn(),
    succeed: vi.fn(),
  };
  const handler = {
    startSpinner: vi.fn(() => spinner),
    printResult: vi.fn(),
    printError: vi.fn(),
  };
  vi.mocked(createOutputHandler).mockReturnValue(handler);
  return { handler, spinner };
}

describe("installCommand", () => {
  let exitSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    exitSpy = vi
      .spyOn(process, "exit")
      .mockImplementation(() => undefined as never);
  });

  afterEach(() => {
    exitSpy.mockRestore();
  });

  it("installs a local file with passing score", async () => {
    const { installCommand } = await import("../../src/commands/install.js");

    const content = "# Commit Helper\n\nA skill for commits.";
    vi.mocked(resolveInput).mockReturnValue({
      type: "content",
      content,
      name: "SKILL.md",
    });
    vi.mocked(auditViaApi).mockResolvedValue(makeResponse("safe"));
    vi.mocked(isBlocked).mockReturnValue(false);
    const { handler, spinner } = setupOutputMock();

    await installCommand("./SKILL.md", {
      output: ".claude",
      force: false,
      json: false,
    });

    expect(resolveInput).toHaveBeenCalledWith("./SKILL.md");
    expect(auditViaApi).toHaveBeenCalledWith({ content });
    expect(isBlocked).toHaveBeenCalledWith("safe");
    expect(spinner.succeed).toHaveBeenCalled();
    expect(handler.printResult).toHaveBeenCalled();
    expect(fs.mkdirSync).toHaveBeenCalledWith(".claude", { recursive: true });
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      ".claude/commit-helper.md",
      content,
      "utf-8",
    );
    expect(exitSpy).not.toHaveBeenCalled();
  });

  it("blocks install for high score and exits 1", async () => {
    const { installCommand } = await import("../../src/commands/install.js");

    const content = "# Bad Skill\n\nDangerous.";
    vi.mocked(resolveInput).mockReturnValue({
      type: "content",
      content,
      name: "SKILL.md",
    });
    vi.mocked(auditViaApi).mockResolvedValue(makeResponse("high"));
    vi.mocked(isBlocked).mockReturnValue(true);
    const { handler, spinner } = setupOutputMock();

    await installCommand("./SKILL.md", {
      output: ".claude",
      force: false,
      json: false,
    });

    expect(spinner.succeed).toHaveBeenCalled();
    expect(handler.printResult).toHaveBeenCalled();
    expect(fs.writeFileSync).not.toHaveBeenCalled();
    expect(exitSpy).toHaveBeenCalledWith(1);
  });

  it("force-installs despite high score", async () => {
    const { installCommand } = await import("../../src/commands/install.js");

    const content = "# Risky Skill\n\nUse carefully.";
    vi.mocked(resolveInput).mockReturnValue({
      type: "content",
      content,
      name: "SKILL.md",
    });
    vi.mocked(auditViaApi).mockResolvedValue(makeResponse("high"));
    vi.mocked(isBlocked).mockReturnValue(true);
    setupOutputMock();

    await installCommand("./SKILL.md", {
      output: ".claude",
      force: true,
      json: false,
    });

    expect(fs.writeFileSync).toHaveBeenCalledWith(
      ".claude/risky-skill.md",
      content,
      "utf-8",
    );
    expect(exitSpy).not.toHaveBeenCalledWith(1);
  });

  it("outputs JSON when --json flag set", async () => {
    const { installCommand } = await import("../../src/commands/install.js");

    const content = "# JSON Skill\n\nTest.";
    vi.mocked(resolveInput).mockReturnValue({
      type: "content",
      content,
      name: "SKILL.md",
    });
    vi.mocked(auditViaApi).mockResolvedValue(makeResponse("safe"));
    vi.mocked(isBlocked).mockReturnValue(false);
    setupOutputMock();

    await installCommand("./SKILL.md", {
      output: ".claude",
      force: false,
      json: true,
    });

    expect(createOutputHandler).toHaveBeenCalledWith(true);
  });

  it("fetches content for URL inputs before auditing", async () => {
    const { installCommand } = await import("../../src/commands/install.js");

    const content = "# URL Skill\n\nFetched from URL.";
    vi.mocked(resolveInput).mockReturnValue({
      type: "url",
      url: "https://example.com/SKILL.md",
    });

    // Mock global fetch for URL content fetching
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(content, { status: 200 }),
    );

    vi.mocked(auditViaApi).mockResolvedValue(makeResponse("safe"));
    vi.mocked(isBlocked).mockReturnValue(false);
    setupOutputMock();

    await installCommand("https://example.com/SKILL.md", {
      output: ".claude",
      force: false,
      json: false,
    });

    expect(fetchSpy).toHaveBeenCalledWith("https://example.com/SKILL.md");
    expect(auditViaApi).toHaveBeenCalledWith({ content });
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      ".claude/url-skill.md",
      content,
      "utf-8",
    );

    fetchSpy.mockRestore();
  });

  it("handles API errors gracefully", async () => {
    const { installCommand } = await import("../../src/commands/install.js");

    vi.mocked(resolveInput).mockReturnValue({
      type: "content",
      content: "# Skill\n\nContent.",
      name: "SKILL.md",
    });
    vi.mocked(auditViaApi).mockRejectedValue(new Error("API timeout"));
    const { handler, spinner } = setupOutputMock();

    await installCommand("./SKILL.md", {
      output: ".claude",
      force: false,
      json: false,
    });

    expect(spinner.fail).toHaveBeenCalled();
    expect(handler.printError).toHaveBeenCalledWith("API timeout");
    expect(exitSpy).toHaveBeenCalledWith(1);
  });

  it("creates output directory if it does not exist", async () => {
    const { installCommand } = await import("../../src/commands/install.js");

    const content = "# New Skill\n\nBrand new.";
    vi.mocked(resolveInput).mockReturnValue({
      type: "content",
      content,
      name: "SKILL.md",
    });
    vi.mocked(auditViaApi).mockResolvedValue(makeResponse("safe"));
    vi.mocked(isBlocked).mockReturnValue(false);
    setupOutputMock();

    await installCommand("./SKILL.md", {
      output: "custom/output/dir",
      force: false,
      json: false,
    });

    expect(fs.mkdirSync).toHaveBeenCalledWith("custom/output/dir", {
      recursive: true,
    });
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      "custom/output/dir/new-skill.md",
      content,
      "utf-8",
    );
  });

  it("extracts skill name from first H1 heading", async () => {
    const { installCommand } = await import("../../src/commands/install.js");

    const content =
      "# My Amazing Commit Helper\n\nSome description.\n\n## Usage\nDo things.";
    vi.mocked(resolveInput).mockReturnValue({
      type: "content",
      content,
      name: "SKILL.md",
    });
    vi.mocked(auditViaApi).mockResolvedValue(makeResponse("safe"));
    vi.mocked(isBlocked).mockReturnValue(false);
    setupOutputMock();

    await installCommand("./SKILL.md", {
      output: ".claude",
      force: false,
      json: false,
    });

    expect(fs.writeFileSync).toHaveBeenCalledWith(
      ".claude/my-amazing-commit-helper.md",
      content,
      "utf-8",
    );
  });

  it("falls back to 'skill' name when no H1 heading found", async () => {
    const { installCommand } = await import("../../src/commands/install.js");

    const content = "No heading here, just content.";
    vi.mocked(resolveInput).mockReturnValue({
      type: "content",
      content,
      name: "SKILL.md",
    });
    vi.mocked(auditViaApi).mockResolvedValue(makeResponse("safe"));
    vi.mocked(isBlocked).mockReturnValue(false);
    setupOutputMock();

    await installCommand("./SKILL.md", {
      output: ".claude",
      force: false,
      json: false,
    });

    expect(fs.writeFileSync).toHaveBeenCalledWith(
      ".claude/skill.md",
      content,
      "utf-8",
    );
  });
});
