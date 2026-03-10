"use client";

import { useEffect, useRef, useState } from "react";
import { CopyButton } from "@/components/copy-button";

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
/*  Badge data                                                         */
/* ------------------------------------------------------------------ */

const badgeVariants = [
  { label: "Safe to Install", bgColor: "#22C55E", textColor: "#FFFFFF" },
  { label: "Use with Caution", bgColor: "#F97316", textColor: "#FFFFFF" },
  { label: "Avoid / Critical", bgColor: "#EF4444", textColor: "#FFFFFF" },
];

function ShieldBadge({
  label,
  bgColor,
  textColor,
}: {
  label: string;
  bgColor: string;
  textColor: string;
}) {
  const leftWidth = 60;
  const rightWidth = label.length * 7.5 + 16;
  const totalWidth = leftWidth + rightWidth;
  const height = 28;
  const radius = 4;

  return (
    <svg
      width={totalWidth}
      height={height}
      viewBox={`0 0 ${totalWidth} ${height}`}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={`Skillgate: ${label}`}
    >
      <rect width={leftWidth} height={height} rx={radius} ry={radius} fill="#555" />
      <rect x={leftWidth - radius} width={radius} height={height} fill="#555" />
      <rect x={leftWidth} width={rightWidth} height={height} rx={radius} ry={radius} fill={bgColor} />
      <rect x={leftWidth} width={radius} height={height} fill={bgColor} />
      <text
        x={leftWidth / 2}
        y={height / 2 + 1}
        fill="#FFFFFF"
        fontSize="11"
        fontFamily="sans-serif"
        fontWeight="600"
        textAnchor="middle"
        dominantBaseline="middle"
      >
        Skillgate
      </text>
      <text
        x={leftWidth + rightWidth / 2}
        y={height / 2 + 1}
        fill={textColor}
        fontSize="11"
        fontFamily="sans-serif"
        fontWeight="600"
        textAnchor="middle"
        dominantBaseline="middle"
      >
        {label}
      </text>
    </svg>
  );
}

const snippetText = "![Skillgate](https://skillgate.sh/badge/your-skill)";

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
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[3fr_2fr]">
        {/* Left column — features + trust badges stacked */}
        <div className="flex flex-col gap-6">
          {/* Features */}
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

          {/* Trust Badges */}
          <div>
            <h2 className="mb-3 text-[32px] font-semibold text-text-heading">
              Trust Badges
            </h2>
            <div className="flex items-center rounded-xl bg-[#2d2640] p-5">
              <div className="flex items-center gap-4">
                {badgeVariants.map((v) => (
                  <ShieldBadge key={v.label} {...v} />
                ))}
              </div>
              <div className="ml-auto">
                <CopyButton text={snippetText} label="Copy" />
              </div>
            </div>
          </div>
        </div>

        {/* Right column — mock report demo (spans full height) */}
        <div className="flex flex-col">
          <h2 className="text-xl font-semibold text-text-heading mb-4">
            See it in action
          </h2>
          <div
            ref={containerRef}
            className="overflow-hidden rounded-xl border border-border-card shadow-card bg-surface-card flex-1"
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
