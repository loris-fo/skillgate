# Phase 7: Design System & Layout - Context

**Gathered:** 2026-03-07
**Status:** Ready for planning

<domain>
## Phase Boundary

Replace the dark terminal aesthetic with a light sky-blue design system and add a shared layout (header + footer) used by all pages. All API routes, data logic, and audit engine stay untouched. Only visual/layout changes.

</domain>

<decisions>
## Implementation Decisions

### Wordmark & Header
- Plain text "skillgate" in Plus Jakarta Sans bold, #0C1A1A color — no icon, no two-tone
- npm install pill: `npm i -g skillgate` in Geist Mono with #BAE6FD background pill shape, click copies to clipboard with brief "Copied!" feedback
- GitHub icon turns accent #06B6D4 on hover
- Header is sticky with frosted-glass blur backdrop on scroll
- Header spans full viewport width, inner content constrained (e.g., max-w-6xl)

### Layout Structure
- Per-page max-widths (pages set their own, not a single global width)
- Header and footer span full width with inner content constraint
- Moderate vertical spacing (py-6 to py-10 range)
- Footer always pushed to viewport bottom (min-h-screen flex layout)

### Card & Component Styling
- Border radius: rounded-xl (12px)
- Shadow: subtle (shadow-sm) — cards distinguished mainly by border + white background against #F0F9FF
- Hover: border color shifts from #BAE6FD to #06B6D4 on hover
- Primary buttons: solid accent (#06B6D4) filled background with white text
- Secondary button style: Claude's discretion

### Typography
- Sans font: Plus Jakarta Sans (replacing Inter)
- Mono font: Geist Mono (replacing JetBrains Mono)
- Heading weight: extrabold (800)
- Heading color: #0C1A1A
- Body text: #475569 (from requirements)
- Wordmark color matches heading color (#0C1A1A), accent reserved for interactive elements

### Claude's Discretion
- Exact shadow values for blur backdrop header
- Secondary button styling
- Transition/animation durations
- Exact spacing values within the py-6 to py-10 range per page
- Footer internal layout and spacing

</decisions>

<specifics>
## Specific Ideas

- Sticky header with frosted-glass blur is a firm choice — common in modern SaaS sites
- Card hover effect (border color change) ties cards into the accent color system without being distracting
- Plus Jakarta Sans chosen for its slightly rounded, friendly-but-professional personality
- Geist Mono chosen for clean modern code rendering, pairs well with any sans

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `copy-button.tsx`: Already handles clipboard copy — reuse for npm pill copy behavior
- `category-card.tsx`, `badge-section.tsx`, `utility-section.tsx`: Will need restyling to new design system but structure stays

### Established Patterns
- Tailwind v4 with `@theme` block in globals.css for design tokens — replace dark values with light values
- `dark` class on `<html>` element — remove for light theme
- Google Fonts loaded via `next/font/google` in layout.tsx — swap Inter/JetBrains Mono for Plus Jakarta Sans/Geist Mono

### Integration Points
- `apps/web/src/app/layout.tsx`: Add shared header/footer component here, wrapping `{children}`
- `apps/web/src/app/globals.css`: Replace all `@theme` color tokens
- Each page (page.tsx, report/[slug]/page.tsx): Will inherit new layout, may need spacing adjustments
- Future pages (landing, audit) from Phases 8-9 will automatically get the shared layout

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 07-design-system-layout*
*Context gathered: 2026-03-07*
