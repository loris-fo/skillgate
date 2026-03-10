"use client";

import { useEffect, useRef, useState } from "react";

/* ------------------------------------------------------------------ */
/*  Feature card data                                                  */
/* ------------------------------------------------------------------ */

const features = [
  {
    title: "AI Security Analysis",
    description:
      "Deep-scan any skill across 5 risk categories \u2014 from hidden logic to override attempts \u2014 with plain-English verdicts you can actually understand.",
  },
  {
    title: "CLI Gate",
    description:
      "One command stands between you and a risky install. Block dangerous skills before they ever touch your codebase.",
  },
  {
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
  { name: "Action Risk", severity: "critical" as const },
  { name: "Permission Scope", severity: "critical" as const },
  { name: "Override Attempts", severity: "critical" as const },
];

const PILL_COLORS: Record<string, { bg: string; label: string }> = {
  safe: { bg: "bg-severity-safe", label: "Safe" },
  low: { bg: "bg-severity-low", label: "Low" },
  moderate: { bg: "bg-severity-moderate", label: "Moderate" },
  critical: { bg: "bg-severity-critical", label: "Critical" },
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
    <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[3fr_2fr] lg:items-start">
        {/* Left column — feature cards */}
        <div>
          <h2 className="text-xl font-semibold text-text-heading mb-4">
            Features
          </h2>
          <div className="grid grid-cols-3 gap-4 items-stretch">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl bg-[#2d2640] border border-accent/20 p-6"
              >
                <h3 className="font-semibold text-text-heading">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm text-text-body">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right column — mock report demo */}
        <div>
          <h2 className="text-xl font-semibold text-text-heading mb-4">
            See it in action
          </h2>
          <div
            ref={containerRef}
            className="overflow-hidden rounded-xl border border-border-card shadow-card bg-surface-card"
          >
            {/* Browser chrome top bar */}
            <div className="bg-[#1e1a2e] px-4 py-3 flex items-center gap-2 border-b border-border-card">
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
                    "color-mix(in srgb, var(--color-severity-safe) 10%, transparent)",
                  color: "var(--color-severity-safe)",
                  borderColor:
                    "color-mix(in srgb, var(--color-severity-safe) 20%, transparent)",
                  opacity: visible ? 1 : 0,
                  transform: visible ? "translateY(0)" : "translateY(16px)",
                }}
              >
                Safe to Install
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
      </div>
    </section>
  );
}
