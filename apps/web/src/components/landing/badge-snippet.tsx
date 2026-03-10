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
    <section id="badge-section" className="px-4 py-6">
      <div className="mx-auto max-w-4xl">
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
    </section>
  );
}
