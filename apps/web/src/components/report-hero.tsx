"use client";

import { useState } from "react";
import type { AuditResult } from "@skillgate/audit-engine";
import { getAgentDisplayName } from "@skillgate/shared";
import type { AuditMeta } from "@/lib/types";
import { SEVERITY_CONFIG } from "@/lib/severity";

const VERDICT_COLORS: Record<string, { bg: string; text: string }> = {
  install: { bg: "#4ADE80", text: "#1A1A24" },
  install_with_caution: { bg: "#E8A04C", text: "#1A1A24" },
  review_first: { bg: "#A855F7", text: "#1A1A24" },
  avoid: { bg: "#EF4444", text: "#1A1A24" },
};

const VERDICT_LABELS: Record<string, string> = {
  install: "Install",
  install_with_caution: "Install with Caution",
  review_first: "Review First",
  avoid: "Avoid",
};

function toTitleCase(str: string): string {
  return str
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function ReportHero({
  result,
  meta,
  slug,
}: {
  result: AuditResult;
  meta: AuditMeta;
  slug?: string;
}) {
  const [copied, setCopied] = useState(false);

  const verdictKey = result.recommendation.verdict;
  const verdictColor = VERDICT_COLORS[verdictKey] ?? VERDICT_COLORS.install;
  const verdictLabel = VERDICT_LABELS[verdictKey] ?? verdictKey.replace(/_/g, " ");
  const severity = SEVERITY_CONFIG[result.overall_score];
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://skillgate.sh";
  const permalink = `${baseUrl}/report/${slug ?? meta.slug}`;

  const skillName = toTitleCase(meta.slug);

  const circumference = 2 * Math.PI * 68;
  const dashOffset = circumference * (1 - severity.numeric / 10);

  function handleCopyLink() {
    navigator.clipboard.writeText(permalink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <section className="relative pt-[140px] pb-12 px-4 max-w-[1100px] mx-auto">
      {/* Background decoration */}
      <div
        className="absolute top-[-20px] right-[100px] w-[300px] h-[300px] rounded-full z-0 pointer-events-none"
        style={{ background: "rgba(168,85,247,0.15)", filter: "blur(60px)" }}
      />

      {/* Content */}
      <div className="relative z-10">
        <h1 className="text-[64px] font-bold text-white leading-[1.1] mb-4">
          {skillName}
        </h1>

        {/* Button row */}
        <div className="flex gap-3 mb-6 flex-wrap">
          <button
            type="button"
            className="text-[14px] font-semibold px-5 py-2.5 rounded-lg"
            style={{ backgroundColor: verdictColor.bg, color: verdictColor.text }}
          >
            {verdictLabel}
          </button>

          <span
            className="text-[14px] font-medium px-4 py-2.5 rounded-lg text-white"
            style={{ border: "1px solid #3A3A4A", background: "transparent" }}
          >
            {severity.numeric}/10
          </span>

          <button
            type="button"
            onClick={handleCopyLink}
            className="text-[14px] px-4 py-2.5 rounded-lg cursor-pointer"
            style={{
              border: "1px solid #3A3A4A",
              background: "transparent",
              color: "#A0A0B0",
            }}
          >
            {copied ? "Copied!" : "Copy Link"}
          </button>

          {result.detected_agent && result.detected_agent !== "unknown" && (
            <span
              className="text-[14px] font-medium px-4 py-2.5 rounded-lg"
              style={{
                border: "1px solid #3A3A4A",
                background: "rgba(168, 85, 247, 0.1)",
                color: "#C4B5FD",
              }}
            >
              {getAgentDisplayName(result.detected_agent)}
            </span>
          )}
        </div>

        {/* Description */}
        <p
          className="max-w-[700px] text-[16px] leading-[1.7]"
          style={{ color: "#A0A0B0" }}
        >
          {result.summary}
        </p>
      </div>

      {/* Score circle */}
      <div className="absolute top-[100px] right-[80px] hidden lg:block">
        <svg width="160" height="160" viewBox="0 0 160 160">
          <defs>
            <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#E8A04C" />
              <stop offset="100%" stopColor="#F59E0B" />
            </linearGradient>
          </defs>
          {/* Track */}
          <circle
            cx="80"
            cy="80"
            r="68"
            stroke="#3A3A4A"
            strokeWidth="12"
            fill="none"
          />
          {/* Progress */}
          <circle
            cx="80"
            cy="80"
            r="68"
            stroke="url(#scoreGrad)"
            strokeWidth="12"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            transform="rotate(-90 80 80)"
          />
          {/* Score text */}
          <text
            x="80"
            y="88"
            textAnchor="middle"
            fill="white"
            fontSize="48"
            fontWeight="bold"
          >
            {severity.numeric}
          </text>
          <text
            x="80"
            y="115"
            textAnchor="middle"
            fill="#A0A0B0"
            fontSize="24"
          >
            /10
          </text>
        </svg>
      </div>
    </section>
  );
}

export function RecommendationCard({
  recommendation,
}: {
  recommendation: AuditResult["recommendation"];
}) {
  const hasContent =
    recommendation.for_who ||
    recommendation.caveats?.length > 0 ||
    recommendation.alternatives?.length > 0;

  if (!hasContent) return null;

  return (
    <div
      className="rounded-xl p-6"
      style={{ background: "#1A1A24", border: "1px solid #2A2A3A" }}
    >
      <div className="space-y-4">
        {recommendation.for_who && (
          <p className="text-[14px]" style={{ color: "#A0A0B0" }}>
            {recommendation.for_who}
          </p>
        )}

        {recommendation.caveats?.length > 0 && (
          <ul className="space-y-1.5">
            {recommendation.caveats.map((c, i) => (
              <li key={i} className="flex items-start gap-2 text-[14px]">
                <span
                  className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ background: "#E8A04C" }}
                />
                <span style={{ color: "#A0A0B0" }}>{c}</span>
              </li>
            ))}
          </ul>
        )}

        {recommendation.alternatives?.length > 0 && (
          <ul className="space-y-1.5">
            {recommendation.alternatives.map((a, i) => (
              <li key={i} className="flex items-start gap-2 text-[14px]">
                <span
                  className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ background: "#A0A0B0" }}
                />
                <span style={{ color: "#6B6B7B" }}>{a}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
