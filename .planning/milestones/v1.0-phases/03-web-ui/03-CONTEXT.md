# Phase 3: Web UI - Context

**Gathered:** 2026-03-05
**Status:** Ready for planning

<domain>
## Phase Boundary

Homepage audit interface where developers can paste SKILL.md content or enter a URL to audit a remote skill. Displays the full audit report with per-category breakdown, recommendation verdict, and badge embed snippet. Report pages have permanent shareable URLs. Dark modern aesthetic with Tailwind CSS.

</domain>

<decisions>
## Implementation Decisions

### Input Experience
- Stacked layout: URL input field on top (compact), large textarea below for pasting raw content
- Both inputs always visible — user picks whichever method they prefer
- Client-side validation before submit: check URL format, check content non-empty, show character count
- Submit triggers a full-page loading takeover (form fades, centered loading state takes over)
- On audit completion, redirect to the report permalink URL (/report/[slug])

### Report Layout
- Hero banner at top: large colored banner showing recommendation verdict, summary, and overall score — first thing users see
- All 5 security categories displayed fully expanded by default — no accordion/click required
- Each category shows severity via a horizontal progress bar, color-coded (green=safe, yellow=low, orange=moderate, red=high, dark red=critical)
- Plain-English reasoning visible inline for each category
- Utility analysis section (what it does, use cases, dependencies) appears below the security categories
- by_design flag visually distinguished when a category's risk is intentional vs malicious

### Visual Identity
- Dark modern aesthetic — clean dark theme like Linear or Vercel dashboard, no terminal gimmicks
- Purple/violet accent color for primary actions (submit button, links, focus states, active elements)
- Traffic-light severity colors remain for category indicators (separate from accent)
- Fonts: Inter for UI text, JetBrains Mono for code/data (SKILL.md content, badge snippets)
- Minimal motion: subtle transitions (fade in, smooth expand) — no flashy animations

### Badge & Sharing
- Dedicated "Add to README" section at the bottom of the report page
- Badge preview rendered above the markdown snippet
- Markdown-only snippet format (no HTML variant)
- One-click copy button for the markdown snippet
- Copy URL button in the report header — copies permalink to clipboard with brief confirmation toast
- Dynamic OG image per report (via @vercel/og): shows skill name + verdict + severity overview for social previews in Slack/Twitter/Discord

### Claude's Discretion
- Exact Tailwind color palette values for the dark theme
- Loading state animation/design during audit
- Responsive breakpoints and mobile layout adaptation
- Error state presentation (API errors, invalid URLs, etc.)
- Report page header layout (skill name, audit date, etc.)
- OG image layout and design

</decisions>

<specifics>
## Specific Ideas

- Report page should redirect from homepage after audit completes — clear separation between "audit" (homepage) and "view" (report permalink)
- Progress bars for severity give a visual "meter" feel rather than just colored text
- Purple accent differentiates Skillgate from typical green/blue developer tools
- Hero banner recommendation should be immediately scannable — verdict + color tells the story before reading details

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `AuditResponse` type (lib/types.ts): Full response shape with `result` + `meta` (slug, URLs, cached flag)
- `AuditResult` from `@skillgate/audit-engine`: Complete audit result with security categories, utility analysis, recommendation
- Badge API endpoint (`/api/badge/[id]`): Already generates SVG badges
- Report API endpoint (`/api/report/[id]`): Returns `AuditResponse` JSON by slug
- Audit API endpoint (`/api/audit`): Accepts `{ content }`, returns `AuditResponse`

### Established Patterns
- Next.js 15 App Router with `src/app/` directory structure
- Tailwind CSS configured (from PROJECT.md constraints)
- React 19 available as dependency
- TypeScript strict mode throughout

### Integration Points
- Homepage form POSTs to `/api/audit` and reads the returned `meta.slug` for redirect
- Report page fetches from `/api/report/[slug]` to render audit data
- Badge preview on report page uses `/api/badge/[slug].svg` image source
- Layout.tsx needs global styles, fonts, and dark theme configuration

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 03-web-ui*
*Context gathered: 2026-03-05*
