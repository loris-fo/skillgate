# Phase 11: Landing Page Sections - Context

**Gathered:** 2026-03-10
**Status:** Ready for planning

<domain>
## Phase Boundary

Landing page delivers a compelling dark marketing experience with hero, features+demo, and badge sections. All sections render on the dark purple/violet theme established in Phase 10. This phase builds the content sections — the dark tokens, floating header, and dark footer are already in place.

</domain>

<decisions>
## Implementation Decisions

### Hero Section
- Heading "Don't install blind." at 120px on desktop, 64px on mobile (<=768px)
- Large soft violet gradient orb behind heading (~600px diameter, ~20% opacity, centered behind text) — ambient glow like Vercel
- Keep current subtitle text: "Trust-verify any Claude skill before it touches your codebase. AI-powered security analysis with plain-English reasoning, not just a score."
- Two CTAs: primary "Audit a skill" → /audit (solid violet #9d7aff, white text), secondary "View example report" → /report/cursor-rules-architect (text link style)
- Primary CTA matches header "Try it" button styling for consistency

### Features + Demo Layout
- Two-column layout: left column has 3 stacked feature cards, right column has mock report demo
- Stacks to single column on tablet (<=1024px)

### Feature Cards
- Titles: "AI Security Analysis", "CLI Gate", "Trust Badges" (use requirement names)
- Cards are NOT clickable links — informational only, CTAs in hero handle navigation
- Rewrite descriptions for punchier marketing tone (Claude's discretion on exact copy)
- Dark surface cards: #2d2640 background with subtle violet border — consistent with dark token system
- Keep existing SVG icons (ShieldIcon, TerminalIcon, BadgeIcon)

### Mock Report Demo
- Keep browser chrome (red/yellow/green dots + URL bar) for realistic framing
- Show cursor-rules-architect skill, "Use with Caution" verdict, 6.2/10 score
- Use pill-style severity labels (not progress bars) — matches actual report page UI
- Category-severity spread: Hidden Logic: Safe, Data Access: Low, Action Risk: Moderate, Permission Scope: Low, Override Attempts: Safe
- Keep scroll-triggered entrance animations (IntersectionObserver staggered fade-in)

### Badge Section
- Heading: "Add a trust badge" (keep current)
- 3 badges (Safe to Install, Use with Caution, Avoid) in horizontal row
- Each badge has its own markdown snippet with individual copy-to-clipboard button
- Generic placeholder URLs: `![Skillgate](https://skillgate.sh/badge/your-skill)` — user replaces slug
- Stack vertically on mobile (<=768px)

### Claude's Discretion
- Exact gradient orb CSS implementation (radial-gradient positioning, blur)
- Feature card description rewrites (marketing tone, keep meaning)
- Tablet breakpoint (<=1024px) layout details for features+demo stacking order
- Section spacing and padding between hero, features+demo, and badges
- Mock report demo browser chrome adaptation for dark theme

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `HeroSection` (apps/web/src/components/landing/hero-section.tsx): Needs major rework — heading size, gradient orb, CTA restyling. Structure reusable.
- `FeaturesSection` (apps/web/src/components/landing/features-section.tsx): Has icon components (ShieldIcon, TerminalIcon, BadgeIcon) and feature data array. Needs layout change from 3-col grid to stacked cards, remove link wrapping.
- `AnimatedMockup` (apps/web/src/components/landing/animated-mockup.tsx): Has IntersectionObserver pattern and browser chrome. Needs: new mock data (mixed verdicts), replace progress bars with severity pills, update verdict from "Safe to Install" to "Use with Caution".
- `BadgeSnippet` (apps/web/src/components/landing/badge-snippet.tsx): Has ShieldBadge SVG component and CopyButton integration. Needs: per-badge copy buttons instead of single shared snippet.
- `CopyButton` (apps/web/src/components/copy-button.tsx): Reusable — already used in badge snippet and header.

### Established Patterns
- Dark token system via `.dark-landing` class — components use semantic token names (text-text-heading, bg-surface-card, etc.) that auto-resolve to dark values on landing
- IntersectionObserver for scroll animations (used in AnimatedMockup)
- `max-w-6xl mx-auto px-4 sm:px-6` for content width
- Severity color tokens: --color-severity-safe, --color-severity-low, etc. (static, not overridden by dark theme)

### Integration Points
- `apps/web/src/app/page.tsx`: Landing page renders HeroSection, FeaturesSection, AnimatedMockup, BadgeSnippet — will need restructuring for two-column features+demo layout
- Features and demo need to be combined into a single two-column section (currently separate sections)

</code_context>

<specifics>
## Specific Ideas

- Feature cards + mock demo become a single two-column section (left: cards, right: demo) — this is a layout restructuring from the current 4-section sequential layout
- Mock demo severity pills should use the same severity color tokens as the real report page for visual consistency
- Primary CTA button (solid violet) should have hover state that's slightly lighter/brighter

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 11-landing-page-sections*
*Context gathered: 2026-03-10*
