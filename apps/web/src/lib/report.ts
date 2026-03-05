import type { AuditResult } from "@skillgate/audit-engine";
import { redis } from "@/lib/kv";
import type { AuditMeta, AuditResponse } from "@/lib/types";

/**
 * Load a report directly from Redis by slug or content hash.
 * Used by Server Components to avoid the self-fetch anti-pattern.
 */
export async function getReportBySlug(id: string): Promise<AuditResponse | null> {
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
    if (!resolvedSlug) return null;

    slug = resolvedSlug;
    const entry = await redis.get<{ contentHash: string; createdAt: string }>(
      `slug:${resolvedSlug}`,
    );
    if (!entry) return null;

    contentHash = entry.contentHash;
    createdAt = entry.createdAt;
  }

  // 3. Load audit data
  const result = await redis.get<AuditResult>(`audit:${contentHash}`);
  if (!result) return null;

  // 4. Build response
  const meta: AuditMeta = {
    slug,
    url: `/api/report/${slug}`,
    badge_url: `/api/badge/${slug}.svg`,
    created_at: createdAt,
    cached: true,
  };

  return { result, meta };
}
