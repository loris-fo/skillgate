---
phase: 12-agent-agnostic-messaging
plan: 01
subsystem: ui
tags: [copy, messaging, agent-agnostic, cli, next.js]

# Dependency graph
requires: []
provides:
  - Agent-agnostic user-facing copy across web app and CLI
  - Universal npm package metadata with multi-agent keywords
affects: [13-multi-agent-audit-engine, 14-multi-agent-scan, 15-multi-agent-install, 16-agent-detection]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Use 'AI agent skill' instead of 'Claude skill' in all user-facing strings"
    - "Use 'skill file' instead of 'SKILL.md' in labels and placeholders"

key-files:
  created: []
  modified:
    - apps/web/src/components/landing/hero-section.tsx
    - apps/web/src/app/layout.tsx
    - apps/web/src/app/audit/page.tsx
    - apps/web/src/components/audit-form.tsx
    - apps/web/src/app/report/[slug]/opengraph-image.tsx
    - packages/cli/src/index.ts
    - packages/cli/package/package.json

key-decisions:
  - "Kept internal code comments referencing SKILL.md (e.g., slug.ts) since they are developer-facing, not user-facing"

patterns-established:
  - "Agent-agnostic language: always 'AI agent skill' never 'Claude skill' in user-facing copy"

requirements-completed: [COPY-01, COPY-02, COPY-03, COPY-04]

# Metrics
duration: 4min
completed: 2026-03-11
---

# Phase 12 Plan 01: Agent-Agnostic Messaging Summary

**All user-facing copy updated from Claude-specific to universal agent language across web app (hero, audit, OG image, metadata) and CLI (help text, npm package description/keywords)**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-11T22:27:52Z
- **Completed:** 2026-03-11T22:32:00Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments
- Replaced all "Claude skill" references with "AI agent skill" in web app (hero subtitle, meta descriptions, OG image fallback)
- Updated audit form labels from "SKILL.md Content" to "Skill file content" and placeholder URLs to generic format
- Updated CLI program/command descriptions to agent-agnostic language
- Repositioned npm package as universal security auditor with multi-agent keywords (cursor, windsurf, copilot)

## Task Commits

Each task was committed atomically:

1. **Task 1: Update web app copy to agent-agnostic language** - `0674c8b` (feat)
2. **Task 2: Update CLI help text and npm package metadata** - `320b0d3` (feat)

## Files Created/Modified
- `apps/web/src/components/landing/hero-section.tsx` - Hero subtitle: "AI agent skill"
- `apps/web/src/app/layout.tsx` - Meta description: "AI agent skills"
- `apps/web/src/app/audit/page.tsx` - Meta description and body text updated
- `apps/web/src/components/audit-form.tsx` - Form labels and placeholders updated
- `apps/web/src/app/report/[slug]/opengraph-image.tsx` - OG fallback text updated
- `packages/cli/src/index.ts` - All command descriptions updated
- `packages/cli/package/package.json` - Description and keywords updated

## Decisions Made
- Kept internal code comments referencing SKILL.md (slug.ts) since they are developer-facing, not user-facing

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- Pre-existing web app test failures (34/70) due to missing ANTHROPIC_API_KEY in test environment -- unrelated to copy changes, all previously-passing tests continue to pass

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- All user-facing messaging is agent-agnostic, ready for multi-agent audit engine work in Phase 13
- Internal code (slug.ts, audit engine) still references SKILL.md in code/comments which is correct for now

---
*Phase: 12-agent-agnostic-messaging*
*Completed: 2026-03-11*
