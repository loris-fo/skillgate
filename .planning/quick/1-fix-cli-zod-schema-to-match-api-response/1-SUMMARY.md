---
phase: quick
plan: 1
subsystem: cli
tags: [validation, zod, api-client, testing]
dependency_graph:
  requires: []
  provides: [cli-runtime-validation]
  affects: [api-client, test-mocks]
tech_stack:
  added: []
  patterns: [zod-runtime-validation]
key_files:
  created:
    - packages/cli/src/lib/schema.ts
  modified:
    - packages/cli/src/lib/api-client.ts
    - packages/cli/tests/api-client.test.ts
    - packages/cli/tests/commands/scan.test.ts
decisions:
  - Recreated Zod schemas independently in CLI (no audit-engine import) for runtime bundle independence
metrics:
  duration: 102s
  completed: "2026-03-06"
---

# Quick Task 1: Fix CLI Zod Schema to Match API Response

Zod runtime validation on CLI API responses with schemas mirroring audit-engine types exactly, replacing unsafe type assertions.

## What Was Done

### Task 1: Create Zod schema and add response validation
- **Commit:** `f33f96f`
- Created `packages/cli/src/lib/schema.ts` with complete Zod schemas: `scoreEnum`, `verdictEnum`, `categoryResultSchema`, `categoriesSchema`, `utilityAnalysisSchema`, `recommendationSchema`, `auditResultSchema`, `auditMetaSchema`, `auditResponseSchema`
- Updated `packages/cli/src/lib/api-client.ts` to use `auditResponseSchema.parse(json)` instead of `response.json() as Promise<AuditResponse>`
- Schemas mirror audit-engine types exactly without importing from audit-engine (runtime independence)

### Task 2: Fix test mock response shapes
- **Commit:** `1a884a5`
- Replaced partial mock responses in `api-client.test.ts` with `makeFullResponse()` helper providing complete AuditResponse shapes
- Fixed `makeAuditResponse` in `scan.test.ts` to include all required fields (categories with 5 entries, utility_analysis, recommendation with correct fields)
- Removed all `as any` casts from mock response objects
- All 42 CLI tests pass

## Deviations from Plan

None - plan executed exactly as written.

## Verification

- `npx tsc --noEmit` passes with no type errors
- `pnpm test` passes all 42 tests
- Zod schema covers every field of AuditResult, UtilityAnalysis, Recommendation, Categories
