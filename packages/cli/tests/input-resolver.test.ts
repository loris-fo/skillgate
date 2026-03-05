import { describe, it, expect, vi, beforeEach } from "vitest";
import fs from "node:fs";
import { resolveInput } from "../src/lib/input-resolver.js";

vi.mock("node:fs");

describe("resolveInput", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("resolves local file path starting with ./", async () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockReturnValue("# Test Skill\nContent here");

    const result = resolveInput("./local.md");
    expect(result).toEqual({
      type: "content",
      content: "# Test Skill\nContent here",
      name: "local.md",
    });
  });

  it("resolves local file path starting with /", async () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockReturnValue("skill content");

    const result = resolveInput("/absolute/path/skill.md");
    expect(result).toEqual({
      type: "content",
      content: "skill content",
      name: "skill.md",
    });
  });

  it("resolves HTTP URL", () => {
    const result = resolveInput("https://example.com/SKILL.md");
    expect(result).toEqual({
      type: "url",
      url: "https://example.com/SKILL.md",
    });
  });

  it("resolves GitHub raw URL", () => {
    const result = resolveInput(
      "https://raw.githubusercontent.com/user/repo/main/SKILL.md",
    );
    expect(result).toEqual({
      type: "url",
      url: "https://raw.githubusercontent.com/user/repo/main/SKILL.md",
    });
  });

  it("resolves registry slug to skills.sh URL", () => {
    const result = resolveInput("commit");
    expect(result).toEqual({
      type: "url",
      url: "https://skills.sh/registry/commit/SKILL.md",
    });
  });

  it("resolves slug with hyphens", () => {
    const result = resolveInput("review-pr");
    expect(result).toEqual({
      type: "url",
      url: "https://skills.sh/registry/review-pr/SKILL.md",
    });
  });
});
