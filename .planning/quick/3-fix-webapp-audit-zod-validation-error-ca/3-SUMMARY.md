---
phase: quick
plan: 3
subsystem: api
tags: [zod, redis, deep-parse, validation, audit-engine]

requires:
  - phase: quick-2
    provides: "Redis double-serialization fix (same class of bug)"
provides:
  - "Shared ensureDeepParsed utility in @skillgate/audit-engine"
  - "Deep-parsing before Zod validation in engine"
  - "Deep-parsing in Server Component report path"
affects: [audit-engine, web-api, web-reports]

tech-stack:
  added: []
  patterns: ["Recursive deep-parse for Redis/Claude string-encoded JSON fields"]

key-files:
  created:
    - packages/audit-engine/src/parse.ts
  modified:
    - packages/audit-engine/src/engine.ts
    - packages/audit-engine/src/index.ts
    - apps/web/src/lib/report.ts
    - apps/web/src/app/api/audit/route.ts
    - apps/web/src/app/api/report/[id]/route.ts

key-decisions:
  - "Made ensureDeepParsed lenient (returns input as-is if not object) so Zod catches structural errors downstream"
  - "Added recursive deep-parse for nested objects, not just top-level fields"

patterns-established:
  - "Single source of truth: shared parsing utilities live in audit-engine package"

requirements-completed: []

duration: 2min
completed: 2026-03-09
---

# Quick Task 3: Fix Webapp Audit Zod Validation Error Summary

**Shared recursive ensureDeepParsed utility in audit-engine, applied before Zod validation and in Server Component report path, eliminating string-encoded field crashes**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-09T12:41:49Z
- **Completed:** 2026-03-09T12:44:09Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments
- Created shared `ensureDeepParsed` utility with recursive deep-parsing in `@skillgate/audit-engine`
- Applied deep-parse before Zod validation in engine to handle Claude's string-encoded tool_use fields
- Applied deep-parse in Server Component report path to handle Redis string-encoded fields
- Consolidated 3 copies of ensureDeepParsed into single export

## Task Commits

Each task was committed atomically:

1. **Task 1: Extract ensureDeepParsed to shared audit-engine utility and apply in engine** - `1c32265` (feat)
2. **Task 2: Apply ensureDeepParsed in Server Component report path and deduplicate from API routes** - `a6e645e` (refactor)

## Files Created/Modified
- `packages/audit-engine/src/parse.ts` - Shared recursive ensureDeepParsed utility (NEW)
- `packages/audit-engine/src/engine.ts` - Deep-parse toolBlock.input before Zod validation
- `packages/audit-engine/src/index.ts` - Export ensureDeepParsed from package
- `apps/web/src/lib/report.ts` - Deep-parse Redis result in Server Component path
- `apps/web/src/app/api/audit/route.ts` - Removed inline copy, imports from audit-engine
- `apps/web/src/app/api/report/[id]/route.ts` - Removed inline copy, imports from audit-engine

## Decisions Made
- Made ensureDeepParsed lenient (returns input as-is for non-objects) rather than throwing, so Zod catches structural errors downstream
- Added recursive deep-parsing for nested objects, not just the three known top-level fields

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

---
*Quick Task: 3*
*Completed: 2026-03-09*
