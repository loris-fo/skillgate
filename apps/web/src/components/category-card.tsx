import type { CategoryResult } from "@skillgate/audit-engine";

const CATEGORY_LABELS: Record<string, string> = {
  hidden_logic: "Hidden Logic",
  data_access: "Data Access",
  action_risk: "Action Risk",
  permission_scope: "Permission Scope",
  override_attempts: "Override Attempts",
};

const SEVERITY_DOT_COLORS: Record<string, string> = {
  safe: "#4ADE80",
  low: "#FACC15",
  moderate: "#A855F7",
  high: "#EF4444",
  critical: "#EF4444",
};

const SEVERITY_LABELS: Record<string, string> = {
  safe: "Safe",
  low: "Low",
  moderate: "Moderate",
  high: "High",
  critical: "Critical",
};

export function CategoryCard({
  name,
  result,
}: {
  name: string;
  result: CategoryResult;
}) {
  const label = CATEGORY_LABELS[name] ?? name;
  const dotColor = SEVERITY_DOT_COLORS[result.score] ?? "#A0A0B0";
  const severityLabel = SEVERITY_LABELS[result.score] ?? result.score;

  return (
    <div
      className="rounded-xl p-5"
      style={{ background: "#1A1A24", border: "1px solid #2A2A3A" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full inline-block"
            style={{ background: dotColor }}
          />
          <span className="text-[13px]" style={{ color: dotColor }}>
            {severityLabel}
          </span>
        </div>
        {result.by_design && (
          <span
            className="text-[11px] px-2 py-0.5 rounded"
            style={{ background: "#2A2A3A", color: "#A0A0B0" }}
          >
            By Design
          </span>
        )}
      </div>

      {/* Category name */}
      <h3 className="text-[14px] font-semibold text-white mt-2">{label}</h3>

      {/* Finding */}
      <p
        className="text-[13px] leading-[1.5] mt-1"
        style={{ color: "#6B6B7B" }}
      >
        {result.finding}
      </p>
    </div>
  );
}
