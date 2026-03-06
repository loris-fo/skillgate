---
phase: 04-cli
plan: 01
subsystem: cli
tags: [commander, chalk, ora, cli-table3, esm, tsup, retry, gating]

# Dependency graph
requires:
  - phase: 01-audit-engine
    provides: Score, Verdict, AuditResult, Categories types
provides:
  - CLI package scaffold with ESM config, bin entry, shebang banner
  - Input resolver (local paths, URLs, registry slugs)
  - Score gating logic (high/critical blocked)
  - API client with retry and exponential backoff
  - Terminal output formatting (colored + JSON + scan table)
  - CLI-specific types mirroring API response contract
affects: [04-cli-02, 04-cli-03]

# Tech tracking
tech-stack:
  added: [commander ^14.0.0, ora ^9.3.0, chalk ^5.6.0, cli-table3 ^0.6.5, glob ^11.0.0]
  patterns: [conditional-output-handler, input-type-detection, fetch-with-retry]

key-files:
  created:
    - packages/cli/package.json
    - packages/cli/tsconfig.json
    - packages/cli/tsup.config.ts
    - packages/cli/vitest.config.ts
    - packages/cli/src/types.ts
    - packages/cli/src/lib/retry.ts
    - packages/cli/src/lib/api-client.ts
    - packages/cli/src/lib/input-resolver.ts
    - packages/cli/src/lib/gating.ts
    - packages/cli/src/lib/output.ts
    - packages/cli/tests/input-resolver.test.ts
    - packages/cli/tests/gating.test.ts
    - packages/cli/tests/api-client.test.ts
    - packages/cli/tests/retry.test.ts
    - packages/cli/tests/output.test.ts
  modified:
    - pnpm-lock.yaml

key-decisions:
  - "Removed @types/cli-table3 (does not exist on npm) - cli-table3 ships its own types"
  - "Types defined independently in CLI package matching API response shape (no web app imports)"
  - "ESM-only build format via tsup with node18 target and shebang banner"

patterns-established:
  - "Conditional output handler: createOutputHandler(jsonMode) returns unified interface for JSON/colored output"
  - "Input type detection chain: local path -> HTTP URL -> registry slug"
  - "Score gating: simple BLOCKED_SCORES array inclusion check"

requirements-completed: [CLI-03, CLI-05, CLI-06, CLI-07]

# Metrics
duration: 5min
completed: 2026-03-05
---

# Phase 4 Plan 1: CLI Package Scaffold Summary

**ESM CLI package with 5 tested lib modules: input-resolver, gating, api-client, retry, and colored/JSON output formatter**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-05T21:51:22Z
- **Completed:** 2026-03-05T21:56:00Z
- **Tasks:** 2
- **Files modified:** 16

## Accomplishments
- CLI package scaffolded in monorepo with ESM config, tsup build, and shebang banner
- All 5 lib modules implemented with full test coverage (22 tests across 5 files)
- Types mirror API response contract independently (no web app imports)
- Input resolver handles local paths, HTTP URLs, and skills.sh registry slugs
- Output module supports colored terminal output with emoji verdicts and JSON mode for CI

## Task Commits

Each task was committed atomically:

1. **Task 1: Scaffold CLI package with build config and types** (TDD)
   - `6e43d45` (test: failing tests for lib modules)
   - `7def675` (feat: implement retry, api-client, input-resolver, gating)
2. **Task 2: Implement terminal output module** (TDD)
   - `98e5733` (test: failing tests for output module)
   - `cc64e43` (feat: implement output with colored and JSON modes)

## Files Created/Modified
- `packages/cli/package.json` - CLI package definition with ESM, bin entry, dependencies
- `packages/cli/tsconfig.json` - Extends monorepo base config
- `packages/cli/tsup.config.ts` - ESM build with node18 target and shebang banner
- `packages/cli/vitest.config.ts` - Node environment test config
- `packages/cli/src/index.ts` - Minimal entry point (will be populated in later plans)
- `packages/cli/src/types.ts` - Re-exports audit-engine types, defines AuditMeta/AuditResponse/ErrorResponse
- `packages/cli/src/lib/retry.ts` - fetchWithRetry with exponential backoff (1s, 2s, capped 5s) and 60s timeout
- `packages/cli/src/lib/api-client.ts` - auditViaApi POST to /api/audit with error handling
- `packages/cli/src/lib/input-resolver.ts` - Input type detection: local paths, URLs, registry slugs
- `packages/cli/src/lib/gating.ts` - isBlocked for high/critical scores
- `packages/cli/src/lib/output.ts` - Colored verdict display, JSON mode, scan table
- `packages/cli/tests/input-resolver.test.ts` - 6 tests for input resolution
- `packages/cli/tests/gating.test.ts` - 5 tests for score gating
- `packages/cli/tests/api-client.test.ts` - 3 tests for API client
- `packages/cli/tests/retry.test.ts` - 3 tests for retry logic
- `packages/cli/tests/output.test.ts` - 5 tests for output formatting

## Decisions Made
- Removed `@types/cli-table3` from devDependencies (package does not exist on npm; cli-table3 ships its own TypeScript types)
- CLI types defined independently matching the API response shape rather than importing from web app (separation of concerns)
- ESM-only build format with tsup since ora 9 and chalk 5 are ESM-only packages

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Removed non-existent @types/cli-table3 package**
- **Found during:** Task 1 (package scaffold)
- **Issue:** `@types/cli-table3` does not exist on npm registry, causing `pnpm install` to fail with 404
- **Fix:** Removed from devDependencies; cli-table3 ships its own type definitions
- **Files modified:** packages/cli/package.json
- **Verification:** `pnpm install` succeeds
- **Committed in:** 7def675 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Minimal - package simply doesn't exist, cli-table3 has built-in types.

## Issues Encountered
None beyond the auto-fixed deviation.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All lib modules ready for consumption by install and scan command handlers
- Package builds successfully with tsup producing dist/index.js with shebang
- Types are in place for command handler implementations

## Self-Check: PASSED

- All 15 created files verified present
- All 4 task commits verified (6e43d45, 7def675, 98e5733, cc64e43)

---
*Phase: 04-cli*
*Completed: 2026-03-05*
