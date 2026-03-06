---
phase: quick
plan: 2
subsystem: web-api
tags: [bugfix, redis, serialization]
key-files:
  created: []
  modified:
    - apps/web/src/app/api/audit/route.ts
    - apps/web/src/app/api/report/[id]/route.ts
    - apps/web/src/app/api/audit/__tests__/route.test.ts
decisions:
  - Used inline ensureDeepParsed helper in each route rather than shared util (keeps fix minimal and self-contained)
  - Applied deep-parse to fresh results too as safety net against future Redis serialization quirks
metrics:
  duration: 86s
  completed: "2026-03-06T11:17:50Z"
  tasks_completed: 2
  tasks_total: 2
---

# Quick Task 2: Fix Double-Serialization of Audit Result Summary

Added ensureDeepParsed helper to both API routes that JSON.parse's string-encoded nested fields (categories, utility_analysis, recommendation) from Upstash Redis before returning responses.

## Tasks Completed

| # | Task | Commit | Key Changes |
|---|------|--------|-------------|
| 1 | Add deep-parse safety for Redis-retrieved AuditResult | ca62323 | Added ensureDeepParsed helper to audit POST and report GET routes |
| 2 | Add regression test for string-encoded cached fields | e1ae828 | New test proving double-serialized fields are handled correctly |

## What Changed

### apps/web/src/app/api/audit/route.ts
- Added `ensureDeepParsed()` helper function that checks if `categories`, `utility_analysis`, and `recommendation` are strings and JSON.parse's them
- Applied to cached result path (line 131) and fresh result path (line 180)

### apps/web/src/app/api/report/[id]/route.ts
- Added same `ensureDeepParsed()` helper
- Applied to Redis-retrieved result before returning response

### apps/web/src/app/api/audit/__tests__/route.test.ts
- New test case "handles cached result with string-encoded nested fields"
- Simulates Upstash returning nested objects as JSON strings
- Verifies all three fields are parsed back to objects with correct deep structure

## Deviations from Plan

None - plan executed exactly as written.

## Verification

- TypeScript type check: PASSED (npx tsc --noEmit)
- Test suite: 48/48 tests passing (9 in audit route tests, up from 8)

## Self-Check: PASSED

All files exist and commits verified.
