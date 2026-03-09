---
phase: 08-landing-page
plan: 02
subsystem: ui
tags: [next.js, tailwind, intersection-observer, svg, client-components, animation]

requires:
  - phase: 08-landing-page
    plan: 01
    provides: HeroSection, FeaturesSection, landing page composition
provides:
  - AnimatedMockup component with scroll-triggered staggered report rows
  - BadgeSnippet component with inline SVG badges and copyable markdown
  - Complete 4-section landing page
affects: [09-audit-page]

tech-stack:
  added: []
  patterns: [intersection-observer-scroll-trigger, inline-svg-shield-badges, css-transition-stagger]

key-files:
  created:
    - apps/web/src/components/landing/animated-mockup.tsx
    - apps/web/src/components/landing/badge-snippet.tsx
  modified:
    - apps/web/src/app/page.tsx

key-decisions:
  - "Used CSS transitions with transitionDelay for stagger instead of keyframe animations"
  - "Inline SVG shield badges (shields.io style) to avoid external image dependencies"
  - "AnimatedMockup and BadgeSnippet are client components (IntersectionObserver + clipboard API)"

patterns-established:
  - "Scroll-trigger pattern: IntersectionObserver with threshold 0.2, one-shot disconnect"
  - "Shield badge pattern: dual-rect SVG with label/value text"

requirements-completed: [LAND-03, LAND-04]

duration: 4min
completed: 2026-03-08
---

# Phase 08 Plan 02: Animated Mockup & Badge Snippet Summary

**Scroll-triggered browser chrome mockup with staggered category rows and shield-style SVG badge previews with copyable markdown snippet**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-08T20:25:41Z
- **Completed:** 2026-03-08T20:29:41Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Browser chrome frame with fake URL bar and mock audit report (verdict + 5 category rows)
- Scroll-triggered stagger animation using IntersectionObserver and CSS transitions
- Three inline SVG shield badges (safe/warning/critical) in shields.io style
- Copyable markdown snippet with CopyButton integration
- Full landing page: hero -> features -> mockup -> badge

## Task Commits

Each task was committed atomically:

1. **Task 1: Create AnimatedMockup and BadgeSnippet components** - `5d27432` (feat)
2. **Task 2: Wire animated mockup and badge snippet into landing page** - `e67c016` (feat)

## Files Created/Modified
- `apps/web/src/components/landing/animated-mockup.tsx` - Client component with browser chrome frame, mock report data, IntersectionObserver scroll trigger, staggered row animations
- `apps/web/src/components/landing/badge-snippet.tsx` - Client component with 3 inline SVG shield badges, markdown snippet block, CopyButton integration
- `apps/web/src/app/page.tsx` - Added AnimatedMockup and BadgeSnippet imports after FeaturesSection

## Decisions Made
- Used CSS `transition` + inline `transitionDelay` for stagger effect instead of keyframe animations -- simpler, no new CSS needed
- Created inline SVG shield badges resembling shields.io style (left label + right value) instead of img tags
- Both new components are "use client" (AnimatedMockup needs IntersectionObserver/useState, BadgeSnippet needs CopyButton which is client)
- Progress bars animate width from 0% with additional delay for visual polish

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- `pnpm build --filter=web` flag not supported by Next.js build script; used `cd apps/web && pnpm build` directly. No impact on verification.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Complete 4-section landing page ready: hero, features, animated mockup, badge snippet
- Badge section has `id="badge-section"` for in-page scroll linking from feature card
- /audit route linked from hero CTA but will 404 until Phase 9

## Self-Check: PASSED

All 3 files verified on disk. Both commit hashes (5d27432, e67c016) confirmed in git log.

---
*Phase: 08-landing-page*
*Completed: 2026-03-08*
