import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Skillgate Audit Report";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const SEVERITY_COLORS: Record<string, string> = {
  safe: "#22c55e",
  low: "#eab308",
  moderate: "#f97316",
  high: "#ef4444",
  critical: "#dc2626",
};

export default async function OgImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  let verdict = "Skillgate Audit";
  let summary = "Security audit for AI agent skills";
  let categories: { name: string; score: string }[] = [];

  try {
    const res = await fetch(`${baseUrl}/api/report/${slug}`, {
      next: { revalidate: 3600 },
    });

    if (res.ok) {
      const data = await res.json();
      verdict =
        data.result.recommendation.verdict.replace(/_/g, " ").toUpperCase() ??
        verdict;
      summary = data.result.summary ?? summary;
      categories = Object.entries(
        data.result.categories as Record<string, { score: string }>,
      ).map(([name, cat]) => ({ name, score: cat.score }));
    }
  } catch {
    // Use fallback values
  }

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "60px 80px",
          width: "100%",
          height: "100%",
          backgroundColor: "#0a0a0f",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 18, color: "#6b7280" }}>
          Skillgate Audit
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 56,
            fontWeight: 700,
            color: "#ffffff",
            marginTop: 16,
          }}
        >
          {verdict}
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 22,
            color: "#9ca3af",
            marginTop: 16,
            maxWidth: 900,
          }}
        >
          {summary}
        </div>

        {categories.length > 0 && (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 24,
              marginTop: 48,
            }}
          >
            {categories.map((cat) => (
              <div
                key={cat.name}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <div
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 6,
                    backgroundColor:
                      SEVERITY_COLORS[cat.score] ?? "#6b7280",
                  }}
                />
                <span style={{ color: "#d1d5db", fontSize: 16 }}>
                  {cat.name.replace(/_/g, " ")}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    ),
    { ...size },
  );
}
