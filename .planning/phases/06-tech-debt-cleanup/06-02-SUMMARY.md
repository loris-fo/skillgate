---
phase: 06-tech-debt-cleanup
plan: 02
subsystem: ui, testing
tags: [react, vitest, tailwind, testing-library, badge, recommendation]

requires:
  - phase: 01-audit-engine
    provides: AuditResult type with Recommendation interface
  - phase: 02-api-surface
    provides: Badge route, audit route, buildCacheKey
  - phase: 03-web-ui
    provides: ReportHero, BadgeSection, severity config, vitest setup
provides:
  - Recommendation sub-fields (for_who, caveats, alternatives) in ReportHero
  - Consistent .svg badge URLs in BadgeSection
  - Working API route tests without Anthropic SDK browser errors
  - Real severity config assertions replacing placeholder stubs
affects: []

tech-stack:
  added: []
  patterns:
    - "Full vi.mock without importOriginal to avoid SDK side effects in jsdom"
    - "Conditional sub-field rendering with graceful hiding (no N/A placeholders)"

key-files:
  created:
    - apps/web/src/components/__tests__/report-hero.test.tsx
    - apps/web/src/components/__tests__/badge-section.test.tsx
  modified:
    - apps/web/src/components/report-hero.tsx
    - apps/web/src/components/badge-section.tsx
    - apps/web/src/app/api/audit/__tests__/route.test.ts
    - apps/web/src/lib/__tests__/severity.test.ts

key-decisions:
  - "Full vi.mock without importOriginal to avoid Anthropic SDK dangerouslyAllowBrowser error in jsdom"
  - "Best for: label for for_who field, caveats in yellow warning style, alternatives in secondary text"

patterns-established:
  - "Component test pattern: mock CopyButton dependency, use testing-library render/screen"

requirements-completed: [WEB-05, DIST-01, WEB-07]

duration: 2min
completed: 2026-03-06
---

# Phase 06 Plan 02: Web Tech Debt Fixes Summary

**Recommendation sub-fields in ReportHero, .svg badge URLs in BadgeSection, fixed API route test mocks, and real severity config assertions**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-06T00:30:12Z
- **Completed:** 2026-03-06T00:32:09Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments
- ReportHero now renders for_who ("Best for:"), caveats (yellow warning list), and alternatives when present; hides all when empty
- BadgeSection uses `/api/badge/{slug}.svg` in both img src and markdown snippet, matching AuditMeta.badge_url convention
- All 8 API audit route tests pass without dangerouslyAllowBrowser errors (full mock replaces importOriginal)
- severity.test.ts has 5 real assertions covering all 5 score levels and 4 verdict types

## Task Commits

Each task was committed atomically:

1. **Task 1: Add recommendation sub-fields to report hero, fix badge URL** - TDD
   - RED: `8a97477` (test) - failing tests for sub-fields and .svg suffix
   - GREEN: `ca78ba6` (feat) - implementation passing all tests
2. **Task 2: Fix API route tests and replace severity test stubs** - `10ffcfd` (fix)

## Files Created/Modified
- `apps/web/src/components/__tests__/report-hero.test.tsx` - 5 tests for recommendation sub-field rendering and graceful hiding
- `apps/web/src/components/__tests__/badge-section.test.tsx` - 3 tests for .svg suffix in badge img and markdown snippet
- `apps/web/src/components/report-hero.tsx` - Added conditional sub-fields block (for_who, caveats, alternatives)
- `apps/web/src/components/badge-section.tsx` - Fixed badge URL to include .svg suffix
- `apps/web/src/app/api/audit/__tests__/route.test.ts` - Replaced importOriginal mock with full inline mock
- `apps/web/src/lib/__tests__/severity.test.ts` - Replaced placeholder stubs with real assertions

## Decisions Made
- Full vi.mock without importOriginal for audit-engine to avoid Anthropic SDK `new Anthropic()` side effect that triggers dangerouslyAllowBrowser error in jsdom
- "Best for:" label for for_who field; caveats styled as yellow warning list (text-yellow-400/80); alternatives as secondary text

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All web tests green (47 tests across 9 files)
- TypeScript compilation clean
- Component and API route test infrastructure solid for future additions

---
*Phase: 06-tech-debt-cleanup*
*Completed: 2026-03-06*
