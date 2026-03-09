# Roadmap: Skillgate

## Milestones

- **v1.0 MVP** - Phases 1-6 (shipped 2026-03-06)
- **v1.1 Web Redesign** - Phases 7-9 (in progress)

## Phases

<details>
<summary>v1.0 MVP (Phases 1-6) - SHIPPED 2026-03-06</summary>

- [x] Phase 1: Audit Engine (2/2 plans) - completed 2026-03-05
- [x] Phase 2: API Surface (2/2 plans) - completed 2026-03-05
- [x] Phase 3: Web UI (5/5 plans) - completed 2026-03-05
- [x] Phase 4: CLI (3/3 plans) - completed 2026-03-05
- [x] Phase 5: Publish (1/1 plan) - completed 2026-03-05
- [x] Phase 6: Tech Debt Cleanup (2/2 plans) - completed 2026-03-06

</details>

### v1.1 Web Redesign

**Milestone Goal:** Redesign the web app with a light, professional aesthetic -- new shared layout, landing page, audit page, and report page -- while keeping all API routes, data logic, and audit engine untouched.

- [ ] **Phase 7: Design System & Layout** - Light aesthetic foundation and shared header/footer component
- [x] **Phase 8: Landing Page** - Hero, features, animated mockup, and badge copy (completed 2026-03-08)
- [x] **Phase 9: Audit & Report Pages** - Redesigned audit form and report display (completed 2026-03-09)

## Phase Details

### Phase 7: Design System & Layout
**Goal**: Every page renders inside a consistent shared layout with the new light sky-blue aesthetic applied globally
**Depends on**: Phase 6 (v1.0 complete)
**Requirements**: DS-01, DS-02, DS-03, LAYOUT-01, LAYOUT-02, LAYOUT-03
**Success Criteria** (what must be TRUE):
  1. All pages share a header with "skillgate" wordmark linking home, a copyable npm install pill, and a GitHub icon
  2. All pages share a footer with GitHub, npm, skillgate.sh, and MIT License links in muted text
  3. Background is light sky-blue (#F0F9FF), cards are white with #BAE6FD borders, and accent color #06B6D4 is used for interactive elements
  4. Verdict colors (green/red/orange) are defined and available for downstream pages
**Plans:** 2 plans

Plans:
- [ ] 07-01-PLAN.md — Design system tokens and font swap (DS-01, DS-02, DS-03)
- [ ] 07-02-PLAN.md — Shared header/footer layout components (LAYOUT-01, LAYOUT-02, LAYOUT-03)

### Phase 8: Landing Page
**Goal**: A visitor landing on skillgate.sh immediately understands what the product does, sees a polished animated preview, and can navigate to audit or copy a badge snippet
**Depends on**: Phase 7
**Requirements**: LAND-01, LAND-02, LAND-03, LAND-04
**Success Criteria** (what must be TRUE):
  1. Hero section with headline, subtext, and "Audit a skill" CTA is visible above the fold and CTA navigates to /audit
  2. Feature sections explain what Skillgate audits in clear, scannable blocks
  3. Animated report mockup rows fade and slide in sequentially as the user scrolls
  4. Badge markdown snippet is displayed with a copy button that copies to clipboard
**Plans:** 2/2 plans complete

Plans:
- [ ] 08-01-PLAN.md — Hero section and feature cards (LAND-01, LAND-02)
- [ ] 08-02-PLAN.md — Animated report mockup and badge snippet (LAND-03, LAND-04)

### Phase 9: Audit & Report Pages
**Goal**: Users can audit a skill and view the report with the new design system, with all existing functionality intact
**Depends on**: Phase 7
**Requirements**: AUDIT-01, AUDIT-02, REPORT-01, REPORT-02, REPORT-03
**Success Criteria** (what must be TRUE):
  1. Audit form at /audit matches the new design system and submitting a SKILL.md (paste or URL) still triggers audit and redirects to /report/[slug]
  2. Report page displays verdict, category cards, and utility analysis in the new card-based design with correct verdict colors
  3. Badge image, copy link, and shareable URL all remain functional on the report page
  4. "Audit another skill" link below report content navigates back to /audit
**Plans:** 2/2 plans complete

Plans:
- [ ] 09-01-PLAN.md — Audit page route and form redesign (AUDIT-01, AUDIT-02)
- [ ] 09-02-PLAN.md — Report page redesign with verdict pills, category grid, and section flow (REPORT-01, REPORT-02, REPORT-03)

## Progress

**Execution Order:** 7 -> 8 -> 9

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Audit Engine | v1.0 | 2/2 | Complete | 2026-03-05 |
| 2. API Surface | v1.0 | 2/2 | Complete | 2026-03-05 |
| 3. Web UI | v1.0 | 5/5 | Complete | 2026-03-05 |
| 4. CLI | v1.0 | 3/3 | Complete | 2026-03-05 |
| 5. Publish | v1.0 | 1/1 | Complete | 2026-03-05 |
| 6. Tech Debt Cleanup | v1.0 | 2/2 | Complete | 2026-03-06 |
| 7. Design System & Layout | v1.1 | 0/2 | Not started | - |
| 8. Landing Page | 2/2 | Complete   | 2026-03-08 | - |
| 9. Audit & Report Pages | 2/2 | Complete   | 2026-03-09 | - |
