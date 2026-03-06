---
phase: quick
plan: 1
type: execute
wave: 1
depends_on: []
files_modified:
  - packages/cli/src/lib/api-client.ts
  - packages/cli/src/lib/schema.ts
  - packages/cli/tests/api-client.test.ts
  - packages/cli/tests/commands/scan.test.ts
autonomous: true
requirements: []

must_haves:
  truths:
    - "CLI validates API response at runtime using Zod, catching shape mismatches before rendering"
    - "Zod schema matches the actual AuditResponse shape from audit-engine types"
    - "All existing tests pass with correct mock response shapes"
  artifacts:
    - path: "packages/cli/src/lib/schema.ts"
      provides: "Zod schemas for AuditResult and AuditResponse validation"
      exports: ["auditResponseSchema"]
    - path: "packages/cli/src/lib/api-client.ts"
      provides: "API client with Zod validation on response"
  key_links:
    - from: "packages/cli/src/lib/schema.ts"
      to: "packages/audit-engine/src/types.ts"
      via: "Schema mirrors the AuditResult type shape exactly"
      pattern: "z\\.object.*overall_score.*categories.*utility_analysis.*recommendation"
    - from: "packages/cli/src/lib/api-client.ts"
      to: "packages/cli/src/lib/schema.ts"
      via: "parse call on API JSON response"
      pattern: "auditResponseSchema\\.parse"
---

<objective>
Add Zod runtime validation to the CLI's API client so that response shape mismatches are caught early with clear errors instead of failing silently at render time.

Purpose: The CLI currently type-asserts API responses (`as Promise<AuditResponse>`) with no runtime validation. Zod is already a dependency but unused. The API returns `categories` as nested objects with `{score, finding, detail, by_design}`, `utility_analysis` as `{what_it_does, use_cases, not_for, trigger_behavior, dependencies}`, and `recommendation` as `{verdict, for_who, caveats, alternatives}`. Without validation, any API shape change silently breaks the CLI output.

Output: New `schema.ts` with Zod schemas, updated `api-client.ts` with validation, fixed test mocks.
</objective>

<execution_context>
@/Users/lorisfochesato/.claude/get-shit-done/workflows/execute-plan.md
@/Users/lorisfochesato/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@packages/audit-engine/src/types.ts (source of truth for response shape)
@packages/audit-engine/src/schema.ts (reference Zod schema — do NOT import, recreate for CLI bundle independence)
@packages/cli/src/lib/api-client.ts (add validation here)
@packages/cli/src/types.ts (existing TS types — re-exported from audit-engine)
@packages/cli/tests/api-client.test.ts (fix mock shapes)
@packages/cli/tests/commands/scan.test.ts (fix makeAuditResponse helper — uses wrong shape with `as any`)

<interfaces>
<!-- Source of truth: packages/audit-engine/src/types.ts -->

```typescript
export type Score = "safe" | "low" | "moderate" | "high" | "critical";
export type Verdict = "install" | "install_with_caution" | "review_first" | "avoid";

export type CategoryResult = {
  score: Score;
  finding: string;
  detail: string;
  by_design: boolean;
};

export type Categories = {
  hidden_logic: CategoryResult;
  data_access: CategoryResult;
  action_risk: CategoryResult;
  permission_scope: CategoryResult;
  override_attempts: CategoryResult;
};

export type UtilityAnalysis = {
  what_it_does: string;
  use_cases: string[];
  not_for: string[];
  trigger_behavior: string;
  dependencies: string[];
};

export type Recommendation = {
  verdict: Verdict;
  for_who: string;
  caveats: string[];
  alternatives: string[];
};

export type AuditResult = {
  overall_score: Score;
  verdict: string;
  summary: string;
  intent: string;
  categories: Categories;
  utility_analysis: UtilityAnalysis;
  recommendation: Recommendation;
};
```
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create Zod schema and add response validation to API client</name>
  <files>packages/cli/src/lib/schema.ts, packages/cli/src/lib/api-client.ts</files>
  <action>
1. Create `packages/cli/src/lib/schema.ts` with Zod schemas mirroring the audit-engine types exactly:
   - `scoreEnum`: z.enum(["safe", "low", "moderate", "high", "critical"])
   - `verdictEnum`: z.enum(["install", "install_with_caution", "review_first", "avoid"])
   - `categoryResultSchema`: z.object with score, finding (string), detail (string), by_design (boolean)
   - `categoriesSchema`: z.object with all 5 category keys (hidden_logic, data_access, action_risk, permission_scope, override_attempts), each categoryResultSchema
   - `utilityAnalysisSchema`: z.object with what_it_does (string), use_cases (z.array(z.string())), not_for (z.array(z.string())), trigger_behavior (string), dependencies (z.array(z.string()))
   - `recommendationSchema`: z.object with verdict (verdictEnum), for_who (string), caveats (z.array(z.string())), alternatives (z.array(z.string()))
   - `auditResultSchema`: z.object combining overall_score, verdict, summary, intent, categories, utility_analysis, recommendation
   - `auditMetaSchema`: z.object with slug (string), url (string), badge_url (string), created_at (string), cached (boolean)
   - `auditResponseSchema`: z.object with result (auditResultSchema), meta (auditMetaSchema) — exported

   Do NOT import from @skillgate/audit-engine (audit-engine is devDependency only, not available at runtime in published CLI). Recreate schemas independently.

2. Update `packages/cli/src/lib/api-client.ts`:
   - Import `auditResponseSchema` from `./schema.js`
   - Replace `return response.json() as Promise<AuditResponse>` with:
     ```typescript
     const json = await response.json();
     return auditResponseSchema.parse(json);
     ```
   - This gives clear Zod error messages if the API response shape changes.
  </action>
  <verify>cd /Users/lorisfochesato/Dev/skillgate/packages/cli && npx tsc --noEmit</verify>
  <done>schema.ts exists with all Zod schemas matching audit-engine types; api-client.ts validates responses at runtime via Zod parse</done>
</task>

<task type="auto">
  <name>Task 2: Fix test mock response shapes and verify all tests pass</name>
  <files>packages/cli/tests/api-client.test.ts, packages/cli/tests/commands/scan.test.ts</files>
  <action>
1. Fix `packages/cli/tests/api-client.test.ts`:
   - The mock responses use partial shapes like `{ result: { overall_score: "safe" }, meta: { slug: "test" } }`. Now that api-client validates with Zod, these will fail. Update all mock responses to include the full AuditResponse shape:
     - result must have: overall_score, verdict (string), summary (string), intent (string), categories (all 5 with score/finding/detail/by_design), utility_analysis (all 5 fields), recommendation (verdict enum, for_who, caveats, alternatives)
     - meta must have: slug, url, badge_url, created_at, cached
   - Create a helper `makeFullResponse(overrides?)` at top of file to avoid duplication.

2. Fix `packages/cli/tests/commands/scan.test.ts`:
   - The `makeAuditResponse` helper uses `as any` casts and incomplete shapes (e.g., `recommendation: { verdict, summary: "test" }` — `summary` is not a field of Recommendation). Since scan.test.ts mocks `auditViaApi` (bypassing Zod validation), the shapes don't strictly need to match Zod, but they SHOULD match the TypeScript types for correctness.
   - Update `makeAuditResponse` to return a properly-shaped AuditResponse with all required fields. Remove all `as any` casts. Model it after the `makeResponse` helper in install.test.ts which already has the correct shape.

3. Run all CLI tests to confirm everything passes.
  </action>
  <verify>cd /Users/lorisfochesato/Dev/skillgate/packages/cli && pnpm test</verify>
  <done>All 42+ CLI tests pass; no `as any` casts remain in test mock response helpers; mock responses match the full AuditResponse type shape</done>
</task>

</tasks>

<verification>
1. `cd packages/cli && npx tsc --noEmit` — no type errors
2. `cd packages/cli && pnpm test` — all tests pass
3. Zod schema in schema.ts matches every field of AuditResult, UtilityAnalysis, Recommendation, Categories from audit-engine/src/types.ts
</verification>

<success_criteria>
- CLI validates API responses at runtime using Zod (not just type assertions)
- Zod schema exactly matches the AuditResponse shape from audit-engine types
- All existing CLI tests pass with properly-shaped mock data (no `as any` casts on response objects)
- api-client.ts throws a clear ZodError if API returns unexpected shape
</success_criteria>

<output>
After completion, create `.planning/quick/1-fix-cli-zod-schema-to-match-api-response/1-SUMMARY.md`
</output>
