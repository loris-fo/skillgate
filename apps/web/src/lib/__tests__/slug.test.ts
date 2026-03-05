import { describe, it, expect } from "vitest";
import { extractSkillName, buildSlug } from "../slug";

describe("extractSkillName", () => {
  it("extracts name from first H1 heading", () => {
    expect(extractSkillName("# Commit Helper\nSome content")).toBe(
      "Commit Helper",
    );
  });

  it('returns "unnamed-skill" when no heading found', () => {
    expect(extractSkillName("No heading here")).toBe("unnamed-skill");
  });

  it("finds first H1 even when preceded by H2", () => {
    expect(extractSkillName("## Not H1\n# Actual H1")).toBe("Actual H1");
  });

  it("trims whitespace from extracted name", () => {
    expect(extractSkillName("#   Spaced Name   \nContent")).toBe("Spaced Name");
  });
});

describe("buildSlug", () => {
  it("creates slug from name + 6-char hash prefix", () => {
    const slug = buildSlug(
      "# Commit Helper\n...",
      "abcdef1234567890abcdef1234567890",
    );
    expect(slug).toBe("commit-helper-abcdef");
  });

  it("truncates slug portion to ~30 chars before appending hash suffix", () => {
    const longContent =
      "# This Is A Very Long Skill Name That Should Be Truncated\nContent";
    const slug = buildSlug(longContent, "abcdef1234567890");
    const parts = slug.split("-");
    const hashSuffix = parts[parts.length - 1];
    expect(hashSuffix).toBe("abcdef");
    // Name portion (before hash suffix) should be <= 30 chars
    const namePortion = slug.slice(0, slug.lastIndexOf("-abcdef"));
    expect(namePortion.length).toBeLessThanOrEqual(30);
  });

  it("handles unnamed-skill fallback", () => {
    const slug = buildSlug("No heading", "abcdef1234567890");
    expect(slug).toBe("unnamed-skill-abcdef");
  });

  it("lowercases and strips special characters", () => {
    const slug = buildSlug(
      "# My Cool Skill!",
      "abcdef1234567890",
    );
    expect(slug).toBe("my-cool-skill-abcdef");
  });
});
