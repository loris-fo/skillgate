# Phase 8: Landing Page - Context

**Gathered:** 2026-03-08
**Status:** Ready for planning

<domain>
## Phase Boundary

Build the marketing landing page at `/` — hero section, feature cards, animated report mockup, and badge snippet. Replaces the current minimal home page (which has the audit form — that moves to /audit in Phase 9). All API routes, data logic, and audit engine stay untouched.

</domain>

<decisions>
## Implementation Decisions

### Hero Section
- Bold & punchy headline tone — short, attention-grabbing (e.g., "Don't install blind")
- Text-only hero — no illustration or graphic above the fold; the animated mockup provides visual punch further down
- Subtext: brief explanation of what Skillgate does
- Primary CTA: "Audit a skill" button (solid accent #06B6D4) linking to /audit
- Secondary CTA: "View example report" link to a real audit report — shows the product in action

### Feature Sections
- 3-column card grid layout (stacks on mobile)
- Three cards highlighting: (1) AI-powered security audit (5 categories), (2) CLI install & gate (blocks risky skills), (3) Trust badges for READMEs
- SVG icons per card (Lucide or similar library) — professional, consistent with design system
- Cards are clickable: audit card → /audit, CLI card → npm package page, badge card → scrolls to badge section
- Cards use the established design system: white bg, #BAE6FD border, rounded-xl, shadow-sm, hover border → #06B6D4

### Animated Report Mockup
- Stylized mock data — hardcoded realistic-looking audit with fake skill name, no API dependency
- Shows verdict banner (e.g., "Safe to Install") and the 5 security category rows with scores
- Staggered scroll-triggered animation: first row appears on scroll into view (Intersection Observer), then remaining rows stagger in with delays
- Wrapped in a browser chrome frame (fake browser window with dots and URL bar) for product-screenshot feel

### Badge Snippet Section
- Positioned at bottom of page, before footer — natural end-of-page CTA
- Shows rendered SVG badge preview with multiple variants (safe, warning, critical) to demonstrate the range
- Generic placeholder markdown snippet: `![Skillgate](https://skillgate.sh/badge/your-skill)` — user replaces slug after auditing
- Copy button on the snippet (CopyButton component already exists)

### Claude's Discretion
- Exact hero headline and subtext copy
- SVG icon choices for feature cards
- Feature card description text
- Animation timing/easing for mockup rows
- Browser chrome frame styling details
- Page section spacing and responsive breakpoints
- Which real audit report to link as the "example report" secondary CTA

</decisions>

<specifics>
## Specific Ideas

- Hero tone reference: bold, punchy — think "Don't install blind" or "Know what you're installing" energy
- Feature cards should feel like the Phase 7 card system — clean, not cluttered (Linear-style)
- Browser chrome mockup is a common SaaS landing page pattern — adds credibility
- Badge section showing multiple variants (green safe, orange warning, red critical) gives skill authors a clear picture of what they'll get

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `CopyButton` component (`copy-button.tsx`): Handles clipboard copy with "Copied!" feedback — reuse for badge snippet copy
- `Header` component: Already has clipboard copy pattern for npm pill — consistent UX
- Design tokens in `globals.css`: All colors, shadows, fonts defined as CSS custom properties
- `category-card.tsx`: Existing category card component — mockup can reference its structure for realistic styling
- `badge-section.tsx`: Existing badge section from report page — can inform badge snippet section design

### Established Patterns
- Tailwind v4 with `@theme` tokens — all new components should use token classes (bg-surface-card, text-text-heading, etc.)
- `next/font/google` for Plus Jakarta Sans + Geist Mono — no additional font loading needed
- Card pattern: rounded-xl, shadow-card, border-border-card, hover:border-border-card-hover
- Fade-in animation already defined in globals.css (`animate-fade-in`) — extend for scroll-triggered stagger

### Integration Points
- `apps/web/src/app/page.tsx`: Replace current content (AuditForm import + simple hero) with full landing page
- Layout wrapper (layout.tsx) already provides Header + Footer — landing page just fills the `<main>` slot
- /audit route will be created in Phase 9 — for now, hero CTA can link to /audit (will 404 until Phase 9)
- Badge SVG endpoint already exists at `/badge/[hash]` — can render real badge images in the preview

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 08-landing-page*
*Context gathered: 2026-03-08*
