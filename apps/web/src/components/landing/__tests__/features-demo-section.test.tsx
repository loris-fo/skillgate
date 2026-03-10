import { render, screen } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { FeaturesDemoSection } from "../features-demo-section";

// Mock IntersectionObserver for scroll-triggered animations
beforeEach(() => {
  vi.stubGlobal(
    "IntersectionObserver",
    vi.fn((callback: IntersectionObserverCallback) => {
      // Auto-trigger so content becomes visible in tests
      setTimeout(() => {
        callback(
          [{ isIntersecting: true } as IntersectionObserverEntry],
          {} as IntersectionObserver,
        );
      }, 0);
      return { observe: vi.fn(), disconnect: vi.fn(), unobserve: vi.fn() };
    }),
  );
});

describe("FeaturesDemoSection", () => {
  beforeEach(() => {
    render(<FeaturesDemoSection />);
  });

  // FEAT-01: Three feature cards render with correct titles
  it("renders feature card titled 'AI Security Analysis'", () => {
    expect(screen.getByText("AI Security Analysis")).toBeInTheDocument();
  });

  it("renders feature card titled 'CLI Gate'", () => {
    expect(screen.getByText("CLI Gate")).toBeInTheDocument();
  });

  it("renders feature card titled 'Trust Badges'", () => {
    expect(screen.getByText("Trust Badges")).toBeInTheDocument();
  });

  // FEAT-01: Feature cards are NOT clickable links
  it("feature cards are not wrapped in links", () => {
    const aiCard = screen.getByText("AI Security Analysis").closest("a");
    expect(aiCard).toBeNull();
  });

  // FEAT-02: Mock demo shows "Use with Caution" verdict
  it("shows 'Use with Caution' verdict in mock demo", () => {
    expect(screen.getByText(/use with caution/i)).toBeInTheDocument();
  });

  // FEAT-02: Mock demo shows 6.2/10 score
  it("shows 6.2 score in mock demo", () => {
    expect(screen.getByText(/6\.2/)).toBeInTheDocument();
  });

  // FEAT-02: Mock demo has 5 category rows with pill severity labels
  it("renders 5 category names", () => {
    expect(screen.getByText("Hidden Logic")).toBeInTheDocument();
    expect(screen.getByText("Data Access")).toBeInTheDocument();
    expect(screen.getByText("Action Risk")).toBeInTheDocument();
    expect(screen.getByText("Permission Scope")).toBeInTheDocument();
    expect(screen.getByText("Override Attempts")).toBeInTheDocument();
  });

  it("renders severity pill labels", () => {
    // 2 Safe pills, 2 Low pills, 1 Moderate pill
    const safePills = screen.getAllByText("Safe");
    const lowPills = screen.getAllByText("Low");
    const moderatePills = screen.getAllByText("Moderate");
    expect(safePills).toHaveLength(2);
    expect(lowPills).toHaveLength(2);
    expect(moderatePills).toHaveLength(1);
  });

  // FEAT-03 / RESP-01: Two-column grid class present
  it("has responsive two-column grid layout", () => {
    const grid = document.querySelector(".lg\\:grid-cols-2");
    expect(grid).toBeInTheDocument();
  });

  // RESP-01: Default single column
  it("defaults to single column (grid-cols-1)", () => {
    const grid = document.querySelector(".grid-cols-1");
    expect(grid).toBeInTheDocument();
  });

  // FEAT-01: SVG icons present (ShieldIcon, TerminalIcon, BadgeIcon)
  it("renders three SVG icons for feature cards", () => {
    const section = document.querySelector("section");
    const svgs = section?.querySelectorAll("svg");
    expect(svgs?.length).toBeGreaterThanOrEqual(3);
  });
});
