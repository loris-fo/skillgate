import { type NextRequest } from "next/server";
import type { AuditResult } from "@skillgate/audit-engine";
import { redis } from "@/lib/kv";
import { errorResponse } from "@/lib/errors";
import { generateBadge } from "@/lib/badge";

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
  if (!entry) {
    return errorResponse("NOT_FOUND", `No audit found for slug: ${slug}`);
  }

  // 2. Load audit data
  const result = await redis.get<AuditResult>(`audit:${entry.contentHash}`);
  if (!result) {
    return errorResponse("NOT_FOUND", `Audit data missing for slug: ${slug}`);
  }

  // 3. Generate SVG badge
  const svg = generateBadge(result.recommendation.verdict);

  // 4. Return SVG with cache headers
  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
