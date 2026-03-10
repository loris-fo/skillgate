"use client";

import { usePathname } from "next/navigation";

const links = [
  { label: "GitHub", href: "https://github.com/lorisfochesato/skillgate" },
  { label: "npm", href: "https://www.npmjs.com/package/skillgate" },
  { label: "skillgate.sh", href: "https://skillgate.sh" },
  {
    label: "MIT License",
    href: "https://github.com/lorisfochesato/skillgate/blob/main/LICENSE",
  },
];

export function Footer() {
  const isLanding = usePathname() === "/";

  return (
    <footer className={`py-8 ${isLanding ? "border-t border-accent/30" : ""}`}>
      <div
        className={`max-w-6xl mx-auto px-4 sm:px-6 text-center text-sm ${isLanding ? "text-text-body" : "text-text-muted"}`}
      >
        {links.map((link, i) => (
          <span key={link.label}>
            {i > 0 && <span className="mx-2">&middot;</span>}
            <a
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`transition-colors ${isLanding ? "hover:text-text-heading" : "hover:text-text-body"}`}
            >
              {link.label}
            </a>
          </span>
        ))}
      </div>
    </footer>
  );
}
