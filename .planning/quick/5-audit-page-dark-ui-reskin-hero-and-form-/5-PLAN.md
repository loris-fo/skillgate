---
phase: quick-5
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/web/src/components/layout-body.tsx
  - apps/web/src/app/audit/page.tsx
  - apps/web/src/components/audit-form.tsx
autonomous: true
requirements: [QUICK-5]
must_haves:
  truths:
    - "Audit page has dark #1a1625 background matching landing page"
    - "Hero section displays centered heading and subheading above form"
    - "Form card has dark styling with purple accent focus states"
    - "All existing audit logic (URL input, paste, submit, loading, error, redirect) works unchanged"
  artifacts:
    - path: "apps/web/src/components/layout-body.tsx"
      provides: "dark-landing class applied on /audit route"
    - path: "apps/web/src/app/audit/page.tsx"
      provides: "Hero section + form card wrapper with dark styling"
    - path: "apps/web/src/components/audit-form.tsx"
      provides: "Reskinned form inputs, divider, and button"
  key_links:
    - from: "apps/web/src/components/layout-body.tsx"
      to: "apps/web/src/app/globals.css"
      via: "dark-landing CSS class applies dark CSS variables"
      pattern: "dark-landing"
    - from: "apps/web/src/app/audit/page.tsx"
      to: "apps/web/src/components/audit-form.tsx"
      via: "AuditForm component import"
      pattern: "AuditForm"
---

<objective>
Reskin the /audit page main content area (hero + form card) to match the landing page's dark UI theme.

Purpose: Visual consistency between landing and audit pages -- both use the dark #1a1625 theme.
Output: Updated audit page with dark hero section and restyled form card. No functional changes.
</objective>

<execution_context>
@/Users/lorisfochesato/.claude/get-shit-done/workflows/execute-plan.md
@/Users/lorisfochesato/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@apps/web/src/app/globals.css (dark-landing CSS class at line 53-72)
@apps/web/src/components/layout-body.tsx (isLanding check, dark-landing class toggle)
@apps/web/src/app/audit/page.tsx (current audit page)
@apps/web/src/components/audit-form.tsx (current form component)
@apps/web/src/components/header.tsx (header uses isLanding -- DO NOT change header logic)
@apps/web/src/components/footer.tsx (footer uses isLanding -- DO NOT change footer logic)

<interfaces>
From apps/web/src/components/layout-body.tsx:
```typescript
// Currently applies dark-landing only on "/"
const isLanding = pathname === "/";
// Need to extend: also apply on "/audit"
```

From apps/web/src/components/audit-form.tsx:
```typescript
// Client component with full form logic -- useState, useRouter, handleSubmit
// Only restyle JSX classes/styles. Do NOT touch state, handlers, or API calls.
export function AuditForm() { ... }
```
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Apply dark-landing theme to /audit route</name>
  <files>apps/web/src/components/layout-body.tsx</files>
  <action>
Update LayoutBody to apply the `dark-landing` CSS class on both `/` and `/audit` routes.

Change line 13 from:
```typescript
const isLanding = pathname === "/";
```
to:
```typescript
const isDark = pathname === "/" || pathname === "/audit";
```

Update line 17 to use `isDark` instead of `isLanding`:
```typescript
className={`${fontClassName} text-text-primary font-sans antialiased min-h-screen flex flex-col${isDark ? " dark-landing" : ""}`}
```

This reuses the existing `.dark-landing` CSS variables (defined in globals.css lines 53-72) which set --color-bg-page to #1a1625, --color-surface-card to #2d2640, --color-border to #3d3555, etc.

IMPORTANT: Do NOT touch header.tsx or footer.tsx. Their `isLanding` checks must remain `pathname === "/"` so the header stays as the sticky bar (not the floating pill) and footer stays as non-landing variant on /audit.
  </action>
  <verify>
    <automated>cd /Users/lorisfochesato/Dev/skillgate && npx tsc --noEmit --project apps/web/tsconfig.json 2>&1 | head -20</automated>
  </verify>
  <done>LayoutBody applies dark-landing class on /audit, TypeScript compiles clean</done>
</task>

<task type="auto">
  <name>Task 2: Restyle audit page hero and form card</name>
  <files>apps/web/src/app/audit/page.tsx, apps/web/src/components/audit-form.tsx</files>
  <action>
**audit/page.tsx** -- Replace entire content with new hero + form card layout:

```tsx
import type { Metadata } from "next";
import { AuditForm } from "@/components/audit-form";

export const metadata: Metadata = {
  title: "Audit a Skill — Skillgate",
  description:
    "Paste a SKILL.md or provide a URL to audit any Claude skill for security risks.",
};

export default function AuditPage() {
  return (
    <main
      className="flex-1 px-4"
      style={{ backgroundColor: "#1a1625" }}
    >
      {/* Hero */}
      <div
        className="text-center mx-auto"
        style={{ paddingTop: "120px", maxWidth: "900px" }}
      >
        <h1
          style={{
            fontSize: "56px",
            fontWeight: 700,
            color: "white",
            lineHeight: 1.1,
            marginBottom: "24px",
          }}
        >
          Audit your AI skills with confidence.
        </h1>
        <p
          className="mx-auto"
          style={{
            fontSize: "20px",
            fontWeight: 400,
            color: "#b8b0c8",
            lineHeight: 1.6,
            maxWidth: "700px",
          }}
        >
          Paste your SKILL.md content or provide a URL to get a full security
          audit with plain-English reasoning.
        </p>
      </div>

      {/* Form Card */}
      <div
        className="mx-auto"
        style={{
          maxWidth: "640px",
          marginTop: "48px",
          marginBottom: "64px",
          backgroundColor: "#2d2640",
          border: "1px solid #3d3650",
          borderRadius: "16px",
          padding: "32px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
        }}
      >
        <AuditForm />
      </div>
    </main>
  );
}
```

**audit-form.tsx** -- Restyle the form JSX to match the dark card spec. Preserve ALL state, handlers, and logic exactly as-is. Only change className and style attributes on the JSX elements:

1. **Loading overlay** (lines 67-78): Change `bg-white` to `bg-[#2d2640]` and text colors to white:
   - `bg-white` -> `bg-[#2d2640]`
   - `text-text-heading` -> `text-white`
   - `text-text-body` -> keep, CSS vars handle it

2. **URL label** (line 83-84): Change to `style={{ fontSize: "14px", fontWeight: 500, color: "white", marginBottom: "8px" }}` and keep `block` class.

3. **URL input** (lines 88-99): Replace className with:
   ```
   w-full rounded-lg px-4 text-white placeholder:text-[#8a8196] focus:outline-none transition-colors
   ```
   Add style:
   ```
   { height: "48px", backgroundColor: "#1a1625", border: "1px solid #3d3650", ...(loading ? { opacity: 0.6 } : {}) }
   ```
   Add onFocus/onBlur handlers for border color toggle to #9d7aff / #3d3650 (use inline style manipulation via e.target.style.borderColor).

4. **Divider** (lines 103-107): Change the line divs from `bg-border` to `bg-[#3d3650]`. Change text span: `text-[#9d7aff] text-sm` (replacing text-text-muted).

5. **Textarea label** (line 112-113): Same style as URL label -- `style={{ fontSize: "14px", fontWeight: 500, color: "white", marginBottom: "8px" }}`.

6. **Textarea** (lines 117-128): Replace className with:
   ```
   w-full rounded-lg px-4 py-4 text-white placeholder:text-[#8a8196] font-mono text-sm leading-relaxed resize-y focus:outline-none transition-colors
   ```
   Add style:
   ```
   { height: "120px", backgroundColor: "#1a1625", border: "1px solid #3d3650", ...(loading ? { opacity: 0.6 } : {}) }
   ```
   Add same onFocus/onBlur border color handlers as the URL input.

7. **Character count** (line 129-131): Change to `text-[#8a8196]` classes, keep `mt-1 text-right text-xs` (text-xs is 12px which is close enough to 14px, but change to `text-sm` for 14px per spec).

8. **Submit button** (lines 142-148): Replace className with:
   ```
   w-full rounded-lg text-white font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed
   ```
   Add style:
   ```
   { height: "52px", marginTop: "24px", backgroundColor: "#7c5ccc", fontSize: "16px", fontWeight: 600 }
   ```
   Add hover via onMouseEnter/onMouseLeave toggling bg to #8d6ddd and boxShadow to "0 4px 12px rgba(157,122,255,0.3)" / clearing them. Only apply hover when not disabled.

9. **Error div** (lines 135-139): Keep the existing error styling -- the severity colors work fine in dark mode.

CRITICAL: Do NOT modify any state variables, event handlers (handleSubmit, clearError), router logic, or conditional rendering logic. Only visual changes.
  </action>
  <verify>
    <automated>cd /Users/lorisfochesato/Dev/skillgate && npx tsc --noEmit --project apps/web/tsconfig.json 2>&1 | head -20 && npm run build --prefix apps/web 2>&1 | tail -5</automated>
  </verify>
  <done>Audit page renders with dark hero (56px white heading, #b8b0c8 subheading, 120px top padding) and dark form card (#2d2640 bg, #3d3650 border, 16px radius). All form inputs have #1a1625 bg, #9d7aff focus border, #7c5ccc submit button. Existing audit logic unchanged.</done>
</task>

</tasks>

<verification>
1. TypeScript compiles without errors
2. Next.js build succeeds
3. Visual: /audit page has #1a1625 background, centered hero text, dark form card
4. Functional: URL input, paste textarea, submit, loading overlay, error display, redirect all work as before
</verification>

<success_criteria>
- Audit page main section matches dark UI spec (bg, hero, form card styling)
- Header remains sticky bar variant (not floating pill)
- Footer remains non-landing variant
- All audit form logic preserved -- no behavioral changes
- TypeScript and build pass clean
</success_criteria>

<output>
After completion, create `.planning/quick/5-audit-page-dark-ui-reskin-hero-and-form-/5-SUMMARY.md`
</output>
