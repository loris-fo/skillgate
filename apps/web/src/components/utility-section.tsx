import type { UtilityAnalysis } from "@skillgate/audit-engine";

export function UtilitySection({ utility }: { utility: UtilityAnalysis }) {
  return (
    <section className="rounded-xl bg-surface-card border border-border-card shadow-card p-6 mb-0">
      <h2 className="text-text-heading text-xl font-semibold mb-6">
        Utility Analysis
      </h2>

      {/* What it does */}
      <div className="mb-5">
        <h3 className="text-text-heading font-medium mb-1">What it does</h3>
        <p className="text-text-body text-sm">{utility.what_it_does}</p>
      </div>

      {/* Use Cases */}
      {utility.use_cases.length > 0 && (
        <div className="mb-5">
          <h3 className="text-text-heading font-medium mb-1">Use Cases</h3>
          <ul className="list-disc list-inside text-text-body text-sm space-y-1">
            {utility.use_cases.map((uc) => (
              <li key={uc}>{uc}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Not For */}
      {utility.not_for.length > 0 && (
        <div className="mb-5">
          <h3 className="text-text-heading font-medium mb-1">Not For</h3>
          <ul className="list-disc list-inside text-text-body text-sm space-y-1">
            {utility.not_for.map((nf) => (
              <li key={nf}>{nf}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Trigger Behavior */}
      <div className="mb-5">
        <h3 className="text-text-heading font-medium mb-1">
          Trigger Behavior
        </h3>
        <p className="text-text-body text-sm">
          {utility.trigger_behavior}
        </p>
      </div>

      {/* Dependencies */}
      {utility.dependencies.length > 0 && (
        <div>
          <h3 className="text-text-heading font-medium mb-2">Dependencies</h3>
          <div className="flex flex-wrap gap-2">
            {utility.dependencies.map((dep) => (
              <span
                key={dep}
                className="bg-surface-0 text-text-body text-xs font-mono px-2 py-1 rounded"
              >
                {dep}
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
