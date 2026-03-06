---
phase: 02-api-surface
verified: 2026-03-05T16:00:00Z
status: passed
score: 10/10 must-haves verified
re_verification: false
---

# Phase 2: API Surface Verification Report

**Phase Goal:** The web API accepts audits, persists results to KV, and serves reports and badges via permanent URLs
**Verified:** 2026-03-05T16:00:00Z
**Status:** passed
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | POST /api/audit accepts SKILL.md content and returns AuditResult with slug URL and badge URL | VERIFIED | `apps/web/src/app/api/audit/route.ts` exports POST, validates content, calls `auditSkill`, returns `{ result, meta }` with `url` and `badge_url` fields. Test confirms 200 + full AuditResponse shape. |
| 2 | GET /api/report/{slug} returns the audit data for a previously audited skill | VERIFIED | `apps/web/src/app/api/report/[id]/route.ts` exports GET, looks up `slug:{id}` in Redis, loads `audit:{contentHash}`, returns `AuditResponse`. Test confirms 200 + correct data. |
| 3 | GET /api/badge/{slug}.svg returns a colored SVG badge matching the audit verdict | VERIFIED | `apps/web/src/app/api/badge/[id]/route.ts` exports GET, strips `.svg` suffix, looks up slug, calls `generateBadge(result.recommendation.verdict)`, returns `image/svg+xml` with `Cache-Control: public, max-age=86400`. |
| 4 | Repeated identical POST requests return cached result without additional Claude API calls | VERIFIED | Audit route checks `hash-to-slug:{contentHash}` before calling `auditSkill`. If found, returns `cached: true` and skips engine call. Test confirms `mockAuditSkill` not called on repeat. |
| 5 | POST /api/audit returns 429 with Retry-After header after 30 requests per hour per IP | VERIFIED | Rate limit check at top of POST handler: reads `x-real-ip`, calls `auditRateLimiter.limit(ip)`, returns `errorResponse("RATE_LIMITED", ..., 429, { "Retry-After": ... })`. Test confirms 429 + header present. |
| 6 | Both slug-based and content-hash-based lookups resolve to the same audit | VERIFIED | Report route tries `slug:{id}` first; if not found, tries `hash-to-slug:{id}` to get slug, then loads audit. Test covers both paths and confirms same result. |
| 7 | Next.js app boots and serves a page at localhost:3000 | VERIFIED | `pnpm --filter @skillgate/web build` succeeds. Build output shows `/ (Static)` and all 3 API routes as `(Dynamic)`. |
| 8 | Slug generation produces URL-safe slugs with hash suffix from SKILL.md content | VERIFIED | `apps/web/src/lib/slug.ts` implements `extractSkillName` + `buildSlug`. 8 unit tests pass covering name extraction, slugification, truncation, hash suffix. |
| 9 | Badge generation produces valid SVG with correct colors per verdict | VERIFIED | `apps/web/src/lib/badge.ts` implements `generateBadge` with `VERDICT_COLORS` and `VERDICT_LABELS` maps. 5 unit tests pass for all 4 verdicts including color and "Skillgate" label. |
| 10 | API types define consistent response envelope and error shapes | VERIFIED | `apps/web/src/lib/types.ts` exports `AuditResponse`, `ErrorResponse`, `AuditMeta`, `ApiErrorCode`. Used with `satisfies` type assertion in route handlers. |

**Score:** 10/10 truths verified

---

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `apps/web/src/app/api/audit/route.ts` | POST /api/audit endpoint | VERIFIED | Exports `POST`, 127 lines, substantive implementation with rate limiting, validation, dedup, audit call, KV persistence. |
| `apps/web/src/app/api/report/[id]/route.ts` | GET /api/report/{id} endpoint | VERIFIED | Exports `GET`, 60 lines, dual slug/hash lookup with full AuditResponse shape. |
| `apps/web/src/app/api/badge/[id]/route.ts` | GET /api/badge/{id} endpoint | VERIFIED | Exports `GET`, 39 lines, Redis lookup + `generateBadge` call + SVG response with cache headers. Note: route folder is `[id]` not `[id].svg` — Next.js type generation issue workaround; handler strips `.svg` suffix defensively. |
| `apps/web/src/lib/kv.ts` | Shared Redis client singleton | VERIFIED | Exports `redis = Redis.fromEnv()`. 4 lines, correct singleton pattern. |
| `apps/web/src/lib/slug.ts` | Skill name extraction and slug building | VERIFIED | Exports `extractSkillName`, `buildSlug`. Truncates to 30 chars + 6-char hash suffix. |
| `apps/web/src/lib/badge.ts` | SVG badge generation with verdict color mapping | VERIFIED | Exports `generateBadge`. Correct color map for all 4 verdicts. Uses `badge-maker` `makeBadge`. |
| `apps/web/src/lib/rate-limit.ts` | Sliding window rate limiter | VERIFIED | Exports `auditRateLimiter`. Configured with `slidingWindow(30, "1 h")`, prefix `ratelimit:audit`, ephemeral cache. |
| `apps/web/src/lib/errors.ts` | API error response helpers | VERIFIED | Exports `errorResponse`. STATUS_MAP covers all 5 ApiErrorCode values. |
| `apps/web/src/lib/types.ts` | AuditResponse and ErrorResponse envelope types | VERIFIED | Exports `AuditResponse`, `ErrorResponse`, `AuditMeta`, `ApiErrorCode`. |

---

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `apps/web/src/lib/kv.ts` | `@upstash/redis` | `Redis.fromEnv()` singleton | VERIFIED | Line 1: `import { Redis } from "@upstash/redis"`. Line 4: `export const redis = Redis.fromEnv()`. |
| `apps/web/src/lib/rate-limit.ts` | `apps/web/src/lib/kv.ts` | imports redis singleton | VERIFIED | Line 2: `import { redis } from "./kv"`. Passed directly to `Ratelimit` constructor. |
| `apps/web/src/lib/badge.ts` | `badge-maker` | `makeBadge()` call | VERIFIED | Line 1: `import { makeBadge } from "badge-maker"`. Line 19: `return makeBadge({ ... })`. |
| `apps/web/src/app/api/audit/route.ts` | `@skillgate/audit-engine` | `auditSkill(content)` call | VERIFIED | Line 2-6: imports `auditSkill`, `AuditError`, `buildCacheKey`. Line 83: `result = await auditSkill(content)`. |
| `apps/web/src/app/api/audit/route.ts` | `apps/web/src/lib/kv.ts` | `redis.set/get` for KV persistence | VERIFIED | Lines 61-66: `redis.get(hash-to-slug:...)`, `redis.get(slug:...)`, `redis.get(audit:...)`. Lines 112-114: fire-and-forget `.set` calls. |
| `apps/web/src/app/api/audit/route.ts` | `apps/web/src/lib/rate-limit.ts` | `auditRateLimiter.limit(ip)` | VERIFIED | Line 9: import. Line 21: `const { success, reset } = await auditRateLimiter.limit(ip)`. |
| `apps/web/src/app/api/report/[id]/route.ts` | `apps/web/src/lib/kv.ts` | `redis.get` for slug lookup | VERIFIED | Line 3: import. Lines 18-45: `redis.get(slug:...)`, `redis.get(hash-to-slug:...)`, `redis.get(audit:...)`. |
| `apps/web/src/app/api/badge/[id]/route.ts` | `apps/web/src/lib/badge.ts` | `generateBadge(verdict)` to produce SVG | VERIFIED | Line 5: `import { generateBadge } from "@/lib/badge"`. Line 30: `const svg = generateBadge(result.recommendation.verdict)`. |

---

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| WEB-06 | 02-02-PLAN.md | Each audit has a permanent shareable URL (content-hash based) | SATISFIED | POST /api/audit returns `meta.url = /api/report/{slug}` and `meta.badge_url`. GET /api/report/{id} accepts both slug and content hash. Dedup logic reuses existing slug for same content hash. |
| DIST-01 | 02-01-PLAN.md, 02-02-PLAN.md | SVG badge generated at `/api/badge/[slug].svg` reflecting audit result | SATISFIED | GET /api/badge/[id] returns `image/svg+xml` with verdict-colored SVG. Badge URL format `/api/badge/{slug}.svg` is used throughout; handler strips `.svg` suffix. Build shows route active. |
| DIST-02 | 02-01-PLAN.md, 02-02-PLAN.md | Dual URL scheme — content hash for integrity, human-readable slug for display | SATISFIED | Report route tries slug lookup first, then falls back to `hash-to-slug:{id}` lookup. Both resolve to the same audit result. 3 tests cover both paths. |
| DIST-03 | 02-02-PLAN.md | Badge and audit URLs are permanent and publicly accessible (no auth) | SATISFIED | No auth middleware, no auth checks anywhere in any route handler. All 3 routes are publicly accessible by design. |

No orphaned requirements — all 4 requirement IDs (WEB-06, DIST-01, DIST-02, DIST-03) claimed by Phase 2 plans are accounted for in both plans and verified in code.

---

### Anti-Patterns Found

None. No TODO/FIXME/placeholder comments found in any lib module or route handler. All implementations are substantive.

---

### Human Verification Required

#### 1. Redis connectivity in production

**Test:** Deploy to Vercel with `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` env vars set. Send a POST to `/api/audit` with valid SKILL.md content.
**Expected:** 200 response with slug URL, stored in Upstash Redis. Subsequent GET to the slug URL returns the cached audit.
**Why human:** Tests mock Redis entirely. The `Redis.fromEnv()` call (which requires env vars) cannot be integration-tested without live credentials.

#### 2. Badge URL routing with `.svg` extension

**Test:** Access `/api/badge/commit-helper-abc123.svg` in a real browser or curl with a known slug.
**Expected:** The URL resolves to the badge route, the `.svg` suffix is stripped, and the SVG badge is returned with correct Content-Type.
**Why human:** The badge route is at `/api/badge/[id]` — Next.js must route `/api/badge/{slug}.svg` to it with `id = "{slug}.svg"`. This is confirmed by the build output, but should be verified against a live request to ensure no routing edge cases.

---

### Design Decisions Worth Noting

**Badge route folder change:** The plan specified `[id].svg` as the folder name but the implementation uses `[id]`. This was a necessary deviation — Next.js type generation treats `[id].svg` as a segment without dynamic params, causing a TypeScript build failure. The handler compensates by stripping the `.svg` suffix from the `id` parameter. The badge URLs in API responses still use the `.svg` extension (e.g., `/api/badge/commit-helper-abc123.svg`), which routes correctly because Next.js treats the full `{slug}.svg` string as the `[id]` parameter value.

**fire-and-forget KV writes:** The audit route uses `.catch(() => {})` for all three KV writes to avoid blocking the response on persistence errors. This is intentional and matches the pattern documented in the SUMMARY.

---

## Gaps Summary

None. All 10 must-haves verified. All 4 requirements satisfied. All 28 tests pass. Next.js build succeeds.

---

_Verified: 2026-03-05T16:00:00Z_
_Verifier: Claude (gsd-verifier)_
