---
phase: 10-dark-design-tokens-layout-foundation
plan: 02
subsystem: ui
tags: [nextjs, react, usePathname, conditional-rendering, dark-theme, header, footer]

# Dependency graph
requires:
  - phase: 10-01
    provides: ".dark-landing CSS token overrides for dark purple/violet theme"
provides:
  - "Floating pill header on landing with shield icon, wordmark, nav links, CLI pill, CTA"
  - "Sticky bar header unchanged on non-landing pages"
  - "Dark footer variant with purple border on landing page"
affects: [11-hero-social-proof-sections]

# Tech tracking
tech-stack:
  added: []
  patterns: [conditional-component-rendering-by-route, usePathname-route-detection]

key-files:
  created: []
  modified:
    - apps/web/src/components/header.tsx
    - apps/web/src/components/footer.tsx

key-decisions:
  - "Header uses if/else pattern with two full return blocks for clarity over ternary className toggling"
  - "Landing CLI pill shows 'npx skillgate' (lower friction) vs 'npm i -g skillgate' on other pages"

patterns-established:
  - "Route-conditional component pattern: usePathname() with isLanding boolean for dual-mode rendering"

requirements-completed: [HDR-01, HDR-02, HDR-03, FTR-01, FTR-02]

# Metrics
duration: 2min
completed: 2026-03-10
---

# Phase 10 Plan 02: Dark Header/Footer Conversion Summary

**Conditional floating pill header with shield icon, nav links, CLI copy pill, and CTA on landing; dark footer variant with purple border**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-10T11:09:31Z
- **Completed:** 2026-03-10T11:11:29Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Header conditionally renders floating pill (landing) vs sticky bar (other pages) using usePathname()
- Landing header includes shield icon, "skillgate" wordmark, Docs/GitHub nav links, "npx skillgate" copy pill, "Try it" CTA button
- Footer converted to client component with purple top border and light text on landing, unchanged on other pages

## Task Commits

Each task was committed atomically:

1. **Task 1: Implement conditional floating pill header** - `20e321a` (feat)
2. **Task 2: Add dark footer variant for landing page** - `bbd136d` (feat)

## Files Created/Modified
- `apps/web/src/components/header.tsx` - Conditional floating pill (landing) vs sticky bar (other pages) with usePathname()
- `apps/web/src/components/footer.tsx` - Client component with dark variant (purple border, light text) on landing

## Decisions Made
- Used if/else with two full JSX return blocks rather than ternary className toggling for readability
- Landing CLI pill shows "npx skillgate" for lower friction; non-landing keeps "npm i -g skillgate"
- Both header variants share copied/handleCopy state but with route-appropriate copy text

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Header and footer dark variants complete; landing page layout foundation is fully in place
- Ready for Phase 11 (hero, social proof, features sections) which will render under the dark theme with these header/footer wrapping

---
*Phase: 10-dark-design-tokens-layout-foundation*
*Completed: 2026-03-10*
