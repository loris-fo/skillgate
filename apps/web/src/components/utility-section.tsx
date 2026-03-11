import type { UtilityAnalysis } from "@skillgate/audit-engine";

export function UtilitySection({ utility }: { utility: UtilityAnalysis }) {
  return (
    <section
      className="rounded-xl p-6"
      style={{ background: "#1A1A24", border: "1px solid #2A2A3A" }}
    >
      <h2 className="text-[20px] font-semibold text-white">
        Utility Analysis
      </h2>
      <p className="text-[14px] mt-1" style={{ color: "#6B6B7B" }}>
        What it does
      </p>
      <div
        className="rounded-lg p-4 font-mono text-[13px] mt-3"
        style={{ background: "#12121A", color: "#A0A0B0" }}
      >
        {utility.what_it_does}
      </div>
    </section>
  );
}
