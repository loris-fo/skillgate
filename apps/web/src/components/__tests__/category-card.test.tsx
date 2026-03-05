import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CategoryCard } from "../category-card";
import type { CategoryResult } from "@skillgate/audit-engine";

const mockResult: CategoryResult = {
  score: "low",
  finding: "No suspicious data access patterns found",
  detail: "The skill only reads from its declared scope",
  by_design: false,
};

const mockResultByDesign: CategoryResult = {
  score: "moderate",
  finding: "Accesses external APIs",
  detail: "This is expected for a web-fetching skill",
  by_design: true,
};

describe("CategoryCard", () => {
  it("renders with category label and severity badge visible", () => {
    render(<CategoryCard name="data_access" result={mockResult} />);

    expect(screen.getByText("Data Access")).toBeInTheDocument();
    expect(screen.getByText("Low")).toBeInTheDocument();
  });

  it("starts with finding and detail text visible (expanded by default)", () => {
    render(<CategoryCard name="data_access" result={mockResult} />);

    expect(
      screen.getByText("No suspicious data access patterns found"),
    ).toBeVisible();
    expect(
      screen.getByText("The skill only reads from its declared scope"),
    ).toBeVisible();
  });

  it("clicking the header collapses the card — finding and detail text are hidden", () => {
    render(<CategoryCard name="data_access" result={mockResult} />);

    const header = screen.getByRole("button", { name: /data access/i });
    fireEvent.click(header);

    expect(
      screen.queryByText("No suspicious data access patterns found"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("The skill only reads from its declared scope"),
    ).not.toBeInTheDocument();
  });

  it("clicking again expands the card — finding and detail text reappear", () => {
    render(<CategoryCard name="data_access" result={mockResult} />);

    const header = screen.getByRole("button", { name: /data access/i });
    fireEvent.click(header); // collapse
    fireEvent.click(header); // expand

    expect(
      screen.getByText("No suspicious data access patterns found"),
    ).toBeVisible();
    expect(
      screen.getByText("The skill only reads from its declared scope"),
    ).toBeVisible();
  });

  it("chevron icon rotates to indicate expanded/collapsed state", () => {
    render(<CategoryCard name="data_access" result={mockResult} />);

    const header = screen.getByRole("button", { name: /data access/i });
    const chevron = header.querySelector("svg");
    expect(chevron).toBeTruthy();

    // Expanded by default — no rotation
    expect(chevron!.getAttribute("class")).toContain("rotate-0");

    fireEvent.click(header);

    // Collapsed — rotated
    expect(chevron!.getAttribute("class")).toContain("rotate-180");
  });

  it("by_design badge renders when result.by_design is true", () => {
    render(<CategoryCard name="data_access" result={mockResultByDesign} />);

    expect(screen.getByText("By Design")).toBeInTheDocument();
  });
});
