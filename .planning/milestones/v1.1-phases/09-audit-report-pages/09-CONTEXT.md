# Phase 9: Audit & Report Pages - Context

**Gathered:** 2026-03-09
**Status:** Ready for planning

<domain>
## Phase Boundary

Redesign the /audit and /report/[slug] pages to match the new light sky-blue design system. All existing functionality (form submission, redirect, verdict display, badge, copy link, shareable URL) remains intact. Visual refresh only — no API or logic changes.

</domain>

<decisions>
## Implementation Decisions

### Audit Page Layout
- Create new /audit route (no page route exists yet — form component exists at audit-form.tsx)
- Centered card (rounded-xl, shadow-sm) with max-w-2xl on #F0F9FF background
- Heading + one-line subtext above the form inside the card
- Both fields visible at once (URL input + textarea) — no tab toggle
- Full-page semi-transparent overlay with centered spinner for loading state (replaces current inline loading)

### Report Verdict Display
- Large colored pill/badge (e.g. green "Safe to Install") next to skill name and summary
- Numeric score only (e.g. "3/10") with severity color — no progress bar in verdict
- Copy link button placed next to the verdict badge area (prominent, easy to find)
- Recommendation details (Best for, Caveats, Alternatives) in a separate card — not in the verdict section

### Category Cards
- Keep expand/collapse behavior (click to toggle details)
- Colored pill label per category (green "Safe", red "Critical", etc.) — matches verdict badge approach
- Remove progress bars from individual category cards — pill label is sufficient
- 2-column grid layout (responsive — stacks on mobile)
- "By Design" badge retained

### Report Page Flow
- Section order: Verdict → Categories → Recommendation → Utility → Badge → "Audit another skill" link
- Visible section headings above each section (e.g. "Security Analysis", "Utility", "Badge")
- "Audit another skill" link at the very bottom after badge section, linking to /audit

### Claude's Discretion
- Exact heading/subtext copy for audit page
- Animation timing for page transitions
- Expand/collapse behavior in 2-column grid (how expanded cards interact with grid flow)
- Section heading typography and spacing
- Mobile breakpoint for 2-column → 1-column category grid
- Exact overlay styling (opacity, blur, spinner design)

</decisions>

<specifics>
## Specific Ideas

- Verdict badge approach should feel like GitHub issue labels — compact colored pills with clear text
- Category pills should use the same SEVERITY_CONFIG colors already defined in severity.ts
- Audit page should feel focused and clean — like a login page, not cluttered
- Full-page loading overlay gives a more polished feel for an operation that takes a few seconds

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `audit-form.tsx`: Client component with URL input, textarea, validation, error handling — needs wrapping in a page route
- `report-hero.tsx`: Server component with verdict display — needs redesign to badge+text approach
- `category-card.tsx`: Client component with expand/collapse — needs pill label, remove progress bar, grid layout
- `utility-section.tsx`: Server component — needs restyling to design system cards
- `badge-section.tsx`: Server component — needs restyling to design system cards
- `copy-button.tsx`: Clipboard utility component — reuse as-is
- `severity.ts`: SEVERITY_CONFIG and VERDICT_CONFIG with all colors — reuse for pill labels

### Established Patterns
- Tailwind v4 with @theme tokens: bg-surface-card, border-border-card, text-text-heading, etc.
- Card pattern: rounded-xl bg-surface-card border border-border-card shadow-card p-6
- Button pattern: bg-accent text-white hover:bg-accent-hover
- Input pattern: border-border bg-surface-2 focus:ring-accent/40
- Server components by default, client only when interactivity needed (expand/collapse, form state)
- animate-fade-in for page entry animations

### Integration Points
- `apps/web/src/app/audit/page.tsx`: New route to create — imports AuditForm component
- `apps/web/src/app/report/[slug]/page.tsx`: Existing route to restyle — already renders all report components
- Layout wrapper (layout.tsx) already provides Header + Footer — pages just fill the main slot
- Landing page hero CTA already links to /audit — will work once route exists

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 09-audit-report-pages*
*Context gathered: 2026-03-09*
