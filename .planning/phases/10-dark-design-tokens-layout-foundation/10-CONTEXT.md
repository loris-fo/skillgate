# Phase 10: Dark Design Tokens + Layout Foundation - Context

**Gathered:** 2026-03-10
**Status:** Ready for planning

<domain>
## Phase Boundary

Landing page renders with dark purple/violet theme while product pages (/audit, /report) remain unchanged on the light sky-blue theme. This phase delivers: dark design tokens scoped to landing, floating pill header, dark footer variant, and the layout plumbing to support both themes. Hero content, features section, and badge sections are Phase 11.

</domain>

<decisions>
## Implementation Decisions

### Dark Token Scoping
- Use `.dark-landing` CSS class on the body element, applied conditionally (landing page only)
- Override existing token names under `.dark-landing` (--color-bg-page, --color-surface-card, --color-accent, etc.) — components use same class names, dark values kick in automatically
- Move `bg-bg-page` from body to main element so landing page can override the background
- Full text color remap: --color-text-heading → white, --color-text-body → light gray (~#cbd5e1), --color-text-muted → medium gray
- Dark palette: #1a1625 (background), #2d2640 (surfaces), #9d7aff (accent)

### Header Pill Transition
- Single Header component with `usePathname()` for conditional styling
- Landing: floating over content (fixed positioning with top margin), rounded-full pill shape, backdrop-blur
- Other pages: existing sticky bar with border-bottom (no visual changes)
- Landing header content: shield icon + "skillgate" wordmark, nav links (Docs, GitHub), CLI pill (`npx skillgate` with copy), "Try it" CTA button → /audit
- Non-landing header keeps current content: wordmark + npm install pill + GitHub icon

### Footer Dark Variant
- Convert footer to client component using `usePathname()` to detect landing page
- Landing: dark text colors, purple top border as separator (no full border)
- Same link set across all pages (GitHub, npm, skillgate.sh, MIT License) — only styling changes
- Non-landing pages retain existing footer styling unchanged

### Severity Color Consistency
- Severity tokens remain static hex values — never overridden by .dark-landing
- Fix current color mapping to match requirements:
  - safe: #22C55E (green) — unchanged
  - low: #3B82F6 (blue) — was #EAB308 yellow
  - moderate: #F59E0B (amber) — was #F97316 orange
  - high: #F97316 (orange) — unchanged
  - critical: #EF4444 (red) — unchanged

### Claude's Discretion
- Exact backdrop-blur intensity and opacity for floating pill header
- Dark token values for border colors, hover states, and muted accents
- Transition/animation approach when navigating between landing and other pages
- Exact shield icon implementation (SVG inline or icon library)

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `Header` component (apps/web/src/components/header.tsx): Already a client component with `"use client"`, uses backdrop-blur, has copy-to-clipboard for CLI pill
- `Footer` component (apps/web/src/components/footer.tsx): Simple server component with links array — needs conversion to client component
- `globals.css`: Tailwind v4 @theme block defines all design tokens — dark overrides go here under .dark-landing selector
- Landing page components in `apps/web/src/components/landing/` — hero, features, animated-mockup, badge-snippet

### Established Patterns
- Tailwind v4 `@theme` for design tokens with CSS custom properties
- Plus Jakarta Sans + Geist Mono font pairing
- `max-w-6xl mx-auto px-4 sm:px-6` for content width
- Backward-compat CSS aliases exist for older component references

### Integration Points
- `apps/web/src/app/layout.tsx`: Root layout renders Header + main + Footer — needs .dark-landing class logic on body
- `apps/web/src/app/page.tsx`: Landing page entry point — content is inside main, no wrapper div
- Background currently on body (`bg-bg-page`) — needs to move to main element

</code_context>

<specifics>
## Specific Ideas

- Header on landing should match dark marketing page patterns (think Linear, Vercel) — floating pill with subtle blur
- "Try it" CTA in header links directly to /audit for conversion
- CLI pill changes from "npm i -g skillgate" to "npx skillgate" on landing (lower friction)
- Footer dark variant is subtle — just a top purple border separator and inverted text, not a dramatic redesign

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 10-dark-design-tokens-layout-foundation*
*Context gathered: 2026-03-10*
