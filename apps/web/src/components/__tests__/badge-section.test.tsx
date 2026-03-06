import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { BadgeSection } from "../badge-section";

vi.mock("@/components/copy-button", () => ({
  CopyButton: () => <button>Copy</button>,
}));

describe("BadgeSection", () => {
  it("badge img src contains .svg suffix", () => {
    render(<BadgeSection slug="my-skill" />);

    const img = screen.getByAltText("Skillgate badge");
    expect(img.getAttribute("src")).toContain("/api/badge/my-skill.svg");
  });

  it("markdown snippet contains .svg suffix in badge URL", () => {
    render(<BadgeSection slug="my-skill" />);

    const pre = document.querySelector("pre");
    expect(pre?.textContent).toContain("/api/badge/my-skill.svg");
  });

  it("markdown snippet contains report link without .svg", () => {
    render(<BadgeSection slug="my-skill" />);

    const pre = document.querySelector("pre");
    expect(pre?.textContent).toContain("/report/my-skill)");
  });
});
