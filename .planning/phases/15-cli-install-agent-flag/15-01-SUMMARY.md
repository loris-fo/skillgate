---
phase: 15-cli-install-agent-flag
plan: 01
subsystem: cli
tags: [commander, agent-install, multi-agent, path-resolution]

requires:
  - phase: 14-cli-scan-multi-directory
    provides: AGENT_SCAN_MAP with trailing-slash path convention
provides:
  - getInstallPath() helper resolving agent name to install directory
  - --agent flag on install command with validation
  - Default install path .claude/skills/ instead of .claude/
affects: [16-agent-auto-detect]

tech-stack:
  added: []
  patterns: [agent path resolution via AGENT_SCAN_MAP reuse]

key-files:
  created: []
  modified:
    - packages/shared/src/agent-map.ts
    - packages/shared/src/index.ts
    - packages/cli/src/commands/install.ts
    - packages/cli/src/index.ts

key-decisions:
  - "Reuse AGENT_SCAN_MAP for install path resolution instead of creating separate AGENT_INSTALL_MAP"
  - "Default install path changed from .claude/ to .claude/skills/ for backward-compatible improvement"
  - "Use process.exitCode = 1 pattern instead of process.exit(1) for consistency with scan command"

patterns-established:
  - "getInstallPath pattern: find first trailing-slash path in agent entry for installable directory"

requirements-completed: [INST-01, INST-02]

duration: 2min
completed: 2026-03-12
---

# Phase 15 Plan 01: CLI Install Agent Flag Summary

**--agent flag on `skillgate install` with agent-aware path resolution via shared AGENT_SCAN_MAP**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-12T11:34:38Z
- **Completed:** 2026-03-12T11:36:48Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- Added getInstallPath() to @skillgate/shared for agent-to-directory resolution
- Wired --agent flag into install command with full validation (unknown agent, dotfile-only, mutual exclusion)
- Changed default install path from .claude/ to .claude/skills/ for better organization
- Replaced process.exit(1) with process.exitCode = 1 pattern across install command

## Task Commits

Each task was committed atomically:

1. **Task 1: Add getInstallPath helper to shared package** - `9fec92f` (feat)
2. **Task 2: Wire --agent flag into install command with validation** - `818a0f8` (feat)

## Files Created/Modified
- `packages/shared/src/agent-map.ts` - Added getInstallPath() function
- `packages/shared/src/index.ts` - Exported getInstallPath
- `packages/cli/src/commands/install.ts` - Agent validation, path resolution, error handling
- `packages/cli/src/index.ts` - Added --agent option to install command definition

## Decisions Made
- Reused AGENT_SCAN_MAP for install paths (per user decision, no separate map)
- Default to .claude/skills/ when no --agent or -o provided
- Used process.exitCode = 1; return pattern matching scan.ts convention

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed process.exit(1) to process.exitCode pattern**
- **Found during:** Task 2 (install command wiring)
- **Issue:** Existing install.ts used process.exit(1) in catch block, inconsistent with scan.ts
- **Fix:** Replaced all process.exit(1) with process.exitCode = 1; return
- **Files modified:** packages/cli/src/commands/install.ts
- **Committed in:** 818a0f8 (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 bug fix)
**Impact on plan:** Planned deviation per task instructions. No scope creep.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Install command fully supports --agent flag for directory-based agents
- Foundation ready for Phase 16 auto-detection of agent from project context

---
*Phase: 15-cli-install-agent-flag*
*Completed: 2026-03-12*
