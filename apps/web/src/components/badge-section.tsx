import { CopyButton } from "@/components/copy-button";

export function BadgeSection({ slug }: { slug: string }) {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "https://skillgate.sh";
  const badgeSrc = `/api/badge/${slug}.svg`;
  const snippet = `[![Skillgate](${baseUrl}/api/badge/${slug}.svg)](${baseUrl}/report/${slug})`;

  return (
    <section className="bg-surface-1 border border-border rounded-lg p-6 my-8">
      <h2 className="text-text-primary text-xl font-semibold mb-6">
        Add to README
      </h2>

      {/* Badge preview */}
      <div className="bg-surface-2 rounded-lg p-6 flex justify-center mb-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={badgeSrc} alt="Skillgate badge" />
      </div>

      {/* Markdown snippet */}
      <div className="relative">
        <pre className="bg-surface-2 border border-border rounded-lg p-4 pr-24 font-mono text-sm text-text-secondary overflow-x-auto whitespace-pre-wrap break-all">
          {snippet}
        </pre>
        <div className="absolute top-3 right-3">
          <CopyButton text={snippet} label="Copy" />
        </div>
      </div>
    </section>
  );
}
