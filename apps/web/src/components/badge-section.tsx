import { CopyButton } from "@/components/copy-button";

export function BadgeSection({ slug }: { slug: string }) {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "https://skillgate.sh";
  const badgeSrc = `/api/badge/${slug}.svg`;
  const snippet = `[![Skillgate](${baseUrl}/api/badge/${slug}.svg)](${baseUrl}/report/${slug})`;

  return (
    <section
      className="rounded-xl p-6"
      style={{ background: "#1A1A24", border: "1px solid #2A2A3A" }}
    >
      <h2 className="text-[20px] font-semibold text-white mb-1">Badge</h2>
      <p className="text-[14px] mb-4" style={{ color: "#6B6B7B" }}>
        Add to README
      </p>

      {/* Badge preview */}
      <div
        className="rounded-lg p-4 flex justify-center mb-4"
        style={{ background: "#12121A" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={badgeSrc} alt="Skillgate badge" />
      </div>

      {/* Markdown snippet */}
      <div className="relative">
        <pre
          className="rounded-lg p-4 pr-24 font-mono text-[13px] overflow-x-auto whitespace-pre-wrap break-all"
          style={{ background: "#12121A", color: "#A0A0B0" }}
        >
          {snippet}
        </pre>
        <div className="absolute top-3 right-3">
          <CopyButton text={snippet} label="Copy" />
        </div>
      </div>
    </section>
  );
}
