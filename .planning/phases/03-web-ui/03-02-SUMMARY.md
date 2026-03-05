---
phase: 03-web-ui
plan: 02
subsystem: ui
tags: [react, next.js, form, client-component, fetch, url-audit]

requires:
  - phase: 03-web-ui/01
    provides: "Theme system, shared utilities, layout"
  - phase: 02-api-surface
    provides: "POST /api/audit endpoint, types, KV persistence"
provides:
  - "Homepage audit form with URL input and textarea"
  - "Extended /api/audit accepting { url } for server-side fetch"
  - "Client-side validation and loading state"
affects: [03-web-ui/03, 03-web-ui/04]

tech-stack:
  added: []
  patterns: ["Client Component with useRouter redirect", "Server-side URL fetch to bypass CORS"]

key-files:
  created:
    - apps/web/src/components/audit-form.tsx
  modified:
    - apps/web/src/app/page.tsx
    - apps/web/src/app/api/audit/route.ts

key-decisions:
  - "Server-side URL fetch with 10s AbortSignal timeout to solve CORS"
  - "Content takes priority over URL when both provided"
  - "Loading state replaces form entirely rather than overlay"

patterns-established:
  - "Client Component form pattern: useState + fetch + router.push redirect"
  - "API route dual-input pattern: content || url with server-side resolution"

requirements-completed: [WEB-01, WEB-02, WEB-08]

duration: 2min
completed: 2026-03-05
---

# Phase 3 Plan 02: Audit Form Summary

**Homepage audit form with URL input, content textarea, client validation, and server-side URL fetching on /api/audit**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-05T20:41:57Z
- **Completed:** 2026-03-05T20:43:51Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Extended /api/audit to accept URL-based audits with server-side fetch (CORS-safe)
- Built AuditForm client component with URL input, textarea, validation, loading takeover, and error display
- Homepage renders the audit form directly with no separate landing page (WEB-08)

## Task Commits

Each task was committed atomically:

1. **Task 1: Extend /api/audit route to accept URL-based audits** - `d7027e1` (feat)
2. **Task 2: Build homepage audit form with URL input and textarea** - `dab70b3` (feat)

## Files Created/Modified
- `apps/web/src/app/api/audit/route.ts` - Extended to accept { url }, server-side fetch with timeout, HTML rejection
- `apps/web/src/components/audit-form.tsx` - Client Component with URL input, textarea, validation, loading, error states
- `apps/web/src/app/page.tsx` - Homepage rendering AuditForm with header and tagline

## Decisions Made
- Server-side URL fetch with 10s AbortSignal.timeout to solve CORS (RESEARCH.md Pitfall 4)
- Content takes priority over URL when both provided (simpler mental model)
- Loading state replaces form entirely (fade-in animation) rather than overlay

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Audit form complete, ready for report display (Plan 03) and polish (Plan 04)
- Form submits to /api/audit and redirects to /report/[slug] which was built in Plan 01

---
*Phase: 03-web-ui*
*Completed: 2026-03-05*
