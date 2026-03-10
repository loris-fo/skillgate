# Phase 11: Landing Page Sections - Research

**Researched:** 2026-03-10
**Domain:** Next.js landing page sections (hero, features+demo, badges) with dark theme
**Confidence:** HIGH

## Summary

Phase 11 is a UI-only phase that reworks four existing React components to match the v1.2 dark landing page design. All dark design tokens, the floating header, and dark footer are already in place from Phase 10. The `.dark-landing` class on `<body>` auto-resolves all semantic color tokens to their dark values, so components only need to use the existing token classes (e.g., `text-text-heading`, `bg-surface-card`).

The main structural change is combining `FeaturesSection` and `AnimatedMockup` into a single two-column section. The mock report demo needs updated data (mixed verdicts instead of all-safe) and pill-style severity labels instead of progress bars. The badge section needs per-badge copy buttons instead of a single shared snippet.

**Primary recommendation:** Modify existing components in-place since the structure is close; the heaviest lift is the hero gradient orb (pure CSS radial-gradient), the features+demo two-column merge, and the mock report data/UI overhaul.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Hero heading "Don't install blind." at 120px on desktop, 64px on mobile (<=768px)
- Large soft violet gradient orb behind heading (~600px diameter, ~20% opacity, centered behind text) -- ambient glow like Vercel
- Keep current subtitle text: "Trust-verify any Claude skill before it touches your codebase. AI-powered security analysis with plain-English reasoning, not just a score."
- Two CTAs: primary "Audit a skill" -> /audit (solid violet #9d7aff, white text), secondary "View example report" -> /report/cursor-rules-architect (text link style)
- Primary CTA matches header "Try it" button styling for consistency
- Two-column layout: left column has 3 stacked feature cards, right column has mock report demo
- Stacks to single column on tablet (<=1024px)
- Feature card titles: "AI Security Analysis", "CLI Gate", "Trust Badges"
- Cards are NOT clickable links -- informational only
- Dark surface cards: #2d2640 background with subtle violet border -- consistent with dark token system
- Keep existing SVG icons (ShieldIcon, TerminalIcon, BadgeIcon)
- Keep browser chrome (red/yellow/green dots + URL bar) for realistic framing
- Show cursor-rules-architect skill, "Use with Caution" verdict, 6.2/10 score
- Use pill-style severity labels (not progress bars) -- matches actual report page UI
- Category-severity spread: Hidden Logic: Safe, Data Access: Low, Action Risk: Moderate, Permission Scope: Low, Override Attempts: Safe
- Keep scroll-triggered entrance animations (IntersectionObserver staggered fade-in)
- Badge heading: "Add a trust badge"
- 3 badges (Safe to Install, Use with Caution, Avoid) in horizontal row
- Each badge has its own markdown snippet with individual copy-to-clipboard button
- Generic placeholder URLs: `![Skillgate](https://skillgate.sh/badge/your-skill)`
- Stack vertically on mobile (<=768px)

### Claude's Discretion
- Exact gradient orb CSS implementation (radial-gradient positioning, blur)
- Feature card description rewrites (marketing tone, keep meaning)
- Tablet breakpoint (<=1024px) layout details for features+demo stacking order
- Section spacing and padding between hero, features+demo, and badges
- Mock report demo browser chrome adaptation for dark theme

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| HERO-01 | Hero heading "Don't install blind." at 120px desktop, scales down on mobile | Existing HeroSection component; needs font-size override via inline style or custom class, responsive with media query |
| HERO-02 | Subtle gradient orb (violet radial gradient) behind hero text | Pure CSS radial-gradient with absolute positioning; no library needed |
| HERO-03 | Two CTAs: primary "Audit a skill" -> /audit, secondary "View example report" -> /report/cursor-rules-architect | Existing CTAs in HeroSection; need restyling to match header "Try it" button (rounded-full, bg-accent) |
| FEAT-01 | Two-column layout: 3 stacked feature cards left, mock report demo right | Requires merging FeaturesSection + AnimatedMockup into single parent; CSS grid or flex |
| FEAT-02 | Mock report demo shows hardcoded mixed verdicts with pill-style labels | AnimatedMockup needs new data + replace progress bars with severity pills matching CategoryCard pattern |
| FEAT-03 | Layout stacks to single column on tablet (<=1024px) | Tailwind `lg:` breakpoint (1024px) controls two-column vs stacked |
| BADGE-01 | Three badge examples (Safe to Install, Use with Caution, Avoid) with ShieldBadge SVGs | Existing BadgeSnippet has all three badges; structure preserved |
| BADGE-02 | Each badge has own markdown snippet with individual copy-to-clipboard button | Refactor from single shared snippet to per-badge snippets with CopyButton instances |
| RESP-01 | Tablet (<=1024px): features+demo stacks vertically | Tailwind responsive class `lg:grid-cols-2` -> `grid-cols-1` default |
| RESP-02 | Mobile (<=768px): hero heading scales down, all sections single column | Tailwind `md:` breakpoint for heading size; sections already stack naturally |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | ^15.1 | App framework | Already in project |
| React | ^19 | UI | Already in project |
| Tailwind CSS | ^4.2.1 | Styling | Already in project, v4 with @theme syntax |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| CopyButton | internal | Clipboard copy with feedback | Badge section per-badge copy |

### Alternatives Considered
None -- this phase uses only existing project dependencies. No new packages needed.

## Architecture Patterns

### Component Structure After Phase 11
```
apps/web/src/components/landing/
  hero-section.tsx          # Reworked: 120px heading, gradient orb, restyled CTAs
  features-demo-section.tsx # NEW: merges features + mock demo into two-column layout
  features-section.tsx      # DELETED or kept for icon exports only
  animated-mockup.tsx       # DELETED (absorbed into features-demo-section)
  badge-snippet.tsx         # Reworked: per-badge copy buttons
```

### Pattern 1: Gradient Orb (CSS-only ambient glow)
**What:** A large soft radial gradient positioned behind the hero heading
**When to use:** Hero section background effect
**Example:**
```tsx
// Parent container needs relative positioning
<section className="relative overflow-hidden">
  {/* Gradient orb - absolute positioned, centered behind heading */}
  <div
    className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
    style={{
      width: '600px',
      height: '600px',
      background: 'radial-gradient(circle, rgba(157, 122, 255, 0.20) 0%, transparent 70%)',
      filter: 'blur(60px)',
    }}
    aria-hidden="true"
  />
  {/* Content on top with relative z-index */}
  <div className="relative z-10">
    {/* heading, subtitle, CTAs */}
  </div>
</section>
```

### Pattern 2: Two-Column Features + Demo
**What:** CSS Grid with features stacked left, demo right
**When to use:** Features+demo section
**Example:**
```tsx
<section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
  <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-start">
    {/* Left: stacked feature cards */}
    <div className="flex flex-col gap-6">
      {features.map(f => <FeatureCard key={f.title} {...f} />)}
    </div>
    {/* Right: mock report demo */}
    <div>
      <MockReportDemo />
    </div>
  </div>
</section>
```

### Pattern 3: Severity Pills (matching actual report UI)
**What:** Pill-style severity labels using the same pattern as CategoryCard
**When to use:** Mock report demo category rows
**Example:**
```tsx
// From existing CategoryCard pattern in category-card.tsx
<span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold text-white ${severityBgClass}`}>
  {severityLabel}
</span>
```
The severity bg classes map to tokens: `bg-severity-safe`, `bg-severity-low`, `bg-severity-moderate`.

### Pattern 4: Per-Badge Copy Buttons
**What:** Each badge variant gets its own markdown snippet and CopyButton
**When to use:** Badge section
**Example:**
```tsx
const badgeVariants = [
  { label: "Safe to Install", bgColor: "#22C55E", textColor: "#FFFFFF" },
  { label: "Use with Caution", bgColor: "#F97316", textColor: "#FFFFFF" },
  { label: "Avoid / Critical", bgColor: "#EF4444", textColor: "#FFFFFF" },
];

{badgeVariants.map((v) => (
  <div key={v.label} className="flex flex-col items-center gap-3">
    <ShieldBadge {...v} />
    <div className="relative w-full">
      <pre className="bg-surface-2 border border-border rounded-lg p-3 pr-20 font-mono text-xs text-text-body overflow-x-auto">
        {`![Skillgate](https://skillgate.sh/badge/your-skill)`}
      </pre>
      <div className="absolute top-2 right-2">
        <CopyButton text={`![Skillgate](https://skillgate.sh/badge/your-skill)`} label="Copy" />
      </div>
    </div>
  </div>
))}
```

### Pattern 5: Matching Header CTA Style
**What:** Primary hero CTA should match the header "Try it" button styling
**Current header "Try it" button classes:**
```
bg-accent hover:bg-accent-hover text-white rounded-full px-4 py-1.5 font-semibold text-sm transition-colors
```
For hero, scale up slightly:
```
bg-accent hover:bg-accent-hover text-white rounded-full px-6 py-3 font-semibold transition-colors
```

### Anti-Patterns to Avoid
- **Don't use fixed pixel values for heading on mobile:** Use responsive classes or clamp(). The heading is 120px on desktop but must scale to 64px on mobile.
- **Don't create a new CSS file for dark tokens:** The `.dark-landing` class in globals.css already overrides all semantic tokens. Use existing token classes.
- **Don't use Tailwind `text-[120px]` for the heading:** 120px is an unusual size; use inline `style={{ fontSize: '120px' }}` with a responsive wrapper, or use `text-[120px] md:text-[64px]` (mobile-first: `text-[64px] lg:text-[120px]`).
- **Don't wrap feature cards in links:** CONTEXT.md explicitly says cards are NOT clickable -- informational only. Remove CardWrapper link pattern.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Clipboard copy | Custom clipboard logic | Existing `CopyButton` component | Already handles state, feedback, clipboard API |
| Scroll animations | Custom animation library | Existing IntersectionObserver pattern from AnimatedMockup | Already proven in codebase, no dependencies |
| Severity color mapping | Hardcoded color strings | `SEVERITY_CONFIG` from `@/lib/severity` or CSS token vars | Consistency with report page, single source of truth |
| Responsive breakpoints | Custom media queries | Tailwind responsive prefixes (`md:`, `lg:`) | Consistent with project patterns |

**Key insight:** Everything needed is already in the codebase. This phase is about rearranging and restyling existing components, not adding new capabilities.

## Common Pitfalls

### Pitfall 1: Heading Font Size Responsiveness
**What goes wrong:** Using a single Tailwind class for 120px creates overflow on mobile
**Why it happens:** 120px heading is extremely large and will overflow viewports under ~500px
**How to avoid:** Use mobile-first approach: `text-[64px] lg:text-[120px]` or `style={{ fontSize: 'clamp(3rem, 8vw + 1rem, 120px)' }}`. Test on 375px viewport.
**Warning signs:** Horizontal scrollbar on mobile, text clipping

### Pitfall 2: Gradient Orb Causing Layout Shift
**What goes wrong:** The 600px gradient element pushes content or creates unwanted scrollbars
**Why it happens:** Absolute-positioned elements can overflow their container
**How to avoid:** Parent needs `overflow-hidden` and `position: relative`. Orb uses `pointer-events-none` and `aria-hidden="true"`.
**Warning signs:** Horizontal scroll on page, content shifting when section enters viewport

### Pitfall 3: Dark Theme Browser Chrome in Mock Demo
**What goes wrong:** The mock report browser chrome uses `bg-white` for the URL bar, which clashes with dark theme
**Why it happens:** Current AnimatedMockup hardcodes `bg-white` for URL bar
**How to avoid:** Use dark-appropriate colors: `bg-surface-2` for chrome bar, `bg-[#1a1625]` or `bg-surface-0` for URL bar text area. The traffic light dots (red/yellow/green) stay as-is.
**Warning signs:** Bright white rectangle in otherwise dark section

### Pitfall 4: CopyButton Styling in Dark Theme
**What goes wrong:** CopyButton's default styling (`bg-surface-3`) may not contrast well on dark cards
**Why it happens:** `surface-3` maps to `#3d3555` in dark mode which may blend with card background `#2d2640`
**How to avoid:** Test contrast; may need to pass `className` override to CopyButton for badge section context
**Warning signs:** Button barely visible against card background

### Pitfall 5: IntersectionObserver Cleanup
**What goes wrong:** Memory leaks from IntersectionObserver not being cleaned up
**Why it happens:** Component unmounts before observer fires
**How to avoid:** Existing pattern already handles this with `return () => observer.disconnect()` in useEffect cleanup. Preserve this pattern when refactoring.
**Warning signs:** Console warnings about setting state on unmounted components

### Pitfall 6: Features+Demo Merge Breaking Page.tsx
**What goes wrong:** page.tsx imports both FeaturesSection and AnimatedMockup separately; merging them requires updating the import
**Why it happens:** Structural change to combine two sections into one
**How to avoid:** Update page.tsx imports atomically with component creation. Remove old imports when new combined component is ready.
**Warning signs:** Build errors, missing sections on page

## Code Examples

### Hero Section with 120px Heading and Gradient Orb
```tsx
// hero-section.tsx (reworked)
import Link from "next/link";

export function HeroSection() {
  return (
    <section className="relative mx-auto max-w-4xl overflow-hidden px-4 pb-16 pt-32 text-center">
      {/* Gradient orb */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(157, 122, 255, 0.20) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
        aria-hidden="true"
      />

      <div className="relative z-10">
        <h1
          className="font-bold tracking-tight text-text-heading"
          style={{ fontSize: 'clamp(48px, 10vw, 120px)', lineHeight: 1.05 }}
        >
          Don&apos;t install blind.
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-lg text-text-body">
          Trust-verify any Claude skill before it touches your codebase.
          AI-powered security analysis with plain-English reasoning, not just a score.
        </p>

        <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/audit"
            className="inline-flex items-center rounded-full bg-accent px-6 py-3 font-semibold text-white transition-colors hover:bg-accent-hover"
          >
            Audit a skill
          </Link>
          <Link
            href="/report/cursor-rules-architect"
            className="text-sm text-text-muted transition-colors hover:text-accent"
          >
            View example report &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
}
```

### Mock Report Demo with Pill Labels (replacing progress bars)
```tsx
// Key data change
const mockCategories = [
  { name: "Hidden Logic",      severity: "safe"     as const },
  { name: "Data Access",       severity: "low"      as const },
  { name: "Action Risk",       severity: "moderate" as const },
  { name: "Permission Scope",  severity: "low"      as const },
  { name: "Override Attempts", severity: "safe"     as const },
];

// Severity pill (replacing progress bar)
const PILL_COLORS: Record<string, { bg: string; label: string }> = {
  safe:     { bg: "bg-severity-safe",     label: "Safe" },
  low:      { bg: "bg-severity-low",      label: "Low" },
  moderate: { bg: "bg-severity-moderate", label: "Moderate" },
};

// In category row, replace progress bar with:
<span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold text-white ${PILL_COLORS[cat.severity].bg}`}>
  {PILL_COLORS[cat.severity].label}
</span>
```

### Updated page.tsx Structure
```tsx
import { HeroSection } from "@/components/landing/hero-section";
import { FeaturesDemoSection } from "@/components/landing/features-demo-section";
import { BadgeSnippet } from "@/components/landing/badge-snippet";

export default function Home() {
  return (
    <>
      <HeroSection />
      <FeaturesDemoSection />
      <BadgeSnippet />
    </>
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Tailwind v3 `@apply` + config file | Tailwind v4 `@theme` in CSS + CSS-native tokens | v4.0 (Jan 2025) | Project already uses v4; no config file, tokens in globals.css |
| 4 separate landing sections | 3 sections (hero, features+demo merged, badges) | Phase 11 | Structural change in page.tsx |
| Progress bars for severity | Pill labels for severity | Phase 11 | Matches actual report page CategoryCard UI |
| Single shared badge snippet | Per-badge individual snippets | Phase 11 | Better UX -- users copy the specific badge they want |

## Open Questions

1. **Hero heading: clamp() vs breakpoint classes**
   - What we know: Heading needs 120px desktop, 64px mobile. Both approaches work.
   - What's unclear: Whether intermediate sizes (tablet) need explicit sizing
   - Recommendation: Use `clamp(48px, 10vw, 120px)` for fluid scaling -- simpler than managing multiple breakpoints. The 64px mobile target falls naturally within this range at ~640px viewport.

2. **Features+Demo: new file vs refactor existing**
   - What we know: FeaturesSection and AnimatedMockup need to merge into one two-column section
   - What's unclear: Whether to create a brand new `features-demo-section.tsx` or refactor one of the existing files
   - Recommendation: Create new `features-demo-section.tsx` and delete both old files. Cleaner than trying to expand one file to absorb the other.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest + React Testing Library |
| Config file | `apps/web/vitest.config.ts` |
| Quick run command | `cd apps/web && npx vitest run --reporter=verbose` |
| Full suite command | `cd apps/web && npx vitest run` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| HERO-01 | Hero heading renders with correct text | unit | `cd apps/web && npx vitest run src/components/landing/__tests__/hero-section.test.tsx -x` | No - Wave 0 |
| HERO-02 | Gradient orb element present with aria-hidden | unit | Same as HERO-01 | No - Wave 0 |
| HERO-03 | Two CTA links with correct hrefs | unit | Same as HERO-01 | No - Wave 0 |
| FEAT-01 | Three feature cards render with correct titles | unit | `cd apps/web && npx vitest run src/components/landing/__tests__/features-demo-section.test.tsx -x` | No - Wave 0 |
| FEAT-02 | Mock demo shows "Use with Caution" verdict, 6.2/10 score, 5 category rows | unit | Same as FEAT-01 | No - Wave 0 |
| FEAT-03 | Two-column grid class present (lg:grid-cols-2) | unit | Same as FEAT-01 | No - Wave 0 |
| BADGE-01 | Three ShieldBadge SVGs render | unit | `cd apps/web && npx vitest run src/components/landing/__tests__/badge-snippet.test.tsx -x` | No - Wave 0 |
| BADGE-02 | Three CopyButton instances render (one per badge) | unit | Same as BADGE-01 | No - Wave 0 |
| RESP-01 | Responsive classes verified (grid-cols-1 default, lg:grid-cols-2) | unit | Same as FEAT-01 | No - Wave 0 |
| RESP-02 | Heading responsive class/style verified | unit | Same as HERO-01 | No - Wave 0 |

### Sampling Rate
- **Per task commit:** `cd apps/web && npx vitest run src/components/landing/__tests__/ -x`
- **Per wave merge:** `cd apps/web && npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `apps/web/src/components/landing/__tests__/hero-section.test.tsx` -- covers HERO-01, HERO-02, HERO-03, RESP-02
- [ ] `apps/web/src/components/landing/__tests__/features-demo-section.test.tsx` -- covers FEAT-01, FEAT-02, FEAT-03, RESP-01
- [ ] `apps/web/src/components/landing/__tests__/badge-snippet.test.tsx` -- covers BADGE-01, BADGE-02

## Sources

### Primary (HIGH confidence)
- Project codebase: `apps/web/src/components/landing/` -- all existing component files read
- Project codebase: `apps/web/src/app/globals.css` -- dark-landing token system verified
- Project codebase: `apps/web/src/components/category-card.tsx` -- pill severity pattern verified
- Project codebase: `apps/web/src/lib/severity.ts` -- SEVERITY_CONFIG mapping verified
- Project codebase: `apps/web/src/components/header.tsx` -- "Try it" button styling verified
- Project codebase: `apps/web/src/components/copy-button.tsx` -- reusable CopyButton API verified

### Secondary (MEDIUM confidence)
- CSS radial-gradient + blur approach for ambient glow -- standard CSS pattern, well-supported

### Tertiary (LOW confidence)
None

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- no new dependencies, all existing project libraries
- Architecture: HIGH -- component structure clear from codebase analysis, patterns well-established
- Pitfalls: HIGH -- identified from direct code inspection (hardcoded colors, responsive overflow, component merge)

**Research date:** 2026-03-10
**Valid until:** 2026-04-10 (stable -- no external dependency changes)
