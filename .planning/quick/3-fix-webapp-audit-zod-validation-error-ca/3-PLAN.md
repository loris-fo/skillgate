---
phase: quick
plan: 3
type: execute
wave: 1
depends_on: []
files_modified:
  - packages/audit-engine/src/parse.ts
  - packages/audit-engine/src/engine.ts
  - packages/audit-engine/src/index.ts
  - apps/web/src/lib/report.ts
  - apps/web/src/app/api/audit/route.ts
  - apps/web/src/app/api/report/[id]/route.ts
autonomous: true
requirements: []
must_haves:
  truths:
    - "Auditing a skill via URL or paste no longer throws Zod validation errors for categories/utility_analysis/recommendation"
    - "Server Component report pages render correctly without JSON string fields"
  artifacts:
    - path: "packages/audit-engine/src/parse.ts"
      provides: "Shared ensureDeepParsed helper"
      exports: ["ensureDeepParsed"]
    - path: "packages/audit-engine/src/engine.ts"
      provides: "Deep-parsed toolBlock.input before Zod validation"
    - path: "apps/web/src/lib/report.ts"
      provides: "Deep-parsed Redis result before returning"
  key_links:
    - from: "packages/audit-engine/src/engine.ts"
      to: "packages/audit-engine/src/parse.ts"
      via: "import ensureDeepParsed"
      pattern: "ensureDeepParsed.*toolBlock\\.input"
    - from: "apps/web/src/lib/report.ts"
      to: "packages/audit-engine"
      via: "import ensureDeepParsed"
      pattern: "ensureDeepParsed.*result"
---

<objective>
Fix Zod validation errors when auditing skills via the webapp. Claude's API sometimes returns
`categories` as a JSON string instead of parsed object, and `utility_analysis`/`recommendation`
can be string-encoded. The engine crashes at Zod parse. Separately, the Server Component path
reads from Redis without deep-parsing, causing the same class of bug on report pages.

Purpose: Eliminate runtime crashes on audit and report display
Output: Shared `ensureDeepParsed` utility in audit-engine, applied at both failure points
</objective>

<execution_context>
@/Users/lorisfochesato/.claude/get-shit-done/workflows/execute-plan.md
@/Users/lorisfochesato/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@packages/audit-engine/src/engine.ts
@apps/web/src/lib/report.ts
@apps/web/src/app/api/audit/route.ts
@apps/web/src/app/api/report/[id]/route.ts

<interfaces>
From packages/audit-engine/src/types.ts:
- export type AuditResult (the main result type)
- export class AuditError

From packages/audit-engine/src/schema.ts:
- export const auditResultSchema (Zod schema)

Existing ensureDeepParsed in apps/web/src/app/api/audit/route.ts (lines 20-32):
```typescript
function ensureDeepParsed(result: unknown): AuditResult {
  if (typeof result !== "object" || result === null) {
    throw new Error("Invalid audit result from cache");
  }
  const r = result as Record<string, unknown>;
  const fields = ["categories", "utility_analysis", "recommendation"] as const;
  for (const field of fields) {
    if (typeof r[field] === "string") {
      r[field] = JSON.parse(r[field] as string);
    }
  }
  return r as unknown as AuditResult;
}
```
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Extract ensureDeepParsed to shared audit-engine utility and apply in engine</name>
  <files>packages/audit-engine/src/parse.ts, packages/audit-engine/src/engine.ts, packages/audit-engine/src/index.ts</files>
  <action>
1. Create `packages/audit-engine/src/parse.ts` with an exported `ensureDeepParsed` function. Use the same logic as the existing inline helper in the API route, but make it work on `unknown` input:
   - Check typeof is object and not null
   - Iterate over keys: if value is a string, try JSON.parse; if value is a nested object, recurse
   - Return the deep-parsed object as `Record<string, unknown>`
   - Do NOT throw on invalid input -- for the engine path we need it to be lenient (just return the input as-is if not an object) since Zod will catch structural problems after parsing

2. In `packages/audit-engine/src/engine.ts` line ~85, before calling `auditResultSchema.parse(toolBlock.input)`, add:
   ```typescript
   const parsed = ensureDeepParsed(toolBlock.input as Record<string, unknown>);
   result = auditResultSchema.parse(parsed);
   ```
   Import `ensureDeepParsed` from `./parse.js`.

3. In `packages/audit-engine/src/index.ts`, add `export { ensureDeepParsed } from "./parse.js";` so the webapp can import from `@skillgate/audit-engine`.
  </action>
  <verify>
    <automated>cd /Users/lorisfochesato/Dev/skillgate && pnpm --filter @skillgate/audit-engine build 2>&1 | tail -5</automated>
  </verify>
  <done>ensureDeepParsed exists in audit-engine, is exported, and engine applies it before Zod parse. Package builds cleanly.</done>
</task>

<task type="auto">
  <name>Task 2: Apply ensureDeepParsed in Server Component report path and deduplicate from API routes</name>
  <files>apps/web/src/lib/report.ts, apps/web/src/app/api/audit/route.ts, apps/web/src/app/api/report/[id]/route.ts</files>
  <action>
1. In `apps/web/src/lib/report.ts`:
   - Import `ensureDeepParsed` from `@skillgate/audit-engine`
   - On line 39, after `const result = await redis.get<AuditResult>('audit:${contentHash}')`, apply: `const safeResult = result ? ensureDeepParsed(result as Record<string, unknown>) as AuditResult : null;`
   - Use `safeResult` in the null check and response building below

2. In `apps/web/src/app/api/audit/route.ts`:
   - Remove the inline `ensureDeepParsed` function (lines 20-32)
   - Add import: `import { ensureDeepParsed } from "@skillgate/audit-engine";` (add to existing import)
   - Verify all existing call sites still work (lines ~142, ~199)

3. In `apps/web/src/app/api/report/[id]/route.ts`:
   - Remove the inline `ensureDeepParsed` function
   - Add import from `@skillgate/audit-engine`
   - Verify existing call site still works (line ~67)
  </action>
  <verify>
    <automated>cd /Users/lorisfochesato/Dev/skillgate && pnpm --filter web build 2>&1 | tail -10</automated>
  </verify>
  <done>Server Component report path deep-parses Redis data. All three copies of ensureDeepParsed consolidated to single export from audit-engine. Web app builds cleanly.</done>
</task>

</tasks>

<verification>
1. `pnpm --filter @skillgate/audit-engine build` -- engine package compiles
2. `pnpm --filter web build` -- web app compiles with shared import
3. Manual: audit a skill via URL on the webapp -- no Zod validation error
4. Manual: visit an existing report page -- renders without field errors
</verification>

<success_criteria>
- No Zod validation errors when Claude returns string-encoded fields in tool_use blocks
- Server Component report pages correctly display categories, utility_analysis, and recommendation
- Single source of truth for ensureDeepParsed in @skillgate/audit-engine
- Both packages build without errors
</success_criteria>

<output>
After completion, create `.planning/quick/3-fix-webapp-audit-zod-validation-error-ca/3-SUMMARY.md`
</output>
