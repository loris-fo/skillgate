---
phase: 02-api-surface
plan: 02
subsystem: api
tags: [next.js, api-routes, upstash, redis, badge-maker, vitest, tdd]

# Dependency graph
requires:
  - phase: 01-audit-engine
    provides: AuditResult type, auditSkill function, buildCacheKey hash utility
  - phase: 02-api-surface
    plan: 01
    provides: Redis singleton, slug generation, badge generation, rate limiter, types, error helpers
provides:
  - POST /api/audit endpoint with rate limiting, dedup, and KV persistence
  - GET /api/report/[id] endpoint with dual slug/hash URL scheme
  - GET /api/badge/[id] endpoint returning verdict-colored SVG badges
  - Full public API surface for web UI (Phase 3) and CLI (Phase 4)
affects: [03-web-ui, 04-cli]

# Tech tracking
tech-stack:
  added: []
  patterns: [Next.js App Router API handlers, fire-and-forget KV writes, content-hash dedup]

key-files:
  created:
    - apps/web/src/app/api/audit/route.ts
    - apps/web/src/app/api/report/[id]/route.ts
    - apps/web/src/app/api/badge/[id]/route.ts
    - apps/web/src/app/api/audit/__tests__/route.test.ts
    - apps/web/src/app/api/report/__tests__/route.test.ts
    - apps/web/src/app/api/badge/__tests__/route.test.ts
  modified:
    - packages/audit-engine/src/index.ts

key-decisions:
  - "Exported buildCacheKey from audit-engine public API for route handler content dedup"
  - "Changed badge route folder from [id].svg to [id] to fix Next.js type generation conflict"
  - "Badge route strips .svg suffix from param defensively for URL flexibility"

patterns-established:
  - "Route handler pattern: validate -> dedup -> execute -> persist -> respond"
  - "Fire-and-forget KV writes with .catch(() => {}) for non-blocking persistence"
  - "Dual URL scheme: slug:{slug} for human-readable, hash-to-slug:{hash} for content-hash lookups"

requirements-completed: [WEB-06, DIST-01, DIST-02, DIST-03]

# Metrics
duration: 5min
completed: 2026-03-05
---

# Phase 2 Plan 2: API Route Handlers Summary

**Three API routes (POST /api/audit, GET /api/report/[id], GET /api/badge/[id]) with content-hash dedup, rate limiting, and 28 passing tests**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-05T14:51:46Z
- **Completed:** 2026-03-05T14:56:21Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments
- POST /api/audit: validates input, rate-limits (30/hr per IP), deduplicates via content hash, runs audit engine, persists slug + audit to KV
- GET /api/report/[id]: dual URL scheme supporting both slug and content-hash lookups (DIST-02)
- GET /api/badge/[id]: returns verdict-colored SVG badge with public cache headers (DIST-01)
- All 28 tests passing (8 audit + 3 report + 4 badge + 13 existing lib), Next.js build succeeds

## Task Commits

Each task was committed atomically:

1. **Task 1 RED: Failing tests for POST /api/audit** - `37f917d` (test)
2. **Task 1 GREEN: Implement POST /api/audit** - `442f4f0` (feat)
3. **Task 2 RED: Failing tests for report and badge** - `59c9b2d` (test)
4. **Task 2 GREEN: Implement report and badge routes** - `d4feff1` (feat)

_TDD tasks had separate RED and GREEN commits._

## Files Created/Modified
- `apps/web/src/app/api/audit/route.ts` - POST handler with rate limiting, validation, dedup, audit execution, KV persistence
- `apps/web/src/app/api/report/[id]/route.ts` - GET handler with dual slug/hash lookups returning AuditResponse
- `apps/web/src/app/api/badge/[id]/route.ts` - GET handler returning SVG badge with Cache-Control headers
- `apps/web/src/app/api/audit/__tests__/route.test.ts` - 8 tests for audit endpoint
- `apps/web/src/app/api/report/__tests__/route.test.ts` - 3 tests for report endpoint
- `apps/web/src/app/api/badge/__tests__/route.test.ts` - 4 tests for badge endpoint
- `packages/audit-engine/src/index.ts` - Added buildCacheKey to public exports

## Decisions Made
- Exported `buildCacheKey` from audit-engine public API so route handler can compute content hashes for dedup without duplicating logic
- Changed badge route folder from `[id].svg` to `[id]` because Next.js type generation treats `[id].svg` as a segment without dynamic params, causing TypeScript build failure
- Badge route defensively strips `.svg` suffix from the `id` param, so `/api/badge/my-skill-abc123.svg` resolves correctly

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Exported buildCacheKey from audit-engine**
- **Found during:** Task 1 (audit route needs content hash for dedup)
- **Issue:** `buildCacheKey` was internal to audit-engine (not in public exports), but route handler needs it for KV key construction
- **Fix:** Added `export { buildCacheKey } from "./hash.js"` to audit-engine index.ts, rebuilt package
- **Files modified:** packages/audit-engine/src/index.ts
- **Verification:** Import succeeds, tests pass
- **Committed in:** 37f917d (Task 1 RED commit)

**2. [Rule 3 - Blocking] Changed badge route folder from [id].svg to [id]**
- **Found during:** Task 2 (Next.js build verification)
- **Issue:** Next.js type generation for `[id].svg` folder produced empty params type `{}` instead of `{ id: string }`, causing TypeScript compilation error
- **Fix:** Moved route to `[id]/route.ts` and strip `.svg` suffix in handler code
- **Files modified:** apps/web/src/app/api/badge/[id]/route.ts
- **Verification:** Next.js build succeeds, all tests pass
- **Committed in:** d4feff1 (Task 2 GREEN commit)

---

**Total deviations:** 2 auto-fixed (2 blocking)
**Impact on plan:** Both auto-fixes necessary for build to succeed. No scope creep.

## Issues Encountered
None beyond the auto-fixed blocking issues above.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All 3 API routes working and tested — complete public API surface
- Phase 3 (web UI) can call POST /api/audit and display results
- Phase 4 (CLI) can call POST /api/audit and GET /api/report/{slug}
- Upstash Redis env vars (UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN) must be set in production

---
*Phase: 02-api-surface*
*Completed: 2026-03-05*
