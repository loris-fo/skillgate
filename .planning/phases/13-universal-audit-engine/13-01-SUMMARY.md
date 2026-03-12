---
phase: 13-universal-audit-engine
plan: 01
subsystem: audit-engine
tags: [prompt-engineering, zod, anthropic-tool, security-audit, multi-agent]

# Dependency graph
requires:
  - phase: 12-agent-agnostic-messaging
    provides: Agent-agnostic user-facing messaging patterns
provides:
  - Universal audit prompt analyzing any AI agent instruction file
  - DetectedAgent enum type and optional schema field
  - AUDIT_TOOL with detected_agent for Claude tool use
affects: [14-universal-scan, 15-universal-install, 16-agent-detection]

# Tech tracking
tech-stack:
  added: []
  patterns: [agent-agnostic prompt design, optional backward-compatible schema extension]

key-files:
  created: []
  modified:
    - packages/audit-engine/src/prompt.ts
    - packages/audit-engine/src/types.ts
    - packages/audit-engine/src/schema.ts
    - packages/audit-engine/src/index.ts
    - packages/audit-engine/tests/schema.test.ts

key-decisions:
  - "Agent-specific risk patterns folded into existing 5 categories as enriched examples, no new categories"
  - "detected_agent is optional to preserve backward compatibility with cached audits"
  - "skill_content XML fence tag kept unchanged as internal detail"

patterns-established:
  - "Optional schema extension: add new optional fields to preserve cache validity"
  - "Universal prompt identity: no agent named, content-based detection only"

requirements-completed: [AUDIT-01, AUDIT-02]

# Metrics
duration: 4min
completed: 2026-03-12
---

# Phase 13 Plan 01: Universal Audit Engine Summary

**Universal audit prompt with agent-specific risk patterns for 6 AI agents and optional detected_agent schema field**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-12T08:26:26Z
- **Completed:** 2026-03-12T08:30:32Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments
- Rewrote audit prompt from Claude-specific to universal AI agent instruction file auditor
- Enriched all 5 security categories with agent-specific risk pattern examples
- Added DetectedAgent type, Zod enum, and AUDIT_TOOL field -- all optional for backward compatibility
- All 33 tests pass including 4 new detected_agent schema tests

## Task Commits

Each task was committed atomically:

1. **Task 1: Add detected_agent to type, schema, and tool definition (TDD)**
   - `f859938` (test: add failing tests for detected_agent schema field)
   - `8656ec9` (feat: add detected_agent to AuditResult type, schema, and tool)
2. **Task 2: Rewrite prompt to universal auditor** - `17b4d20` (feat)

## Files Created/Modified
- `packages/audit-engine/src/types.ts` - Added DetectedAgent enum type and optional field on AuditResult
- `packages/audit-engine/src/schema.ts` - Added detectedAgentEnum, optional Zod field, AUDIT_TOOL property and updated description
- `packages/audit-engine/src/prompt.ts` - Rewrote SYSTEM_PROMPT and buildUserMessage to universal agent terminology
- `packages/audit-engine/src/index.ts` - Exported DetectedAgent type
- `packages/audit-engine/tests/schema.test.ts` - Added 4 tests for detected_agent optional/valid/invalid cases

## Decisions Made
- Agent-specific risk patterns folded into existing 5 categories as enriched examples (no new categories or separate sections)
- detected_agent field is optional so existing cached audits remain valid without cache invalidation
- Kept skill_content XML fence tag name unchanged (internal detail, not user-facing)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Universal audit engine ready for downstream phases (scan, install, detection)
- detected_agent field available for CLI scan and install commands to consume
- All existing cached audits remain valid (optional field)

---
*Phase: 13-universal-audit-engine*
*Completed: 2026-03-12*
