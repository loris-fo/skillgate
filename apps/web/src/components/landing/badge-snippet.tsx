"use client";

import { CopyButton } from "@/components/copy-button";

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
      {/* Left side - "Skillgate" */}
      <rect width={leftWidth} height={height} rx={radius} ry={radius} fill="#555" />
      <rect x={leftWidth - radius} width={radius} height={height} fill="#555" />
      {/* Right side - status */}
      <rect x={leftWidth} width={rightWidth} height={height} rx={radius} ry={radius} fill={bgColor} />
      <rect x={leftWidth} width={radius} height={height} fill={bgColor} />
      {/* Text */}
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

export function BadgeSnippet() {
  return (
    <section id="badge-section" className="px-4 py-16">
      <div className="mx-auto max-w-4xl">
        <h2 className="mb-4 text-center text-2xl font-bold text-text-heading">
          Add a trust badge
        </h2>

        <p className="mb-8 text-center text-text-body">
          After auditing your skill, add the badge to your README.
        </p>

        {/* Per-badge cards with individual copy buttons */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {badgeVariants.map((v) => (
            <div key={v.label} className="flex flex-col items-center gap-3">
              <ShieldBadge {...v} />
              <div className="relative w-full">
                <pre className="overflow-x-auto rounded-lg border border-border bg-surface-2 p-3 pr-20 font-mono text-xs text-text-body">
                  {snippetText}
                </pre>
                <div className="absolute right-2 top-2">
                  <CopyButton text={snippetText} label="Copy" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
