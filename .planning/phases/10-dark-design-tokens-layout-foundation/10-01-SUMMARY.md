---
phase: 10-dark-design-tokens-layout-foundation
plan: 01
subsystem: ui
tags: [css-custom-properties, tailwindcss, dark-theme, nextjs, design-tokens]

# Dependency graph
requires: []
provides:
  - ".dark-landing CSS custom property overrides for dark purple/violet theme"
  - "LayoutBody client component with conditional body class based on route"
  - "bg-bg-page on main element enabling per-route background override"
  - "Fixed severity color tokens (low=blue, moderate=amber)"
affects: [10-dark-header-footer-conversion, 11-hero-social-proof-sections]

# Tech tracking
tech-stack:
  added: []
  patterns: [scoped-dark-theme-via-css-class, client-wrapper-for-server-layout]

key-files:
  created:
    - apps/web/src/components/layout-body.tsx
  modified:
    - apps/web/src/app/globals.css
    - apps/web/src/app/layout.tsx

key-decisions:
  - "LayoutBody client component wraps body tag to keep layout.tsx as server component for metadata"
  - "Dark tokens use plain CSS custom properties (not @theme) since they are scoped overrides"
  - "Severity colors remain static across themes for consistent rendering"

patterns-established:
  - "Scoped theme pattern: .dark-landing class on body triggers CSS custom property overrides"
  - "Client wrapper pattern: LayoutBody handles client-side route detection while RootLayout stays server"

requirements-completed: [DS-01, DS-02, DS-03]

# Metrics
duration: 4min
completed: 2026-03-10
---

# Phase 10 Plan 01: Dark Design Tokens + Layout Foundation Summary

**Dark purple/violet design tokens scoped via .dark-landing CSS class with LayoutBody client wrapper for route-conditional body styling**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-10T11:05:43Z
- **Completed:** 2026-03-10T11:10:00Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Added .dark-landing selector with 17 CSS custom property overrides for dark purple/violet theme
- Fixed severity-low (yellow to blue) and severity-moderate (orange to amber) color tokens
- Created LayoutBody client component using usePathname() for conditional dark-landing class
- Moved bg-bg-page from body to main element so landing page dark background works correctly

## Task Commits

Each task was committed atomically:

1. **Task 1: Add dark design tokens and fix severity colors in globals.css** - `4c4b8df` (feat)
2. **Task 2: Wire conditional dark-landing class and move background to main in layout.tsx** - `aae4772` (feat)

## Files Created/Modified
- `apps/web/src/app/globals.css` - Added .dark-landing overrides and fixed severity color tokens
- `apps/web/src/components/layout-body.tsx` - New client component wrapping body with conditional dark-landing class
- `apps/web/src/app/layout.tsx` - Uses LayoutBody, moved bg-bg-page to main element

## Decisions Made
- Created LayoutBody as separate client component rather than inline to keep layout.tsx as server component for metadata export
- Used plain CSS custom properties (not @theme) for .dark-landing since these are scoped overrides that should cascade
- Severity colors intentionally not overridden in .dark-landing to ensure identical rendering on both themes

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Dark tokens and layout plumbing complete; header, footer, and section components can now inherit dark styling automatically when rendered under .dark-landing
- Ready for 10-02 (dark header/footer conversion) which will use these tokens

---
*Phase: 10-dark-design-tokens-layout-foundation*
*Completed: 2026-03-10*
