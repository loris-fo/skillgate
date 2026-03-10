import { render, screen } from "@testing-library/react";
import { HeroSection } from "../hero-section";

// Mock next/link since we're in jsdom
vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: any) => <a href={href} {...props}>{children}</a>,
}));

describe("HeroSection", () => {
  beforeEach(() => {
    render(<HeroSection />);
  });

  // HERO-01: Hero heading renders with correct text
  it("renders the heading 'Don't install blind.'", () => {
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveTextContent("Don't install blind.");
  });

  // HERO-01: Heading has large font size style
  it("has heading with clamp font size for 120px desktop scaling", () => {
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveStyle({ fontSize: expect.stringContaining("clamp") });
  });

  // HERO-02: Gradient orb element present with aria-hidden
  it("renders a gradient orb element with aria-hidden", () => {
    const orb = document.querySelector("[aria-hidden='true']");
    expect(orb).toBeInTheDocument();
    expect(orb).toHaveStyle({ filter: "blur(60px)" });
  });

  // HERO-03: Two CTA links with correct hrefs
  it("renders primary CTA linking to /audit", () => {
    const link = screen.getByRole("link", { name: /audit a skill/i });
    expect(link).toHaveAttribute("href", "/audit");
  });

  it("renders secondary CTA linking to /report/cursor-rules-architect", () => {
    const link = screen.getByRole("link", { name: /view example report/i });
    expect(link).toHaveAttribute("href", "/report/cursor-rules-architect");
  });

  // HERO-03: Primary CTA has rounded-full style matching header
  it("primary CTA has rounded-full class", () => {
    const link = screen.getByRole("link", { name: /audit a skill/i });
    expect(link.className).toContain("rounded-full");
  });

  // RESP-02: Heading has responsive sizing (clamp or breakpoint classes)
  it("heading style supports responsive scaling", () => {
    const heading = screen.getByRole("heading", { level: 1 });
    const style = heading.getAttribute("style") || "";
    // Should use clamp() for fluid scaling between mobile and desktop
    expect(style).toContain("clamp");
  });
});
