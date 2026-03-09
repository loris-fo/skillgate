"use client";

import { useState } from "react";
import type { CategoryResult } from "@skillgate/audit-engine";
import { SEVERITY_CONFIG } from "@/lib/severity";

const CATEGORY_LABELS: Record<string, string> = {
  hidden_logic: "Hidden Logic",
  data_access: "Data Access",
  action_risk: "Action Risk",
  permission_scope: "Permission Scope",
  override_attempts: "Override Attempts",
};

export function CategoryCard({
  name,
  result,
}: {
  name: string;
  result: CategoryResult;
}) {
  const [expanded, setExpanded] = useState(false);
  const severity = SEVERITY_CONFIG[result.score];
  const label = CATEGORY_LABELS[name] ?? name;

  return (
    <div className="rounded-xl bg-surface-card border border-border-card shadow-card p-6">
      {/* Header -- clickable toggle */}
      <button
        type="button"
        aria-expanded={expanded}
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left flex items-center justify-between cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <h3 className="text-text-heading font-semibold">{label}</h3>
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold text-white ${severity.bg}`}
          >
            {severity.label}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {result.by_design && (
            <span className="bg-accent-muted text-accent text-xs font-medium px-2 py-0.5 rounded-full">
              By Design
            </span>
          )}
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={`transition-transform duration-200 ${expanded ? "rotate-0" : "rotate-180"}`}
          >
            <path
              d="M4 6L8 10L12 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </button>

      {/* Finding + Detail -- conditionally rendered */}
      {expanded && (
        <div className="mt-4">
          <p className="text-text-body text-sm mb-2">{result.finding}</p>
          <p className="text-text-muted text-sm">{result.detail}</p>
        </div>
      )}
    </div>
  );
}
