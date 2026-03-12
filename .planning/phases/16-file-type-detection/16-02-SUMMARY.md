---
phase: 16-file-type-detection
plan: 02
subsystem: cli
tags: [cli, agent-detection, url-detection]

# Dependency graph
requires:
  - phase: 14-shared-agent-config
    provides: getAgentForPath, getAgentDisplayName from @skillgate/shared
  - phase: 16-file-type-detection plan 01
    provides: server-side URL detection in API audit route
provides:
  - CLI sends URL to API enabling server-side URL-based agent detection
  - CLI verdict line displays detected agent name
  - Local URL-based agent detection fallback in CLI
affects: []

# Tech tracking
tech-stack:
  added: []
  patterns: [dual-source detection with API primary and local fallback]

key-files:
  created: []
  modified:
    - packages/cli/src/commands/install.ts
    - packages/cli/src/lib/api-client.ts
    - packages/cli/src/lib/output.ts

key-decisions:
  - "Send both content and URL to API so server-side detection works while content is pre-fetched"
  - "Local URL detection fallback when API returns unknown agent"

patterns-established:
  - "API-primary with local-fallback pattern for agent detection in CLI"

requirements-completed: [DETECT-01, DETECT-02]

# Metrics
duration: 1min
completed: 2026-03-12
---

# Phase 16 Plan 02: CLI Agent Detection Wiring Summary

**CLI passes URL to API for server-side agent detection and shows detected agent name in verdict line**

## Performance

- **Duration:** 1 min
- **Started:** 2026-03-12T11:59:06Z
- **Completed:** 2026-03-12T11:59:59Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- CLI install command sends URL alongside content to API for server-side URL-based agent detection
- Local URL-based detection fallback using getAgentForPath when API returns unknown
- Verdict line now shows agent suffix (e.g., "Cursor rules file") when agent is detected

## Task Commits

Each task was committed atomically:

1. **Task 1: Pass URL to API for server-side detection** - `58d043a` (feat)
2. **Task 2: Show detected agent in CLI audit output** - `995343e` (feat)

## Files Created/Modified
- `packages/cli/src/commands/install.ts` - Sends URL+content to API, adds local detection fallback
- `packages/cli/src/lib/api-client.ts` - Updated auditViaApi signature to accept optional url with content
- `packages/cli/src/lib/output.ts` - Added agent suffix to verdict line in printCompactResult

## Decisions Made
- Send both content and URL to API: CLI pre-fetches content but also passes URL so API can extract agent from pathname
- Local fallback detection: When API doesn't detect agent, CLI uses getAgentForPath on URL pathname

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- CLI fully wired for agent detection from URLs
- Ready for end-to-end testing with real URLs containing agent-specific paths

## Self-Check: PASSED

All files exist, all commits verified.

---
*Phase: 16-file-type-detection*
*Completed: 2026-03-12*
