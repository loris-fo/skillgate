import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ReportHero } from "../report-hero";
import type { AuditResult } from "@skillgate/audit-engine";
import type { AuditMeta } from "@/lib/types";

vi.mock("@/components/copy-button", () => ({
  CopyButton: () => <button>Copy</button>,
}));

const mockResult: AuditResult = {
  overall_score: "low",
  summary: "This skill is safe to use",
  recommendation: {
    verdict: "install" as const,
    for_who: "Teams building web scrapers",
    caveats: ["Requires network access", "May timeout on slow connections"],
    alternatives: ["axios", "node-fetch"],
  },
  categories: {} as AuditResult["categories"],
} as AuditResult;

const mockMeta: AuditMeta = {
  slug: "test-skill",
  url: "https://example.com",
  badge_url: "/api/badge/test-skill.svg",
  created_at: "2026-01-01T00:00:00Z",
  cached: false,
};

const mockResultEmpty: AuditResult = {
  ...mockResult,
  recommendation: {
    verdict: "install" as const,
    for_who: "",
    caveats: [],
    alternatives: [],
  },
} as AuditResult;

describe("ReportHero", () => {
  it("renders 'Best for:' label and for_who text when for_who is non-empty", () => {
    render(<ReportHero result={mockResult} meta={mockMeta} />);

    expect(screen.getByText("Best for:")).toBeInTheDocument();
    expect(screen.getByText("Teams building web scrapers")).toBeInTheDocument();
  });

  it("renders caveats as list items when caveats array is non-empty", () => {
    render(<ReportHero result={mockResult} meta={mockMeta} />);

    expect(screen.getByText("Requires network access")).toBeInTheDocument();
    expect(
      screen.getByText("May timeout on slow connections"),
    ).toBeInTheDocument();
  });

  it("renders alternatives as list items when alternatives array is non-empty", () => {
    render(<ReportHero result={mockResult} meta={mockMeta} />);

    expect(screen.getByText("axios")).toBeInTheDocument();
    expect(screen.getByText("node-fetch")).toBeInTheDocument();
  });

  it("hides sub-fields section entirely when for_who is empty and caveats/alternatives are empty arrays", () => {
    render(<ReportHero result={mockResultEmpty} meta={mockMeta} />);

    expect(screen.queryByText("Best for:")).not.toBeInTheDocument();
    expect(screen.queryByText("Caveats")).not.toBeInTheDocument();
    expect(screen.queryByText("Alternatives")).not.toBeInTheDocument();
  });

  it("renders verdict label and summary", () => {
    render(<ReportHero result={mockResult} meta={mockMeta} />);

    expect(screen.getByText("Install")).toBeInTheDocument();
    expect(screen.getByText("This skill is safe to use")).toBeInTheDocument();
  });
});
