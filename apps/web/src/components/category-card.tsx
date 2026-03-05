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
  const severity = SEVERITY_CONFIG[result.score];
  const label = CATEGORY_LABELS[name] ?? name;

  return (
    <div className="bg-surface-1 border border-border rounded-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-text-primary font-semibold">{label}</h3>
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium ${severity.color}`}>
            {severity.label}
          </span>
          {result.by_design && (
            <span className="bg-accent-muted text-accent text-xs font-medium px-2 py-0.5 rounded-full">
              By Design
            </span>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 rounded-full bg-surface-3 overflow-hidden mb-4">
        <div
          className={`h-full rounded-full ${severity.bg}`}
          style={{ width: `${severity.percent}%` }}
        />
      </div>

      {/* Finding */}
      <p className="text-text-secondary text-sm mb-2">{result.finding}</p>

      {/* Detail */}
      <p className="text-text-muted text-sm">{result.detail}</p>
    </div>
  );
}
