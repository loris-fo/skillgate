import { render, screen } from "@testing-library/react";
import { BadgeSnippet } from "../badge-snippet";

describe("BadgeSnippet", () => {
  beforeEach(() => {
    render(<BadgeSnippet />);
  });

  // BADGE-01: Three ShieldBadge SVGs render
  it("renders three badge SVGs", () => {
    const badges = screen.getAllByRole("img");
    expect(badges).toHaveLength(3);
  });

  it("renders badge labels: Safe to Install, Use with Caution, Avoid", () => {
    expect(screen.getByLabelText(/safe to install/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/use with caution/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/avoid/i)).toBeInTheDocument();
  });

  // BADGE-02: Three CopyButton instances render (one per badge)
  it("renders three copy buttons (one per badge)", () => {
    const copyButtons = screen.getAllByRole("button", { name: /copy/i });
    expect(copyButtons).toHaveLength(3);
  });

  // BADGE-02: Each badge has its own markdown snippet
  it("renders three markdown snippet blocks", () => {
    const snippets = document.querySelectorAll("pre");
    expect(snippets).toHaveLength(3);
  });
});
