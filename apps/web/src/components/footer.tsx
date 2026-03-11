"use client";

import { useLandingMode } from "@/components/landing-context";

const links = [
  { label: "GitHub", href: "https://github.com/loris-fo/skillgate" },
  { label: "npm", href: "https://www.npmjs.com/package/skillgate" },
  { label: "skillgate.sh", href: "https://skillgate.sh" },
  {
    label: "MIT License",
    href: "https://github.com/loris-fo/skillgate/blob/main/LICENSE",
  },
];

export function Footer() {
  const isLanding = useLandingMode();

  return (
    <footer
      className={`py-6 ${isLanding ? "border-t border-accent/30" : ""}`}
      style={isLanding ? { backgroundColor: "#1a1625" } : undefined}
    >
      <div
        className={`max-w-6xl mx-auto px-4 sm:px-6 text-center text-sm`}
        style={isLanding ? { color: "#8a8196" } : undefined}
      >
        {links.map((link, i) => (
          <span key={link.label}>
            {i > 0 && <span className="mx-2">&middot;</span>}
            <a
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors"
              style={isLanding ? { color: "#b8b0c8" } : undefined}
            >
              {link.label}
            </a>
          </span>
        ))}
      </div>
    </footer>
  );
}
