import { type NextRequest } from "next/server";
import type { AuditResult } from "@skillgate/audit-engine";
import { redis } from "@/lib/kv";
import { errorResponse } from "@/lib/errors";
import { generateBadge } from "@/lib/badge";
import { getMockReport } from "@/lib/mock-reports";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  // Strip .svg suffix defensively (URL is /api/badge/{slug}.svg but Next.js catches it as [id])
  const slug = id.replace(/\.svg$/, "");

  // 1. Look up slug
  const entry = await redis.get<{ contentHash: string; createdAt: string }>(
    `slug:${slug}`,
  );

  let result: AuditResult | null = null;

  if (entry) {
    // 2. Load audit data from Redis
    result = await redis.get<AuditResult>(`audit:${entry.contentHash}`);
  }

  // 3. Fall back to mock reports
  if (!result) {
    const mock = getMockReport(slug);
    if (mock) {
      result = mock.result;
    }
  }

  if (!result) {
    return errorResponse("NOT_FOUND", `No audit found for slug: ${slug}`);
  }

  // 4. Generate SVG badge
  const svg = generateBadge(result.recommendation.verdict);

  // 5. Return SVG with cache headers
  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
