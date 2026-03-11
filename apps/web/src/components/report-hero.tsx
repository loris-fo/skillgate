import type { AuditResult } from "@skillgate/audit-engine";
import type { AuditMeta } from "@/lib/types";
import { VERDICT_CONFIG, SEVERITY_CONFIG } from "@/lib/severity";
import { CopyButton } from "@/components/copy-button";

export function ReportHero({
  result,
  meta,
  slug: _slug,
}: {
  result: AuditResult;
  meta: AuditMeta;
  slug?: string;
}) {
  const verdictKey = result.recommendation.verdict;
  const verdict = VERDICT_CONFIG[verdictKey] ?? VERDICT_CONFIG.install;
  const severity = SEVERITY_CONFIG[result.overall_score];
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://skillgate.sh";
  const permalink = `${baseUrl}/report/${meta.slug}`;

  return (
    <section className="rounded-xl bg-surface-card border border-border-card shadow-card p-8 mb-8">
      {/* Top row: verdict pill + score pill + copy link */}
      <div className="flex items-center gap-4 flex-wrap">
        <span
          className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold text-white ${verdict.bg}`}
        >
          {verdict.label}
        </span>

        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${severity.color} border-current`}
        >
          {severity.numeric}/10
        </span>

        <CopyButton text={permalink} label="Copy Link" />
      </div>

      {/* Summary */}
      <p className="text-text-body text-base leading-relaxed mt-4">
        {result.summary}
      </p>
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
    <div className="rounded-xl bg-surface-card border border-border-card shadow-card p-6">
      <div className="space-y-4">
        {recommendation.for_who && (
          <div>
            <span className="text-text-muted text-xs uppercase tracking-wide font-medium">
              Best for
            </span>
            <p className="text-text-body text-sm mt-1">
              {recommendation.for_who}
            </p>
          </div>
        )}

        {recommendation.caveats?.length > 0 && (
          <div>
            <span className="text-text-muted text-xs uppercase tracking-wide font-medium">
              Caveats
            </span>
            <ul className="mt-1 list-disc list-inside text-sm text-severity-moderate">
              {recommendation.caveats.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </div>
        )}

        {recommendation.alternatives?.length > 0 && (
          <div>
            <span className="text-text-muted text-xs uppercase tracking-wide font-medium">
              Alternatives
            </span>
            <ul className="mt-1 list-disc list-inside text-sm text-text-body">
              {recommendation.alternatives.map((a, i) => (
                <li key={i}>{a}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
