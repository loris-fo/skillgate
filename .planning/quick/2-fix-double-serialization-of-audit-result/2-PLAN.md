---
phase: quick
plan: 2
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/web/src/app/api/audit/route.ts
  - apps/web/src/app/api/audit/__tests__/route.test.ts
  - apps/web/src/app/api/report/[id]/route.ts
autonomous: true
must_haves:
  truths:
    - "CLI Zod validation passes for both fresh and cached audit responses"
    - "Nested fields (categories, utility_analysis, recommendation) are always objects, never strings"
  artifacts:
    - path: "apps/web/src/app/api/audit/route.ts"
      provides: "Audit API route with safe Redis deserialization"
    - path: "apps/web/src/app/api/report/[id]/route.ts"
      provides: "Report API route with safe Redis deserialization"
  key_links:
    - from: "apps/web/src/app/api/audit/route.ts"
      to: "redis.get"
      via: "ensureAuditResult helper"
      pattern: "ensureAuditResult|JSON\\.parse"
---

<objective>
Fix double-serialization of audit result fields returned by the Next.js API routes.

Purpose: The CLI's Zod validation fails with "Expected object, received string" for categories, utility_analysis, and recommendation fields. Upstash Redis can return nested objects as JSON strings depending on how the data was stored or if Redis internally double-encodes values. Both the POST /api/audit (cached path) and GET /api/report/[id] routes retrieve AuditResult from Redis without any validation or deep-parse safety, so they can pass string-encoded nested fields straight to Response.json().

Output: API routes that always return properly structured nested objects regardless of Redis serialization quirks.
</objective>

<context>
@apps/web/src/app/api/audit/route.ts
@apps/web/src/app/api/report/[id]/route.ts
@apps/web/src/lib/kv.ts
@packages/audit-engine/src/types.ts
@packages/audit-engine/src/cache.ts
@packages/cli/src/lib/schema.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add deep-parse safety for Redis-retrieved AuditResult in both API routes</name>
  <files>apps/web/src/app/api/audit/route.ts, apps/web/src/app/api/report/[id]/route.ts</files>
  <action>
The problem: When Upstash Redis returns a cached AuditResult, nested object fields (categories, utility_analysis, recommendation) can arrive as JSON strings instead of parsed objects. The audit-engine's own cache.ts handles this by Zod-validating on read (line 25-33 of cache.ts), but the API routes in apps/web do raw `redis.get<AuditResult>()` with no validation -- the TypeScript generic is just a cast, not runtime parsing.

Fix approach: Create a helper function `ensureDeepParsed` in the audit route file (or a shared util) that ensures any field that should be an object but arrived as a string gets JSON.parse'd. Apply it to the cached AuditResult before returning from both routes.

Implementation for `apps/web/src/app/api/audit/route.ts`:
1. Add a helper function at the top of the file (after imports):
```typescript
/**
 * Upstash Redis can return nested objects as JSON strings.
 * Deep-parse any string fields that should be objects.
 */
function ensureDeepParsed(result: unknown): AuditResult {
  if (typeof result !== 'object' || result === null) {
    throw new Error('Invalid audit result from cache');
  }
  const r = result as Record<string, unknown>;
  const fields = ['categories', 'utility_analysis', 'recommendation'] as const;
  for (const field of fields) {
    if (typeof r[field] === 'string') {
      r[field] = JSON.parse(r[field] as string);
    }
  }
  return r as unknown as AuditResult;
}
```
2. On line 121, after `const cachedResult = await redis.get<AuditResult>(...)`, wrap with: `const safeCachedResult = cachedResult ? ensureDeepParsed(cachedResult) : null;`
3. Use `safeCachedResult` in the response on line 131 instead of `cachedResult`.
4. Also apply `ensureDeepParsed` to the fresh `result` on line 180 before returning, as a safety net: `return Response.json({ result: ensureDeepParsed(result), meta } satisfies AuditResponse);` -- this ensures even if Upstash did something unexpected during the fire-and-forget write, the returned value is always clean.

Implementation for `apps/web/src/app/api/report/[id]/route.ts`:
1. Add the same `ensureDeepParsed` helper (or import from a shared location).
2. On line 45, after `const result = await redis.get<AuditResult>(...)`, wrap: `const safeResult = result ? ensureDeepParsed(result) : null;`
3. Use `safeResult` in the null check (line 46) and response (line 59).

Note: An alternative approach would be importing and using the Zod auditResultSchema from @skillgate/audit-engine for full validation (like cache.ts does), but that's heavier than needed. The targeted field-level deep-parse is sufficient and keeps the fix minimal. If we wanted full Zod validation, we could add it later.
  </action>
  <verify>
    <automated>cd /Users/lorisfochesato/Dev/skillgate && npx tsc --noEmit -p apps/web/tsconfig.json 2>&1 | head -20</automated>
  </verify>
  <done>Both API routes deep-parse Redis-retrieved AuditResult fields before returning, preventing string-encoded nested objects from reaching the client.</done>
</task>

<task type="auto">
  <name>Task 2: Add regression test for string-encoded cached fields</name>
  <files>apps/web/src/app/api/audit/__tests__/route.test.ts</files>
  <action>
Add a test case to the existing route.test.ts that simulates the double-serialization bug.

Add this test inside the existing `describe("POST /api/audit")` block:

```typescript
it("handles cached result with string-encoded nested fields", async () => {
  const existingSlug = "commit-helper-abc123";
  // Simulate Upstash returning nested fields as JSON strings (the double-serialization bug)
  const stringifiedResult = {
    ...MOCK_RESULT,
    categories: JSON.stringify(MOCK_RESULT.categories),
    utility_analysis: JSON.stringify(MOCK_RESULT.utility_analysis),
    recommendation: JSON.stringify(MOCK_RESULT.recommendation),
  };

  mockRedis.get.mockImplementation((key: string) => {
    if (key.startsWith("hash-to-slug:")) return Promise.resolve(existingSlug);
    if (key === `slug:${existingSlug}`)
      return Promise.resolve({ contentHash: "abc123", createdAt: "2026-01-01T00:00:00Z" });
    if (key.startsWith("audit:"))
      return Promise.resolve(stringifiedResult);
    return Promise.resolve(null);
  });

  const { POST } = await import("../route");
  const request = makeRequest({ content: VALID_CONTENT });

  const response = await POST(request as any);
  const data = await response.json();

  expect(response.status).toBe(200);
  // These must be objects, not strings
  expect(typeof data.result.categories).toBe("object");
  expect(typeof data.result.utility_analysis).toBe("object");
  expect(typeof data.result.recommendation).toBe("object");
  // Verify deep structure is intact
  expect(data.result.categories.hidden_logic.score).toBe("safe");
  expect(data.result.utility_analysis.what_it_does).toBe("Generates commit messages from staged changes");
  expect(data.result.recommendation.verdict).toBe("install");
});
```

Run the full test suite to confirm both the new test and existing tests pass.
  </action>
  <verify>
    <automated>cd /Users/lorisfochesato/Dev/skillgate && pnpm test --filter=web 2>&1 | tail -30</automated>
  </verify>
  <done>Regression test exists proving that string-encoded nested fields in cached results are properly deep-parsed before returning. All existing tests continue to pass.</done>
</task>

</tasks>

<verification>
1. `pnpm test --filter=web` -- all route tests pass including the new regression test
2. `npx tsc --noEmit -p apps/web/tsconfig.json` -- no type errors
3. The new test specifically covers the scenario where Redis returns string-encoded nested fields
</verification>

<success_criteria>
- Both API routes (audit POST and report GET) deep-parse cached AuditResult nested fields
- Regression test proves string-encoded fields are handled correctly
- CLI Zod validation will pass for cached audit responses
- All existing tests continue to pass
</success_criteria>
