---
phase: 11-landing-page-sections
plan: 00
subsystem: testing
tags: [vitest, react-testing-library, jsdom, landing-page]

# Dependency graph
requires: []
provides:
  - "Failing test stubs for all 3 landing section components (hero, features-demo, badge)"
  - "RED-state verification contract for plans 11-01 and 11-02"
affects: [11-01-PLAN, 11-02-PLAN]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Wave 0 test-first stubs pattern for landing page sections"
    - "IntersectionObserver mock pattern in test setup for scroll-triggered animations"

key-files:
  created:
    - apps/web/src/components/landing/__tests__/hero-section.test.tsx
    - apps/web/src/components/landing/__tests__/badge-snippet.test.tsx
    - apps/web/src/components/landing/__tests__/features-demo-section.test.tsx
  modified: []

key-decisions:
  - "Tests written as RED stubs — expected to fail until implementation plans complete"
  - "features-demo-section test imports non-existent component (fails at import time)"

patterns-established:
  - "Landing section tests use vi.mock for next/link in jsdom"
  - "IntersectionObserver stubbed via vi.stubGlobal with auto-trigger for animation tests"

requirements-completed: [HERO-01, HERO-02, HERO-03, FEAT-01, FEAT-02, FEAT-03, BADGE-01, BADGE-02, RESP-01, RESP-02]

# Metrics
duration: 3min
completed: 2026-03-10
---

# Phase 11 Plan 00: Wave 0 Test Stubs Summary

**22 Vitest test stubs across 3 files covering all 10 landing page requirements in RED state**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-10T11:49:11Z
- **Completed:** 2026-03-10T11:52:11Z
- **Tasks:** 2
- **Files created:** 3

## Accomplishments
- Created hero-section test stubs covering HERO-01 (heading text, clamp font), HERO-02 (gradient orb), HERO-03 (CTA links, rounded-full), RESP-02 (responsive scaling)
- Created badge-snippet test stubs covering BADGE-01 (3 SVG badges, labels), BADGE-02 (3 copy buttons, 3 snippet blocks)
- Created features-demo-section test stubs covering FEAT-01 (3 feature cards, not clickable, SVG icons), FEAT-02 (verdict, score, categories, severity pills), FEAT-03/RESP-01 (two-column grid layout)

## Task Commits

Each task was committed atomically:

1. **Task 1: Create hero-section and badge-snippet test stubs** - `1f54213` (test)
2. **Task 2: Create features-demo-section test stubs** - `0779436` (test)

## Files Created/Modified
- `apps/web/src/components/landing/__tests__/hero-section.test.tsx` - 7 test stubs for hero heading, gradient orb, CTA links, responsive sizing
- `apps/web/src/components/landing/__tests__/badge-snippet.test.tsx` - 4 test stubs for badge SVGs, labels, copy buttons, snippet blocks
- `apps/web/src/components/landing/__tests__/features-demo-section.test.tsx` - 11 test stubs for feature cards, mock demo verdict/score/categories/pills, grid layout

## Decisions Made
- Tests written as RED stubs that fail against current implementations — this is the expected Wave 0 state
- features-demo-section.test.tsx imports a non-existent component, causing all 11 tests to fail at import time until plan 11-02 creates the component

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Reverted auto-generated implementation commit**
- **Found during:** Task 2 (after commit)
- **Issue:** Pre-commit hook auto-generated a full `features-demo-section.tsx` implementation and hero-section.tsx modifications, creating an out-of-scope commit `b69f462`
- **Fix:** Reverted the auto-generated commit with `git revert`, restored original component files
- **Files affected:** apps/web/src/components/landing/features-demo-section.tsx, apps/web/src/components/landing/hero-section.tsx
- **Verification:** Working tree clean, only test files committed
- **Committed in:** 8445b4b (revert)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Revert necessary to keep Wave 0 scope pure — implementation belongs to plans 11-01 and 11-02.

## Issues Encountered
- Pre-commit hooks auto-generated implementation code (features-demo-section.tsx component and hero-section.tsx modifications) during the test stub commit. Reverted to maintain proper Wave 0 RED state.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All test stubs in place as verification targets for plans 11-01 (hero + badge) and 11-02 (features-demo)
- Tests confirm RED state: 3 failing tests in hero, all 11 failing in features-demo, badge tests partially pass but will need per-badge copy buttons
- No blockers for implementation plans

## Self-Check: PASSED

All 3 test files found. All 2 task commits verified. SUMMARY.md created.

---
*Phase: 11-landing-page-sections*
*Completed: 2026-03-10*
