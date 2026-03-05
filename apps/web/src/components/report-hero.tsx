import type { AuditResult } from "@skillgate/audit-engine";
import type { AuditMeta } from "@/lib/types";
import { VERDICT_CONFIG, SEVERITY_CONFIG } from "@/lib/severity";
import { CopyButton } from "@/components/copy-button";

export function ReportHero({
  result,
  meta,
}: {
  result: AuditResult;
  meta: AuditMeta;
}) {
  const verdictKey = result.recommendation.verdict;
  const verdict = VERDICT_CONFIG[verdictKey] ?? VERDICT_CONFIG.install;
  const severity = SEVERITY_CONFIG[result.overall_score];
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://skillgate.dev";
  const permalink = `${baseUrl}/report/${meta.slug}`;

  return (
    <section className="bg-surface-1 border border-border rounded-lg p-8 mb-8">
      <div className={`h-1 -mt-8 rounded-t-lg mb-6 ${verdict.bg}`} />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1">
          <span
            className={`text-xs font-semibold uppercase tracking-widest ${verdict.color}`}
          >
            Verdict
          </span>
          <h1 className={`text-3xl font-bold mt-1 ${verdict.color}`}>
            {verdict.label}
          </h1>
          <p className="text-text-secondary mt-2 max-w-prose">
            {result.summary}
          </p>
        </div>

        <div className="flex flex-col items-end gap-3">
          <div className="text-right">
            <span className="text-text-muted text-xs uppercase tracking-wide">
              Overall Score
            </span>
            <p className={`text-lg font-semibold ${severity.color}`}>
              {severity.label}
            </p>
          </div>

          <div className="w-32 h-2 rounded-full bg-surface-3 overflow-hidden">
            <div
              className={`h-full rounded-full ${severity.bg}`}
              style={{ width: `${severity.percent}%` }}
            />
          </div>

          <CopyButton text={permalink} label="Copy Link" />
        </div>
      </div>
    </section>
  );
}
