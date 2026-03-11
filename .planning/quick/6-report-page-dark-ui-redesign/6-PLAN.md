---
phase: quick-6
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/web/src/components/layout-body.tsx
  - apps/web/src/app/report/[slug]/page.tsx
  - apps/web/src/components/report-hero.tsx
  - apps/web/src/components/category-card.tsx
  - apps/web/src/components/utility-section.tsx
  - apps/web/src/components/badge-section.tsx
autonomous: true
requirements: [REPORT-DARK-UI]

must_haves:
  truths:
    - "Report page renders with dark background (#0D0D14) and dark-landing class"
    - "Shared header/footer auto-render dark variants on /report/* routes"
    - "Hero shows skill name h1, verdict button, score badge, copy link, description, and SVG score circle"
    - "Security analysis shows 2x2 grid + full-width 5th card with dark card styling"
    - "Recommendation card shows caveats (amber) and alternatives (gray) lists"
    - "Utility analysis card renders with dark code block styling"
    - "Badge section shows preview and copy-able markdown snippet"
  artifacts:
    - path: "apps/web/src/components/layout-body.tsx"
      provides: "isDark check includes /report routes"
      contains: "pathname.startsWith(\"/report\")"
    - path: "apps/web/src/app/report/[slug]/page.tsx"
      provides: "Redesigned report page layout"
    - path: "apps/web/src/components/report-hero.tsx"
      provides: "Dark hero with score circle SVG"
    - path: "apps/web/src/components/category-card.tsx"
      provides: "Dark category cards with severity dots"
  key_links:
    - from: "apps/web/src/components/layout-body.tsx"
      to: "dark-landing CSS class"
      via: "isDark pathname check"
      pattern: "pathname.startsWith.*report"
---

<objective>
Redesign the /report/[slug] page to match the new dark UI aesthetic used on landing and /audit pages. This is a visual reskin only -- all data fetching, URL structure, and badge generation remain unchanged.

Purpose: Visual consistency across all dark pages (landing, /audit, /report).
Output: Fully restyled report page with dark theme, score circle SVG, redesigned section cards.
</objective>

<execution_context>
@/Users/lorisfochesato/.claude/get-shit-done/workflows/execute-plan.md
@/Users/lorisfochesato/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@apps/web/src/components/layout-body.tsx
@apps/web/src/app/report/[slug]/page.tsx
@apps/web/src/components/report-hero.tsx
@apps/web/src/components/category-card.tsx
@apps/web/src/components/utility-section.tsx
@apps/web/src/components/badge-section.tsx
@apps/web/src/lib/severity.ts
@apps/web/src/app/globals.css

<interfaces>
From apps/web/src/lib/severity.ts:
```typescript
export const SEVERITY_CONFIG: Record<Score, {
  color: string; bg: string; percent: number; numeric: number; label: string;
}>;
export const VERDICT_CONFIG: Record<string, { color: string; bg: string; label: string }>;
```

From @skillgate/audit-engine types:
```typescript
type Score = "safe" | "low" | "moderate" | "high" | "critical";
type AuditResult = {
  overall_score: Score;
  verdict: string;
  summary: string;
  intent: string;
  categories: Categories; // hidden_logic, data_access, action_risk, permission_scope, override_attempts
  utility_analysis: UtilityAnalysis;
  recommendation: Recommendation; // { verdict, for_who, caveats: string[], alternatives: string[] }
};
type CategoryResult = { score: Score; finding: string; detail: string; by_design: boolean };
type UtilityAnalysis = { what_it_does: string; use_cases: string[]; not_for: string[]; trigger_behavior: string; dependencies: string[] };
```

From apps/web/src/lib/types.ts:
```typescript
type AuditMeta = { slug: string; url: string; badge_url: string; created_at: string; cached: boolean };
```

SEVERITY_CONFIG numeric mapping: safe=2, low=4, moderate=6, high=8, critical=10
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Enable dark mode for /report routes and restyle page layout</name>
  <files>apps/web/src/components/layout-body.tsx, apps/web/src/app/report/[slug]/page.tsx</files>
  <action>
1. In layout-body.tsx, change the isDark check from:
   `const isDark = pathname === "/" || pathname === "/audit";`
   to:
   `const isDark = pathname === "/" || pathname === "/audit" || pathname.startsWith("/report");`

2. In page.tsx, completely restyle the page layout. Keep ALL data fetching logic (getReportBySlug, notFound, generateMetadata) unchanged. Replace the returned JSX with the new dark layout:

   - Outer wrapper: no max-width constraint at top level, full-width sections
   - Remove the old `<section className="max-w-4xl mx-auto...">` wrapper
   - Remove the old `<Link>` back-link at bottom
   - Add inline style `backgroundColor: "#0D0D14"` on the outer div for consistency

   Page structure (all rendered inside a single container div):
   a) Hero section: render `<ReportHero>` (will be restyled in Task 2) passing result, meta, and slug
   b) Two-column grid below hero: `max-w-[1100px] mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-8`
      - Left column:
        - "Security Analysis" h2 (24px, font-semibold, white, mb-5)
        - 2x2 grid of first 4 categories (hidden_logic, data_access, action_risk, permission_scope) with gap-4
        - Full-width 5th category (override_attempts) below the 2x2 grid, mt-4
        - Utility section below (mt-6): `<UtilitySection>`
      - Right column:
        - "Recommendation" h2 (24px, font-semibold, white, mb-5)
        - `<RecommendationCard>`
        - Badge section below (mt-6): `<BadgeSection>`

   Render categories explicitly by key (not Object.entries) to control order and layout:
   ```
   const cats = report.result.categories;
   const gridCats = [
     { key: "hidden_logic", data: cats.hidden_logic },
     { key: "data_access", data: cats.data_access },
     { key: "action_risk", data: cats.action_risk },
     { key: "permission_scope", data: cats.permission_scope },
   ];
   ```
   Then override_attempts separately as full-width.
  </action>
  <verify>
    <automated>cd /Users/lorisfochesato/Dev/skillgate && npx next build 2>&1 | tail -20</automated>
  </verify>
  <done>Report page uses dark layout with two-column grid. isDark includes /report routes. Build succeeds.</done>
</task>

<task type="auto">
  <name>Task 2: Restyle all report components for dark UI</name>
  <files>apps/web/src/components/report-hero.tsx, apps/web/src/components/category-card.tsx, apps/web/src/components/utility-section.tsx, apps/web/src/components/badge-section.tsx</files>
  <action>
**report-hero.tsx** -- Complete rewrite of ReportHero. Make it a client component ("use client") for copy-link interactivity. Accept additional `slug` prop alongside result and meta.

Layout (position: relative, pt 140px, pb 48px, px 4, max-w-[1100px] mx-auto):
- Background decoration: absolute div at top-20 right-[100px], w-[300px] h-[300px], bg rgba(168,85,247,0.15), blur(60px), rounded-full, z-0, pointer-events-none
- Content wrapper: relative z-10

- Skill name h1: Extract skill name from meta.slug -- convert hyphens to spaces, title-case each word. Style: 64px, font-bold, white, leading-[1.1], mb-4

- Button row (flex, gap-3, mb-6):
  - Verdict button: Use verdict-specific colors map (NOT the existing VERDICT_CONFIG bg classes which are Tailwind bg-severity-* -- use inline hex colors instead):
    - install: bg #4ADE80, text #1A1A24
    - install_with_caution: bg #E8A04C, text #1A1A24
    - review_first: bg #A855F7, text #1A1A24
    - avoid: bg #EF4444, text #1A1A24
    Font: 14px, font-semibold, px-5 py-2.5, rounded-lg
  - Score badge: bg transparent, border 1px solid #3A3A4A, white text, 14px font-medium, px-4 py-2.5, rounded-lg. Show `{severity.numeric}/10`
  - Copy Link button: bg transparent, border 1px solid #3A3A4A, color #A0A0B0, 14px, px-4 py-2.5, rounded-lg. onClick copies `${baseUrl}/report/${meta.slug}` to clipboard, toggles text to "Copied!" for 2s using useState

- Description: max-w-[700px], 16px, leading-[1.7], color #A0A0B0, renders result.summary

- Score circle (absolute, top-[100px], right-[80px], hidden on mobile lg:block):
  SVG 160x160, viewBox "0 0 160 160":
  - Track circle: cx=80 cy=80 r=68, stroke=#3A3A4A, strokeWidth=12, fill=none
  - Progress circle: cx=80 cy=80 r=68, stroke with gradient (id="scoreGrad", stop #E8A04C at 0%, stop #F59E0B at 100%), strokeWidth=12, fill=none, strokeLinecap=round, transform="rotate(-90 80 80)"
  - strokeDasharray = 2 * PI * 68 = ~427.26
  - strokeDashoffset = dasharray * (1 - severity.numeric / 10)
  - Center text group: score number (48px, bold, white, textAnchor=middle, x=80, y=88) + "/10" (24px, fill=#A0A0B0, x=80, y=115)
  - Define linearGradient in <defs>

**RecommendationCard** -- Restyle with dark theme:
- Card: bg #1A1A24, border 1px solid #2A2A3A, rounded-xl, p-6
- Remove the labels/headers ("Best for", etc.), keep content
- Caveats list: bullet color #E8A04C (use inline style or a custom class), text 14px #A0A0B0
- Alternatives list: bullet color #A0A0B0, text 14px #6B6B7B
- If recommendation.for_who exists, show it as first paragraph, 14px #A0A0B0

**category-card.tsx** -- Restyle for dark cards:
- Card: bg #1A1A24, border 1px solid #2A2A3A, rounded-xl, p-5
- Remove the expand/collapse toggle. Show all content always (finding as the reasoning text). Remove useState, remove "use client" if no other client needs exist -- actually keep "use client" removed; CategoryCard can be a server component now.
- Header row (flex items-center justify-between):
  - Left: colored severity dot (w-2 h-2 rounded-full, inline-block) + status label text. Colors by severity: safe=#4ADE80, low=#FACC15, moderate=#A855F7, high/critical=#EF4444. Use inline styles.
  - Right: if by_design, show "By Design" badge (bg #2A2A3A, color #A0A0B0, text-[11px], px-2 py-0.5, rounded)
- Category name: 14px font-semibold white, mt-2
- Finding/reasoning: 13px color #6B6B7B, leading-[1.5], mt-1. Show result.finding (not result.detail)

**utility-section.tsx** -- Restyle:
- Card: bg #1A1A24, border 1px solid #2A2A3A, rounded-xl, p-6
- Title "Utility Analysis": 20px font-semibold white
- Subtitle "What it does": 14px color #6B6B7B, mt-1
- Content: show utility.what_it_does in a code-like block (bg #12121A, rounded-lg, p-4, font-mono text-[13px] color #A0A0B0, mt-3)
- Remove use_cases, not_for, trigger_behavior, dependencies sections from the display (simplify to match the design spec -- just the "what it does" code block)

**badge-section.tsx** -- Restyle:
- Card: bg #1A1A24, border 1px solid #2A2A3A, rounded-xl, p-6
- Title "Badge": 20px font-semibold white, mb-1
- Subtitle "Add to README": 14px color #6B6B7B, mb-4
- Badge preview: bg #12121A, rounded-lg, p-4, flex justify-center, mb-4
- Markdown snippet: bg #12121A, rounded-lg, p-4, font-mono text-[13px] color #A0A0B0
- Keep the CopyButton but it should inherit dark styles already from the CSS vars
  </action>
  <verify>
    <automated>cd /Users/lorisfochesato/Dev/skillgate && npx next build 2>&1 | tail -20</automated>
  </verify>
  <done>All report components render with dark UI styling. Hero shows score circle SVG. Category cards show severity dots without expand/collapse. Build succeeds with no type errors.</done>
</task>

</tasks>

<verification>
- `npx next build` completes without errors
- Visit /report/[any-existing-slug] -- page renders with dark background, dark header/footer
- Hero shows skill name, verdict button with correct color, score circle SVG
- Security analysis shows 2x2 + full-width grid of dark cards
- Recommendation card shows caveats in amber, alternatives in gray
- Utility and badge sections render with dark code blocks
</verification>

<success_criteria>
- /report routes get dark-landing class via layout-body.tsx isDark check
- Report page visually matches the dark UI spec with #0D0D14 background
- All 5 category cards render in the specified grid layout
- Score circle SVG shows correct progress based on severity.numeric
- No functional regressions -- same data, same URLs, same badge generation
</success_criteria>

<output>
After completion, create `.planning/quick/6-report-page-dark-ui-redesign/6-SUMMARY.md`
</output>
