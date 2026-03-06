---
phase: 02-api-surface
plan: 01
subsystem: api
tags: [next.js, react, upstash, redis, badge-maker, slugify, vitest]

# Dependency graph
requires:
  - phase: 01-audit-engine
    provides: AuditResult type, Verdict type, AuditError class, audit engine exports
provides:
  - Next.js 15 App Router bootstrapped in apps/web
  - Shared Redis client singleton (kv.ts)
  - Slug generation with hash suffix (slug.ts)
  - SVG badge generation with verdict colors (badge.ts)
  - Sliding window rate limiter 30/hr (rate-limit.ts)
  - API response envelope types (types.ts)
  - Error response helpers with status mapping (errors.ts)
affects: [02-api-surface-plan-02, 03-web-ui]

# Tech tracking
tech-stack:
  added: [next@15.5, react@19, react-dom@19, "@upstash/ratelimit@2", "@upstash/redis@1.36", badge-maker@4, slugify@1.6, vitest@3.2]
  patterns: [Next.js App Router, Redis singleton, TDD red-green]

key-files:
  created:
    - apps/web/next.config.ts
    - apps/web/vitest.config.ts
    - apps/web/src/app/layout.tsx
    - apps/web/src/app/page.tsx
    - apps/web/src/lib/types.ts
    - apps/web/src/lib/errors.ts
    - apps/web/src/lib/kv.ts
    - apps/web/src/lib/rate-limit.ts
    - apps/web/src/lib/slug.ts
    - apps/web/src/lib/badge.ts
    - apps/web/src/lib/__tests__/slug.test.ts
    - apps/web/src/lib/__tests__/badge.test.ts
  modified:
    - apps/web/package.json
    - apps/web/tsconfig.json

key-decisions:
  - "Added @upstash/redis as direct dependency (not just transitive via ratelimit)"
  - "Override rootDir in tsconfig to fix Next.js build with monorepo base config"
  - "Set outputFileTracingRoot to workspace root for correct Vercel tracing"

patterns-established:
  - "Redis singleton pattern: Redis.fromEnv() in kv.ts, imported by other modules"
  - "API error response pattern: errorResponse(code, message, status?, headers?) helper"
  - "Slug format: slugified-name-6charhash (e.g., commit-helper-abcdef)"

requirements-completed: [DIST-01, DIST-02]

# Metrics
duration: 3min
completed: 2026-03-05
---

# Phase 2 Plan 1: Foundation & Shared Libraries Summary

**Next.js 15 bootstrapped with 6 shared lib modules (slug, badge, KV, rate-limit, types, errors) and 13 passing unit tests**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-05T14:44:48Z
- **Completed:** 2026-03-05T14:48:41Z
- **Tasks:** 2
- **Files modified:** 14

## Accomplishments
- Next.js 15 App Router bootstrapped and building in apps/web
- All 6 shared lib modules implemented with correct exports
- 13 unit tests passing (8 slug tests, 5 badge tests) via TDD red-green
- Rate limiter configured with sliding window 30 requests/hour

## Task Commits

Each task was committed atomically:

1. **Task 1: Bootstrap Next.js 15 and install dependencies** - `f8621ed` (feat)
2. **Task 2 RED: Failing tests for slug and badge** - `6f9ea77` (test)
3. **Task 2 GREEN: Implement shared lib modules** - `1c6a244` (feat)

_TDD task had separate RED and GREEN commits._

## Files Created/Modified
- `apps/web/package.json` - Updated with Next.js 15, React 19, all lib dependencies
- `apps/web/tsconfig.json` - App Router config with path aliases and monorepo rootDir fix
- `apps/web/next.config.ts` - Minimal config with transpilePackages and outputFileTracingRoot
- `apps/web/vitest.config.ts` - Test config with @ path alias
- `apps/web/src/app/layout.tsx` - Root layout placeholder for Phase 3
- `apps/web/src/app/page.tsx` - Home page placeholder for Phase 3
- `apps/web/src/lib/types.ts` - AuditResponse, ErrorResponse, AuditMeta envelope types
- `apps/web/src/lib/errors.ts` - errorResponse helper with ApiErrorCode to HTTP status mapping
- `apps/web/src/lib/kv.ts` - Redis.fromEnv() singleton
- `apps/web/src/lib/rate-limit.ts` - Sliding window 30/hr rate limiter with ephemeral cache
- `apps/web/src/lib/slug.ts` - extractSkillName + buildSlug (name + 6-char hash suffix)
- `apps/web/src/lib/badge.ts` - generateBadge with verdict color/label mapping
- `apps/web/src/lib/__tests__/slug.test.ts` - 8 tests for name extraction and slug building
- `apps/web/src/lib/__tests__/badge.test.ts` - 5 tests for all 4 verdicts and SVG validity

## Decisions Made
- Added @upstash/redis as direct dependency since kv.ts imports it directly (not just transitive via ratelimit)
- Overrode rootDir in tsconfig.json to fix Next.js build conflict with monorepo base tsconfig's rootDir: "src"
- Set outputFileTracingRoot to workspace root to resolve lockfile detection warning

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added @upstash/redis as direct dependency**
- **Found during:** Task 2 (build verification after lib implementation)
- **Issue:** kv.ts imports from @upstash/redis but it was only a transitive dep via @upstash/ratelimit; TypeScript could not find type declarations
- **Fix:** Added @upstash/redis@^1.36 to package.json dependencies
- **Files modified:** apps/web/package.json
- **Verification:** Build succeeds with direct import
- **Committed in:** 1c6a244 (Task 2 GREEN commit)

**2. [Rule 3 - Blocking] Fixed tsconfig rootDir for monorepo**
- **Found during:** Task 1 (initial build)
- **Issue:** Base tsconfig sets rootDir: "src" which conflicts with Next.js .next/types directory being outside src/
- **Fix:** Override rootDir to "." in apps/web/tsconfig.json
- **Files modified:** apps/web/tsconfig.json
- **Verification:** Build succeeds without rootDir errors
- **Committed in:** f8621ed (Task 1 commit)

---

**Total deviations:** 2 auto-fixed (2 blocking)
**Impact on plan:** Both auto-fixes necessary for build to succeed. No scope creep.

## Issues Encountered
None beyond the auto-fixed blocking issues above.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All shared lib modules ready for route handler implementation (Plan 02)
- Route handlers can import from @/lib/kv, @/lib/slug, @/lib/badge, @/lib/rate-limit, @/lib/errors, @/lib/types
- Next.js app builds and tests pass

---
*Phase: 02-api-surface*
*Completed: 2026-03-05*
