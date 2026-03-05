import { type NextRequest } from "next/server";
import type { AuditResult } from "@skillgate/audit-engine";
import { redis } from "@/lib/kv";
import { errorResponse } from "@/lib/errors";
import type { AuditMeta, AuditResponse } from "@/lib/types";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  let slug: string;
  let contentHash: string;
  let createdAt: string;

  // 1. Try slug lookup first
  const slugEntry = await redis.get<{ contentHash: string; createdAt: string }>(
    `slug:${id}`,
  );

  if (slugEntry) {
    slug = id;
    contentHash = slugEntry.contentHash;
    createdAt = slugEntry.createdAt;
  } else {
    // 2. Try as content hash
    const resolvedSlug = await redis.get<string>(`hash-to-slug:${id}`);
    if (!resolvedSlug) {
      return errorResponse("NOT_FOUND", `No audit found for id: ${id}`);
    }

    slug = resolvedSlug;
    const entry = await redis.get<{ contentHash: string; createdAt: string }>(
      `slug:${resolvedSlug}`,
    );
    if (!entry) {
      return errorResponse("NOT_FOUND", `No audit found for id: ${id}`);
    }
    contentHash = entry.contentHash;
    createdAt = entry.createdAt;
  }

  // 3. Load audit data
  const result = await redis.get<AuditResult>(`audit:${contentHash}`);
  if (!result) {
    return errorResponse("NOT_FOUND", `Audit data missing for id: ${id}`);
  }

  // 4. Build response
  const meta: AuditMeta = {
    slug,
    url: `/api/report/${slug}`,
    badge_url: `/api/badge/${slug}.svg`,
    created_at: createdAt,
    cached: true,
  };

  return Response.json({ result, meta } satisfies AuditResponse);
}
