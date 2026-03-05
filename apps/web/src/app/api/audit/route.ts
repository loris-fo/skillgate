import { type NextRequest } from "next/server";
import {
  auditSkill,
  AuditError,
  buildCacheKey,
  type AuditResult,
} from "@skillgate/audit-engine";
import { redis } from "@/lib/kv";
import { auditRateLimiter } from "@/lib/rate-limit";
import { errorResponse } from "@/lib/errors";
import { buildSlug } from "@/lib/slug";
import type { AuditMeta, AuditResponse } from "@/lib/types";

export const maxDuration = 60; // Vercel Pro for long Claude calls

const MAX_CONTENT_BYTES = 100_000; // 100KB

export async function POST(request: NextRequest) {
  // 1. Rate limit check
  const ip = request.headers.get("x-real-ip") ?? "127.0.0.1";
  const { success, reset } = await auditRateLimiter.limit(ip);
  if (!success) {
    const retryAfter = Math.ceil((reset - Date.now()) / 1000);
    return errorResponse("RATE_LIMITED", "Rate limit exceeded", 429, {
      "Retry-After": String(Math.max(retryAfter, 1)),
    });
  }

  // 2. Parse and validate request body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse("VALIDATION_ERROR", "Invalid JSON body");
  }

  const content =
    typeof body === "object" && body !== null && "content" in body
      ? (body as { content: unknown }).content
      : undefined;

  if (typeof content !== "string" || !content.trim()) {
    return errorResponse(
      "VALIDATION_ERROR",
      "Request body must include a non-empty 'content' string",
    );
  }

  // 2b. Size limit check (before hashing)
  if (Buffer.byteLength(content, "utf8") > MAX_CONTENT_BYTES) {
    return errorResponse(
      "INPUT_TOO_LARGE",
      `Content exceeds ${MAX_CONTENT_BYTES} byte limit`,
    );
  }

  // 3. Dedup via content hash
  const cacheKey = buildCacheKey(content);
  const contentHash = cacheKey.split(":")[0];

  const existingSlug = await redis.get<string>(`hash-to-slug:${contentHash}`);
  if (existingSlug) {
    const slugEntry = await redis.get<{ contentHash: string; createdAt: string }>(
      `slug:${existingSlug}`,
    );
    const cachedResult = await redis.get<AuditResult>(`audit:${contentHash}`);

    if (slugEntry && cachedResult) {
      const meta: AuditMeta = {
        slug: existingSlug,
        url: `/api/report/${existingSlug}`,
        badge_url: `/api/badge/${existingSlug}.svg`,
        created_at: slugEntry.createdAt,
        cached: true,
      };
      return Response.json({ result: cachedResult, meta } satisfies AuditResponse);
    }
  }

  // 4. Run audit
  let result: AuditResult;
  try {
    result = await auditSkill(content);
  } catch (error) {
    if (error instanceof AuditError) {
      return errorResponse(error.code, error.message);
    }
    return errorResponse(
      "API_ERROR",
      error instanceof Error ? error.message : "Unknown error",
    );
  }

  // 5. Generate slug and persist
  let slug = buildSlug(content, contentHash);

  // Handle slug collision: check if slug already points to different content
  const existingEntry = await redis.get<{ contentHash: string }>(
    `slug:${slug}`,
  );
  if (existingEntry && existingEntry.contentHash !== contentHash) {
    // Collision: extend hash suffix from 6 to 8 chars
    slug = buildSlug(content, contentHash).replace(
      /-[a-f0-9]{6}$/,
      `-${contentHash.slice(0, 8)}`,
    );
  }

  const createdAt = new Date().toISOString();

  // Fire-and-forget KV writes
  redis.set(`slug:${slug}`, { contentHash, createdAt }).catch(() => {});
  redis.set(`hash-to-slug:${contentHash}`, slug).catch(() => {});
  redis.set(`audit:${contentHash}`, result).catch(() => {});

  // 6. Return AuditResponse
  const meta: AuditMeta = {
    slug,
    url: `/api/report/${slug}`,
    badge_url: `/api/badge/${slug}.svg`,
    created_at: createdAt,
    cached: false,
  };

  return Response.json({ result, meta } satisfies AuditResponse);
}
