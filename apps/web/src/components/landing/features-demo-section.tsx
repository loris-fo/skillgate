"use client";

import { useEffect, useRef, useState } from "react";

/* ------------------------------------------------------------------ */
/*  Icon components (migrated from features-section.tsx)               */
/* ------------------------------------------------------------------ */

const ShieldIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-accent"
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="M9 12l2 2 4-4" />
  </svg>
);

const TerminalIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-accent"
  >
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <path d="M7 15l3-3-3-3" />
    <path d="M13 15h4" />
  </svg>
);

const BadgeIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-accent"
  >
    <circle cx="12" cy="8" r="6" />
    <path d="M8.21 13.89L7 23l5-3 5 3-1.21-9.12" />
  </svg>
);

/* ------------------------------------------------------------------ */
/*  Feature card data                                                  */
/* ------------------------------------------------------------------ */

const features = [
  {
    icon: <ShieldIcon />,
    title: "AI Security Analysis",
    description:
      "Deep-scan any skill across 5 risk categories — from hidden logic to override attempts — with plain-English verdicts you can actually understand.",
  },
  {
    icon: <TerminalIcon />,
    title: "CLI Gate",
    description:
      "One command stands between you and a risky install. Block dangerous skills before they ever touch your codebase.",
  },
  {
    icon: <BadgeIcon />,
    title: "Trust Badges",
    description:
      "Ship a verified trust signal in your README. Let other developers know your skill has been audited at a glance.",
  },
];

/* ------------------------------------------------------------------ */
/*  Mock report data                                                   */
/* ------------------------------------------------------------------ */

const mockCategories = [
  { name: "Hidden Logic", severity: "safe" as const },
  { name: "Data Access", severity: "low" as const },
  { name: "Action Risk", severity: "moderate" as const },
  { name: "Permission Scope", severity: "low" as const },
  { name: "Override Attempts", severity: "safe" as const },
];

const PILL_COLORS: Record<string, { bg: string; label: string }> = {
  safe: { bg: "bg-severity-safe", label: "Safe" },
  low: { bg: "bg-severity-low", label: "Low" },
  moderate: { bg: "bg-severity-moderate", label: "Moderate" },
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function FeaturesDemoSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-start">
        {/* Left column — feature cards */}
        <div className="flex flex-col gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-xl bg-surface-card border border-border-card p-6"
            >
              <div className="mb-3">{feature.icon}</div>
              <h3 className="font-semibold text-text-heading">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm text-text-body">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Right column — mock report demo */}
        <div
          ref={containerRef}
          className="overflow-hidden rounded-xl border border-border-card shadow-card bg-surface-card"
        >
          {/* Browser chrome top bar */}
          <div className="bg-surface-2 px-4 py-3 flex items-center gap-2 border-b border-border-card">
            <span className="w-3 h-3 rounded-full bg-[#EF4444]" />
            <span className="w-3 h-3 rounded-full bg-[#EAB308]" />
            <span className="w-3 h-3 rounded-full bg-[#22C55E]" />
            <div className="bg-[#1a1625] rounded px-3 py-1 text-xs text-text-muted flex-1 ml-4">
              skillgate.sh/report/cursor-rules-architect
            </div>
          </div>

          {/* Mock report content */}
          <div className="p-6">
            {/* Verdict banner */}
            <div
              className="rounded-lg p-4 font-semibold text-center mb-4 border transition-all duration-500 ease-out"
              style={{
                backgroundColor:
                  "color-mix(in srgb, var(--color-severity-moderate) 10%, transparent)",
                color: "var(--color-severity-moderate)",
                borderColor:
                  "color-mix(in srgb, var(--color-severity-moderate) 20%, transparent)",
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(16px)",
              }}
            >
              Use with Caution
            </div>

            {/* Score */}
            <div
              className="text-center mb-6 transition-all duration-500 ease-out"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(16px)",
                transitionDelay: "100ms",
              }}
            >
              <span className="text-2xl font-bold text-text-heading">6.2</span>
              <span className="text-sm text-text-muted ml-1">/ 10</span>
            </div>

            {/* Category rows */}
            {mockCategories.map((cat, i) => (
              <div
                key={cat.name}
                className="flex items-center justify-between p-4 border-b border-border-card last:border-b-0 transition-all duration-500 ease-out"
                style={{
                  opacity: visible ? 1 : 0,
                  transform: visible ? "translateY(0)" : "translateY(16px)",
                  transitionDelay: `${(i + 1) * 150}ms`,
                }}
              >
                <span className="text-text-body font-medium">{cat.name}</span>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold text-white ${PILL_COLORS[cat.severity].bg}`}
                >
                  {PILL_COLORS[cat.severity].label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
