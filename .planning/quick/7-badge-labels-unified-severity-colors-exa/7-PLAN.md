---
phase: quick-7
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/web/src/components/landing/features-demo-section.tsx
  - apps/web/src/components/landing/badge-snippet.tsx
  - apps/web/src/app/globals.css
  - apps/web/src/components/report-hero.tsx
  - apps/web/src/components/category-card.tsx
  - apps/web/src/components/landing/hero-section.tsx
  - apps/web/src/lib/mock-reports.ts
  - apps/web/src/lib/report.ts
autonomous: true
requirements: [BADGE-LABELS, SEVERITY-COLORS, MOCK-REPORTS]
must_haves:
  truths:
    - "Landing page badges show single-word labels: Safe, Caution, Danger"
    - "Severity colors are consistent between landing page and report page"
    - "View example report CTA randomly links to one of 3 mock reports"
    - "All 3 mock report slugs render a full report page without errors"
  artifacts:
    - path: "apps/web/src/lib/mock-reports.ts"
      provides: "3 hardcoded mock AuditResponse objects"
    - path: "apps/web/src/components/landing/features-demo-section.tsx"
      provides: "Updated badge labels and unified pill colors"
    - path: "apps/web/src/components/landing/hero-section.tsx"
      provides: "Random mock report CTA"
  key_links:
    - from: "apps/web/src/lib/report.ts"
      to: "apps/web/src/lib/mock-reports.ts"
      via: "fallback lookup when Redis returns null"
      pattern: "getMockReport|mockReports"
    - from: "apps/web/src/components/landing/hero-section.tsx"
      to: "apps/web/src/lib/mock-reports.ts"
      via: "import slug list for random selection"
      pattern: "MOCK_SLUGS"
---

<objective>
Update badge labels to single-word, unify severity colors across landing and report pages, and add 3 mock reports with random CTA selection.

Purpose: Visual consistency and a self-contained demo experience without needing real audit data.
Output: Unified color scheme, shorter badge labels, 3 working mock report pages.
</objective>

<execution_context>
@/Users/lorisfochesato/.claude/get-shit-done/workflows/execute-plan.md
@/Users/lorisfochesato/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@apps/web/src/components/landing/features-demo-section.tsx
@apps/web/src/components/landing/badge-snippet.tsx
@apps/web/src/components/landing/hero-section.tsx
@apps/web/src/components/report-hero.tsx
@apps/web/src/components/category-card.tsx
@apps/web/src/app/globals.css
@apps/web/src/lib/report.ts
@apps/web/src/lib/severity.ts
@apps/web/src/lib/types.ts
@packages/audit-engine/src/types.ts

<interfaces>
From packages/audit-engine/src/types.ts:
```typescript
export type Score = "safe" | "low" | "moderate" | "high" | "critical";
export type Verdict = "install" | "install_with_caution" | "review_first" | "avoid";
export type CategoryResult = { score: Score; finding: string; detail: string; by_design: boolean; };
export type Categories = {
  hidden_logic: CategoryResult; data_access: CategoryResult; action_risk: CategoryResult;
  permission_scope: CategoryResult; override_attempts: CategoryResult;
};
export type UtilityAnalysis = { what_it_does: string; use_cases: string[]; not_for: string[]; trigger_behavior: string; dependencies: string[]; };
export type Recommendation = { verdict: Verdict; for_who: string; caveats: string[]; alternatives: string[]; };
export type AuditResult = { overall_score: Score; verdict: string; summary: string; intent: string; categories: Categories; utility_analysis: UtilityAnalysis; recommendation: Recommendation; };
```

From apps/web/src/lib/types.ts:
```typescript
export type AuditMeta = { slug: string; url: string; badge_url: string; created_at: string; cached: boolean; };
export type AuditResponse = { result: AuditResult; meta: AuditMeta; };
```
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Unify severity colors and update badge labels</name>
  <files>
    apps/web/src/app/globals.css
    apps/web/src/components/landing/features-demo-section.tsx
    apps/web/src/components/landing/badge-snippet.tsx
    apps/web/src/components/report-hero.tsx
    apps/web/src/components/category-card.tsx
  </files>
  <action>
**1. Unify CSS severity tokens in globals.css (line ~28-33):**
Change to these unified values:
```
--color-severity-safe: #4ADE80;
--color-severity-low: #E8A04C;
--color-severity-moderate: #A855F7;
--color-severity-high: #EF4444;
--color-severity-critical: #EF4444;
```
This makes: safe=green, low=amber, moderate=purple, high/critical=red.

**2. Update badge labels in features-demo-section.tsx (line 51-55):**
Change `badgeVariants` to single-word labels with unified colors:
```typescript
const badgeVariants = [
  { label: "Safe", bgColor: "#4ADE80", textColor: "#FFFFFF" },
  { label: "Caution", bgColor: "#E8A04C", textColor: "#FFFFFF" },
  { label: "Danger", bgColor: "#EF4444", textColor: "#FFFFFF" },
];
```

**3. Update badge labels in badge-snippet.tsx (line 5-9):**
Same change as above — update `badgeVariants` to single-word labels with matching colors.

**4. Update PILL_COLORS in features-demo-section.tsx (line 40-45):**
Replace Tailwind severity class references with inline hex styles for consistency with the dark theme approach (per quick-6 decision). Use the unified colors:
```typescript
const PILL_COLORS: Record<string, { bg: string; label: string }> = {
  safe: { bg: "#4ADE80", label: "Safe" },
  low: { bg: "#E8A04C", label: "Low" },
  moderate: { bg: "#A855F7", label: "Moderate" },
  critical: { bg: "#EF4444", label: "Critical" },
};
```
Update the JSX that renders pills (line ~236) to use `style={{ backgroundColor: PILL_COLORS[cat.severity].bg }}` instead of className with `bg-severity-*`.

**5. Update VERDICT_COLORS in report-hero.tsx (line 8-13):**
Align with unified palette:
```typescript
const VERDICT_COLORS: Record<string, { bg: string; text: string }> = {
  install: { bg: "#4ADE80", text: "#1A1A24" },
  install_with_caution: { bg: "#E8A04C", text: "#1A1A24" },
  review_first: { bg: "#A855F7", text: "#1A1A24" },
  avoid: { bg: "#EF4444", text: "#1A1A24" },
};
```

**6. Update SEVERITY_DOT_COLORS in category-card.tsx (line 11-17):**
Align with unified palette:
```typescript
const SEVERITY_DOT_COLORS: Record<string, string> = {
  safe: "#4ADE80",
  low: "#E8A04C",
  moderate: "#A855F7",
  high: "#EF4444",
  critical: "#EF4444",
};
```
  </action>
  <verify>
    <automated>cd /Users/lorisfochesato/Dev/skillgate && npx next build 2>&1 | tail -5</automated>
  </verify>
  <done>All severity colors use the unified palette (#4ADE80 green, #E8A04C amber, #A855F7 purple, #EF4444 red). Badge labels are single-word: Safe, Caution, Danger.</done>
</task>

<task type="auto">
  <name>Task 2: Create mock reports and random CTA</name>
  <files>
    apps/web/src/lib/mock-reports.ts
    apps/web/src/lib/report.ts
    apps/web/src/components/landing/hero-section.tsx
  </files>
  <action>
**1. Create `apps/web/src/lib/mock-reports.ts`:**

Export `MOCK_SLUGS: string[]` with 3 slugs: `"mock-safe-skill"`, `"mock-caution-skill"`, `"mock-danger-skill"`.

Export `getMockReport(slug: string): AuditResponse | null` that returns hardcoded data for each slug. Each must conform to `AuditResponse` shape (AuditResult + AuditMeta).

**mock-safe-skill:** Safe verdict, score "safe" (overall_score), verdict "install".
- summary: "This skill follows security best practices with no concerning patterns detected."
- All 5 categories: score "safe", realistic findings (e.g. "No hidden logic detected", "No external data access", etc.), by_design: false
- recommendation: verdict "install", for_who: "Any developer looking for a well-structured coding assistant.", caveats: ["Always review skill updates for changes in behavior"], alternatives: []
- utility_analysis: what_it_does: "Provides structured code formatting and style guidance", use_cases: ["Code formatting", "Style consistency"], not_for: ["Security auditing"], trigger_behavior: "Activates on code editing tasks", dependencies: []
- meta: slug matching, url `/api/report/{slug}`, badge_url `/api/badge/{slug}.svg`, created_at "2025-01-15T10:00:00Z", cached: true

**mock-caution-skill:** Caution verdict, score "moderate" (overall_score), verdict "install_with_caution".
- summary: "This skill has some elevated permissions that warrant review before installation."
- Categories mixed: hidden_logic "safe", data_access "moderate", action_risk "low", permission_scope "high", override_attempts "safe". Realistic findings for each.
- recommendation: verdict "install_with_caution", for_who: "Developers who need advanced file manipulation capabilities.", caveats: ["Requests broad file system access", "May modify files outside project directory"], alternatives: ["Consider sandboxed-editor for safer file operations"]
- utility_analysis: what_it_does: "Advanced file manipulation and project scaffolding", use_cases: ["Project scaffolding", "Bulk file operations", "Template generation"], not_for: ["Simple text editing"], trigger_behavior: "Activates on file creation and modification requests", dependencies: ["fs", "path"]

**mock-danger-skill:** Danger verdict, score "critical" (overall_score), verdict "avoid".
- summary: "This skill exhibits multiple high-risk patterns including hidden network requests and instruction override attempts."
- Categories mostly bad: hidden_logic "critical", data_access "high", action_risk "critical", permission_scope "critical", override_attempts "high". Alarming findings.
- recommendation: verdict "avoid", for_who: "Not recommended for any developer.", caveats: ["Contains obfuscated network calls", "Attempts to override system instructions", "Requests unnecessary elevated permissions"], alternatives: ["Use verified-assistant for similar functionality", "Consider audited-helper as a safer option"]
- utility_analysis: what_it_does: "Claims to provide code optimization and refactoring", use_cases: ["Code refactoring"], not_for: ["Any production environment"], trigger_behavior: "Activates broadly on most prompts with hidden side effects", dependencies: ["undisclosed"]

**2. Update `apps/web/src/lib/report.ts`:**

Import `getMockReport` from `./mock-reports`. At the END of the `getReportBySlug` function, before the final `return null` path (after step 2 where `resolvedSlug` is null), add a mock fallback:
```typescript
// 2b. Try mock reports
const mockReport = getMockReport(id);
if (mockReport) return mockReport;
```
This goes right after the `if (!resolvedSlug) return null;` line (change `return null` to try mock first).

**3. Update `apps/web/src/components/landing/hero-section.tsx`:**

Convert to a client component ("use client" at top). Import `MOCK_SLUGS` from `@/lib/mock-reports`. Replace the static Link to `/report/cursor-rules-architect` with a button/anchor that on click navigates to a random mock slug:

```typescript
"use client";
import { useRouter } from "next/navigation";
import { MOCK_SLUGS } from "@/lib/mock-reports";

// Inside component:
const router = useRouter();

function handleExampleClick() {
  const slug = MOCK_SLUGS[Math.floor(Math.random() * MOCK_SLUGS.length)];
  router.push(`/report/${slug}`);
}

// Replace the Link with:
<button
  onClick={handleExampleClick}
  className="inline-flex items-center rounded-lg border-2 border-[#9d7aff] px-8 py-4 font-semibold text-[#9d7aff] transition-colors hover:bg-[#9d7aff]/10"
>
  View example report
</button>
```

Keep the "Audit a skill" Link as-is (it can use next/link since it's a static route).
  </action>
  <verify>
    <automated>cd /Users/lorisfochesato/Dev/skillgate && npx next build 2>&1 | tail -5</automated>
  </verify>
  <done>3 mock reports render at /report/mock-safe-skill, /report/mock-caution-skill, /report/mock-danger-skill. Hero CTA randomly picks one on each click.</done>
</task>

</tasks>

<verification>
1. `next build` succeeds without errors
2. Landing page badges show "Safe", "Caution", "Danger" (single-word)
3. Mock report pill colors on landing match report page severity dot colors
4. /report/mock-safe-skill shows green Install verdict
5. /report/mock-caution-skill shows amber Install with Caution verdict
6. /report/mock-danger-skill shows red Avoid verdict
7. Clicking "View example report" navigates to a random mock report
</verification>

<success_criteria>
- Badge labels are single-word across both badge-snippet.tsx and features-demo-section.tsx
- All severity colors unified: safe=#4ADE80, low/caution=#E8A04C, moderate=#A855F7, high/critical/danger=#EF4444
- 3 mock reports with full AuditResponse data accessible via getReportBySlug
- Hero CTA randomly selects from 3 mock slugs on each click
- Build passes cleanly
</success_criteria>

<output>
After completion, create `.planning/quick/7-badge-labels-unified-severity-colors-exa/7-SUMMARY.md`
</output>
