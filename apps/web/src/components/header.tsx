"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

export function Header() {
  const [copied, setCopied] = useState(false);
  const pathname = usePathname();
  const isLanding = pathname === "/";

  async function handleCopy() {
    const text = isLanding ? "npx skillgate" : "npm i -g skillgate";
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (isLanding) {
    return (
      <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 max-w-4xl w-[calc(100%-2rem)] rounded-full backdrop-blur-md bg-white/5 border border-white/10 px-4 sm:px-6 py-2.5">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 font-sans font-bold text-text-heading tracking-tight hover:opacity-80 transition-opacity"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            skillgate
          </Link>

          {/* Nav + Actions */}
          <div className="flex items-center gap-4">
            <nav className="hidden sm:flex items-center gap-4 text-sm">
              <a
                href="https://github.com/lorisfochesato/skillgate#readme"
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-body hover:text-white transition-colors"
              >
                Docs
              </a>
              <a
                href="https://github.com/lorisfochesato/skillgate"
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-body hover:text-white transition-colors"
              >
                GitHub
              </a>
            </nav>

            <button
              type="button"
              onClick={handleCopy}
              className="font-mono text-sm bg-white/10 border border-white/10 rounded-full px-3 py-1 text-text-body hover:bg-white/15 transition-colors cursor-pointer"
            >
              {copied ? "Copied!" : "npx skillgate"}
            </button>

            <Link
              href="/audit"
              className="bg-accent hover:bg-accent-hover text-white rounded-full px-4 py-1.5 font-semibold text-sm transition-colors"
            >
              Try it
            </Link>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-bg-page/80 border-b border-border-card/50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <Link
          href="/"
          className="font-sans font-bold text-lg text-text-heading tracking-tight hover:opacity-80 transition-opacity"
        >
          skillgate
        </Link>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleCopy}
            className="font-mono text-sm bg-[#BAE6FD]/40 border border-border-card rounded-full px-3 py-1 text-text-body hover:bg-[#BAE6FD]/60 transition-colors cursor-pointer"
          >
            {copied ? "Copied!" : "npm i -g skillgate"}
          </button>

          <a
            href="https://github.com/lorisfochesato/skillgate"
            target="_blank"
            rel="noopener noreferrer"
            className="text-text-muted hover:text-accent transition-colors"
            aria-label="GitHub"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
            </svg>
          </a>
        </div>
      </div>
    </header>
  );
}
