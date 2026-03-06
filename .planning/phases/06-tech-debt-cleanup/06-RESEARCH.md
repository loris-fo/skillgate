# Phase 6: Tech Debt Cleanup - Research

**Researched:** 2026-03-06
**Domain:** Integration gap closure (CLI spinner, web UI sub-fields, badge URLs, test fixes)
**Confidence:** HIGH

## Summary

Phase 6 addresses five specific tech debt items identified in the v1.0 milestone audit. All items are well-scoped fixes to existing code rather than new features. The codebase is already structured to accommodate these changes with clear integration points.

The five items are: (1) wiring real ora spinners in the CLI, (2) rendering recommendation sub-fields in the report hero UI, (3) normalizing badge URL format between `AuditMeta.badge_url` and `BadgeSection`, (4) fixing API route test failures caused by Anthropic SDK `dangerouslyAllowBrowser` in jsdom, and (5) replacing stub assertions in `severity.test.ts` with real tests.

**Primary recommendation:** These are all isolated fixes that can be executed independently. The most delicate is the API route test fix which requires restructuring the vi.mock for `@skillgate/audit-engine` to prevent the module-level `new Anthropic()` call from executing in jsdom.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Wire ora for real animated spinners -- do NOT remove the dependency
- Spinner appears in both `install` and `scan` commands during API calls
- Suppressed entirely in JSON mode (--json) -- stdout stays pure JSON, no spinner to stderr
- Contextual spinner messages that change during the operation: "Auditing skill..." -> "Analyzing security..." -> "Generating report..."
- Spinner stops with success/fail indicator on completion (ora's `.succeed()` / `.fail()`)
- Render `for_who`, `caveats`, and `alternatives` inside the existing hero banner on the report page
- `for_who` displayed with a label: "Best for: [text]"
- `caveats` rendered as a warning-styled bulleted list
- `alternatives` rendered as a separate bulleted list
- Hide each sub-field when empty/missing -- no "N/A" or "None" placeholders, graceful degradation
- Styling consistent with existing hero banner dark theme and purple accent

### Claude's Discretion
- Badge URL format fix approach (normalize in AuditMeta or in BadgeSection -- whichever is cleaner)
- API route test fix strategy (mock Anthropic SDK or adjust test environment)
- severity.test.ts real test content (test actual severity utility functions or remove if no severity.ts exists)
- Exact spinner text progression and timing
- Sub-field typography and spacing within the hero banner

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| CLI-07 | CLI displays colored terminal output with per-category breakdown | Ora spinner wiring completes the CLI output experience; `output.ts` already has colored output, spinner is the missing piece |
| WEB-05 | Audit report displays final recommendation prominently | Rendering `for_who`, `caveats`, `alternatives` in the hero banner completes the recommendation display |
| DIST-01 | SVG badge generated at `/api/badge/[slug].svg` reflecting audit result | Badge URL normalization ensures consistent `.svg` suffix handling between generation and consumption |
| WEB-07 | Audit page shows copyable markdown badge snippet for READMEs | Badge URL consistency fix ensures the copied snippet actually works |
</phase_requirements>

## Architecture Patterns

### Item 1: CLI Spinner (ora wiring)

**Current state:** `output.ts` has `startSpinner()` that returns a no-op object with `stop()`, `fail()`, `succeed()` methods. Both `scan.ts` and `install.ts` already call `startSpinner()` and use `.stop()`, `.fail()`, `.succeed()`, and `.text` assignment.

**Problem:** ora is ESM-only (v9.3.0 installed). The CLI is ESM (`"type": "module"` in package.json, tsup with ESM format), so direct import works fine.

**Pattern:** Replace the no-op implementation in `createOutputHandler().startSpinner()` with a real ora call. The return type already matches ora's API (stop, fail, succeed, text).

```typescript
// In output.ts - startSpinner implementation
import ora, { type Ora } from "ora";

export function createOutputHandler(jsonMode: boolean) {
  return {
    startSpinner(text: string): Ora {
      if (jsonMode) {
        // Return no-op that satisfies Ora interface minimally
        return { stop() {}, fail() {}, succeed() {}, text: "", isSpinning: false } as unknown as Ora;
      }
      return ora({ text, stream: process.stderr }).start();
    },
    // ...
  };
}
```

**Key details:**
- ora writes to stderr by default, which is correct (stdout stays clean for JSON mode and piping)
- `scan.ts` line 111 assigns `spinner.text = ...` -- ora's `Ora` object supports `.text` property assignment natively
- The `install.ts` command already uses `.stop()`, `.fail("Audit failed")` and these map directly to ora methods
- Contextual messages in install: the user wants progression like "Auditing skill..." -> "Analyzing security..." -> "Generating report...". Since the actual API call is a single `auditViaApi()` call, realistic stage progression would need to be time-based (setInterval) rather than event-based.
- For scan, the spinner text already updates with count progress (`Auditing skills... (N/M)`), which is real progress.
- CI detection: ora automatically detects non-interactive terminals and falls back to static text (no ANSI escape codes), so CI logs will be clean.

**Confidence:** HIGH -- ora 9.3.0 is installed, CLI is ESM, API matches existing stub interface.

### Item 2: Recommendation Sub-fields UI

**Current state:** `ReportHero` component renders verdict, summary, overall score, and permalink. The `Recommendation` type already has `for_who: string`, `caveats: string[]`, `alternatives: string[]`. The component receives full `AuditResult` via props, so `result.recommendation.for_who` etc. are already available.

**Pattern:** Add a new section below the existing hero content, inside the same `<section>` tag:

```tsx
{/* Recommendation sub-fields */}
{(result.recommendation.for_who || result.recommendation.caveats?.length || result.recommendation.alternatives?.length) && (
  <div className="mt-6 pt-6 border-t border-border">
    {result.recommendation.for_who && (
      <p className="text-text-secondary text-sm">
        <span className="text-text-muted uppercase text-xs tracking-wide">Best for:</span>{" "}
        {result.recommendation.for_who}
      </p>
    )}
    {result.recommendation.caveats?.length > 0 && (
      <div className="mt-3">
        <span className="text-text-muted uppercase text-xs tracking-wide">Caveats</span>
        <ul className="mt-1 list-disc list-inside text-sm text-yellow-400/80">
          {result.recommendation.caveats.map((c, i) => <li key={i}>{c}</li>)}
        </ul>
      </div>
    )}
    {result.recommendation.alternatives?.length > 0 && (
      <div className="mt-3">
        <span className="text-text-muted uppercase text-xs tracking-wide">Alternatives</span>
        <ul className="mt-1 list-disc list-inside text-sm text-text-secondary">
          {result.recommendation.alternatives.map((a, i) => <li key={i}>{a}</li>)}
        </ul>
      </div>
    )}
  </div>
)}
```

**Key details:**
- Existing Tailwind classes: `text-text-primary`, `text-text-secondary`, `text-text-muted`, `bg-surface-1`, `border-border`
- Warning styling for caveats: use `text-yellow-400/80` or similar amber tone for the warning feel
- Each sub-field hidden when empty/missing -- conditional rendering with `&&`
- Placed below summary, separated by a border-top, so it doesn't overwhelm the verdict prominence

**Confidence:** HIGH -- types exist, props available, straightforward JSX addition.

### Item 3: Badge URL Consistency

**Current state analysis:**

| Location | Badge URL format |
|----------|-----------------|
| `AuditMeta.badge_url` (audit route, report route) | `/api/badge/${slug}.svg` |
| `BadgeSection` component | `/api/badge/${slug}` (no `.svg`) |
| Badge API route | Strips `.svg` defensively: `id.replace(/\.svg$/, "")` |

The inconsistency: `AuditMeta.badge_url` includes `.svg` suffix, but `BadgeSection` does NOT append `.svg`. The badge route strips `.svg` defensively, so both work at runtime, but the markdown snippet generated by `BadgeSection` produces a URL without `.svg`, while `AuditMeta` has `.svg`.

**Recommendation (Claude's discretion):** Normalize to include `.svg` everywhere. Rationale:
1. Badge URLs conventionally end in `.svg` (shields.io pattern)
2. `AuditMeta` already has `.svg` -- it's the more correct format
3. The badge route already handles stripping `.svg` -- this is defensive and should remain
4. Fix is minimal: update `BadgeSection` to append `.svg` to `badgeSrc` and `snippet`

```typescript
// badge-section.tsx
const badgeSrc = `/api/badge/${slug}.svg`;
const snippet = `[![Skillgate](${baseUrl}/api/badge/${slug}.svg)](${baseUrl}/report/${slug})`;
```

**Confidence:** HIGH -- straightforward string change, behavior verified by reading both files.

### Item 4: API Route Test Fixes (dangerouslyAllowBrowser)

**Root cause analysis:**

The test file `route.test.ts` mocks `@skillgate/audit-engine` with `vi.mock()`:

```typescript
vi.mock("@skillgate/audit-engine", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@skillgate/audit-engine")>();
  return { ...actual, auditSkill: (...args) => mockAuditSkill(...args) };
});
```

The problem: `importOriginal()` loads the real `@skillgate/audit-engine` module, which at module level (line 105 in `engine.ts`) executes `const defaultEngine = createEngine()` which calls `new Anthropic()`. In jsdom environment, the Anthropic SDK detects a browser-like environment and throws `dangerouslyAllowBrowser` error.

**Fix strategy (Claude's discretion):** Do NOT use `importOriginal`. Mock the entire module without importing the real one. The test only needs types (which are imported separately) and the mock functions.

```typescript
vi.mock("@skillgate/audit-engine", () => ({
  auditSkill: (...args: unknown[]) => mockAuditSkill(...args),
  AuditError: class AuditError extends Error {
    readonly code: string;
    constructor(message: string, code: string) {
      super(message);
      this.name = "AuditError";
      this.code = code;
    }
  },
  buildCacheKey: (content: string) => {
    // Simple hash mock for testing
    const crypto = require("crypto");
    return crypto.createHash("sha256").update(content).digest("hex") + ":v1";
  },
}));
```

The key insight: the current mock uses `importOriginal` to get `AuditError` and `buildCacheKey` from the real module. But we can provide lightweight mock implementations instead, avoiding the module-level side effect entirely.

**Alternative approach:** Add `vi.mock("@anthropic-ai/sdk")` before the engine mock to prevent the SDK from initializing. But this is fragile -- if the engine import chain changes, the mock breaks.

**Recommended approach:** Full mock without `importOriginal`. More robust and explicit.

**Confidence:** HIGH -- root cause clearly identified from test output and code analysis.

### Item 5: severity.test.ts Real Assertions

**Current state:** The file has two stub tests:
1. `"vitest runs with jsdom environment"` -- checks `typeof document === "object"`
2. `"can import from @/ alias"` -- just `expect(true).toBe(true)` with a comment "replaced with real severity tests once 03-01 creates severity.ts"

**severity.ts exists** at `apps/web/src/lib/severity.ts` and exports:
- `SEVERITY_CONFIG` -- maps Score to { color, bg, percent, label }
- `VERDICT_CONFIG` -- maps verdict string to { color, bg, label }

**Real test content (Claude's discretion):**

```typescript
import { describe, it, expect } from "vitest";
import { SEVERITY_CONFIG, VERDICT_CONFIG } from "@/lib/severity";

describe("SEVERITY_CONFIG", () => {
  it("has entries for all five score levels", () => {
    const scores = ["safe", "low", "moderate", "high", "critical"];
    for (const score of scores) {
      expect(SEVERITY_CONFIG[score]).toBeDefined();
    }
  });

  it("percent increases with severity", () => {
    const ordered = ["safe", "low", "moderate", "high", "critical"];
    for (let i = 1; i < ordered.length; i++) {
      expect(SEVERITY_CONFIG[ordered[i]].percent).toBeGreaterThan(
        SEVERITY_CONFIG[ordered[i - 1]].percent
      );
    }
  });

  it("each entry has color, bg, percent, and label", () => {
    for (const config of Object.values(SEVERITY_CONFIG)) {
      expect(config.color).toMatch(/^text-/);
      expect(config.bg).toMatch(/^bg-/);
      expect(config.percent).toBeGreaterThanOrEqual(0);
      expect(config.label).toBeTruthy();
    }
  });
});

describe("VERDICT_CONFIG", () => {
  it("has entries for all four verdict types", () => {
    const verdicts = ["install", "install_with_caution", "review_first", "avoid"];
    for (const v of verdicts) {
      expect(VERDICT_CONFIG[v]).toBeDefined();
    }
  });

  it("each entry has color, bg, and label", () => {
    for (const config of Object.values(VERDICT_CONFIG)) {
      expect(config.color).toMatch(/^text-/);
      expect(config.bg).toMatch(/^bg-/);
      expect(config.label).toBeTruthy();
    }
  });
});
```

**Confidence:** HIGH -- `severity.ts` exists and is a pure data module, easy to test.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Terminal spinners | Custom ANSI escape sequences | ora (already installed, v9.3.0) | Handles terminal detection, CI fallback, Windows compat |
| CLI colored output | Manual ANSI codes | chalk (already installed) | Already used throughout output.ts |
| Badge SVG | Custom SVG strings | badge-maker (already installed) | Already used in `lib/badge.ts` |

## Common Pitfalls

### Pitfall 1: ora ESM Import in startSpinner
**What goes wrong:** Trying to use `require("ora")` or dynamic import with await inside a synchronous function.
**Why it happens:** ora 9 is ESM-only. The CLI is already ESM, so a top-level `import ora from "ora"` works fine.
**How to avoid:** Use static `import ora from "ora"` at the top of `output.ts`. Do NOT use dynamic import -- it was considered in the original code comments but is unnecessary since the CLI package is ESM.
**Warning signs:** If you see `require()` or `import()` with `.then()` for ora, it's overcomplicated.

### Pitfall 2: Spinner in JSON Mode Writing to stderr
**What goes wrong:** Even though stdout is clean JSON, spinner ANSI codes leak to stderr, breaking machine-readable parsing for tools that capture both streams.
**Why it happens:** ora defaults to stderr, which is usually fine, but the user explicitly said "no spinner to stderr" in JSON mode.
**How to avoid:** The no-op object returned in JSON mode must truly do nothing. Current stub already handles this correctly -- just preserve the pattern.

### Pitfall 3: vi.mock Hoisting and importOriginal Side Effects
**What goes wrong:** `vi.mock` factories are hoisted to the top of the file. Using `importOriginal` inside the factory causes the real module to load, triggering side effects (like `new Anthropic()`).
**Why it happens:** Vitest hoists `vi.mock()` calls before other imports. The `importOriginal` function loads the actual module including all its side effects.
**How to avoid:** Mock the entire module without `importOriginal`. Provide lightweight implementations of `AuditError` and `buildCacheKey` directly in the mock factory.
**Warning signs:** Errors mentioning "dangerouslyAllowBrowser" or "browser-like environment" in test output.

### Pitfall 4: Sub-field Rendering Breaking Hero Layout
**What goes wrong:** Adding too much content to the hero banner pushes the verdict off-screen or makes it less scannable.
**Why it happens:** Sub-fields (especially long caveats lists) can take significant vertical space.
**How to avoid:** Place sub-fields below the main verdict/score area with a separator. Use `text-sm` sizing. The verdict/score remain prominently at the top.

### Pitfall 5: Badge URL Tests Expecting .svg
**What goes wrong:** Existing tests in `route.test.ts` assert `meta.badge_url` matches `/api/badge/{slug}.svg`. If we change the format, tests break.
**Why it happens:** Tests were written with the `.svg` format.
**How to avoid:** Keep `.svg` in `AuditMeta.badge_url` (it's already there). Only fix `BadgeSection` to match. No test changes needed for the badge URL itself.

## Code Examples

### ora Spinner with Contextual Messages (install command)

```typescript
// install.ts - contextual spinner progression
const spinner = output.startSpinner("Auditing skill...");

// Simulate progression while waiting for API
const stages = [
  { delay: 2000, text: "Analyzing security patterns..." },
  { delay: 4000, text: "Generating report..." },
];
const timers = stages.map(({ delay, text }) =>
  setTimeout(() => { if (spinner.isSpinning) spinner.text = text; }, delay)
);

try {
  const response = await auditViaApi({ content });
  timers.forEach(clearTimeout);
  spinner.succeed("Audit complete");
  output.printResult(response);
} catch (error) {
  timers.forEach(clearTimeout);
  spinner.fail("Audit failed");
  // ...
}
```

### Full Mock Without importOriginal

```typescript
// Avoids loading real @skillgate/audit-engine (and thus Anthropic SDK)
const mockAuditSkill = vi.fn();
vi.mock("@skillgate/audit-engine", () => ({
  auditSkill: (...args: unknown[]) => mockAuditSkill(...args),
  AuditError: class extends Error {
    code: string;
    constructor(msg: string, code: string) { super(msg); this.code = code; this.name = "AuditError"; }
  },
  buildCacheKey: (content: string) => {
    const { createHash } = require("node:crypto");
    return createHash("sha256").update(content.trim()).digest("hex") + ":v1";
  },
}));
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| ora dynamic import | ora static ESM import | ora v6+ (2022) | CLI is ESM, no dynamic import needed |
| vi.mock with importOriginal | vi.mock with full manual mock | Vitest best practice | Avoids module-level side effects |

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | vitest 3.2.0 |
| Config file | `apps/web/vitest.config.ts` (jsdom) and `packages/cli/vitest.config.ts` |
| Quick run command | `cd apps/web && npx vitest run` |
| Full suite command | `pnpm -r run test` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| CLI-07 | Spinner shows animated progress | unit | `cd packages/cli && npx vitest run` | Needs new test |
| WEB-05 | Sub-fields render when present, hide when empty | unit | `cd apps/web && npx vitest run src/components/__tests__/report-hero.test.tsx` | Wave 0 |
| DIST-01 | Badge URL consistent with `.svg` suffix | unit | `cd apps/web && npx vitest run src/app/api/badge/__tests__/route.test.ts` | Existing (passes) |
| WEB-07 | Badge snippet in BadgeSection uses correct URL | unit | `cd apps/web && npx vitest run src/components/__tests__/badge-section.test.tsx` | Wave 0 |
| N/A | API route tests pass (no dangerouslyAllowBrowser) | unit | `cd apps/web && npx vitest run src/app/api/audit/__tests__/route.test.ts` | Existing (8 failing) |
| N/A | severity.test.ts has real assertions | unit | `cd apps/web && npx vitest run src/lib/__tests__/severity.test.ts` | Existing (stub) |

### Sampling Rate
- **Per task commit:** `cd apps/web && npx vitest run` (web tests) or `cd packages/cli && npx vitest run` (CLI tests)
- **Per wave merge:** `pnpm -r run test`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `apps/web/src/components/__tests__/report-hero.test.tsx` -- covers WEB-05 (sub-field rendering)
- [ ] `apps/web/src/components/__tests__/badge-section.test.tsx` -- covers WEB-07 (badge URL format)
- [ ] CLI spinner test (mock ora, verify `.start()` called in non-JSON mode, verify no-op in JSON mode)

## Open Questions

1. **Spinner timer-based progression vs. single message**
   - What we know: The API call is a single `auditViaApi()` -- there are no real intermediate stages to hook into
   - What's unclear: Whether time-based progression messages feel natural or forced
   - Recommendation: Use time-based progression with conservative delays (2s, 4s). If the call returns fast, only the first message shows. If slow, user sees progression. Clear timers on completion.

2. **buildCacheKey mock accuracy**
   - What we know: The real `buildCacheKey` does `sha256(content.trim()) + ":" + PROMPT_VERSION`
   - What's unclear: Whether tests depend on exact hash output
   - Recommendation: The audit route test checks `slug` format (regex) not exact hash values. A simple mock returning `crypto.createHash("sha256").update(content.trim()).digest("hex") + ":v1"` is sufficient.

## Sources

### Primary (HIGH confidence)
- Direct codebase analysis: `packages/cli/src/lib/output.ts`, `apps/web/src/components/report-hero.tsx`, `apps/web/src/components/badge-section.tsx`
- Direct codebase analysis: `packages/audit-engine/src/types.ts` (Recommendation type with for_who, caveats, alternatives)
- Direct codebase analysis: `apps/web/src/app/api/audit/route.ts` (badge_url with .svg)
- Direct codebase analysis: `apps/web/src/app/api/audit/__tests__/route.test.ts` (failing tests, vi.mock with importOriginal)
- Direct codebase analysis: `packages/audit-engine/src/engine.ts` (module-level `new Anthropic()` at line 105)
- Test run output: 8 failures in audit route tests, all with "dangerouslyAllowBrowser" error
- `packages/cli/package.json`: ora 9.3.0 in dependencies

### Secondary (MEDIUM confidence)
- ora API (`.text` property, `.succeed()`, `.fail()`, `.stop()`, `.isSpinning`) -- from training knowledge, ora v8+ API stable

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - all libraries already installed, versions verified
- Architecture: HIGH - all integration points inspected in codebase
- Pitfalls: HIGH - root causes verified by running tests and reading source

**Research date:** 2026-03-06
**Valid until:** 2026-04-06 (stable -- all tech debt items are internal fixes)
