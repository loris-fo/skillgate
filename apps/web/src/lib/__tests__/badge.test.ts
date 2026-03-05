import { describe, it, expect } from "vitest";
import { generateBadge } from "../badge";

describe("generateBadge", () => {
  it('generates green badge for "install" verdict', () => {
    const svg = generateBadge("install");
    expect(svg).toContain("Skillgate");
    expect(svg).toContain("Install");
    expect(svg).toContain("#4c1");
  });

  it('generates red badge for "avoid" verdict', () => {
    const svg = generateBadge("avoid");
    expect(svg).toContain("Skillgate");
    expect(svg).toContain("Avoid");
    expect(svg).toContain("#e05d44");
  });

  it('generates orange badge for "review_first" verdict', () => {
    const svg = generateBadge("review_first");
    expect(svg).toContain("Skillgate");
    expect(svg).toContain("Review First");
    expect(svg).toContain("#fe7d37");
  });

  it('generates yellow badge for "install_with_caution" verdict', () => {
    const svg = generateBadge("install_with_caution");
    expect(svg).toContain("Skillgate");
    expect(svg).toContain("Caution");
    expect(svg).toContain("#dfb317");
  });

  it("returns valid SVG string", () => {
    const svg = generateBadge("install");
    expect(svg).toMatch(/^<svg/);
    expect(svg).toMatch(/<\/svg>$/);
  });
});
