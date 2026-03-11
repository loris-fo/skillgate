---
phase: quick-7
plan: 01
subsystem: ui
tags: [severity-colors, badges, mock-data, landing-page]

requires:
  - phase: quick-6
    provides: Dark UI report page with inline hex color approach
provides:
  - Unified severity color palette across all components
  - Single-word badge labels (Safe, Caution, Danger)
  - 3 hardcoded mock AuditResponse objects for demo
  - Random mock report CTA in hero section
affects: [landing-page, report-page, badges]

tech-stack:
  added: []
  patterns: [inline-hex-severity-colors, mock-data-fallback]

key-files:
  created:
    - apps/web/src/lib/mock-reports.ts
  modified:
    - apps/web/src/app/globals.css
    - apps/web/src/components/landing/features-demo-section.tsx
    - apps/web/src/components/landing/badge-snippet.tsx
    - apps/web/src/components/category-card.tsx
    - apps/web/src/lib/report.ts
    - apps/web/src/components/landing/hero-section.tsx

key-decisions:
  - "Unified severity palette: safe=#4ADE80, low=#E8A04C, moderate=#A855F7, high/critical=#EF4444"
  - "Badge labels shortened to single-word: Safe, Caution, Danger"
  - "Mock reports served as fallback in getReportBySlug when Redis returns null"

patterns-established:
  - "Mock data fallback: getMockReport(slug) checked after Redis miss in getReportBySlug"

requirements-completed: [BADGE-LABELS, SEVERITY-COLORS, MOCK-REPORTS]

duration: 3min
completed: 2026-03-11
---

# Quick Task 7: Badge Labels, Unified Severity Colors, and Mock Reports Summary

**Single-word badge labels with unified hex severity palette and 3 hardcoded mock reports for self-contained demo experience**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-11T16:24:58Z
- **Completed:** 2026-03-11T16:27:51Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments
- Unified severity colors across globals.css, features-demo pills, category-card dots, and report-hero verdict buttons
- Badge labels shortened from multi-word ("Safe to Install") to single-word ("Safe", "Caution", "Danger")
- Created 3 mock reports (safe, caution, danger) with full AuditResponse data
- Hero CTA randomly navigates to one of 3 mock report pages on each click

## Task Commits

Each task was committed atomically:

1. **Task 1: Unify severity colors and update badge labels** - `d22b6c4` (feat)
2. **Task 2: Create mock reports and random CTA** - `a8f9c86` (feat)

## Files Created/Modified
- `apps/web/src/lib/mock-reports.ts` - 3 hardcoded AuditResponse objects with MOCK_SLUGS export
- `apps/web/src/app/globals.css` - Updated CSS severity tokens to unified palette
- `apps/web/src/components/landing/features-demo-section.tsx` - Single-word badges, inline hex pill colors
- `apps/web/src/components/landing/badge-snippet.tsx` - Single-word badge labels with unified colors
- `apps/web/src/components/category-card.tsx` - Updated low severity dot color to #E8A04C
- `apps/web/src/lib/report.ts` - Added mock report fallback after Redis miss
- `apps/web/src/components/landing/hero-section.tsx` - Client component with random mock report navigation

## Decisions Made
- Unified severity palette: safe=#4ADE80 (green), low=#E8A04C (amber), moderate=#A855F7 (purple), high/critical=#EF4444 (red)
- Badge labels shortened to single-word for cleaner visual presentation
- Mock reports served via fallback in getReportBySlug rather than separate route handler

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

---
*Quick Task: 7*
*Completed: 2026-03-11*
