# Roadmap: Skillgate

## Milestones

- **v1.0 MVP** - Phases 1-6 (shipped 2026-03-06)
- **v1.1 Web Redesign** - Phases 7-9 (shipped 2026-03-09)
- **v1.2 Landing Page Redesign** - Phases 10-11 (in progress)

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

<details>
<summary>v1.1 Web Redesign (Phases 7-9) - SHIPPED 2026-03-09</summary>

- [x] Phase 7: Design System & Layout (2/2 plans) - completed 2026-03-07
- [x] Phase 8: Landing Page (2/2 plans) - completed 2026-03-08
- [x] Phase 9: Audit & Report Pages (2/2 plans) - completed 2026-03-09

</details>

### v1.2 Landing Page Redesign

- [x] **Phase 10: Dark Design Tokens + Layout Foundation** - Dark theme tokens scoped to landing, floating pill header, dark footer variant, layout plumbing (completed 2026-03-10)
- [x] **Phase 11: Landing Page Sections** - Hero with 120px heading, two-column features+demo, badge cards, responsive breakpoints (completed 2026-03-10)

## Phase Details

### Phase 10: Dark Design Tokens + Layout Foundation
**Goal**: Landing page renders with dark purple/violet theme while product pages remain unchanged
**Depends on**: Phase 9
**Requirements**: DS-01, DS-02, DS-03, HDR-01, HDR-02, HDR-03, FTR-01, FTR-02
**Success Criteria** (what must be TRUE):
  1. Landing page displays dark purple background (#1a1625) with violet accent colors, while /audit and /report pages remain light sky-blue
  2. Severity colors (safe green, low blue, moderate amber, high orange, critical red) render identically on both dark landing and light product pages
  3. Landing page header appears as a floating rounded pill with backdrop blur, showing shield icon, wordmark, nav links, CLI pill, and CTA button
  4. Non-landing pages retain their existing sticky header and footer styling with zero visual changes
  5. Landing page footer renders with dark variant styling (dark text, purple border)
**Plans**: 2 plans

Plans:
- [x] 10-01-PLAN.md — Dark design tokens + severity color fix + layout plumbing
- [x] 10-02-PLAN.md — Floating pill header + dark footer variant

### Phase 11: Landing Page Sections
**Goal**: Landing page delivers a compelling dark marketing experience with hero, features+demo, and badge sections
**Depends on**: Phase 10
**Requirements**: HERO-01, HERO-02, HERO-03, FEAT-01, FEAT-02, FEAT-03, BADGE-01, BADGE-02, RESP-01, RESP-02
**Success Criteria** (what must be TRUE):
  1. Hero heading "Don't install blind." renders at 120px on desktop with a violet gradient orb behind it, and two CTA buttons link to /audit and /report/cursor-rules-architect
  2. Features section shows a two-column layout: 3 stacked feature cards on the left, and a hardcoded mock report demo on the right showing cursor-rules-architect with "Use with Caution" verdict, 6.2/10 score, and 5 category rows
  3. Badge section displays 3 badge examples (Safe to Install, Use with Caution, Avoid) each with its own copy-to-clipboard button for the markdown snippet
  4. On tablet (<=1024px), features+demo stacks to single column; on mobile (<=768px), hero heading scales down and all sections render single column
**Plans**: 3 plans

Plans:
- [ ] 11-00-PLAN.md — Wave 0 test stubs for hero, features-demo, and badge sections
- [ ] 11-01-PLAN.md — Hero section rework + badge per-copy buttons
- [ ] 11-02-PLAN.md — Features+demo two-column section + page.tsx wiring

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Audit Engine | v1.0 | 2/2 | Complete | 2026-03-05 |
| 2. API Surface | v1.0 | 2/2 | Complete | 2026-03-05 |
| 3. Web UI | v1.0 | 5/5 | Complete | 2026-03-05 |
| 4. CLI | v1.0 | 3/3 | Complete | 2026-03-05 |
| 5. Publish | v1.0 | 1/1 | Complete | 2026-03-05 |
| 6. Tech Debt Cleanup | v1.0 | 2/2 | Complete | 2026-03-06 |
| 7. Design System & Layout | v1.1 | 2/2 | Complete | 2026-03-07 |
| 8. Landing Page | v1.1 | 2/2 | Complete | 2026-03-08 |
| 9. Audit & Report Pages | v1.1 | 2/2 | Complete | 2026-03-09 |
| 10. Dark Design Tokens + Layout Foundation | v1.2 | 2/2 | Complete | 2026-03-10 |
| 11. Landing Page Sections | 3/3 | Complete   | 2026-03-10 | - |
